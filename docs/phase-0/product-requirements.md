# Phase 0 product requirements

## Goal and deliverables

Define a small, credible demo before writing application code. A candidate should be able to explain why a design saturates, make a change, and use modeled evidence to defend the trade-off. Deliver requirements, acceptance criteria, numeric targets, scope boundaries, capacity and cost estimates, a roadmap, ADRs and an evidence-backed risk register.

Plainly: build a learning lab, then a single interview exercise. Technically: React presents versioned graph inputs and results produced by a Java engine; the scorecard must reference the exact run and graph version. A pretty animation alone does not prove correctness.

## Personas

| Persona | Need | Release priority | Success signal to collect later |
|---|---|---|---|
| Java interview candidate | Turn Spring/SQL knowledge into defensible architecture decisions | Primary | Completes a URL-shortener exercise and explains a bottleneck using a cited metric |
| System design beginner | Understand cache, queue and replica behavior visually | Secondary | Predicts a lesson outcome, then explains the result after changing one variable |
| Working developer | Keep requirements, APIs and data model consistent | Later | Resolves a contradiction linked to specific artifacts |

Success experiment: invite three peers to try the demo locally or in an owner-operated session. Target: at least two complete the basic scenario within 20 minutes without developer intervention. Ask them to explain one trade-off. This is a proposed usability gate, not evidence of learning improvement or interview success.

## Release boundaries

| First portfolio release | v2 after evidence and time review | Later |
|---|---|---|
| Five short Learn lessons; reusable graph presets | Larger lesson/problem catalog | Design Studio requirements through LLD |
| One URL-shortener Practice problem | Richer interviewer state machine and rubric calibration | Cross-artifact rules and AI checker |
| Analytic estimates plus bounded seeded discrete-event runs | Replication lag, connection pools, richer retry policy and cascading failures | Diagram/text synchronization and document PDF export |
| Client, load balancer, service, cache, DB and queue/worker behaviors | CDN and external API behavior, slow dependency and AZ outage | Public multi-user launch and collaboration |
| Steady load and 10x spike; service kill and cache flush | Diurnal, read-heavy and thundering-herd profiles; autoscaling delay | Cost-efficiency leaderboard, boss fights, daily challenges |
| Metrics, time-series animation and deterministic rubric findings | Extensive golden-design AI eval set and broader scoring | Monetization and optional 3D last |
| Optional grounded AI adapter with explicit unavailable state | Multiple tested AI provider adapters | Full production deployment |
| Basic lesson completion, local/persisted owner progress | XP, levels, streaks, stars and badges with server validation | Hiring-selection or real-world benchmark claims |

Advanced engine requests in the original brief remain backlog items; do not claim them as first-release capabilities. Cross-cutting security, bounded computation, result provenance, accessibility and truthful labeling are release gates, not deferrable polish.

## User stories and acceptance criteria

### Learn mode — first release

**L1 — Predict and observe.** As a learner I choose a lesson, predict a change, move a control, and see why the outcome changes.

- The UI shows the assumption, units, baseline graph and prediction before revealing results.
- A control change settles for 400 ms before submission; one active preview and one latest pending request per browser session. Superseded responses never overwrite the latest result.
- Every displayed result identifies its graph version, seed, engine version and assumptions version. Replay renders that result rather than generating new numbers in the browser.
- Loading, invalid-input and failed-run states remain usable; last successful results are visibly marked stale after an edit.

**L2 — Complete the first five lessons.** Each lesson has one prediction, an explanation, a preset, one control and a checkpoint:

| Lesson | Control | Required observation and checkpoint |
|---|---|---|
| Load balancing | Service replicas 1–4 | Compare per-replica utilization and capacity under equal routing; explain why extra replicas do not fix a saturated DB |
| Caching | Hit ratio 0–95% | Observe DB request-rate change; explain why hits must be cheaper than misses under the stated assumptions |
| Replication | Read replicas 0–3 | Route reads separately from writes; show fixed write capacity and disclose simplified consistency and omitted replication lag |
| Queues and backpressure | Workers 1–8 and arrival rate | Compare queue depth, rejected work and drain time; explain why a queue does not create service capacity |
| Rate limiting | Allowed rate and burst | Distinguish policy rejections from service errors; explain protecting a downstream bottleneck |

- Inputs outside defined bounds are rejected by the server with actionable validation messages.
- Checkpoints are evaluated using backend results and fixture-specific thresholds, not a browser-reported score.
- Numeric input alternatives, keyboard controls and reduced-motion/static rendering provide the same information.

**L3 — Resume learning.** As the demo owner I can resume completed lessons after restarting. Acceptance: completions persist locally in the backend store; clearing a demo resets progress explicitly; no unearned public rank is claimed.

### Practice mode — basic first release

**P1 — Clarify one problem.** As a candidate I start “URL shortener, 100 million new URLs/day” and record requirements before drawing.

- Scenario distinguishes new URL creation from redirect reads, and states retention, payload and peak factors.
- A scripted Q&A based on the hidden problem spec works without AI. Optional AI only paraphrases allowed facts; unavailable AI is labeled and does not fabricate answers.
- Session captures requirement notes and estimation assumptions. Stored content is treated as data.

**P2 — Estimate capacity.** I enter reads per write, peak factor and bytes per record.

