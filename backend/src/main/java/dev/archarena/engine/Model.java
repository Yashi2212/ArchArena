package dev.archarena.engine;

import java.util.List;
import java.util.Map;

public final class Model {
    private Model() {}
    public enum NodeType { CLIENT, LOAD_BALANCER, SERVICE, CACHE, DATABASE, QUEUE, RATE_LIMITER, CDN, EXTERNAL_API }
    public record Node(String id, NodeType type, String label, Map<String, Double> config) {
        public double value(String key, double fallback) { return config == null ? fallback : config.getOrDefault(key, fallback); }
    }
    public record Edge(String id, String source, String target) {}
    public record Graph(List<Node> nodes, List<Edge> edges) {}
    public record Request(Graph graph, double arrivalRate, double durationSeconds, long seed, String profile, String failure, Map<String,Double> options) {
        public Request(Graph graph,double arrivalRate,double durationSeconds,long seed,String profile,String failure) {this(graph,arrivalRate,durationSeconds,seed,profile,failure,Map.of());}
        public double option(String key,double fallback) {return options==null?fallback:options.getOrDefault(key,fallback);}
    }
    public record NodeMetric(String id, String label, double arrivalRate, double utilization, double meanLatencyMs, int maxQueueDepth, long visits, long dropped) {}
    public record Sample(double timeSeconds, double throughputRps, double errorRate, int queueDepth) {}
    public record Finding(String severity, String title, String detail, String metric) {}
    public record NodeSample(double timeSeconds,String nodeId,int busy,int queueDepth,int capacity,int replicas,long completed,long failures,boolean circuitOpen,long staleReads) {}
    public record Trace(long requestId,int attempt,double timeSeconds,String nodeId,String event) {}
    public record Telemetry(long attempts,long retries,long timeouts,long circuitRejections,long staleReads,int processedEvents,int peakPendingEvents,List<NodeSample> nodeTimeline,List<Trace> traces) {}
    public record Result(String engineVersion, String assumptionsVersion, String mode, long seed,
                         long requests, long successful, long errors, long rejected, double throughputRps,
                         double p50Ms, double p95Ms, double p99Ms, Map<String, NodeMetric> nodes,
                         List<Sample> timeline, List<Finding> findings, List<String> assumptions, double roughCostPerHour, Telemetry telemetry) {
        public Result(String engineVersion,String assumptionsVersion,String mode,long seed,long requests,long successful,long errors,long rejected,double throughputRps,double p50Ms,double p95Ms,double p99Ms,Map<String,NodeMetric> nodes,List<Sample> timeline,List<Finding> findings,List<String> assumptions,double roughCostPerHour) {
            this(engineVersion,assumptionsVersion,mode,seed,requests,successful,errors,rejected,throughputRps,p50Ms,p95Ms,p99Ms,nodes,timeline,findings,assumptions,roughCostPerHour,null);
        }
    }
}
