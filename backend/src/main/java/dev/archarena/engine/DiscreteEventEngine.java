package dev.archarena.engine;

import java.util.*;
import static dev.archarena.engine.Model.*;

/** A per-run virtual clock. No user code, HTTP, sleep, database or global RNG. */
public final class DiscreteEventEngine implements SimulationEngine {
    private record Call(long id, double started, double deadline, boolean read) {}
    private record Event(double time, long order, int kind, String node, Call call) {}
    private static final class Pool {
        int busy;
        final ArrayDeque<Call> waiting = new ArrayDeque<>();
    }
    private static final class Stats {
        long visits, dropped, completed;
        int maxQueue;
        double busySeconds, residenceSeconds;
    }
    private static final class Context {
        final PriorityQueue<Event> events = new PriorityQueue<>(Comparator.comparingDouble(Event::time).thenComparingLong(Event::order));
        final Map<String,Node> nodes = new TreeMap<>();
        final Map<String,Pool> pools = new HashMap<>();
        final Map<String,Stats> stats = new TreeMap<>();
        final Map<String,double[]> tokens = new HashMap<>();
        final Set<Long> finished = new HashSet<>();
        final List<Double> latencies = new ArrayList<>();
        final List<Sample> samples = new ArrayList<>();
        long order, requests, success, errors, rejected, lastSuccess, lastFailed;
        void add(double time,int kind,String node,Call call) { events.add(new Event(time,order++,kind,node,call)); }
        void end(Call call, double time, boolean error, boolean policy) {
            if (!finished.add(call.id())) return;
            if(policy) rejected++; else if(error) errors++; else {success++;latencies.add((time-call.started())*1000);}
        }
    }
    @Override public Result run(Request request) {
        new GraphValidator().validate(request);
        Context c = new Context();
        var outgoing = AnalyticEngine.outgoing(request.graph());
        for(Node node:request.graph().nodes()) {c.nodes.put(node.id(),node); c.stats.put(node.id(),new Stats());}
        SplittableRandom random = new SplittableRandom(request.seed());
        String entry = c.nodes.values().stream().filter(n->n.type()==NodeType.CLIENT).findFirst().orElseThrow().id();
        double readRatio=c.nodes.values().stream().filter(n->n.type()==NodeType.DATABASE).findFirst().map(n->n.value("readRatio",0.9)).orElse(0.9);
        // Piecewise-constant Poisson intensity; independent generation per interval avoids carrying a baseline gap through a spike boundary.
        double[] boundaries=request.profile().equals("spike") ? new double[]{0,request.durationSeconds()*0.5,request.durationSeconds()*0.6,request.durationSeconds()} : new double[]{0,request.durationSeconds()};
        for(int segment=0;segment<boundaries.length-1;segment++) {
            double rate=request.arrivalRate()*(request.profile().equals("spike")&&segment==1?10:1);
            double t=boundaries[segment];
            while((t += exponential(random,1/rate))<boundaries[segment+1]) {
                if(++c.requests>10_000) throw new IllegalArgumentException("Arrival safety bound exceeded; reduce load");
                Call call=new Call(c.requests,t,t+2,random.nextDouble()<readRatio);
                c.add(t,0,entry,call);
                c.add(call.deadline(),2,null,call);
            }
        }
        for(int t=1;t<=Math.ceil(request.durationSeconds()+2);t++) c.add(t,3,null,null);
        int processed=0;
        long deadline=System.nanoTime()+5_000_000_000L;
        String killed=c.nodes.values().stream().filter(n->n.type()==NodeType.SERVICE).findFirst().map(Node::id).orElse("");
        while(!c.events.isEmpty()) {
            if(++processed>GraphValidator.MAX_EVENTS) throw new IllegalArgumentException("Event safety bound exceeded");
            if((processed&255)==0 && (System.nanoTime()>deadline || Thread.currentThread().isInterrupted())) throw new SimulationTimeoutException("Simulation wall-clock deadline exceeded");
            Event e=c.events.remove();
            if(e.kind()==3) {
                int depth=c.pools.values().stream().mapToInt(p->p.waiting.size()).sum();
                long successes=c.success-c.lastSuccess, failures=c.errors+c.rejected-c.lastFailed;
                c.samples.add(new Sample(e.time(),successes,successes+failures==0?0:(double)failures/(successes+failures),depth));
                c.lastSuccess=c.success;c.lastFailed=c.errors+c.rejected;
                continue;
            }
            Call call=e.call();
            if(e.kind()==2) {if(!c.finished.contains(call.id())) c.end(call,e.time(),true,false);continue;}
            Node node=c.nodes.get(e.node());
            Stats stat=c.stats.get(node.id());
            String key=node.id()+(node.type()==NodeType.DATABASE?(call.read()?":read":":write"):"");
            Pool pool=c.pools.computeIfAbsent(key,k->new Pool());
            if(e.kind()==1) {
                pool.busy--;
                while(!pool.waiting.isEmpty()) {
                    Call waiting=pool.waiting.removeFirst();
                    if(!c.finished.contains(waiting.id())&&waiting.deadline()>e.time()) {start(c,node,pool,waiting,e.time(),random,stat);break;}
                }
                if(c.finished.contains(call.id())) continue;
                stat.residenceSeconds+=e.time()-call.started();
                stat.completed++;
                boolean hit=node.type()==NodeType.CACHE&&call.read()&&random.nextDouble()<hitRatio(node,request,e.time());
                List<String> next=outgoing.getOrDefault(node.id(),List.of());
                if(hit||next.isEmpty()) c.end(call,e.time(),false,false);
                else c.add(e.time(),0,next.get(next.size()==1?0:random.nextInt(next.size())),call);
                continue;
            }
            if(c.finished.contains(call.id())) continue;
            stat.visits++;
            boolean killedNow=request.failure().equals("service-kill")&&node.id().equals(killed)&&e.time()>=request.durationSeconds()*0.5&&e.time()<request.durationSeconds()*0.5+5;
            if(killedNow) {stat.dropped++;c.end(call,e.time(),true,false);continue;}
            if(node.type()==NodeType.RATE_LIMITER) {
                double burst=node.value("burst",20),rate=node.value("rate",80);
                double[] bucket=c.tokens.computeIfAbsent(node.id(),k->new double[]{burst,e.time()});
                bucket[0]=Math.min(burst,bucket[0]+(e.time()-bucket[1])*rate);bucket[1]=e.time();
                if(bucket[0]<1) {stat.dropped++;c.end(call,e.time(),false,true);continue;}
                bucket[0]--;
            }
            if(pool.busy<AnalyticEngine.servers(node,call.read())) start(c,node,pool,call,e.time(),random,stat);
            else if(pool.waiting.size()<(int)node.value("queueLimit",200)) {pool.waiting.addLast(call);stat.maxQueue=Math.max(stat.maxQueue,pool.waiting.size());}
            else {stat.dropped++;c.end(call,e.time(),true,false);}
        }
        Map<String,NodeMetric> metrics=new LinkedHashMap<>();
        List<Finding> findings=new ArrayList<>();
        for(Node node:c.nodes.values()) {
            Stats stat=c.stats.get(node.id());
            int capacity=AnalyticEngine.servers(node,true)+(node.type()==NodeType.DATABASE?AnalyticEngine.servers(node,false):0);
            double utilization=stat.busySeconds/((request.durationSeconds()+2)*capacity);
            metrics.put(node.id(),new NodeMetric(node.id(),node.label(),stat.visits/request.durationSeconds(),utilization,stat.completed==0?0:stat.residenceSeconds/stat.completed*1000,stat.maxQueue,stat.visits,stat.dropped));
            if(stat.maxQueue>5||stat.dropped>0) findings.add(new Finding(stat.dropped>0?"critical":"warning",node.label()+" needs attention", "Maximum modeled queue "+stat.maxQueue+"; node rejections/failures "+stat.dropped+".","nodes."+node.id()+".maxQueueDepth"));
        }
        if(c.errors>0) findings.add(new Finding("critical","Some requests failed",c.errors+" of "+c.requests+" modeled requests failed or exceeded the 2-second deadline.","errors"));
        if(c.rejected>0) findings.add(new Finding("warning","Rate limiting protected downstream work",c.rejected+" modeled requests were rejected by policy, separately from service errors.","rejected"));
        if(findings.isEmpty()) findings.add(new Finding("info","The modeled workload completed",c.success+" successful requests. Try the same seed with a 10x spike and compare tail latency.","successful"));
        if(c.nodes.values().stream().anyMatch(n->n.type()==NodeType.DATABASE&&n.value("replicas",1)==1)) findings.add(new Finding("warning","Single database failure domain","One configured database replica is not a highly available database deployment.","nodes"));
        c.latencies.sort(Double::compare);
        List<String> assumptions=new ArrayList<>(AnalyticEngine.ASSUMPTIONS);
        assumptions.add("Event engine quantiles use successful end-to-end requests only; failures and policy rejections are counted separately. A 2-second request deadline applies.");
        assumptions.add("Utilization counts service scheduled through a two-second drain window, including timed-out in-flight work; timeline includes drain buckets. Node mean latency is cumulative residence from entry, not isolated node latency.");
        assumptions.add("Service kill rejects new arrivals for five virtual seconds; it does not kill already scheduled work. Cache flush forces misses for five seconds.");
        return new Result(AnalyticEngine.VERSION,"1.0.0","discrete-event",request.seed(),c.requests,c.success,c.errors,c.rejected,c.success/request.durationSeconds(),quantile(c.latencies,0.5),quantile(c.latencies,0.95),quantile(c.latencies,0.99),metrics,c.samples,findings,List.copyOf(assumptions),AnalyticEngine.cost(request.graph()));
    }
    private static void start(Context c,Node node,Pool pool,Call call,double time,SplittableRandom rng,Stats stat) {
        pool.busy++;
        double seconds=exponential(rng,AnalyticEngine.serviceSeconds(node));
        // Timed-out service is not canceled by this model: it continues occupying its slot.
        stat.busySeconds+=seconds;
        c.add(time+seconds,1,node.id(),call);
    }
    private double hitRatio(Node n,Request r,double t) { return r.failure().equals("cache-flush")&&t>=r.durationSeconds()*0.5&&t<r.durationSeconds()*0.5+5?0:n.value("hitRatio",0.8); }
    private static double exponential(SplittableRandom random,double mean) {return -Math.log1p(-random.nextDouble())*mean;}
    private static double quantile(List<Double> sorted,double p) {return sorted.isEmpty()?0:sorted.get(Math.min(sorted.size()-1,(int)Math.ceil(p*sorted.size())-1));}
    public static final class SimulationTimeoutException extends RuntimeException {public SimulationTimeoutException(String message){super(message);}}
}
