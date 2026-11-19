package dev.archarena.engine;

import org.junit.jupiter.api.Test;
import java.util.*;
import static dev.archarena.engine.Model.*;
import static org.assertj.core.api.Assertions.*;

class ResilienceEngineTest {
    Node n(String id,NodeType type,Map<String,Double> config){return new Node(id,type,id,config);}
    Graph chain(Node... stages){List<Node> nodes=new ArrayList<>();nodes.add(n("c",NodeType.CLIENT,Map.of()));nodes.addAll(List.of(stages));List<Edge> edges=new ArrayList<>();for(int i=1;i<nodes.size();i++)edges.add(new Edge("e"+i,nodes.get(i-1).id(),nodes.get(i).id()));return new Graph(nodes,edges);}
    Result run(Graph g,double rate,String failure,Map<String,Double> options){return new DiscreteEventEngine().run(new Request(g,rate,30,42,"steady",failure,options));}
    @Test void retryRecoveryIsBoundedAndPreservesLogicalAccounting(){
        Graph g=chain(n("api",NodeType.EXTERNAL_API,Map.of("serviceMs",2.0,"failureProbability",0.5)));
        Result base=run(g,40,"none",Map.of()),retry=run(g,40,"none",Map.of("retries",3.0,"retryBackoffMs",10.0));
        assertThat(retry.requests()).isEqualTo(base.requests());assertThat(retry.successful()).isGreaterThan(base.successful());
        assertThat(retry.telemetry().attempts()).isBetween(retry.requests(),retry.requests()*4);
        assertThat(retry.telemetry().retries()).isEqualTo(retry.telemetry().attempts()-retry.requests());
        assertThat(retry.successful()+retry.errors()+retry.rejected()).isEqualTo(retry.requests());
    }
    @Test void policyRejectionsAreNeverAutomaticallyRetried(){
        Result r=run(chain(n("lim",NodeType.RATE_LIMITER,Map.of("rate",1.0,"burst",1.0)),n("db",NodeType.DATABASE,Map.of("serviceMs",0.1))),40,"none",Map.of("retries",3.0));
        assertThat(r.rejected()).isPositive();assertThat(r.telemetry().retries()).isZero();
    }
    @Test void timeoutsDoNotFreeRunningDependencyWorkAndHoldingPropagatesPressure(){
        Node db=n("db",NodeType.DATABASE,Map.of("serviceMs",800.0,"queueLimit",0.0,"readRatio",1.0));
        Map<String,Double> plain=Map.of("serviceMs",1.0,"concurrency",1.0,"queueLimit",0.0);
        Map<String,Double> held=new HashMap<>(plain);held.put("holdUpstream",1.0);
        Result a=run(chain(n("s",NodeType.SERVICE,plain),db),20,"none",Map.of());
        Result b=run(chain(n("s",NodeType.SERVICE,held),db),20,"none",Map.of("attemptTimeoutMs",100.0,"retries",2.0));
        assertThat(b.nodes().get("s").dropped()).isGreaterThan(a.nodes().get("s").dropped());
        assertThat(b.telemetry().timeouts()).isPositive();assertThat(b.telemetry().retries()).isPositive();
        assertThat(b.telemetry().nodeTimeline()).anyMatch(s->s.nodeId().equals("db")&&s.busy()>0);
    }
    @Test void breakerOpensAndRecoversAfterSyntheticDependencyOutage(){
        Result r=run(chain(n("s",NodeType.SERVICE,Map.of("holdUpstream",1.0,"breakerThreshold",2.0,"breakerResetSeconds",1.0)),n("api",NodeType.EXTERNAL_API,Map.of("serviceMs",1.0))),30,"dependency-outage",Map.of());
        assertThat(r.telemetry().circuitRejections()).isPositive();
        assertThat(r.telemetry().nodeTimeline()).anyMatch(s->s.nodeId().equals("s")&&s.circuitOpen());
        assertThat(r.telemetry().nodeTimeline()).filteredOn(s->s.nodeId().equals("s")&&s.timeSeconds()>25).allMatch(s->!s.circuitOpen());
    }
    @Test void autoscalingHasAnObservableDelayAndBoundedReplicaCount(){
        Graph g=chain(n("s",NodeType.SERVICE,Map.of("serviceMs",100.0,"concurrency",1.0,"autoscaleMax",4.0,"autoscaleDelaySeconds",3.0)),n("db",NodeType.DATABASE,Map.of("serviceMs",0.1)));
        Result r=run(g,40,"none",Map.of());
        var samples=r.telemetry().nodeTimeline().stream().filter(s->s.nodeId().equals("s")).toList();
        assertThat(samples).filteredOn(s->s.timeSeconds()<4).allMatch(s->s.replicas()==1);
        assertThat(samples).anyMatch(s->s.replicas()>1);assertThat(samples).allMatch(s->s.replicas()<=4);
        Result fixed=run(chain(n("s",NodeType.SERVICE,Map.of("serviceMs",100.0,"concurrency",1.0)),n("db",NodeType.DATABASE,Map.of("serviceMs",0.1))),40,"none",Map.of());
        assertThat(r.successful()).isGreaterThan(fixed.successful());
    }
    @Test void followerLagIsVisibleAndFreshReadModeAvoidsFollowerStaleness(){
        Map<String,Double> config=new HashMap<>(Map.of("serviceMs",1.0,"replicas",3.0,"readRatio",0.7,"replicationLagMs",500.0));
        Result lag=run(chain(n("db",NodeType.DATABASE,config)),80,"none",Map.of());
        config.put("requireFreshReads",1.0);Result fresh=run(chain(n("db",NodeType.DATABASE,config)),80,"none",Map.of());
        assertThat(lag.telemetry().staleReads()).isPositive();assertThat(fresh.telemetry().staleReads()).isZero();
    }
    @Test void cdnServesReadsAndExternalApiCanBeATerminalWithoutARealNetworkCall(){
        Result r=run(chain(n("cdn",NodeType.CDN,Map.of("hitRatio",0.99)),n("api",NodeType.EXTERNAL_API,Map.of("serviceMs",1.0))),40,"none",Map.of());
        assertThat(r.successful()).isPositive();assertThat(r.nodes().get("api").visits()).isLessThan(r.requests()/3);
        assertThat(new AnalyticEngine().run(new Request(chain(n("api",NodeType.EXTERNAL_API,Map.of())),5,5,42,"steady","none")).p95Ms()).isFinite();
    }
    @Test void everyFailureProfileHasConsistentBoundedSamplesAndReplay(){
        Graph g=chain(n("s",NodeType.SERVICE,Map.of("holdUpstream",1.0,"replicas",2.0)),n("db",NodeType.DATABASE,Map.of("serviceMs",5.0)));
        for(String failure:List.of("none","service-kill","cache-flush","dependency-outage","slow-dependency","az-outage")){
            Result r=run(g,30,failure,Map.of("retries",1.0));
            assertThat(run(g,30,failure,Map.of("retries",1.0))).isEqualTo(r);
            assertThat(r.requests()).isEqualTo(r.successful()+r.errors()+r.rejected());
            assertThat(r.telemetry().processedEvents()).isLessThanOrEqualTo(GraphValidator.MAX_EVENTS);
            assertThat(r.telemetry().peakPendingEvents()).isLessThanOrEqualTo(40000);
            assertThat(r.telemetry().traces()).hasSizeLessThanOrEqualTo(1500);
            assertThat(r.telemetry().nodeTimeline()).hasSize(32*3);
            assertThat(r.telemetry().nodeTimeline()).allMatch(s->s.busy()>=0&&s.queueDepth()>=0);
        }
    }
    @Test void largeMmcCapacityAndPureWorkloadMixDoNotCreateNaNs(){
        assertThat(AnalyticEngine.mmcMeanSeconds(500,1,2048)).isFinite();
        for(double read:List.of(0.0,1.0))assertThat(new AnalyticEngine().run(new Request(chain(n("db",NodeType.DATABASE,Map.of("readRatio",read,"serviceMs",1000.0))),30,30,42,"steady","none")).p95Ms()).isFinite();
    }
    @Test void malformedOptionsAndInvalidScalingAreRejected(){
        Graph g=chain(n("db",NodeType.DATABASE,Map.of()));
        for(Map<String,Double> options:List.of(Map.of("retries",4.0),Map.of("deadlineMs",Double.NaN),Map.of("evil",1.0),Map.of("attemptTimeoutMs",3000.0)))assertThatThrownBy(()->run(g,30,"none",options)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(()->run(chain(n("db",NodeType.DATABASE,Map.of("autoscaleMax",3.0))),30,"none",Map.of())).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void thirtyNodeResultFitsStorageBoundAndIsolatedLatencyDoesNotAccumulateUpstream()throws Exception {
        List<Node> nodes=new ArrayList<>();for(int i=0;i<28;i++)nodes.add(n("s"+i,NodeType.SERVICE,Map.of("serviceMs",1.0,"concurrency",4.0)));
        nodes.add(n("db",NodeType.DATABASE,Map.of("serviceMs",1.0,"readRatio",1.0)));
        Graph g=chain(nodes.toArray(Node[]::new));Result r=run(g,20,"none",Map.of());
        assertThat(r.telemetry().nodeTimeline()).hasSize(30*32);
        assertThat(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsBytes(r).length).isLessThan(1024*1024);
        assertThat(r.nodes().get("db").meanLatencyMs()).isLessThan(5);
        assertThat(r.nodes().values()).allMatch(n->n.utilization()>=0&&n.utilization()<=1.000001);
    }
    @Test void staticReplicaCostAgreesAcrossAnalyticAndEventModels(){
        Graph g=chain(n("cdn",NodeType.CDN,Map.of("replicas",2.0)),n("db",NodeType.DATABASE,Map.of("replicas",3.0)));
        assertThat(run(g,20,"none",Map.of()).roughCostPerHour()).isCloseTo(AnalyticEngine.cost(g),within(1e-9));
    }
    @Test void interruptionStopsBoundedExecutionAndOptionsSurviveLegacyJson()throws Exception {
        try {Thread.currentThread().interrupt();assertThatThrownBy(()->run(chain(n("db",NodeType.DATABASE,Map.of())),40,"none",Map.of())).isInstanceOf(DiscreteEventEngine.SimulationTimeoutException.class);}
        finally {Thread.interrupted();}
        var json=new com.fasterxml.jackson.databind.ObjectMapper();
        Request legacy=json.readValue("{\"graph\":null,\"arrivalRate\":1,\"durationSeconds\":5,\"seed\":42,\"profile\":\"steady\",\"failure\":\"none\"}",Request.class);
        assertThat(legacy.option("retries",0)).isZero();
    }
}
