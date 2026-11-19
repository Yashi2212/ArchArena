package dev.archarena.engine;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.*;
import static dev.archarena.engine.Model.*;

public final class EngineBenchmark {
    public static void main(String[] args) {
        List<Node> thirty=new ArrayList<>();List<Edge> edges=new ArrayList<>();
        thirty.add(new Node("c",NodeType.CLIENT,"Client",Map.of()));
        for(int i=1;i<30;i++){thirty.add(new Node("n"+i,i==29?NodeType.DATABASE:NodeType.SERVICE,"Stage "+i,Map.of("serviceMs",1.0,"concurrency",4.0)));edges.add(new Edge("e"+i,i==1?"c":"n"+(i-1),"n"+i));}
        Graph graph=new Graph(thirty,edges);
        for(int i=0;i<5;i++)new DiscreteEventEngine().run(new Request(graph,20,120,i,"steady","none"));
        ManagementFactory.getMemoryPoolMXBeans().forEach(pool->{if(pool.isValid())pool.resetPeakUsage();});
        List<Double> times=new ArrayList<>();long arrivals=0,events=0;int pending=0;
        for(int i=0;i<20;i++) {long start=System.nanoTime();Result r=new DiscreteEventEngine().run(new Request(graph,20,120,i,"steady","none"));times.add((System.nanoTime()-start)/1_000_000.0);arrivals+=r.requests();events+=r.telemetry().processedEvents();pending=Math.max(pending,r.telemetry().peakPendingEvents());}
        times.sort(Double::compare);
        System.out.println("ArchArena v2 virtual engine benchmark, not deployed-system performance");
        System.out.println("UTC: "+Instant.now()+"; Java: "+System.getProperty("java.version")+"; VM: "+System.getProperty("java.vm.name"));
        System.out.println("OS: "+System.getProperty("os.name")+" "+System.getProperty("os.arch")+"; processors: "+Runtime.getRuntime().availableProcessors());
        System.out.println("VM arguments: "+ManagementFactory.getRuntimeMXBean().getInputArguments());
        System.out.println("Workload: 30 nodes, 29 edges, 20 req/s, 120 virtual seconds, steady, exponential 1ms stages, seeds 0-19, 5 warmup runs");
        System.out.println("Runs: 20; logical arrivals: "+arrivals+"; processed events: "+events+"; peak pending events: "+pending);
        System.out.printf(Locale.ROOT,"Execution p50 %.3f ms; p95 %.3f ms; max %.3f ms%n",times.get(9),times.get(18),times.getLast());
        long peakHeap=ManagementFactory.getMemoryPoolMXBeans().stream().filter(p->p.getType()==java.lang.management.MemoryType.HEAP).mapToLong(p->p.getPeakUsage().getUsed()).sum();
        System.out.println("Sum of heap-pool peak usage MiB: "+peakHeap/1024.0/1024+"; max heap MiB: "+Runtime.getRuntime().maxMemory()/1024/1024);
        System.out.println("Pool peaks are not simultaneous RSS. Sequential JVM only; no HTTP/DB/startup/queue-wait/container or 300-node renderer measurement. Does not certify a full-stack SLO.");
    }
}
