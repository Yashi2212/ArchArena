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
