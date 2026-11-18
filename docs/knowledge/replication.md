---
id: replication
status: draft
verified: no
verified_by: pending
verified_date: pending
sources: [DDIA1]
model_parameters: [replicas, readRatio, concurrency]
---

# Database replication notes

## What it is plain

- [RE-01] In a leader-based design, updates go through the leader while read requests can be served by followers. Source: DDIA1, PDF page 217.

## Why it exists

The lesson separates the desire for more read capacity from the different requirements of durability, consistency and failure recovery. A replica count alone cannot demonstrate all of them.

## How it works

Original teaching sketch: an observatory records booking changes at one official desk. Other desks use their own copies to answer viewing-slot questions. The distinction between the official update point and the answer copies is the idea to examine; it is not a copied source scenario.

## Rules of thumb and numbers

Assumption for the project experiment: most requests are reads. Change the read fraction rather than asserting a universal production read/write ratio. Replica count is a model input, not a measured availability percentage.

## Trade-offs

- [RE-02] Synchronous and asynchronous replication differ in when updates propagate and when a write is acknowledged. Source: DDIA1, PDF page 207.

## Failure modes

- [RE-03] A follower that has not caught up can answer with an older view of the data. Source: DDIA1, PDF page 218.

## Misconceptions

The current replica slider does not prove failover, a recovery time, cross-zone durability or fresh reads. Those behaviors are not implemented by adding parallel read slots.

## Interview questions

Why does a read-heavy architecture benefit differently from more replicas than a write-heavy one? Distinguish request routing from data-copy correctness before discussing capacity.

## How ArchArena models it

Implementation source: `AnalyticEngine.java` and `DiscreteEventEngine.java`. The simplified database has separate read and write pools. `replicas` affects read slots; write capacity uses a single primary pool. Lag, acknowledgment protocols, stale values and failover are not simulated. This is a capacity lesson, not a consistency demonstration.

## Sources

DDIA1, Martin Kleppmann, *Designing Data-Intensive Applications*, first edition, inspected PDF pages 207, 217–218. See [source register](sources.md). The supplied second-edition early release does not contain its replication chapter and is not used for these claims.

## Verified by me

No. Awaiting the owner's claim and expression review. Date: pending. Not publishable.
