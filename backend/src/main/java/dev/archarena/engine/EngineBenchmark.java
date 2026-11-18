package dev.archarena.engine;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.*;
import static dev.archarena.engine.Model.*;

public final class EngineBenchmark {
    public static void main(String[] args) {
        Graph graph=new Graph(List.of(new Node("c",NodeType.CLIENT,"Client",Map.of()),new Node("s",NodeType.SERVICE,"Service",Map.of("replicas",2.0)),new Node("db",NodeType.DATABASE,"Database",Map.of("serviceMs",20.0,"readRatio",1.0))),List.of(new Edge("a","c","s"),new Edge("b","s","db")));
        for(int i=0;i<10;i++)new DiscreteEventEngine().run(new Request(graph,30,120,i,"steady","none"));
        List<Double> times=new ArrayList<>();long events=0;
        for(int i=0;i<50;i++) {long start=System.nanoTime();Result result=new DiscreteEventEngine().run(new Request(graph,30,120,i,"steady","none"));times.add((System.nanoTime()-start)/1_000_000.0);events+=result.requests();}
        times.sort(Double::compare);
        System.out.println("ArchArena engine benchmark — not an API or deployed-system benchmark");
        System.out.println("UTC timestamp: "+Instant.now());
        System.out.println("Java: "+System.getProperty("java.version")+"; VM: "+System.getProperty("java.vm.name"));
        System.out.println("OS: "+System.getProperty("os.name")+" "+System.getProperty("os.arch"));
        System.out.println("Visible logical processors: "+Runtime.getRuntime().availableProcessors()+"; max heap MiB: "+Runtime.getRuntime().maxMemory()/1024/1024);
        System.out.println("VM arguments: "+ManagementFactory.getRuntimeMXBean().getInputArguments());
        System.out.println("Workload: 3 nodes, 2 edges, 30 virtual requests/s, 120 virtual seconds, steady, exponential service, seeds 0–49, 10 warmup runs");
        System.out.println("Measured runs: 50; generated requests across measured runs: "+events);
        System.out.printf(Locale.ROOT,"Execution p50: %.3f ms; p95: %.3f ms; max: %.3f ms%n",times.get(24),times.get(47),times.getLast());
        System.out.println("Single JVM, sequential runs; no worker startup, DB, HTTP, queue wait, container isolation or 30-node coverage. These timings cannot establish the full-stack SLO.");
    }
}
