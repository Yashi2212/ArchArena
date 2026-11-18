package dev.archarena.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import dev.archarena.engine.Model.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.*;

@Repository
public class JobRepository {
    private final JdbcTemplate jdbc;
    private final ObjectMapper json;
    public record RunView(UUID id,String status,int attempt,Request request,Result result,String error,String createdAt) {}
    public record Claimed(UUID id,UUID lease,Request request) {}
    public record DesignView(UUID id,String title,int version,Graph graph,String updatedAt) {}
    public JobRepository(JdbcTemplate jdbc,ObjectMapper json) {this.jdbc=jdbc;this.json=json.copy().enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS);}
    public String encode(Object object) {try{return json.writeValueAsString(object);}catch(JsonProcessingException e){throw new IllegalArgumentException("Invalid JSON input",e);}}
    public <T> T decode(String value,Class<T> type) {if(value==null)return null;try{return json.readValue(value,type);}catch(JsonProcessingException e){throw new IllegalStateException("Stored data could not be decoded",e);}}
    private String canonical(Request r) {
        List<Node> nodes=r.graph().nodes().stream().sorted(Comparator.comparing(Node::id)).map(n->new Node(n.id(),n.type(),n.label(),n.config()==null?Map.of():new TreeMap<>(n.config()))).toList();
        return encode(new Request(new Graph(nodes,r.graph().edges().stream().sorted(Comparator.comparing(Edge::id)).toList()),r.arrivalRate(),r.durationSeconds(),r.seed(),r.profile(),r.failure()));
    }
    private String hash(String text) {try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);}}
    @Transactional public RunView submit(String owner,String key,Request request) {
        if(key==null||!key.matches("[a-zA-Z0-9_-]{8,100}")) throw new IllegalArgumentException("Idempotency-Key must contain 8–100 letters, digits, underscores or hyphens");
        String body=canonical(request),hash=hash(body);
        jdbc.queryForObject("SELECT id FROM admission_lock WHERE id=1 FOR UPDATE",Integer.class);
        var existing=jdbc.queryForList("SELECT id,request_hash FROM simulation_runs WHERE owner_id=? AND idempotency_key=?",owner,key);
        if(!existing.isEmpty()) {
            if(!existing.getFirst().get("request_hash").equals(hash)) throw new Conflict("Idempotency key already belongs to a different request");
            return find(owner,UUID.fromString(existing.getFirst().get("id").toString()));
        }
        int queued=jdbc.queryForObject("SELECT COUNT(*) FROM simulation_runs WHERE status IN ('QUEUED','RUNNING')",Integer.class);
        if(queued>=5) throw new Capacity("Simulation queue is full; retry after a job finishes");
        int globalRecent=jdbc.queryForObject("SELECT COUNT(*) FROM simulation_runs WHERE created_at>?",Integer.class,OffsetDateTime.now().minusMinutes(1));
        if(globalRecent>=6) throw new Capacity("Global demo quota: at most six new experiments per minute");
        int recent=jdbc.queryForObject("SELECT COUNT(*) FROM simulation_runs WHERE owner_id=? AND created_at>?",Integer.class,owner,OffsetDateTime.now().minusMinutes(1));
        if(recent>=2) throw new Capacity("Demo quota: at most two new experiments per minute");
        UUID id=UUID.randomUUID();
        jdbc.update("INSERT INTO simulation_runs(id,owner_id,request_text,request_hash,idempotency_key,status) VALUES (?,?,?,?,?,'QUEUED')",id,owner,body,hash,key);
        return find(owner,id);
    }
    public RunView find(String owner,UUID id) {
        var list=jdbc.query("SELECT * FROM simulation_runs WHERE id=? AND owner_id=?",(rs,row)->new RunView(rs.getObject("id",UUID.class),rs.getString("status"),rs.getInt("attempt"),decode(rs.getString("request_text"),Request.class),decode(rs.getString("result_text"),Result.class),rs.getString("error_message"),rs.getString("created_at")),id,owner);
        if(list.isEmpty())throw new Missing("Run not found");return list.getFirst();
    }
    @Transactional public Optional<Claimed> claim() {
        jdbc.queryForObject("SELECT id FROM admission_lock WHERE id=1 FOR UPDATE",Integer.class);
        jdbc.update("UPDATE simulation_runs SET status=CASE WHEN attempt<2 THEN 'QUEUED' ELSE 'TIMED_OUT' END,lease_token=NULL,error_message='Worker lease expired',updated_at=CURRENT_TIMESTAMP WHERE status='RUNNING' AND lease_until<CURRENT_TIMESTAMP");
        if(jdbc.queryForObject("SELECT COUNT(*) FROM simulation_runs WHERE status='RUNNING'",Integer.class)>0)return Optional.empty();
        var rows=jdbc.queryForList("SELECT id,request_text FROM simulation_runs WHERE status='QUEUED' ORDER BY created_at,id LIMIT 1 FOR UPDATE");
        if(rows.isEmpty())return Optional.empty();
        var row=rows.getFirst();UUID id=UUID.fromString(row.get("id").toString()),lease=UUID.randomUUID();
        jdbc.update("UPDATE simulation_runs SET status='RUNNING',attempt=attempt+1,lease_token=?,lease_until=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",lease,OffsetDateTime.now().plusSeconds(30),id);
        return Optional.of(new Claimed(id,lease,decode(row.get("request_text").toString(),Request.class)));
    }
    public boolean complete(Claimed job,Result result) {
        String body=encode(result);
        if(body.getBytes(StandardCharsets.UTF_8).length>1024*1024) throw new IllegalArgumentException("Encoded result exceeds 1 MiB safety limit");
        return jdbc.update("UPDATE simulation_runs SET status='DONE',result_text=?,error_message=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=? AND lease_token=? AND status='RUNNING'",body,job.id(),job.lease())==1;
    }
    public void fail(Claimed job,String status,String error) {
        String safe=error==null?"Simulation failed":error.substring(0,Math.min(400,error.length()));
        jdbc.update("UPDATE simulation_runs SET status=?,error_message=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND lease_token=? AND status='RUNNING'",status,safe,job.id(),job.lease());
    }
    public List<DesignView> designs(String owner) {return jdbc.query("SELECT * FROM designs WHERE owner_id=? ORDER BY updated_at DESC",(rs,row)->new DesignView(rs.getObject("id",UUID.class),rs.getString("title"),rs.getInt("version"),decode(rs.getString("graph_text"),Graph.class),rs.getString("updated_at")),owner);}
    @Transactional public DesignView save(String owner,UUID id,String title,int version,Graph graph) {
        String body=encode(graph);
        if(id==null) {id=UUID.randomUUID();jdbc.update("INSERT INTO designs(id,owner_id,title,version,graph_text) VALUES (?,?,?,1,?)",id,owner,title,body);version=1;}
        else {
            int changed=jdbc.update("UPDATE designs SET title=?,graph_text=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND owner_id=? AND version=?",title,body,id,owner,version);
            if(changed!=1)throw new Conflict("Design changed in another tab or is unavailable; reload before saving");version++;
        }
        jdbc.update("INSERT INTO design_versions(design_id,version,graph_text) VALUES (?,?,?)",id,version,body);
        UUID saved=id;return designs(owner).stream().filter(d->d.id().equals(saved)).findFirst().orElseThrow();
    }
    public void deleteDesign(String owner,UUID id) {if(jdbc.update("DELETE FROM designs WHERE id=? AND owner_id=?",id,owner)==0)throw new Missing("Design not found");}
    public List<String> progress(String owner) {return jdbc.queryForList("SELECT lesson_id FROM lesson_progress WHERE owner_id=?",String.class,owner);}
    @Transactional public void completeLesson(String owner,String lesson,UUID run) {
        jdbc.queryForObject("SELECT id FROM admission_lock WHERE id=1 FOR UPDATE",Integer.class);
        jdbc.update("DELETE FROM lesson_progress WHERE owner_id=? AND lesson_id=?",owner,lesson);
        jdbc.update("INSERT INTO lesson_progress(owner_id,lesson_id,run_id) VALUES (?,?,?)",owner,lesson,run);
    }
    @Transactional public void retain() {
        OffsetDateTime cutoff=OffsetDateTime.now().minusDays(7);
        var expired=jdbc.queryForList("SELECT id,result_text FROM simulation_runs WHERE created_at<? AND result_text IS NOT NULL",cutoff);
        for(var row:expired) {
            Result r=decode(row.get("result_text").toString(),Result.class);
            if(!r.timeline().isEmpty())jdbc.update("UPDATE simulation_runs SET result_text=? WHERE id=?",encode(new Result(r.engineVersion(),r.assumptionsVersion(),r.mode(),r.seed(),r.requests(),r.successful(),r.errors(),r.rejected(),r.throughputRps(),r.p50Ms(),r.p95Ms(),r.p99Ms(),r.nodes(),List.of(),r.findings(),r.assumptions(),r.roughCostPerHour())),row.get("id"));
        }
        OffsetDateTime summaries=OffsetDateTime.now().minusDays(30);
        jdbc.update("DELETE FROM lesson_progress WHERE run_id IN (SELECT id FROM simulation_runs WHERE created_at<?)",summaries);
        jdbc.update("DELETE FROM simulation_runs WHERE created_at<? AND status NOT IN ('QUEUED','RUNNING')",summaries);
        jdbc.update("DELETE FROM designs WHERE updated_at<?",summaries);
    }
    public static class Conflict extends RuntimeException {public Conflict(String message){super(message);}}
    public static class Capacity extends RuntimeException {public Capacity(String message){super(message);}}
    public static class Missing extends RuntimeException {public Missing(String message){super(message);}}
}
