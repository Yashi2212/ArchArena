# ArchArena interview questions and answers

Answers describe the intended design unless an evidence file or test is named. Never say an unimplemented adapter, target or diagram is a measured achievement.

## Product and requirements

### Why does this project need to exist?

It gives a Java developer a repeatable way to connect a design decision to modeled behavior. Instead of only naming a cache, the learner compares the same workload before and after adding it and explains what DB demand changes. The model is not a benchmark, and usability improvement still needs observation.

### Who is the MVP for and why defer Design Studio?

The primary user is a Java developer preparing for system design interviews. Five lessons plus one Practice exercise serve that need. Studio requires cross-artifact versioning and consistency checks, which would put the initial 216-hour planning envelope at risk. It remains a future milestone.

### How can a $0 demo discuss 100 million URLs per day?

It calculates that fictional workload and runs a bounded normalized model. It does not serve that actual traffic. At 512 bytes per new record, raw creation storage would be 51.2 GB/day; indexes, backups and replication add more. Hosted AWS use is optional and account eligibility must be verified.

## High level design

### Why a modular monolith and a separate worker?

Feature modules keep code boundaries without a network hop per feature. Simulation gets a process boundary because CPU and memory exhaustion must not make the API unresponsive. Scale workers first if load measurements justify it; microservices are not a prerequisite for good modularity.

### Why not use WebSockets for everything?

Most interactions are requests and results. Polling is the first simple status adapter; SSE can stream one-way progress later. WebSockets add connection and protocol management without a current collaboration requirement. SSE reconnect/cursor behavior must be tested before being claimed complete.

### What happens if the LLM is down?

Simulation results and deterministic findings remain available. The UI identifies AI as unavailable and can show scripted problem facts. An external free provider is not a reliable foundation for core correctness, and the design has no automatic paid fallback.

## Low level design and persistence

### How do you prevent duplicate jobs on a retried POST?

Scope an idempotency key to the owner and endpoint, persist a canonical request hash and enforce a unique key. Same key and same request returns the prior run. Reusing the key for a changed request is 409. This must be tested under concurrent requests, not just sequential retries.

### How does worker crash recovery avoid stale completion?

A claimed job has a lease token. After lease expiry it may be retried within an attempt limit. Completion includes the token and running-state predicate, so an old worker cannot overwrite a newer attempt. SQS later still needs idempotent delivery processing; it does not guarantee exactly-once execution.

### Why are graph snapshots immutable for runs?

A later canvas edit must not change the meaning of an earlier result. Each run records graph, seed, profile, engine version and assumptions version. Feedback must reference that snapshot. Optimistic locking prevents two tabs from silently overwriting the design.

## Simulation engine

### How would you validate a queueing simulator?

Use independent M/M/1 and M/M/c closed-form fixtures for compatible assumptions, a stated statistical tolerance, warm-up handling and enough samples. Also test deterministic replay and bounded resource failure. Do not compare a lognormal simulation directly against exponential-service formulas and call the discrepancy a bug without matching distributions.

### Does adding replicas always improve throughput?

Only under constrained assumptions. More replicas cannot remove an unchanged database bottleneck, and contention or retries can worsen a real system. Monotonicity properties need a narrowly defined workload without extra overhead; they are not universal laws.

### Why are event and memory limits both necessary?

An event count bounds modeled work but does not stop large payloads or queues consuming memory before that count. Validate graph/payload sizes, bound arrivals and queues, apply a wall deadline, and isolate the worker under a container memory limit. Thread interruption alone is insufficient.

## Frontend, operations and claims

### How do you stop old preview results replacing a newer edit?

Tag requests with a revision and compare it on response, debounce changes and cancel superseded work where possible. Ignore responses whose revision is no longer current. Keep a visible stale marker until the current result arrives.

### Does a budget alarm guarantee a zero-dollar bill?

No. Alerts may be delayed and do not automatically cap all spend. Verify account plan, credits, service access, regional rates and retained resources. If coverage is unavailable, keep the demo local rather than upgrading the account.

### What may go on the resume?

Only implemented features and observed test results, with hardware/load context for performance numbers. A target p95, a planned SQS adapter or a production diagram is not an achievement. Keep the benchmark report and demo recording as evidence.

## UI audit and original learning content

### Why cannot the time scrubber show live utilization for every node yet?

The actual API returns whole-run node aggregates and a global timeline. It does not return per-node history. A frontend can synchronize global samples but must keep node utilization and p95 labeled whole-run. Creating a changing per-node number would invent telemetry. An exact node-time view needs a separately approved API change; illustrative animation must say it is illustrative.

### How would you animate requests without rendering React every frame?

The proposed design uses one bounded Canvas2D overlay and requestAnimationFrame, reading stable geometry/state through references. React updates semantic controls and sampled state, not every particle position. Static/low-quality modes and reduced motion remain available. This is currently a proposal: no 300-node frame-time result has been measured.

### How do book references become publishable lessons?

We create short original topic notes with claim/source-page references, then the owner reviews accuracy and expression. The current five notes are all unverified. The publication guard rejects them until reviewed; citation and passing tests are not permission or legal clearance. Future lessons must have original scenarios and a claim-to-approved-note map, with no copied book prose, diagrams or chapter reconstruction.

## Expedition Console Step 2

### Why self-host fonts instead of fetching a font CDN?

The application serves two licensed WOFF2 assets itself: Sora Variable and IBM Plex Mono, totaling 48,360 bytes. This removes an external runtime request and makes screenshot typography more repeatable. The OFL notices are retained. Local font delivery does not by itself solve accessibility or performance; those are tested separately.

### Why did both token tests and browser axe checks matter?

The token tests check contrast mathematically against the real CSS values and catch accidental palette regressions. They cannot inspect landmarks, keyboard flow or rendered layout. Browser axe found two complementary regions without distinct names, which I fixed with accessible labels. Passing axe still does not prove every WCAG requirement or graph legibility at every zoom level.

### What does the keyboard export test establish?

It uses real keyboard events to enter a prediction, run the UI fixture, activate its checkpoint and save a Markdown HTTP attachment. The earlier intercepted download was canceled in Edge, so an isolated local test server now serves that fixture over HTTP. No security flags are disabled. This proves the presentation flow under that fixture; Java API and engine behavior have their own tests.

## HLD/LLD learning and practice slice

**Why separate HLD and LLD views instead of duplicating the workbench?** HLD asks about service/data boundaries and traffic, while LLD asks about contracts, responsibilities and invariants. Separate presentations share scenario context and keep the existing graph engine unchanged; LLD hides irrelevant generic queueing controls.

**How do you avoid a misleading automated design grade?** The deterministic coach flags missing worksheet sections and model topology restrictions. Supplied text remains manual review. It cites only a result matching current inputs and never interprets good latency as proof of correct driver assignment or payment handling. Live AI is disabled.

**What would you change when practice artifacts need reliable cross-device persistence?** Replace browser-only worksheets with owner-scoped versioned server artifacts and explicit scenario ids. Add authorization, conflict and export tests, and migrate existing drafts deliberately. Current backend saves contain only graphs, and the UI states that boundary.
