package dev.archarena.engine;

import java.util.List;
import java.util.Map;

public final class Model {
    private Model() {}
    public enum NodeType { CLIENT, LOAD_BALANCER, SERVICE, CACHE, DATABASE, QUEUE, RATE_LIMITER }
    public record Node(String id, NodeType type, String label, Map<String, Double> config) {
        public double value(String key, double fallback) { return config == null ? fallback : config.getOrDefault(key, fallback); }
    }
    public record Edge(String id, String source, String target) {}
    public record Graph(List<Node> nodes, List<Edge> edges) {}
    public record Request(Graph graph, double arrivalRate, double durationSeconds, long seed, String profile, String failure) {}
    public record NodeMetric(String id, String label, double arrivalRate, double utilization, double meanLatencyMs, int maxQueueDepth, long visits, long dropped) {}
    public record Sample(double timeSeconds, double throughputRps, double errorRate, int queueDepth) {}
    public record Finding(String severity, String title, String detail, String metric) {}
    public record Result(String engineVersion, String assumptionsVersion, String mode, long seed,
                         long requests, long successful, long errors, long rejected, double throughputRps,
                         double p50Ms, double p95Ms, double p99Ms, Map<String, NodeMetric> nodes,
                         List<Sample> timeline, List<Finding> findings, List<String> assumptions, double roughCostPerHour) {}
}
