package dev.archarena.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.archarena.engine.*;
import dev.archarena.engine.Model.*;
import dev.archarena.persistence.JobRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:api-tests;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1","archarena.worker.enabled=false"})
@AutoConfigureMockMvc
class ApiTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired JobRepository jobs;
    @Autowired JdbcTemplate jdbc;
    @BeforeEach void reset(){jdbc.update("DELETE FROM lesson_progress");jdbc.update("DELETE FROM design_versions");jdbc.update("DELETE FROM designs");jdbc.update("DELETE FROM simulation_runs");}
    Request valid(){return new Request(new Graph(List.of(new Node("c",NodeType.CLIENT,"Client",Map.of()),new Node("s",NodeType.SERVICE,"Service",Map.of("replicas",2.0)),new Node("db",NodeType.DATABASE,"DB",Map.of("serviceMs",5.0))),List.of(new Edge("a","c","s"),new Edge("b","s","db"))),20,10,42,"steady","none");}
    @Test void catalogContainsFiveLessonsAndNoPretendAi()throws Exception {mvc.perform(get("/api/catalog")).andExpect(status().isOk()).andExpect(jsonPath("$.lessons.length()").value(5)).andExpect(jsonPath("$.aiEnabled").value(false));}
    @Test void malformedBodyAndOversizedBodyAreRejected()throws Exception {
        mvc.perform(post("/api/preview").contentType("application/json").content("{\"madeUp\":true}")).andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
        mvc.perform(post("/api/preview").contentType("application/json").content("x".repeat(65537))).andExpect(status().isPayloadTooLarge());
    }
    @Test void crossOriginWritesAreBlocked()throws Exception {mvc.perform(post("/api/runs").header("Origin","https://evil.invalid").contentType("application/json").content(json.writeValueAsString(valid()))).andExpect(status().isForbidden());}
    @Test void idempotencyReturnsSameRunAndRejectsPayloadChange()throws Exception {
        String body=json.writeValueAsString(valid());
        String first=mvc.perform(post("/api/runs").header("Idempotency-Key","repeat-key-01").contentType("application/json").content(body)).andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        String second=mvc.perform(post("/api/runs").header("Idempotency-Key","repeat-key-01").contentType("application/json").content(body)).andExpect(status().isAccepted()).andReturn().getResponse().getContentAsString();
        assertThat(json.readTree(first).get("id")).isEqualTo(json.readTree(second).get("id"));
        mvc.perform(post("/api/runs").header("Idempotency-Key","repeat-key-01").contentType("application/json").content(body.replace("42","43"))).andExpect(status().isConflict());
    }
    @Test void repositoryScopesRunsAndDesignsToOwner()throws Exception {
        var run=jobs.submit("owner-a","owner-key-01",valid());
        assertThatThrownBy(()->jobs.find("owner-b",run.id())).isInstanceOf(JobRepository.Missing.class);
        var design=jobs.save("owner-a",null,"Private",1,valid().graph());
        assertThat(jobs.designs("owner-b")).isEmpty();
        assertThatThrownBy(()->jobs.save("owner-b",design.id(),"Overwrite",1,valid().graph())).isInstanceOf(JobRepository.Conflict.class);
        assertThatThrownBy(()->jobs.deleteDesign("owner-b",design.id())).isInstanceOf(JobRepository.Missing.class);
    }
    @Test void staleDesignVersionCannotOverwriteSnapshot() {
        var saved=jobs.save("local-owner",null,"Initial",1,valid().graph());
        jobs.save("local-owner",saved.id(),"Second",1,valid().graph());
        assertThatThrownBy(()->jobs.save("local-owner",saved.id(),"Stale",1,valid().graph())).isInstanceOf(JobRepository.Conflict.class);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM design_versions",Integer.class)).isEqualTo(2);
        assertThat(jobs.designs("local-owner").getFirst().title()).isEqualTo("Second");
    }
    @Test void workerCompletionCheckpointScorecardAndExportUseStoredEvidence()throws Exception {
        var run=jobs.submit("local-owner","complete-key-01",valid());
        var claim=jobs.claim().orElseThrow();
        assertThat(jobs.claim()).isEmpty();
        Result result=new DiscreteEventEngine().run(claim.request());
        assertThat(jobs.complete(new JobRepository.Claimed(claim.id(),UUID.randomUUID(),claim.request()),result)).isFalse();
        assertThat(jobs.complete(claim,result)).isTrue();
        mvc.perform(get("/api/runs/"+run.id())).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("DONE")).andExpect(jsonPath("$.result.seed").value(42));
        mvc.perform(post("/api/lessons/load-balancing/checkpoint").contentType("application/json").content("{\"runId\":\""+run.id()+"\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.passed").value(true));
        mvc.perform(get("/api/runs/"+run.id()+"/scorecard")).andExpect(status().isOk()).andExpect(jsonPath("$.dimensions.length()").value(9)).andExpect(jsonPath("$.aiEnabled").value(false));
        mvc.perform(get("/api/runs/"+run.id()+"/export")).andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("seed: 42")));
    }
    @Test void concurrentDuplicateAdmissionsCreateOneJob()throws Exception {
        try(var executor=Executors.newFixedThreadPool(2)) {
            CountDownLatch start=new CountDownLatch(1);
            Callable<UUID> submit=()->{start.await();return jobs.submit("concurrent-owner","same-key-01",valid()).id();};
            var a=executor.submit(submit);var b=executor.submit(submit);start.countDown();
            assertThat(a.get(10,TimeUnit.SECONDS)).isEqualTo(b.get(10,TimeUnit.SECONDS));
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM simulation_runs",Integer.class)).isEqualTo(1);
    }
    @Test void admissionQueueIsBoundedAcrossOwners() {
        for(int i=0;i<5;i++)jobs.submit("owner-"+i,"bounded-key-01",valid());
        assertThatThrownBy(()->jobs.submit("owner-six","bounded-key-01",valid())).isInstanceOf(JobRepository.Capacity.class);
    }
    @Test void expiredLeaseRetriesThenStops() {
        var run=jobs.submit("owner-a","lease-key-01",valid());
        var first=jobs.claim().orElseThrow();
        jdbc.update("UPDATE simulation_runs SET lease_until=? WHERE id=?",java.time.OffsetDateTime.now().minusMinutes(1),run.id());
        var second=jobs.claim().orElseThrow();assertThat(second.lease()).isNotEqualTo(first.lease());
        jdbc.update("UPDATE simulation_runs SET lease_until=? WHERE id=?",java.time.OffsetDateTime.now().minusMinutes(1),run.id());
        assertThat(jobs.claim()).isEmpty();assertThat(jobs.find("owner-a",run.id()).status()).isEqualTo("TIMED_OUT");
    }
    @Test void retrySettingsArePersistedAndParticipateInIdempotency()throws Exception {
        Request base=valid();Request input=new Request(base.graph(),20,10,42,"steady","none",Map.of("retries",2.0,"retryJitter",0.5));
        var first=jobs.submit("options-owner","options-key-01",input);
        assertThat(first.request().option("retries",0)).isEqualTo(2);
        Request changed=new Request(base.graph(),20,10,42,"steady","none",Map.of("retries",1.0,"retryJitter",0.5));
        assertThatThrownBy(()->jobs.submit("options-owner","options-key-01",changed)).isInstanceOf(JobRepository.Conflict.class);
        var claim=jobs.claim().orElseThrow();Result result=new DiscreteEventEngine().run(claim.request());assertThat(jobs.complete(claim,result)).isTrue();
        assertThat(jobs.find("options-owner",first.id()).result().telemetry().nodeTimeline()).isNotEmpty();
    }
    @Test void sqlPayloadRemainsDataAndDoesNotEscapeOwnerScope(){
        String hostile="x'); DROP TABLE designs; --";
        var d=jobs.save("owner-a",null,hostile,1,valid().graph());assertThat(jobs.designs("owner-a").getFirst().title()).isEqualTo(hostile);
        assertThat(jobs.designs("owner-b' OR '1'='1")).isEmpty();assertThatThrownBy(()->jobs.deleteDesign("owner-b' OR '1'='1",d.id())).isInstanceOf(JobRepository.Missing.class);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM designs",Integer.class)).isEqualTo(1);
    }
    @Test void formUploadsAndServerSideUrlParametersAreRejected()throws Exception {
        mvc.perform(post("/api/preview").contentType("application/x-www-form-urlencoded").content("graph=attacker")).andExpect(status().isUnsupportedMediaType());
        mvc.perform(post("/api/designs").contentType("multipart/form-data; boundary=x").content("--x--")).andExpect(status().isUnsupportedMediaType());
        String body=json.writeValueAsString(valid()).replace("\"replicas\":2.0","\"replicas\":2.0,\"url\":\"http://169.254.169.254/latest/meta-data\"");
        mvc.perform(post("/api/preview").contentType("application/json").content(body)).andExpect(status().isBadRequest());
    }
    @Test void legacyRequestHashesStillReturnTheExistingIdempotentRun(){
        var first=jobs.submit("legacy-owner","legacy-key-01",valid());
        jdbc.update("UPDATE simulation_runs SET request_hash=? WHERE id=?","legacy-v1-canonical-hash",first.id());
        assertThat(jobs.submit("legacy-owner","legacy-key-01",valid()).id()).isEqualTo(first.id());
        Request different=new Request(valid().graph(),21,10,42,"steady","none");
        assertThatThrownBy(()->jobs.submit("legacy-owner","legacy-key-01",different)).isInstanceOf(JobRepository.Conflict.class);
    }
}
