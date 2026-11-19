# Bounded simulation v2

The engine models request flow under explicit educational assumptions. It never runs user Java, resolves a user-supplied URL, contacts a cloud API or proves a company's business invariants. HLD graphs remain acyclic, while retries are a separate bounded policy.

## Supported model behavior

| Area | Implementation / boundary |
|---|---|
| Components | Client, load balancer, Java service, cache, database, queue/workers, rate limiter, CDN and synthetic external API. Paths terminate at database or external API. Only load balancers branch, uniformly. |
| Queueing | Seeded Poisson arrivals, independent exponential stage service, finite FIFO queues, bounded concurrency and separate read/write database pools. Optional fixed stage network delay in event mode. |
| Estimates | Stable Erlang-C M/M/c mean calculation; analytic p95/p99 are explicitly rough mean multipliers. Initial steady capacity only; it omits retries, incidents, dependency holding, lag and scale-out. |
| Retries | Zero to three full-path retries, exponential backoff and bounded jitter, shared read/write request identity and overall deadline. Policy rejections are not automatically retried. |
| Timeouts | Attempt timeout and overall logical deadline. Timed-out local service continues consuming a slot until completion or the simulation horizon; upstream held slots release when the attempt ends. |
| Cascading pressure | A node can hold its occupied slot while waiting for downstream response. Slow/failing dependencies propagate pressure and failure to held upstream stages. This is not a complete model of threads, connection pools or every cascade mechanism. |
| Circuit breakers | Consecutive node/held-dependency failures open a circuit, followed by a reset delay and single half-open probe. Held-upstream success is recorded only after downstream success. Queued work was already admitted and is not revoked by opening a breaker. |
| Autoscaling | Service-only scale-out, one replica after each observed-pressure delay, up to a configured maximum. No scale-in, provisioning failure, placement scheduler or cloud controller. |
| Replication | Fixed follower lag for one synthetic shared record. Reads may choose a follower; fresh-read mode uses a separate primary read pool. No real keys, locking, quorum, consensus, durability or lost-write model. |
| Failures | Five-second service-arrival rejection, cache/CDN hit flush, selected dependency outage, tenfold newly started dependency slowdown, or loss of one service replica without killing in-flight work. |
| Results | Logical success/errors/policy rejections, successful-request end-to-end quantiles including backoff, node visit/failure metrics, queue peaks and integrated slot occupancy through drain. No-success quantiles are zero, not proof of speed. |
| Replay | Returned global buckets and exact virtual per-node snapshots. Play/pause and 1×/4×/8× step through samples; p95 is not fabricated per sample. Up to 1,500 event traces from only the first sixteen logical arrivals. |
| Cost | Time-weighted configured replica counts and illustrative model weights, not AWS prices or a bill. |

## Input and safety limits

Legacy six-field requests still deserialize. Optional numeric `options` accepts `retries` (0–3), `retryBackoffMs` (0–2000), `retryJitter` (0–1), `attemptTimeoutMs` (50–10000), and `deadlineMs` (100–10000); attempt timeout must not exceed the overall deadline. The default is no retries and a two-second overall/attempt deadline.

Node config adds `failureProbability`, `networkMs`, `holdUpstream`, `breakerThreshold`, `breakerResetSeconds`, service-only `autoscaleMax`/`autoscaleThreshold`/`autoscaleDelaySeconds`, and database-only `replicationLagMs`/`requireFreshReads`. Input ranges are enforced server-side, including finite values and integral counts. Existing graph saves keep these parameters. Saved run inputs include options in idempotency matching; old stored requests can be normalized before comparing legacy hashes.

Hard envelopes: 30 nodes, 60 edges, 64 KiB request body, expected arrivals ≤8,000, actual logical arrivals ≤10,000, retries ≤3, processed events ≤200,000, pending events ≤40,000, virtual input duration ≤120 seconds, deadline ≤10 seconds and engine wall-clock guard five seconds. Samples are at one-second boundaries plus a possible final partial bucket. The worker JVM uses a 128 MiB local heap; container/native-memory enforcement still requires a deployment test. Encoded stored results are capped at 1 MiB.

The terminal graph and full-path retry restrictions intentionally limit expressiveness. Do not label them universal system-design rules. Arbitrary fan-out/join, workflows, distributed locks, trip matching, payment correctness and user Java execution are outside this engine.

## Validation

`EngineTest` retains independent M/M/1 and M/M/c theory checks, finite-sampling comparisons, deterministic replay, workload accounting, cache-write preservation and rate-limit distinction. `ResilienceEngineTest` checks retry recovery/bounds, no retry on policy rejection, occupied timed-out work, cascading pressure, breaker recovery, delayed scale-out, stale/fresh reads, CDN/external terminals, every incident profile, large-capacity numerical stability, malformed inputs, result-size bound, isolated stage residence and interruption. API tests check option persistence/idempotency and stored telemetry.

An initial breaker test failed because local completion reset upstream failures before the held dependency finished. Success now closes/resets that breaker only after downstream success. Keep this regression test; a compile-only check would miss the bug.

The existing 30-node/128 MiB benchmark reports actual local execution times and heap-pool peaks in `docs/evidence/engine-v2-benchmark.txt`. It is sequential JVM evidence, not API throughput, container RSS or a full-stack latency claim. Re-run after the final dependency update before reporting final measurements.

## Remaining simulation presentation work

The core v2 model and sampled replay are distinct from the aspirational game UI. Smooth request particles, 300-node renderer/60 fps validation, quality controls and full mobile graph readability remain UI work. Traces are bounded, so particle paths must not imply complete production-like trace capture. PostgreSQL/container isolation and real-backend browser tests remain verification tasks until their evidence exists.

## Three interview answers

**Why retry outside the graph?** Keeping topology acyclic bounds traversal and simplifies validation. A separate attempt counter/backoff/shared deadline lets retries amplify actual modeled work without arbitrary graph loops.

**Why can a timeout worsen overload?** The client may stop waiting while work still occupies a downstream slot. A retry can add another attempt to the same bottleneck; dependency holding also ties up upstream slots.

**Why are good latency results insufficient to prove an Uber design?** The queueing engine does not establish exclusive driver assignment, payment idempotency or state-machine correctness. Those require separate domain invariants, concurrency contracts and tests.
