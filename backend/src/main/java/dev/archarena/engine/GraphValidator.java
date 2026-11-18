package dev.archarena.engine;

import java.util.*;
import static dev.archarena.engine.Model.*;

public final class GraphValidator {
    public static final int MAX_EVENTS = 200_000;
    private static final Set<String> CONFIG = Set.of("replicas", "serviceMs", "concurrency", "hitRatio", "readRatio", "rate", "burst", "queueLimit");
    public void validate(Request request) {
        if (request == null || request.graph() == null) fail("A graph is required");
        Graph graph = request.graph();
        if (graph.nodes() == null || graph.edges() == null || graph.nodes().isEmpty() || graph.nodes().size() > 30 || graph.edges().size() > 60) fail("Use 1–30 nodes and at most 60 edges");
        if (!Double.isFinite(request.arrivalRate()) || request.arrivalRate() < 0.1 || request.arrivalRate() > 500) fail("Arrival rate must be 0.1–500 virtual requests/s");
        if (!Double.isFinite(request.durationSeconds()) || request.durationSeconds() < 5 || request.durationSeconds() > 120) fail("Duration must be 5–120 virtual seconds");
        if (!Set.of("steady", "spike").contains(Objects.toString(request.profile(), ""))) fail("Profile must be steady or spike");
        if (!Set.of("none", "service-kill", "cache-flush").contains(Objects.toString(request.failure(), ""))) fail("Unknown failure profile");
        if (request.seed() < 0 || request.seed() > 9_007_199_254_740_991L) fail("Seed must be a nonnegative safe JavaScript integer");
        double expected = request.arrivalRate() * request.durationSeconds() * (request.profile().equals("spike") ? 1.9 : 1);
        if (expected > 8000) fail("Reduce traffic or duration: expected arrivals exceed the 8,000 safety envelope");
        Map<String, Node> nodes = new HashMap<>();
        for (Node node : graph.nodes()) {
            if (node == null || node.id() == null || !node.id().matches("[a-zA-Z0-9_-]{1,48}") || node.type() == null || node.label() == null || node.label().length() > 80) fail("Each node needs an ID, supported type and label of at most 80 characters");
            if (nodes.put(node.id(), node) != null) fail("Duplicate node ID: " + node.id());
            if (node.config() != null) for (var entry : node.config().entrySet()) {
                if (!CONFIG.contains(entry.getKey()) || entry.getValue() == null || !Double.isFinite(entry.getValue())) fail("Unknown or non-finite node parameter");
            }
            range(node, "replicas", 1, 16, 1, true);
            range(node, "serviceMs", 0.1, 1000, 10, false);
            range(node, "concurrency", 1, 128, 1, true);
            range(node, "hitRatio", 0, 0.99, 0.8, false);
            range(node, "readRatio", 0, 1, 0.9, false);
            range(node, "rate", 0.1, 1000, 80, false);
            range(node, "burst", 1, 1000, 20, true);
            range(node, "queueLimit", 0, 2000, 200, true);
        }
        List<Node> clients = graph.nodes().stream().filter(n -> n.type() == NodeType.CLIENT).toList();
        if (clients.size() != 1 || graph.nodes().size() < 2) fail("Use exactly one client and at least one processing node");
        if (graph.nodes().stream().filter(n -> n.type()==NodeType.DATABASE).map(n -> n.value("readRatio",0.9)).distinct().count()>1) fail("All terminal databases must use the same workload read ratio");
        Map<String, List<String>> adjacency = new HashMap<>();
        Set<String> edgeIds = new HashSet<>();
        Set<String> pairs = new HashSet<>();
        for (Edge edge : graph.edges()) {
            if (edge == null || edge.id() == null || !edgeIds.add(edge.id()) || !nodes.containsKey(edge.source()) || !nodes.containsKey(edge.target()) || edge.source().equals(edge.target()) || !pairs.add(edge.source()+":"+edge.target())) fail("Edges need unique IDs, distinct existing endpoints and no duplicate connections");
            if (nodes.get(edge.target()).type() == NodeType.CLIENT) fail("Client cannot have incoming edges");
            adjacency.computeIfAbsent(edge.source(), k -> new ArrayList<>()).add(edge.target());
        }
        for (Node node : graph.nodes()) {
            int count = adjacency.getOrDefault(node.id(), List.of()).size();
            if (node.type() != NodeType.LOAD_BALANCER && count > 1) fail("Only a load balancer may route to multiple downstream nodes");
            if (node.type() != NodeType.DATABASE && count == 0) fail("Every request path must end at a database node");
            if (node.type() == NodeType.DATABASE && count != 0) fail("Database must be terminal in this model");
        }
        Set<String> visited = new HashSet<>();
        visit(clients.getFirst().id(), adjacency, new HashSet<>(), visited);
        if (visited.size() != nodes.size()) fail("Every node must be reachable from the client");
    }
    private void range(Node n, String key, double min, double max, double fallback, boolean integer) {
        double value = n.value(key, fallback);
        if (value < min || value > max || (integer && value != Math.rint(value))) fail(key + " must be " + min + "–" + max + (integer ? " and an integer" : ""));
    }
    private void visit(String id, Map<String,List<String>> edges, Set<String> stack, Set<String> visited) {
        if (stack.contains(id)) fail("Cycles and retry loops are not supported in engine v1");
        if (!visited.add(id)) return;
        stack.add(id);
        for (String next : edges.getOrDefault(id, List.of())) visit(next, edges, stack, visited);
        stack.remove(id);
    }
    private void fail(String message) { throw new IllegalArgumentException(message); }
}
