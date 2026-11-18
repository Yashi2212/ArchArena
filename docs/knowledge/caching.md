---
id: caching
status: draft
verified: no
verified_by: pending
verified_date: pending
sources: [SDI1]
model_parameters: [hitRatio, readRatio, serviceMs]
---

# Caching notes

## What it is plain

- [CA-01] A cache keeps reusable results so some repeated requests can avoid doing the original retrieval again. Source: SDI1, PDF page 20.

## Why it exists

The learning question is which repeated reads can skip expensive downstream work, rather than assuming a cache makes every operation cheap.

## How it works

Original teaching sketch: a planetarium desk keeps a quick-reference card for today's show times while the official schedule remains elsewhere. Finding the answer on the card is a hit; needing the schedule is a miss. This is our own analogy, not a prescription for a production cache strategy.

## Rules of thumb and numbers

Assumption: 80 out of 100 read lookups hit the cache. That leaves 20 modeled read misses; writes must be counted separately. These are illustrative inputs, not measured results or an optimal hit ratio from a source.

## Trade-offs

- [CA-02] Cached copies need a freshness policy; changes to the original data and its cached copy can disagree. Source: SDI1, PDF page 21.

## Failure modes

- [CA-03] A volatile cache must not be the only place important data is kept. Source: SDI1, PDF page 21.

## Misconceptions

High hit ratio is not a statement that writes disappeared or that the application meets an availability target. Our model's hit ratio is an assumption, not a measured cache eviction result.

## Interview questions

Which requests still reach the database after adding a read cache? Separate read misses from writes, then explain what the model omits about freshness.

## How ArchArena models it

Implementation source: `DiscreteEventEngine.java`, `hitRatio` behavior and `AnalyticEngine.java` read/write propagation. Hits complete at the cache only for reads. Misses and writes continue. The cache-flush input forces a temporary miss interval; it does not implement entries, eviction, expiry or invalidation races.

## Sources

SDI1, Alex Xu, *System Design Interview: An Insider's Guide*, inspected PDF pages 20–21. See [source register](sources.md). No copied code, diagrams or open-license claim. The sample counts and scenario above are project assumptions/original drafts.

## Verified by me

No. Awaiting the owner's claim and expression review. Date: pending. Not publishable.
