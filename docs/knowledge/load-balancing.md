---
id: load-balancing
status: draft
verified: no
verified_by: pending
verified_date: pending
sources: [SDI1]
model_parameters: [replicas, concurrency, serviceMs]
---

# Load balancing notes

## What it is plain

- [LB-01] A routing component can send incoming work to a group of servers rather than a single server. Source: SDI1, PDF page 14.

## Why it exists

- [LB-02] Increasing one server's resources and adding more servers are different scaling choices; one machine has resource limits. Source: SDI1, PDF page 13.

## How it works

Original teaching sketch: a community observatory has several identical check-in desks. A greeter sends the next visitor to a desk. The greeter routes work; the desks perform it. This sketch is an original analogy, not a claim about a particular load-balancing product or a copied book scenario.

## Rules of thumb and numbers

Assumption: give each independent desk the same service time and send comparable work to each. Doubling desks increases modeled desk capacity only under those assumptions; it does not establish a universal latency improvement. No measured server-capacity number is asserted here.

## Trade-offs

Model discussion: another desk adds cost in our illustrative model. A shared downstream stage may still limit the end-to-end path. This is a model inference to test, not an empirical guarantee.

## Failure modes

Discuss what happens when a desk cannot accept work and whether the routing component can itself fail. The current engine's five-second rejection input is not a real failover/health-check implementation.

## Misconceptions

“Twice as many service replicas means half the total response time” is a hypothesis to test, not an outcome to promise.

## Interview questions

Why can adding service replicas leave a database queue unchanged? Explain which stage's capacity changed, then inspect the same seeded model before and after.

## How ArchArena models it

Implementation source: `backend/src/main/java/dev/archarena/engine/AnalyticEngine.java` and `DiscreteEventEngine.java`. The load-balancer node chooses among outgoing routes uniformly; the service's `replicas` and `concurrency` determine parallel slots. This is not a least-connections router. No book is a source for our implementation's behavior.

## Sources

SDI1, Alex Xu, *System Design Interview: An Insider's Guide*, inspected PDF pages 13–14. See [source register](sources.md). Copyrighted; no open-content reuse license established. Analogy and proposed experiment are original project drafts.

## Verified by me

No. Awaiting the owner's claim and expression review. Date: pending. Not publishable.