- QPS, storage and bandwidth show formulas, units and decimal-versus-binary conventions; zero, negative and non-finite inputs are rejected.
- The interview workload is normalized into bounded virtual traffic for the simulator. Display original workload, scale factor and model limits. Never pretend to generate 100M real requests/day.

**P3 — Compare two designs.** I edit a supported graph and run baseline and spike profiles.

- Graph editing supports adding, connecting, deleting, undo/redo and selecting a preset. Server rejects unsupported cycles/types and dangling edges according to the future schema.
- A saved run is immutable and linked to graph version and seed. Baseline and revised design comparisons use the same traffic profile and seed.
- Results show p50/p95/p99 latency, successful throughput, policy rejections, errors, utilization, queue depth, bottleneck ranking and an explicitly rough cost estimate.
- UI gives the user a readable reason when resource bounds are exceeded; no partial output is labeled complete.

**P4 — Explain and review.** I write a trade-off and receive a nine-dimension scorecard: requirements, estimation, data model, API, scalability, reliability, trade-offs, cost awareness and communication.

- Deterministic findings identify the run and metric, such as a failed traffic target or single DB. A score is accompanied by the rubric and evidence.
- Dimensions without sufficient submitted evidence are “not assessed,” never silently zero or AI-invented proficiency. Basic Practice includes text fields for API/data model reasoning; it does not generate their artifacts.
- Optional AI critique must cite existing metric paths and values. Unsupported metric citations are rejected, and deterministic results remain available.
- Export a Markdown summary with assumptions, graph JSON, run metadata, results and scorecard. No claim that scores predict hiring outcomes.

### Design Studio — future acceptance contract only

**D1 — Trace requirements.** A working developer links a requirement to estimates, service nodes, API ownership and data entities. Acceptance: every artifact has a version; unresolved references are listed. Deferred.

**D2 — Find contradictions.** Rules flag an unowned endpoint and 99.99% availability requested with a single database, with artifact references and rationale. AI findings are separately labeled suggestions. Acceptance: rerunning on unchanged input is stable for deterministic rules. Deferred.

**D3 — Export a coherent design.** Markdown/PDF includes requirements, calculations, HLD, API, ER/SQL, class/sequence diagrams and ADRs from one snapshot. Acceptance: no mixed versions or unscoped share links. Deferred.

## Numeric non-functional requirements

All are unmeasured acceptance targets. Reference demo hardware for future tests: 2 vCPU, 4 GiB RAM, with CPU model, OS, JVM and container limits recorded; test on equivalent local limits before choosing any AWS instance. A smaller instance is not assumed sufficient.

| Area | First-release target | Full production design goal, not a demo promise |
|---|---|---|
| Simultaneous sessions | 5 owner-operated sessions | 100 sessions |
| Analytic previews | 30/min globally; burst maximum 2 requests/s | 300/min |
| Discrete-event admissions | 6/min global, 2/min per session; 1 active worker and 4 waiting | 60/min across workers |
| API latency | p95 ≤250 ms for validation/read/admission at stated load, excluding run and AI time | p95 ≤250 ms under production load test |
| Analytic preview | p95 ≤500 ms end to end on local reference test | Same goal after scaling |
| Simulation duration | p95 ≤3 s execution and ≤20 s from submission at the admission limits; hard wall timeout 5 s | p95 ≤3 s execution with measured horizontal sizing |
| AI response | 15 s hard timeout, at most one retry inside that deadline | Provider-specific SLO after evals |
| Availability | 99% during declared demo windows over 30 days; scheduled-off time explicitly excluded | 99.9% monthly, including failures; requires multi-AZ design |
| Graph | ≤30 nodes, ≤60 edges, graph JSON ≤64 KiB | 300-node UI design target; simulator cap only raised after testing |
| Engine bounds | ≤200,000 processed events; ≤120 virtual seconds; ≤10,000 arrivals; bounded queue lengths; 256 MiB worker container target | Per-worker bounds remain; scale worker count |
| Retention | Raw time series/chat 7 days; owner designs/summaries 30 days; logs 3 days; rolling backup 7 days | Policy reviewed before public launch |
| Recovery | Owner-demo RPO ≤24 h, RTO ≤2 h within an operating window | RPO ≤15 min and RTO ≤1 h after restore drills |
| Browser/accessibility | Latest two stable Chrome/Edge/Firefox and current Safari; WCAG 2.2 AA target; all core flows keyboard usable; motion preference honored | Same, measured with larger graphs |
| UI performance | 30-node interaction p95 frame ≤33 ms on documented test hardware; Lighthouse accessibility ≥95, performance ≥90 in repeatable local production-build run | Profile 300 nodes before enabling |

Memory containment requires an isolated worker process/container; interrupting a Java thread alone is not a memory cap. Bounds and correctness are mandatory before exposing run submission beyond loopback.

## Out of scope

First release excludes public sign-up, teams, payments, voice interviews, executing user code, live benchmarking of arbitrary endpoints, uploading confidential diagrams, unrestricted graphs, arbitrary scripting, 300-node simulation, public leaderboards, guaranteed accuracy of modeled AWS costs and 3D. No real cloud resources are provisioned from a canvas.

## Definition of portfolio launch

Five lessons and one Practice flow work from a clean local setup; the simulator passes published correctness tolerances; the offline path works without AI; authorizations and resource limits pass negative tests; core browser flows pass; recordings and restore instructions exist. AWS is optional and can proceed only with verified account eligibility and a cost worksheet. No unmeasured resume numbers or claims of production availability.
