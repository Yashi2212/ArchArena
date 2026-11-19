package dev.archarena.engine;

import java.util.*;
import static dev.archarena.engine.Model.*;

public final class AnalyticEngine implements SimulationEngine {
    public static final String VERSION = "2.0.0";
    public static final List<String> ASSUMPTIONS = List.of(
        "Educational model, not a benchmark or prediction of deployed AWS performance.",
        "Poisson arrivals; exponential independent service times; FIFO finite queues; no real network or TLS. Event mode optionally adds fixed node network delay; analytic mode omits it.",
        "Cache hits complete at the cache. Misses continue downstream; hit ratio is an input, not a learned cache state.",
        "Database writes use a separate primary pool; replicas add read capacity. Event mode models one synthetic shared-record replication lag, not a real database.",
        "Load balancers split routes uniformly; acyclic paths end at a database or synthetic external API. No actual external network calls occur.",
        "Queue nodes process work before downstream stages; event mode supports bounded retries, circuit breakers, dependency holding, delayed service scale-out and synthetic failures.",
        "Costs use illustrative per-node weights, not live AWS pricing or a billing estimate."
    );
    public static int servers(Node node, boolean read) {
        int replicas = (int)node.value("replicas", 1);
        if (node.type() == NodeType.DATABASE && (!read || node.value("requireFreshReads",0)==1)) replicas = 1;
        return replicas * (int)node.value("concurrency", node.type() == NodeType.SERVICE ? 4 : 1);
    }
    public static double serviceSeconds(Node node) {
        return node.value("serviceMs", switch (node.type()) {
            case CLIENT -> 0.1;
            case LOAD_BALANCER, RATE_LIMITER -> 0.5;
            case CACHE, CDN -> 2;
            case EXTERNAL_API -> 100;
            case SERVICE -> 20;
            case DATABASE -> 15;
            case QUEUE -> 40;
        }) / 1000;
    }
    public static double mmcMeanSeconds(double lambda, double mu, int c) {
        if (lambda <= 0) return 1 / mu;
        double a = lambda / mu, rho = a / c;
        if (rho >= 1) return Double.POSITIVE_INFINITY;
        double erlangB=1;
        for(int k=1;k<=c;k++) erlangB=a*erlangB/(k+a*erlangB);
        double probabilityWait=erlangB/(1-rho+rho*erlangB);
        return 1 / mu + probabilityWait / (c * mu - lambda);
    }
    @Override public Result run(Request request) {
        new GraphValidator().validate(request);
        Map<String, List<String>> outgoing = outgoing(request.graph());
        Map<String, Double> readRates = new HashMap<>(), writeRates = new HashMap<>();
        String entry = request.graph().nodes().stream().filter(n -> n.type() == NodeType.CLIENT).findFirst().orElseThrow().id();
        double inputReadRatio = request.graph().nodes().stream().filter(n -> n.type()==NodeType.DATABASE).findFirst().map(n->n.value("readRatio",0.9)).orElse(0.9);
        readRates.put(entry, request.arrivalRate()*inputReadRatio);
        writeRates.put(entry, request.arrivalRate()*(1-inputReadRatio));
        List<Node> ordered = topological(request.graph());
        Map<String, NodeMetric> metrics = new LinkedHashMap<>();
        List<Finding> findings = new ArrayList<>();
        double weightedMean = 0;
        boolean unstable = false;
        for (Node node : ordered) {
            double reads=readRates.getOrDefault(node.id(),0.0), writes=writeRates.getOrDefault(node.id(),0.0);
            double lambda = reads+writes;
            double service = serviceSeconds(node);
            int c = servers(node, true);
            double utilization = lambda * service / c;
            double mean;
            if (node.type() == NodeType.DATABASE) {
                double readFraction = lambda==0?0:reads/lambda;
                double readLambda = reads, writeLambda = writes;
                // Reads and writes use explicitly separate pools in this simplified model.
                double readMean = mmcMeanSeconds(readLambda, 1/service, servers(node, true));
                double writeMean = mmcMeanSeconds(writeLambda, 1/service, servers(node, false));
                utilization = Math.max(readLambda * service / servers(node,true), writeLambda * service / servers(node,false));
                mean = (reads==0?0:readFraction*readMean)+(writes==0?0:(1-readFraction)*writeMean);
            } else mean = mmcMeanSeconds(lambda, 1/service, c);
            boolean saturated = !Double.isFinite(mean);
            unstable |= saturated;
            double displayMean = saturated ? 2000 : mean * 1000;
            weightedMean += displayMean * lambda / request.arrivalRate();
            metrics.put(node.id(), new NodeMetric(node.id(), node.label(), lambda, utilization, displayMean, 0, 0, 0));
            if (utilization >= 0.8) findings.add(new Finding(utilization >= 1 ? "critical" : "warning", node.label() + (saturated ? " is saturated" : " is near capacity"), "Modeled utilization " + Math.round(utilization*100) + "%. More upstream service replicas do not remove this bottleneck.", "nodes."+node.id()+".utilization"));
            if ((node.type() == NodeType.CACHE || node.type()==NodeType.CDN)) reads *= 1 - node.value("hitRatio", 0.8);
            if (node.type() == NodeType.RATE_LIMITER) {
                double fraction=Math.min(1,node.value("rate",80)/Math.max(0.0001,reads+writes));
                reads*=fraction;writes*=fraction;
            }
            List<String> next = outgoing.getOrDefault(node.id(), List.of());
            for (String target : next) {
                readRates.merge(target,reads/next.size(),Double::sum);
                writeRates.merge(target,writes/next.size(),Double::sum);
            }
        }
        if (findings.isEmpty()) findings.add(new Finding("info", "No analytic saturation", "This is a steady-state approximation. Run the seeded experiment to inspect finite queues and spikes.", "nodes"));
        return new Result(VERSION,"2.0.0","analytic",request.seed(),0,0,0,0,request.arrivalRate(),weightedMean,weightedMean * 3,weightedMean * 4.6,metrics,List.of(),findings,
            concat(ASSUMPTIONS, List.of("Analytic p95/p99 are rough mean multipliers, not measured quantiles; 2,000 ms is a saturation display sentinel, not a finite queueing solution.", "Analytic estimates use initial steady capacity and ignore retries, breakers, scaling, dependency holding, lag and failure injection; use event mode for those effects.")),cost(request.graph()));
    }
    public static Map<String,List<String>> outgoing(Graph graph) {
        Map<String,List<String>> result = new HashMap<>();
        graph.edges().stream().sorted(Comparator.comparing(Edge::id)).forEach(e -> result.computeIfAbsent(e.source(), k -> new ArrayList<>()).add(e.target()));
        return result;
    }
    public static List<Node> topological(Graph graph) {
        Map<String,Integer> degree = new HashMap<>();
        Map<String,Node> map = new TreeMap<>();
        graph.nodes().forEach(n -> {degree.put(n.id(),0);map.put(n.id(),n);});
        graph.edges().forEach(e -> degree.merge(e.target(),1,Integer::sum));
        PriorityQueue<String> ready = new PriorityQueue<>();
        degree.forEach((id,d) -> {if(d==0) ready.add(id);});
        List<Node> result = new ArrayList<>();
        var edges = outgoing(graph);
        while (!ready.isEmpty()) {
            String id=ready.remove(); result.add(map.get(id));
            for(String next:edges.getOrDefault(id,List.of())) if(degree.merge(next,-1,Integer::sum)==0) ready.add(next);
        }
        return result;
    }
    public static double cost(Graph graph) { return graph.nodes().stream().mapToDouble(n -> switch(n.type()) {case CLIENT -> 0;case CACHE, CDN -> 0.015*n.value("replicas",1);case DATABASE -> 0.04*n.value("replicas",1);default -> 0.01*n.value("replicas",1);}).sum(); }
    private static <T> List<T> concat(List<T> a,List<T> b) {List<T> out=new ArrayList<>(a);out.addAll(b);return List.copyOf(out);}
}
