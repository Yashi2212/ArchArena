package dev.archarena.engine;

import org.junit.jupiter.api.Test;
import java.util.*;
import static dev.archarena.engine.Model.*;
import static org.assertj.core.api.Assertions.*;

class EngineTest {
    static Graph graph(int replicas,double serviceMs) {
        return new Graph(List.of(new Node("client",NodeType.CLIENT,"Client",Map.of()),new Node("db",NodeType.DATABASE,"Database",Map.of("serviceMs",serviceMs,"replicas",(double)replicas,"readRatio",1.0,"queueLimit",1000.0))),List.of(new Edge("a","client","db")));
    }
    static Request request(Graph graph,double rate,double duration,long seed) {return new Request(graph,rate,duration,seed,"steady","none");}
    @Test void mm1AndMmcClosedForms() {
        assertThat(AnalyticEngine.mmcMeanSeconds(30,50,1)).isCloseTo(0.05,within(1e-10));
        assertThat(AnalyticEngine.mmcMeanSeconds(90,50,3)).isCloseTo(0.02591240875912409,within(1e-10));
        assertThat(AnalyticEngine.mmcMeanSeconds(50,50,1)).isInfinite();
    }
    @Test void eventMeansMatchExponentialQueueingAtModerateUtilization() {
        // Independent theory oracle; startup transient is included. 25% tolerance accounts for finite seeded sampling.
        for(int servers:List.of(1,3)) {
            double rate=servers==1?30:90;
            double measured=0;
            for(long seed=1;seed<=3;seed++) measured+=new DiscreteEventEngine().run(request(graph(servers,20),rate,servers==1?120:80,seed)).nodes().get("db").meanLatencyMs()/3;
            double expected=AnalyticEngine.mmcMeanSeconds(rate,50,servers)*1000+0.1;
            assertThat(measured).isCloseTo(expected,within(expected*0.25));
        }
    }
    @Test void replayIsExactAndNodeOrderDoesNotAffectIt() {
        Request req=request(graph(2,15),60,30,42);
        Result first=new DiscreteEventEngine().run(req);
        assertThat(new DiscreteEventEngine().run(req)).isEqualTo(first);
        List<Node> reversed=new ArrayList<>(req.graph().nodes());Collections.reverse(reversed);
        assertThat(new DiscreteEventEngine().run(request(new Graph(reversed,req.graph().edges()),60,30,42))).isEqualTo(first);
    }
    @Test void requestAccountingAndQuantilesStayConsistentAcrossSeeds() {
        for(long seed=0;seed<20;seed++) {
            Result r=new DiscreteEventEngine().run(request(graph(1,40),100,20,seed));
            assertThat(r.successful()+r.errors()+r.rejected()).isEqualTo(r.requests());
            assertThat(r.p50Ms()).isBetween(0.0,r.p95Ms());
            assertThat(r.p95Ms()).isBetween(r.p50Ms(),r.p99Ms());
            assertThat(r.p99Ms()).isLessThanOrEqualTo(2000);
            assertThat(r.timeline()).hasSize(22);
        }
    }
    @Test void analyticCapacityIsMonotoneForIndependentReadOnlyDatabase() {
        double previous=Double.POSITIVE_INFINITY;
        for(int replicas=1;replicas<=8;replicas++) {
            Result result=new AnalyticEngine().run(request(graph(replicas,20),30,30,1));
            assertThat(result.p50Ms()).isLessThanOrEqualTo(previous+1e-9);previous=result.p50Ms();
        }
    }
    @Test void cacheNeverEliminatesWrites() {
        Graph graph=new Graph(List.of(new Node("c",NodeType.CLIENT,"Client",Map.of()),new Node("cache",NodeType.CACHE,"Cache",Map.of("hitRatio",0.99)),new Node("db",NodeType.DATABASE,"DB",Map.of("readRatio",0.0))),List.of(new Edge("a","c","cache"),new Edge("b","cache","db")));
        assertThat(new AnalyticEngine().run(request(graph,20,10,1)).nodes().get("db").arrivalRate()).isEqualTo(20);
        Result event=new DiscreteEventEngine().run(request(graph,20,10,1));
        assertThat(event.nodes().get("db").visits()).isEqualTo(event.requests());
    }
    @Test void rejectsCyclesUnknownParametersAndUnboundedInputs() {
        Graph cycle=new Graph(List.of(new Node("c",NodeType.CLIENT,"Client",Map.of()),new Node("s",NodeType.SERVICE,"Service",Map.of()),new Node("db",NodeType.DATABASE,"DB",Map.of())),List.of(new Edge("1","c","s"),new Edge("2","s","s")));
        assertThatThrownBy(()->new GraphValidator().validate(request(cycle,20,30,1))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(()->new GraphValidator().validate(request(graph(1,20),500,120,1))).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(()->new GraphValidator().validate(request(graph(1,Double.NaN),10,10,1))).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void rateLimitIsSeparateFromServiceErrors() {
        Graph graph=new Graph(List.of(new Node("c",NodeType.CLIENT,"Client",Map.of()),new Node("limit",NodeType.RATE_LIMITER,"Limiter",Map.of("rate",5.0,"burst",1.0)),new Node("db",NodeType.DATABASE,"DB",Map.of("serviceMs",0.1))),List.of(new Edge("a","c","limit"),new Edge("b","limit","db")));
        Result result=new DiscreteEventEngine().run(request(graph,50,20,1));
        assertThat(result.rejected()).isGreaterThan(500);assertThat(result.errors()).isZero();
        assertThat(result.successful()).isLessThanOrEqualTo(101);
    }
}
