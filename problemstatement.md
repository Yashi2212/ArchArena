# Why ArchArena exists

## The problem

A Java backend developer can build controllers, SQL queries and services yet still struggle to answer: “What breaks first at ten times the traffic?” Static architecture diagrams name components without demonstrating their limits. An ungrounded AI answer can sound authoritative while inventing latency or capacity. Running real infrastructure for every learning experiment is expensive and hard to reproduce.

ArchArena gives that developer a repeatable experiment: predict an outcome, change an architecture, run a bounded model, inspect evidence and explain a trade-off. It is a learning tool, not a benchmark of AWS or a predictor of hiring success.

## A concrete learning journey

Yashi models a URL shortener. Writes average about 1,157/s for 100 million new URLs/day. Reads are a separate assumption, not another name for writes. A baseline model shows a database bottleneck. She increases service replicas; the database remains saturated. She then introduces a read cache, compares the same seeded workload and checks the reduction in modeled database demand. She explains the trade-off: improved read capacity, cache invalidation complexity and unchanged write capacity.

The lesson is the causal chain and its assumptions. The latency shown is a model output, not a real measured database latency. Every run must retain its graph snapshot, parameters, seed and engine version so a reviewer can reproduce it.

## Who benefits

| Person | Existing difficulty | How the product helps | Evidence still needed |
|---|---|---|---|
| Java interview candidate | Memorizes components but cannot defend choices | Capacity calculator, architecture canvas and evidence-backed feedback | Observe peers completing the scenario and explaining their decisions |
| Beginner | Cannot visualize overload, queue growth or cache misses | Five short lessons, predictions, sliders and result playback | Lesson usability and checkpoint completion observations |
| Working developer, later | Requirements and design artifacts contradict one another | Versioned Design Studio consistency checks | Deferred implementation and rule-accuracy evaluation |

## Why these features belong together

Learn supplies intuition; Practice asks the learner to apply it. Sharing one engine avoids teaching one set of semantics in lessons and scoring another in interviews. Future Design Studio can attach those same experiments to requirements and design documents. Building three separate engines would increase code and semantic drift without helping the user.

## What the first release resolves

It makes bottlenecks and trade-offs inspectable within explicit simplifying assumptions. It preserves design and result provenance, supports a no-AI path, and lets the developer demonstrate Java engineering through validation, bounded execution, persistence and tests.

It does not establish how a real deployment performs, eliminate the need for real load testing, guarantee accurate AI grading, teach every distributed-systems behavior or replace a human interviewer. Public multi-user operation and Design Studio remain separate milestones.

## Success measures

Targets, not results: at least two of three peer testers complete one Practice exercise within 20 minutes without developer help; each can identify the bottleneck and describe one trade-off using an actual run metric. Engineering gates include deterministic replay, analytic validation, bounded execution, graceful AI failure and reproducible local startup. Record actual observations in evidence files before making portfolio claims.

## Why not just a diagramming app, AI chat or a real cluster?

A diagram is necessary but cannot alone explain modeled overload. AI can explain but must be constrained by evidence. A real cluster is valuable later but adds costs and uncontrolled environmental variables. A bounded simulator is the useful middle step, provided its assumptions and unsupported behaviors are visible. Interactive simulations and AI practice already exist; ArchArena's proposed value is the shared, inspectable workflow, not an unsupported uniqueness claim.

## Why concentrate on system-design learning and practice?

The target learner is a Java developer preparing for system-design interviews. Reading terminology alone leaves an application gap: turning requirements into system boundaries, choosing data access patterns, defending concurrency invariants and explaining failure recovery. A single generic graph can also make HLD and class-level design look interchangeable.

ArchArena addresses that gap with an ordered exercise route, distinct HLD and LLD artifacts, scenario-specific requirements and a predict/change/run/review loop. HLD connects assumptions to modeled queueing evidence. LLD asks for contracts, ownership, transaction/concurrency decisions and behavioral tests. Uber-inspired practice makes the gap concrete: good simulated latency cannot prove exclusive driver assignment. The coach surfaces missing reasoning instead of awarding an inflated architecture score.

The current slice supplies forty original exercise briefs and twenty company-inspired problems, not a complete theory course or factual company architecture library. Its value is structured practice and visible evidence boundaries. Learning outcomes, interview success and time saved have not been measured. Full reviewed theory, domain-aware correctness checks and optional evaluated AI assistance remain separate deliverables.

## What the resilience simulator adds

Learners need to see why a timeout or retry can make a bad situation worse. Counting only successful throughput hides work still occupying a slow dependency. Engine v2 separates logical outcomes from attempt pressure, permits synchronous upstream holding, and makes breaker recovery, delayed capacity and synthetic staleness visible through sampled telemetry. This helps learners compare assumptions and explain trade-offs; it does not establish actual company behavior, production performance or business correctness.

Security is treated similarly: all twenty requested controls have explicit local evidence, non-applicability or an open deployment gap. A public demo must not expose the current shared local owner merely because model tests or vulnerability scans pass.
