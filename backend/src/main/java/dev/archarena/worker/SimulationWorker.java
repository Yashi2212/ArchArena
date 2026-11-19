package dev.archarena.worker;

import dev.archarena.engine.DiscreteEventEngine;
import dev.archarena.persistence.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name="archarena.worker.enabled",havingValue="true")
public class SimulationWorker {
    private static final Logger LOG=LoggerFactory.getLogger(SimulationWorker.class);
    private final JobRepository jobs;
    public SimulationWorker(JobRepository jobs){this.jobs=jobs;}
    @Scheduled(fixedDelay=200) public void poll() {
        jobs.claim().ifPresent(job->{
            long start=System.nanoTime();
            try {var result=new DiscreteEventEngine().run(job.request());boolean committed=jobs.complete(job,result);LOG.info("run={} status=DONE committed={} durationMs={}",job.id(),committed,(System.nanoTime()-start)/1_000_000);}
            catch(DiscreteEventEngine.SimulationTimeoutException exception){jobs.fail(job,"TIMED_OUT",exception.getMessage());LOG.warn("run={} status=TIMED_OUT",job.id());}
            catch(RuntimeException exception){jobs.fail(job,"FAILED",exception instanceof IllegalArgumentException?exception.getMessage():"Internal worker failure");LOG.error("run={} status=FAILED errorType={}",job.id(),exception.getClass().getSimpleName());}
        });
    }
    @Scheduled(fixedDelay=3_600_000,initialDelay=60_000) public void retention(){jobs.retain();}
}
