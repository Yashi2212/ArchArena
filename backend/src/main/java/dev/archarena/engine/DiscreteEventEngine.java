package dev.archarena.engine;

import java.util.*;
import static dev.archarena.engine.Model.*;

/** Bounded virtual-time model. Never executes supplied code, makes HTTP calls or sleeps. */
public final class DiscreteEventEngine implements SimulationEngine {
    private static final int ARRIVE=0, COMPLETE=1, ATTEMPT_TIMEOUT=2, SAMPLE=3, SCALE=4, RETRY=5, DEADLINE=6;
    private static final int MAX_PENDING=40_000, MAX_TRACES=1500;
    private static final class Logical {
        long id; double started,deadline; boolean read,done; Attempt current;
    }
    private static final class Attempt {
        Logical logical; int number; boolean done; String lastNode; List<Visit> holds=new ArrayList<>();
    }
    private static final class Visit {
        Attempt attempt; State state; Pool pool; double arrived,started; boolean released;
    }
    private static final class Pool {int busy; final ArrayDeque<Visit> waiting=new ArrayDeque<>();}
    private static final class State {
        Node node; int replicas,maxQueue,failuresInRow; long visits,completed,failed,stale;
        double busySeconds,capacitySeconds,residence,openUntil,costSeconds; boolean probe,scalePending;
        final Pool reads=new Pool(),writes=new Pool();
        final List<Double> writesAt=new ArrayList<>();
        int busy(){return reads.busy+writes.busy;}
        int queued(){return reads.waiting.size()+writes.waiting.size();}
    }
    private record Event(double time,long order,int kind,State state,Visit visit,Attempt attempt,Logical logical) {}
    private static final class Context {
        Request request; double now,horizon,lastSample; String entry,dependency,killed;
        Map<String,List<String>> outgoing; final Map<String,State> states=new TreeMap<>();
        final PriorityQueue<Event> events=new PriorityQueue<>(Comparator.comparingDouble(Event::time).thenComparingLong(Event::order));
        final List<Double> latencies=new ArrayList<>(); final List<Sample> samples=new ArrayList<>();
        final List<NodeSample> nodeSamples=new ArrayList<>(); final List<Trace> traces=new ArrayList<>();
        final Map<String,double[]> tokens=new HashMap<>();
        long order,requests,successful,errors,rejected,attempts,retries,timeouts,circuitRejections,staleReads,lastSuccess,lastFailure;
        int processed,peakPending;
        void add(double time,int kind,State state,Visit visit,Attempt attempt,Logical logical){
            if(time>horizon)return;
            if(events.size()>=MAX_PENDING)throw new IllegalArgumentException("Pending event bound exceeded");
            events.add(new Event(time,order++,kind,state,visit,attempt,logical));peakPending=Math.max(peakPending,events.size());
        }
        void trace(Attempt a,String node,String event){if(a!=null&&a.logical.id<=16&&traces.size()<MAX_TRACES)traces.add(new Trace(a.logical.id,a.number,now,node,event));}
    }
    @Override public Result run(Request request) {
        new GraphValidator().validate(request);
        Context c=new Context();c.request=request;c.outgoing=AnalyticEngine.outgoing(request.graph());
        c.horizon=request.durationSeconds()+request.option("deadlineMs",2000)/1000;
        for(Node node:request.graph().nodes()){State s=new State();s.node=node;s.replicas=(int)node.value("replicas",1);c.states.put(node.id(),s);}
        c.entry=c.states.values().stream().filter(s->s.node.type()==NodeType.CLIENT).findFirst().orElseThrow().node.id();
        c.killed=c.states.values().stream().filter(s->s.node.type()==NodeType.SERVICE).findFirst().map(s->s.node.id()).orElse("");
        c.dependency=c.states.values().stream().filter(s->s.node.type()==NodeType.EXTERNAL_API).findFirst().or(()->c.states.values().stream().filter(s->s.node.type()==NodeType.DATABASE).findFirst()).map(s->s.node.id()).orElse("");
        generate(c);
        for(int t=1;t<c.horizon;t++)c.add(t,SAMPLE,null,null,null,null);
        c.add(c.horizon,SAMPLE,null,null,null,null);
        long wallDeadline=System.nanoTime()+5_000_000_000L;
        while(!c.events.isEmpty()) {
            if(++c.processed>GraphValidator.MAX_EVENTS)throw new IllegalArgumentException("Event safety bound exceeded");
            if((c.processed&255)==0&&(Thread.currentThread().isInterrupted()||System.nanoTime()>wallDeadline))throw new SimulationTimeoutException("Simulation wall-clock deadline exceeded");
            Event e=c.events.remove();integrate(c,e.time());c.now=e.time();
            switch(e.kind()) {
                case SAMPLE -> sample(c);
                case SCALE -> scale(c,e.state());
                case DEADLINE -> {if(!e.logical().done){if(e.logical().current!=null)fail(c,e.logical().current,false,true);finish(c,e.logical(),false,false);}}
                case RETRY -> {if(!e.logical().done)begin(c,e.logical(),e.attempt().number+1);}
                case ATTEMPT_TIMEOUT -> {if(active(e.attempt()))fail(c,e.attempt(),false,true);}
                case ARRIVE -> {if(active(e.attempt()))arrive(c,e.state(),e.attempt());}
                case COMPLETE -> complete(c,e.visit());
                default -> throw new IllegalStateException("Unsupported internal event");
            }
        }
        // Every logical arrival has exactly one overall deadline event inside the bounded horizon.
        if(c.successful+c.errors+c.rejected!=c.requests)throw new IllegalStateException("Request accounting invariant violated");
        return result(c);
    }
    private void generate(Context c) {
        Request r=c.request;SplittableRandom rng=new SplittableRandom(r.seed());
        double readRatio=c.states.values().stream().filter(s->s.node.type()==NodeType.DATABASE).findFirst().map(s->s.node.value("readRatio",0.9)).orElse(0.9);
        double[] boundaries=r.profile().equals("spike")?new double[]{0,r.durationSeconds()*.5,r.durationSeconds()*.6,r.durationSeconds()}:new double[]{0,r.durationSeconds()};
        for(int segment=0;segment<boundaries.length-1;segment++) {
            double rate=r.arrivalRate()*(r.profile().equals("spike")&&segment==1?10:1),time=boundaries[segment];
            while((time+=exponential(rng,1/rate))<boundaries[segment+1]) {
                if(++c.requests>10_000)throw new IllegalArgumentException("Arrival safety bound exceeded");
                Logical l=new Logical();l.id=c.requests;l.started=time;l.deadline=time+r.option("deadlineMs",2000)/1000;l.read=rng.nextDouble()<readRatio;
                // Initial attempt is scheduled, not executed during arrival generation.
                Attempt initial=new Attempt();initial.logical=l;initial.number=-1;
                c.add(time,RETRY,null,null,initial,l);c.add(l.deadline,DEADLINE,null,null,null,l);
            }
        }
    }
    private void begin(Context c,Logical l,int number) {
        if(c.now>=l.deadline){finish(c,l,false,false);return;}
        Attempt a=new Attempt();a.logical=l;a.number=number;l.current=a;c.attempts++;if(number>0)c.retries++;
        c.trace(a,c.entry,"attempt-start");
        c.add(Math.min(l.deadline,c.now+c.request.option("attemptTimeoutMs",2000)/1000),ATTEMPT_TIMEOUT,null,null,a,null);
        c.add(c.now,ARRIVE,c.states.get(c.entry),null,a,null);
    }
    private static boolean active(Attempt a){return a!=null&&!a.done&&!a.logical.done;}
    private boolean window(Context c){return c.now>=c.request.durationSeconds()*.5&&c.now<c.request.durationSeconds()*.5+5;}
    private int capacity(Context c,State s,boolean read) {
        int replicas=s.replicas;
        if(s.node.type()==NodeType.DATABASE&&(!read||s.node.value("requireFreshReads",0)==1))replicas=1;
        if(c.request.failure().equals("az-outage")&&window(c)&&s.node.type()==NodeType.SERVICE)replicas=Math.max(0,replicas-1);
        return replicas*(int)s.node.value("concurrency",s.node.type()==NodeType.SERVICE?4:1);
    }
    private int totalCapacity(Context c,State s){return capacity(c,s,true)+(s.node.type()==NodeType.DATABASE?capacity(c,s,false):0);}
    private void integrate(Context c,double time) {
        // Availability transitions can occur between events; split integration at the two incident boundaries.
        double mid=c.request.durationSeconds()*.5,end=mid+5,from=c.now;
        while(from<time){double to=time;if(from<mid&&mid<to)to=mid;if(from<end&&end<to)to=end;
            double original=c.now;c.now=from;
            for(State s:c.states.values()) {double dt=to-from;s.busySeconds+=s.busy()*dt;s.capacitySeconds+=totalCapacity(c,s)*dt;s.costSeconds+=s.replicas*dt;}
            c.now=original;from=to;
        }
    }
    private void arrive(Context c,State s,Attempt a) {
        a.lastNode=s.node.id();s.visits++;c.trace(a,s.node.id(),"arrive");
        boolean unavailable=window(c)&&((c.request.failure().equals("service-kill")&&s.node.id().equals(c.killed))||(c.request.failure().equals("dependency-outage")&&s.node.id().equals(c.dependency)));
        if(unavailable){nodeFailure(c,s);fail(c,a,false,false);return;}
        if(s.node.value("breakerThreshold",0)>0&&s.openUntil>0) {
            if(c.now<s.openUntil||s.probe){s.failed++;c.circuitRejections++;c.trace(a,s.node.id(),"circuit-reject");fail(c,a,false,false);return;}
            s.probe=true;c.trace(a,s.node.id(),"half-open-probe");
        }
        if(s.node.type()==NodeType.RATE_LIMITER) {
            double burst=s.node.value("burst",20);double[] bucket=c.tokens.computeIfAbsent(s.node.id(),k->new double[]{burst,c.now});
            bucket[0]=Math.min(burst,bucket[0]+(c.now-bucket[1])*s.node.value("rate",80));bucket[1]=c.now;
            if(bucket[0]<1){s.failed++;c.trace(a,s.node.id(),"policy-reject");fail(c,a,true,false);return;}bucket[0]--;
        }
        Pool pool=s.node.type()==NodeType.DATABASE&&!a.logical.read?s.writes:s.reads;
        pool.waiting.removeIf(queued->!active(queued.attempt));
        Visit v=new Visit();v.attempt=a;v.state=s;v.pool=pool;v.arrived=c.now;
        if(pool.busy<capacity(c,s,a.logical.read))start(c,v);
        else if(pool.waiting.size()<(int)s.node.value("queueLimit",200)){pool.waiting.add(v);s.maxQueue=Math.max(s.maxQueue,s.queued());c.trace(a,s.node.id(),"enqueue");}
        else{nodeFailure(c,s);c.trace(a,s.node.id(),"queue-overflow");fail(c,a,false,false);}
    }
    private void start(Context c,Visit v) {
        v.pool.busy++;v.started=c.now;State s=v.state;c.trace(v.attempt,s.node.id(),"service-start");
        SplittableRandom rng=random(c,v.attempt,s.node.id(),1);
        double seconds=exponential(rng,AnalyticEngine.serviceSeconds(s.node))+s.node.value("networkMs",0)/1000;
        if(c.request.failure().equals("slow-dependency")&&window(c)&&s.node.id().equals(c.dependency))seconds*=10;
        c.add(c.now+seconds,COMPLETE,s,v,v.attempt,null);
    }
    private void complete(Context c,Visit v) {
        State s=v.state;Attempt a=v.attempt;
        if(!active(a)){release(c,v);return;}
        boolean outage=window(c)&&c.request.failure().equals("dependency-outage")&&s.node.id().equals(c.dependency);
        if(outage||random(c,a,s.node.id(),2).nextDouble()<s.node.value("failureProbability",0)){
            release(c,v);nodeFailure(c,s);c.trace(a,s.node.id(),"service-failure");fail(c,a,false,false);return;
        }
        if(s.node.type()==NodeType.DATABASE)replicate(c,s,a);
        double hit=s.node.value("hitRatio",0.8);
        if(c.request.failure().equals("cache-flush")&&window(c))hit=0;
        boolean cache=(s.node.type()==NodeType.CACHE||s.node.type()==NodeType.CDN)&&a.logical.read&&random(c,a,s.node.id(),3).nextDouble()<hit;
        List<String> next=c.outgoing.getOrDefault(s.node.id(),List.of());
        if(cache||next.isEmpty()){nodeSuccess(s);release(c,v);c.trace(a,s.node.id(),cache?"cache-hit":"response");succeed(c,a);return;}
        if(s.node.value("holdUpstream",0)==1){a.holds.add(v);c.trace(a,s.node.id(),"wait-for-dependency");}
        else {nodeSuccess(s);release(c,v);}
        String target=next.get(random(c,a,s.node.id(),4).nextInt(next.size()));c.add(c.now,ARRIVE,c.states.get(target),null,a,null);
    }
    private void release(Context c,Visit v) {
        if(v.released)return;v.released=true;v.pool.busy--;v.state.completed++;v.state.residence+=c.now-v.arrived;
        drain(c,v.state,v.pool);
    }
    private void drain(Context c,State s,Pool pool) {
        while(!pool.waiting.isEmpty()) {
            Visit v=pool.waiting.peek();if(!active(v.attempt)){pool.waiting.remove();continue;}
            if(pool.busy>=capacity(c,s,v.attempt.logical.read))break;
            pool.waiting.remove();start(c,v);
        }
    }
    private void fail(Context c,Attempt a,boolean policy,boolean timeout) {
        if(!active(a))return;a.done=true;
        if(timeout){c.timeouts++;State s=c.states.get(a.lastNode);if(s!=null)nodeFailure(c,s);c.trace(a,a.lastNode,"attempt-timeout");}
        for(Visit held:a.holds){nodeFailure(c,held.state);release(c,held);}a.holds.clear();
        Logical l=a.logical;
        if(!policy&&a.number<c.request.option("retries",0)&&c.now<l.deadline) {
            double backoff=c.request.option("retryBackoffMs",100)/1000*Math.pow(2,a.number);
            double jitter=c.request.option("retryJitter",1);backoff*=1-jitter+jitter*random(c,a,"retry",5).nextDouble();
            if(c.now+backoff<l.deadline){c.trace(a,a.lastNode,"retry-scheduled");c.add(c.now+backoff,RETRY,null,null,a,l);return;}
        }
        finish(c,l,false,policy);
    }
    private void succeed(Context c,Attempt a){if(!active(a))return;a.done=true;for(Visit held:a.holds){nodeSuccess(held.state);release(c,held);}a.holds.clear();finish(c,a.logical,true,false);}
    private void finish(Context c,Logical l,boolean success,boolean policy){if(l.done)return;l.done=true;if(success){c.successful++;c.latencies.add((c.now-l.started)*1000);}else if(policy)c.rejected++;else c.errors++;}
    private void nodeSuccess(State s){s.failuresInRow=0;s.openUntil=0;s.probe=false;}
    private void nodeFailure(Context c,State s) {
        s.failed++;s.failuresInRow++;s.probe=false;
        if(s.node.value("breakerThreshold",0)>0&&s.failuresInRow>=s.node.value("breakerThreshold",0))s.openUntil=c.now+s.node.value("breakerResetSeconds",5);
    }
    private void replicate(Context c,State s,Attempt a) {
        if(!a.logical.read){s.writesAt.add(c.now);return;}
        if(s.replicas<=1||s.node.value("requireFreshReads",0)==1||s.writesAt.isEmpty())return;
        boolean follower=random(c,a,s.node.id(),6).nextInt(s.replicas)!=0;
        if(follower&&s.writesAt.getLast()>c.now-s.node.value("replicationLagMs",0)/1000){s.stale++;c.staleReads++;c.trace(a,s.node.id(),"stale-shared-record-read");}
    }
    private void sample(Context c) {
        for(State s:c.states.values()){s.reads.waiting.removeIf(v->!active(v.attempt));s.writes.waiting.removeIf(v->!active(v.attempt));}
        double width=c.now-c.lastSample;long success=c.successful-c.lastSuccess,failure=c.errors+c.rejected-c.lastFailure;
        c.samples.add(new Sample(c.now,success/width,success+failure==0?0:(double)failure/(success+failure),c.states.values().stream().mapToInt(State::queued).sum()));
        c.lastSuccess=c.successful;c.lastFailure=c.errors+c.rejected;c.lastSample=c.now;
        for(State s:c.states.values()) {
            // Purge expired queued visits before exposing instantaneous queue depth.
            s.reads.waiting.removeIf(v->!active(v.attempt));s.writes.waiting.removeIf(v->!active(v.attempt));
            c.nodeSamples.add(new NodeSample(c.now,s.node.id(),s.busy(),s.queued(),totalCapacity(c,s),s.replicas,s.completed,s.failed,s.openUntil>c.now||s.probe,s.stale));
            double load=(double)s.busy()/Math.max(1,totalCapacity(c,s));
            if(s.node.type()==NodeType.SERVICE&&!s.scalePending&&s.replicas<s.node.value("autoscaleMax",s.replicas)&&(load>=s.node.value("autoscaleThreshold",0.8)||s.queued()>0)) {
                s.scalePending=true;c.add(c.now+s.node.value("autoscaleDelaySeconds",5),SCALE,s,null,null,null);
            }
            drain(c,s,s.reads);drain(c,s,s.writes);
        }
    }
    private void scale(Context c,State s){s.scalePending=false;if(s.replicas<s.node.value("autoscaleMax",s.replicas)){s.replicas++;c.trace(null,s.node.id(),"scale-out");drain(c,s,s.reads);}}
    private Result result(Context c) {
        Map<String,NodeMetric> metrics=new LinkedHashMap<>();List<Finding> findings=new ArrayList<>();double cost=0;
        for(State s:c.states.values()) {
            double utilization=s.capacitySeconds==0?0:s.busySeconds/s.capacitySeconds;
            metrics.put(s.node.id(),new NodeMetric(s.node.id(),s.node.label(),s.visits/c.request.durationSeconds(),utilization,s.completed==0?0:s.residence/s.completed*1000,s.maxQueue,s.visits,s.failed));
            if(s.failed>0||s.maxQueue>5)findings.add(new Finding(s.failed>0?"critical":"warning",s.node.label()+" needs attention","Maximum queue "+s.maxQueue+"; attempt-level failures/rejections "+s.failed+". Inspect node timeline and bounded request traces.","nodes."+s.node.id()+".dropped"));
            double weight=s.node.type()==NodeType.CLIENT?0:s.node.type()==NodeType.DATABASE?0.04:s.node.type()==NodeType.CACHE||s.node.type()==NodeType.CDN?0.015:0.01;
            cost+=weight*s.costSeconds/c.horizon;
        }
        if(c.retries>0)findings.add(new Finding("warning","Retries amplify work",c.attempts+" attempts for "+c.requests+" logical requests; "+c.retries+" retries. Retries can continue while timed-out downstream work occupies slots.","telemetry.retries"));
        if(c.staleReads>0)findings.add(new Finding("warning","Replica reads can be stale",c.staleReads+" follower reads missed the latest committed version of the synthetic shared record. This is not a durability or consensus model.","telemetry.staleReads"));
        if(c.errors>0)findings.add(new Finding("critical","Some logical requests failed",c.errors+" errors after bounded attempts/deadlines; policy rejections are separate.","errors"));
        if(c.rejected>0)findings.add(new Finding("warning","Policy rejections",c.rejected+" requests rejected without automatic retry.","rejected"));
        if(findings.isEmpty())findings.add(new Finding("info","Modeled requests completed",c.successful+" successes. Validate assumptions before drawing conclusions.","successful"));
        c.latencies.sort(Double::compare);List<String> assumptions=new ArrayList<>(AnalyticEngine.ASSUMPTIONS);
        assumptions.addAll(List.of("Event quantiles include successful logical end-to-end requests including retry backoff; overall deadlines and attempt timeouts are explicit inputs. Empty-success quantiles are zero, not evidence of fast responses.",
            "Node latency is isolated stage residence including queue and optional synchronous dependency holding; whole-run utilization integrates occupied/capacity slots through the drain horizon. Timed-out local work continues occupying its slot until completion or horizon.",
            "Retries restart the full acyclic path, retain request identity/read-write type and share one overall deadline. Writes are synthetic and not idempotent: do not infer business correctness from retries.",
            "Circuit breakers use consecutive modeled node/held-dependency failures, a reset interval and one half-open probe. Scale-out adds one service replica after each observed-pressure delay; no scale-in or infrastructure provisioning is modeled.",
            "Replication tracks one synthetic shared record: a follower lags write commits by a fixed input delay; fresh-read mode uses the primary read pool. Independent read/write pools do not model database locking, consensus or data loss.",
            "Service-kill rejects new arrivals; dependency-outage rejects arrivals/completions at one selected synthetic dependency; slow-dependency multiplies newly started work by ten; AZ-outage removes one service replica for five seconds without killing in-flight work.",
            "Per-node samples are actual virtual-clock snapshots, not per-sample p95. Traces cover only the first sixteen logical requests, capped at 1500 events; absence is not proof that an event never occurred.",
            "Bounds: 30 nodes, 60 edges, 10000 logical arrivals, 200000 processed events, 40000 pending events, 5-second engine wall limit, <=130 virtual seconds. Worker process heap is configured separately; container memory enforcement requires deployment verification."));
        Telemetry telemetry=new Telemetry(c.attempts,c.retries,c.timeouts,c.circuitRejections,c.staleReads,c.processed,c.peakPending,List.copyOf(c.nodeSamples),List.copyOf(c.traces));
        return new Result(AnalyticEngine.VERSION,"2.0.0","discrete-event",c.request.seed(),c.requests,c.successful,c.errors,c.rejected,c.successful/c.request.durationSeconds(),quantile(c.latencies,.5),quantile(c.latencies,.95),quantile(c.latencies,.99),metrics,c.samples,findings,List.copyOf(assumptions),cost,telemetry);
    }
    private SplittableRandom random(Context c,Attempt a,String node,int stream) {long seed=c.request.seed()^a.logical.id*0x9e3779b97f4a7c15L^((long)a.number<<32)^((long)node.hashCode()<<8)^stream;return new SplittableRandom(seed);}
    private static double exponential(SplittableRandom rng,double mean){return -Math.log1p(-rng.nextDouble())*mean;}
    private static double quantile(List<Double> sorted,double p){return sorted.isEmpty()?0:sorted.get(Math.min(sorted.size()-1,(int)Math.ceil(p*sorted.size())-1));}
    public static final class SimulationTimeoutException extends RuntimeException {public SimulationTimeoutException(String message){super(message);}}
}
