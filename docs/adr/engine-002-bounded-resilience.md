# ADR Engine-002: bounded resilience and traceable replay

Date: 2026-11-19. Implemented; final results live in the engine-v2 evidence record.

The original acyclic queueing prototype could not explain retry amplification, held upstream resources, breaker recovery or delayed scale-out. Options were arbitrary cyclic graphs, external load generators, or a bounded virtual attempt policy over an acyclic graph. Choose the third: it preserves reproducibility and prevents supplied code/URLs from executing.

Retries share a logical request and overall deadline, with at most four attempts. Each attempt can expire independently; already-running local work keeps occupying capacity. Optional synchronous dependency holding propagates downstream pressure upstream. Breaker success for a held stage occurs only after its dependency succeeds. Synthetic incidents and per-stage failure inputs expose these interactions without contacting real services.

Scale-out adds one service replica after observed pressure plus a configured delay. Database lag tracks a synthetic shared record, with a primary-only fresh-read option. These are intentionally narrower than production controllers, consensus or business transactions. Separate read/write pools and fixed cache hit ratios remain assumptions, not empirically calibrated behavior.

Per-node snapshots and bounded event traces are returned alongside the old global buckets. Replay steps through actual virtual samples; p95 remains whole-run. Bounds cap topology, arrivals, attempts, pending/processed events, time, result bytes and traces. The local worker uses a 128 MiB JVM heap; real container/native-memory enforcement still needs deployment validation.

At 10×, do not raise every limit. Introduce admission tiers, asynchronous result storage, downsampled telemetry and independently validated models. A larger diagram renderer is separate from a larger simulation workload. Full traces, graph fan-out/join, cancellation, distributed consistency and domain invariants require new models/contracts and their own tests.

Validation includes independent queueing oracles, seeded replay, exact logical accounting, timeout/pressure behavior, breaker recovery, lag/fresh reads, scale delay, numerical stability, result size, legacy persistence/idempotency and a real API/worker/export smoke run. Initial breaker and static replica-cost inconsistencies were corrected with regression tests.
