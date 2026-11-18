---
id: queues
status: draft
verified: no
verified_by: pending
verified_date: pending
sources: [SDI1, DDIA1]
model_parameters: [concurrency, queueLimit, serviceMs]
---

# Queues and backpressure notes

## What it is plain

- [QU-01] Producers can hand work to a messaging layer for consumers to process separately. Source: SDI1, PDF page 34; DDIA1, PDF page 581.

## Why it exists

The experiment asks whether work can wait safely and how much waiting is acceptable. More queued work must not be confused with more finished work.

## How it works

Original teaching sketch: a science fair sends repair tickets to a robot workshop. Tickets wait on a board; available robots take them. More board space is not the same intervention as more working robots. This original sketch explains the project model, not a guarantee about a messaging product.

## Rules of thumb and numbers

Assumption: arrivals temporarily exceed the workers' modeled completion rate. Compare queue depth and successful throughput before increasing worker `concurrency`. Do not prescribe a queue size without workload, waiting-time and resource assumptions.

## Trade-offs

- [QU-02] When production outruns consumption, buffering, rejecting work and slowing producers are distinct design responses. Source: DDIA1, PDF page 582.

## Failure modes

- [QU-03] Queue growth and message durability introduce storage/resource and failure-recovery questions; they are not automatically solved by naming a broker. Source: DDIA1, PDF page 582.

## Misconceptions

The engine's queue stage is not a proof of durable delivery, acknowledgment, replay or exactly-once processing. Those are different requirements from modeling a finite waiting line.

## Interview questions

Why can increasing a queue limit worsen user waiting without raising throughput? Explain which model resource controls storage and which controls processing capacity.

## How ArchArena models it

Implementation source: `DiscreteEventEngine.java`. A QUEUE node has finite FIFO waiting and processing slots controlled by `concurrency`; `queueLimit` caps waiting. There is a request deadline and overflow can fail work. It does not currently propagate producer slowdown or model a durable broker. The application job queue is a separate database-backed implementation, not this educational node.

## Sources

SDI1, Alex Xu, PDF page 34; DDIA1, Martin Kleppmann, PDF pages 581–582. See [source register](sources.md). No source queue diagram, task example or code is reused.

## Verified by me

No. Awaiting the owner's claim and expression review. Date: pending. Not publishable.
