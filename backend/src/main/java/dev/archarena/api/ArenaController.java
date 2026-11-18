package dev.archarena.api;

import dev.archarena.engine.*;
import dev.archarena.engine.Model.*;
import dev.archarena.learning.LessonCatalog;
import dev.archarena.persistence.JobRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ArenaController {
    private final JobRepository jobs;
    private final LessonCatalog lessons;
    private final String owner;
    private final ArrayDeque<Long> previews=new ArrayDeque<>();
    public ArenaController(JobRepository jobs,LessonCatalog lessons,@Value("${archarena.owner}")String owner){this.jobs=jobs;this.lessons=lessons;this.owner=owner;}
    @GetMapping("/catalog") public Map<String,Object> catalog(){return Map.of("lessons",lessons.all(),"completed",jobs.progress(owner),"aiEnabled",false,"storage","local-development adapter; PostgreSQL profile available","engineVersion",AnalyticEngine.VERSION);}
    private synchronized void previewQuota(){long now=System.currentTimeMillis();while(!previews.isEmpty()&&previews.getFirst()<now-60000)previews.removeFirst();if(previews.size()>=30)throw new JobRepository.Capacity("Preview quota reached: wait one minute before changing more controls");previews.add(now);}
    @PostMapping("/preview") public Result preview(@RequestBody Request request){previewQuota();return new AnalyticEngine().run(request);}
    @PostMapping("/runs") public ResponseEntity<JobRepository.RunView> run(@RequestBody Request request,@RequestHeader(value="Idempotency-Key",required=false)String key){new GraphValidator().validate(request);var job=jobs.submit(owner,key,request);return ResponseEntity.accepted().location(URI.create("/api/runs/"+job.id())).body(job);}
    @GetMapping("/runs/{id}") public JobRepository.RunView run(@PathVariable UUID id){return jobs.find(owner,id);}
    public record SaveDesign(String title,Integer version,Graph graph){}
    private void validate(SaveDesign input){if(input.title()==null||input.title().isBlank()||input.title().length()>120)throw new IllegalArgumentException("Title must contain 1–120 characters");new GraphValidator().validate(new Request(input.graph(),10,5,1,"steady","none"));}
    @GetMapping("/designs") public List<JobRepository.DesignView> designs(){return jobs.designs(owner);}
    @PostMapping("/designs") public JobRepository.DesignView create(@RequestBody SaveDesign input){validate(input);return jobs.save(owner,null,input.title(),1,input.graph());}
    @PutMapping("/designs/{id}") public JobRepository.DesignView update(@PathVariable UUID id,@RequestBody SaveDesign input){validate(input);if(input.version()==null)throw new IllegalArgumentException("Version is required for updates");return jobs.save(owner,id,input.title(),input.version(),input.graph());}
    @DeleteMapping("/designs/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id){jobs.deleteDesign(owner,id);return ResponseEntity.noContent().build();}
    public record Checkpoint(UUID runId){}
    @PostMapping("/lessons/{id}/checkpoint") public Map<String,Object> checkpoint(@PathVariable String id,@RequestBody Checkpoint input){if(input.runId()==null)throw new IllegalArgumentException("Run ID required");var run=jobs.find(owner,input.runId());if(!"DONE".equals(run.status()))throw new IllegalArgumentException("Complete an experiment before checking this lesson");boolean passed=lessons.checkpoint(id,run.request(),run.result());if(passed)jobs.completeLesson(owner,id,input.runId());return Map.of("passed",passed,"completed",jobs.progress(owner));}
    public record Question(String question){}
    @PostMapping("/practice/clarify") public Map<String,String> clarify(@RequestBody Question input){if(input.question()==null||input.question().isBlank()||input.question().length()>1000)throw new IllegalArgumentException("Question must contain 1–1,000 characters");String q=input.question().toLowerCase(Locale.ROOT);String answer;
        if(q.contains("retention")||q.contains("store")||q.contains("long"))answer="Assume 365-day retention and 512 bytes per stored URL before indexes and replication.";
        else if(q.contains("read")||q.contains("redirect")||q.contains("ratio"))answer="Assume ten redirect reads per new URL. The 100 million/day figure counts new URL creation, not total requests.";
        else if(q.contains("peak")||q.contains("traffic")||q.contains("load"))answer="Use a peak factor of three over daily average. A simulation spike is a separate 10x virtual-traffic experiment.";
        else if(q.contains("availability")||q.contains("latency")||q.contains("slo"))answer="Discuss a 99.9% availability goal and a 200 ms redirect p95 target; these are interview requirements, not implemented guarantees.";
        else answer="Problem facts: 100 million new URLs/day, ten reads per write, peak factor three, 365-day retention. Ask about read ratio, storage, peaks or availability. Architecture choices are yours to justify.";
        return Map.of("mode","scripted","answer",answer,"notice","AI is disabled. This answer comes from the fixed problem specification.");}
    @GetMapping("/runs/{id}/scorecard") public Map<String,Object> scorecard(@PathVariable UUID id){var run=jobs.find(owner,id);if(run.result()==null)throw new IllegalArgumentException("Run must finish before scoring");Result r=run.result();double success=r.requests()==0?0:(double)r.successful()/r.requests();List<Map<String,Object>> dimensions=new ArrayList<>();
        for(String name:List.of("Requirements","Estimation","Data model","API","Scalability","Reliability","Trade-offs","Cost awareness","Communication")){
            if(name.equals("Scalability"))dimensions.add(Map.of("name",name,"status","rules-based","score",Math.round(success*100),"evidence",r.successful()+" / "+r.requests()+" requests succeeded in run "+id));
            else dimensions.add(Map.of("name",name,"status","not assessed","evidence","This demo does not validate this dimension. Explain it in your design notes."));
        }
        return Map.of("runId",id,"dimensions",dimensions,"findings",r.findings(),"aiEnabled",false);}
    @GetMapping(value="/runs/{id}/export",produces="text/markdown") public ResponseEntity<String> export(@PathVariable UUID id){var run=jobs.find(owner,id);if(run.result()==null)throw new IllegalArgumentException("Run must finish before export");var r=run.result();StringBuilder out=new StringBuilder("# ArchArena experiment\n\nEducational model, not a benchmark.\n\n");out.append("Run: ").append(id).append("\n\nEngine: ").append(r.engineVersion()).append("; assumptions: ").append(r.assumptionsVersion()).append("; seed: ").append(r.seed()).append("\n\n");out.append("Requests: ").append(r.requests()).append("; successful: ").append(r.successful()).append("; errors: ").append(r.errors()).append("; policy rejections: ").append(r.rejected()).append("\n\np50/p95/p99 ms: ").append(r.p50Ms()).append(" / ").append(r.p95Ms()).append(" / ").append(r.p99Ms()).append("\n\n## Immutable input\n\n```json\n").append(jobs.encode(run.request())).append("\n```\n\n## Assumptions\n\n");for(String assumption:r.assumptions())out.append("- ").append(assumption).append('\n');return ResponseEntity.ok().header("Content-Disposition","attachment; filename=archarena-"+id+".md").body(out.toString());}
}
