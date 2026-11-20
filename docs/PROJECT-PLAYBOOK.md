# ArchArena project and interview playbook

ArchArena helps a learner move from drawing a system to explaining a trade-off with a repeatable experiment. The learner describes a small architecture, predicts what will happen, changes one input and compares the modeled result. The current implementation is a personal learning and Java-backend portfolio project. It is not a production capacity benchmark, an Uber implementation or an AI examiner.

This guide starts with everyday examples, then explains the working software and its code. Read sections 1–4 before exploring the advanced features. Complete the two experiments in sections 5–6 before rehearsing the interview answers. The observations in section 7 come from actual local API → SQL queue → separate worker runs, not prerecorded UI fixtures.

## 1 The problem and why this project exists

### The everyday problem

Imagine a small café. A customer orders, a cashier records the order, a barista makes the drink and someone checks stock. When customers complain about waiting, buying another till may not help if the only barista is already overloaded. First identify where work is waiting. Then change that part and compare the outcome.

System design has the same reasoning problem. A diagram containing an API, cache, database and queue can look convincing without showing whether one component is overwhelmed. A beginner may memorize “add a cache” or “add more servers” without knowing which problem that change addresses.

### The technical problem

A learner needs a way to state assumptions, form a hypothesis and test a bounded request flow. Building several real deployments for every interview experiment takes time and introduces infrastructure details that can obscure the concept. ArchArena provides a deliberately smaller model for early exploration.

For example: “At an average of 40 modeled requests/s, does increasing Java-service replicas from one to four help if the database is already fast?” A useful answer includes the inputs, one controlled change, observed outcomes and limitations. “Four servers are always faster” is not a useful answer.

### Who benefits and what changes

- A beginner can connect a familiar queueing story to API services and databases.
- A Java developer can practice explaining capacity, timeouts, retries and persistence with real application code behind the demo.
- An interview candidate can show a hypothesis, a result and a trade-off rather than only listing technologies.
- A reviewer can inspect the immutable request, seed, engine version, metrics and exported assumptions.

The project helps structure reasoning. It does not select a correct architecture automatically, validate every company-specific invariant or replace measurements of real software.

### A short explanation for a nontechnical listener

“ArchArena is a practice lab for understanding why an app becomes slow. It is like trying different café layouts on a small model before changing the real café. You decide how many workers there are and how quickly each stage works. The model shows where requests wait or fail. Then you change one thing and explain the difference.”

## 2 Understand the three product areas

| Area | What you do | What it does not prove |
| --- | --- | --- |
| Learn | Read HLD, LLD and company-inspired material, with Story/Simple/Pro explanations and a tutorial | Reading or completing a field does not certify mastery; editorial review remains pending |
| Practice | Edit a graph or worksheet, use concept labs, predict, run, compare and inspect model evidence | A generic request-flow model cannot prove ride matching, correct payments or Java-code correctness |
| Design Studio | Draft Requirements, Capacity, HLD, API, Data model and LLD; capture a graph snapshot and export a bundle | Drafts are browser-local and are not compiled, semantically validated or cloud-synchronized |

HLD means the big components, their communication and data ownership. LLD means the responsibilities inside a component: classes, methods, interfaces, invariants and error handling. A café floor plan is closer to HLD; the cashier’s precise order-taking procedure is closer to LLD.

Company studies are interview proposals inspired by a problem. They are not current internal blueprints of Uber, Netflix or other companies. Start with the two small concept labs in this guide before attempting an Uber worksheet.

### Public preview versus the full local app

The [GitHub Pages preview](https://yashi2212.github.io/ArchArena/) serves static frontend files. It supports reading, the tutorial, local editing, rule-based feedback and Studio exports. It does not host Java simulations, analytic preview, server design saves, checkpoints or server experiment exports.

Use **http://127.0.0.1:5173** for a real local simulation. An “Engine connected” badge confirms the catalog API was reached; a job reaching DONE confirms the worker actually executed it. API health alone is not worker readiness.

## 3 The working model and the two different systems

There are two layers. Keeping them separate is the most important concept in this project.

### Layer A is the real ArchArena application

```text
Browser / React
    → Vite proxy /api
    → Spring MVC API
    → H2 database containing saved simulation jobs
    → separate Java worker
    → Java simulation engine
    → saved result
    → browser polls, displays replay and exports evidence
```

These are real processes, HTTP requests, SQL writes and Java method calls. They run on your machine. The worker and API use the same packaged application, but the worker is started with web mode disabled and its scheduled worker enabled.

### Layer B is the architecture inside the experiment

```text
Modeled client → modeled load balancer → modeled service → modeled database
```

These nodes are Java data records and in-memory simulation state. Four replicas in the graph do not start four Spring Boot servers. A cache node does not start Redis. A database node does not create another SQL database. A synthetic external API never makes an external network call.

### Two queues that must not be confused

The **real SQL job queue** holds simulation jobs waiting for the worker. It provides persistence, admission limits, idempotent submission and lease-based recovery. It is implemented by `JobRepository` and the migration schema.

A **modeled QUEUE node** is an optional stage inside the virtual architecture. It models waiting and worker capacity. It does not implement a production broker’s durable delivery guarantees. Café analogy: the real job queue is the receptionist’s list of experiments to run; the modeled queue is the pretend café’s order line inside one experiment.

### The current stack

- Java 21 and Spring Boot 4.0.9, using Spring MVC, JDBC, validation-related infrastructure, Flyway and Actuator.
- H2 file storage is the verified local database adapter. PostgreSQL configuration exists, but full PostgreSQL/container behavior is not certified by these runs.
- React, TypeScript, Vite, React Flow for the graph and Recharts for charts.
- JUnit/Spring tests, Vitest and opt-in real-browser verification.

**This project currently uses JDBC, not JPA/Hibernate.** Do not describe ArchArena as a Hibernate project merely because you know Hibernate or it appeared in the original target plan. Likewise, it does not currently use SQS, Redis, Cognito or a live LLM for its real backend.

### A few words in plain language

- **API:** the counter where the browser asks the application to do something; technically an HTTP endpoint such as `POST /api/runs`.
- **Job:** a saved work order. QUEUED means waiting; RUNNING means claimed; DONE means the result is stored.
- **Worker:** the separate process that takes work orders and performs simulations. It is different from a simulated service replica.
- **Seed:** a fixed starting value for the model's random draws. Keep it unchanged when comparing one controlled change.
- **JDBC:** Java's database access interface. This project uses explicit SQL through Spring JDBC rather than mapping entities with JPA.
- **Flyway:** numbered database migration files that create and evolve the schema consistently at startup.
- **Transaction:** a database boundary in which related changes commit together or roll back together.
- **Idempotency key:** a label for one submission intent, like an order reference. Repeating the same reference and request retrieves the same job; changing the request under it is a conflict.
- **Lease:** temporary permission for a worker to finish a job. Its token prevents an old worker's late result from overwriting a newer claim.
- **p95:** a latency boundary covering 95% of the successful modeled requests. Failed requests must be reported beside it.

### Where threads and concurrency fit

The real API handles HTTP requests through its servlet server. A separate worker JVM polls for one permitted job at a time. Inside that worker, the simulation event loop runs sequentially; it does not create one Java thread per virtual replica. A graph node’s concurrency value is a modeled slot count, not a Java executor configuration. The launcher sets API/worker heap maxima separately; this is not proof of container memory enforcement.

## 4 Run it locally in VS Code

### The quickest route on this computer

1. Open VS Code and choose **File → Open Folder → ArchArena** inside your `Placementprep` workspace. The folder must contain `backend`, `frontend`, `scripts` and `howtorun.md`.
2. Open **Terminal → New Terminal**. Choose PowerShell. Run commands from the ArchArena root, not `frontend` unless instructed.
3. Check the tools. The current computer has a project-local Java 21 JDK under `.tools/jdk21`; the scripts select it. Those cached tools are not included in a fresh Git clone.

```powershell
node --version
npm --version
python --version
```

Node 24 is the tested version. Python 3 is needed only for the optional demo/verification scripts, not for running the Java simulation engine. On a fresh machine install a Java 21 JDK and Maven 3.9+, set JAVA_HOME to that JDK in the current terminal and install Node 24. The Java extension pack in VS Code is convenient but not required by the command-line launcher.

4. Stop any recorded ArchArena session before rebuilding. This preserves local data and prevents Windows from locking the JAR.

```powershell
.\scripts\dev.ps1 -Stop
.\scripts\maven.ps1 -MavenArgs @('package')
```

The package command compiles, runs the Java tests and creates `backend/target/archarena-0.1.0.jar`. A plain `test` command does not refresh the runnable JAR. Do not lower the Java target to 17 to suppress an error.

5. On the first setup, install the frontend dependencies. On this prepared computer, an existing valid `frontend/node_modules` can be reused.

```powershell
Push-Location frontend
npm.cmd ci --legacy-peer-deps --no-fund
Pop-Location
```

6. Start the real API, separate worker and React development server.

```powershell
.\scripts\dev.ps1
Invoke-RestMethod http://127.0.0.1:8080/actuator/health
```

Health should report UP. Open **http://127.0.0.1:5173**, select **Practice**, then a concept lab. Wait for **Engine connected**. Confirm the worker by completing an experiment or running the automated demos below.

Do not use VS Code Live Server, open `dist/index.html` directly, or use the GitHub Pages URL for these simulations. The normal Vite development server proxies `/api` to port 8080. `npm run preview` is not the documented full-stack development path.

### Inspect the Java code in VS Code

With the Java test tooling installed, open `backend/src/test/java/dev/archarena/engine/EngineTest.java`. Put a breakpoint in `DiscreteEventEngine.run()` and debug `replayIsExactAndNodeOrderDoesNotAffectIt`. This executes a small model directly without HTTP. To debug the actual background worker, you would need to attach to that worker process separately; a breakpoint in an unrelated API process will not intercept it.

### Stopping and restarting

```powershell
.\scripts\dev.ps1 -Stop
```

This stops only command-line-verified recorded ArchArena processes. It does not delete `.local` database files or browser drafts. Never delete the database to solve a startup error. Stop first, then package and start again after backend edits.

### Logs and the execution flow

- `.local/api.log` and `api-error.log`: HTTP server, startup and storage messages.
- `.local/worker.log` and `worker-error.log`: worker startup and completed/failed jobs.
- `.local/frontend.log` and `frontend-error.log`: Vite and browser-serving errors.
- `.local/processes.json`: recorded process IDs; the launcher validates ownership before stopping them.

No AWS account, Docker service or LLM key is needed for the verified H2 setup. Keep it bound to loopback; this is a single-owner local development profile, not a public authentication design.

### Important common controls for both experiments

Set **Virtual arrival rate = 40 req/s**, **Traffic profile = Steady load**, **Simulation seed = 42**, **Failure injection = None — healthy dependencies**. Expand **Resilience settings · bounded virtual model** and set **Maximum retries = 0**, **Attempt timeout = 2000 ms**, **Overall deadline = 2000 ms**. Leave the other resilience values at their defaults.

The UI uses **30 virtual seconds**, fixed in the current frontend. The API supports other bounded durations, but the UI has no duration editor. Switching labs changes the graph; it does not reset every traffic/resilience field, so check these controls each time.

The server allows at most **two new experiments per minute per owner**, and at most five queued/running globally. Finish one pair, then wait at least 61 seconds before starting the next pair. A quota message is expected protection, not evidence that the engine is broken.

## 5 Test case one Add capacity at the actual bottleneck

### Start with the café explanation

One barista cannot keep up, while stock lookup is quick. Adding baristas can help. Adding more tills would not fix that bottleneck. We deliberately make the database fast so this experiment isolates service capacity.

### Predict before you run

The Java-service node has one slot per replica and a mean service time of 60 ms. Its nominal processing capacity is `1 × 1 ÷ 0.060 ≈ 16.7 requests/s`. Demand averages 40 requests/s. Four replicas provide nominal capacity `4 ÷ 0.060 ≈ 66.7 requests/s` under these model assumptions.

These are planning calculations, not promised successful throughput. Random processing times, waiting, two-second deadlines and work that outlives a timeout can reduce successful completions. Replica scaling will help only if another stage does not become the next bottleneck.

### Exact UI procedure

1. Choose **Practice → Load balancing** in the horizontal concept-lab buttons, not the sidebar Learn link.
2. Apply the common controls from section 4.
3. Click the **Database** card in the graph. Below the canvas, find **Configure Database**. Change **serviceMs to 5**. Keep database replicas and concurrency at 1. This is the deliberate isolation step.
4. Confirm **Java service** has `serviceMs = 60`, `concurrency = 1`, `replicas = 1`, `queueLimit = 200`. The concept lab supplies the first three defaults.
5. Fill the prediction field: “One service replica will queue requests; four replicas should reduce service waiting while the database remains fast.” A blank prediction disables Run in a concept lab.
6. Click **Run experiment**. Wait for **Seeded experiment** and completed results. Record successes, errors, successful-request p95 and service maximum queue.
7. Click **Pin result as baseline**.
8. Change only the lab’s **replicas** slider to **4**. Keep seed, traffic, failure and deadline settings unchanged. Click Run again.
9. Compare. The acceptance condition is more successes, fewer errors, lower successful-request p95 and a smaller service queue. Do not demand exactly four times the successful throughput or exactly one-quarter the latency.

### Technical interpretation

This models **horizontal scaling of service capacity**, not just changing a routing algorithm. The graph has one service node with a replica count. The load balancer routes along the graph; multiple branches, if present, are split uniformly in this model. The replica slider does not deploy real containers.

The JSON requests are [baseline](demos/01-service-before.json) and [four replicas](demos/01-service-after.json). The graph is Client → Load balancer → Java service → Database. The only difference inside the pair is service replicas 1 → 4.

### Explain the result to an interviewer

“I first removed the database bottleneck from the experiment, so I could test service scaling fairly. With the same input workload and seed, one replica missed many deadlines. Four replicas completed more requests with less waiting. This demonstrates the modeled capacity trade-off; it is not a performance measurement of four real Spring Boot instances.”

## 6 Test case two Avoid repeated database reads with caching

### Start with the café explanation

Customers repeatedly ask for the same menu price. A cashier can read a nearby menu instead of asking the stock office each time. But a new order still has to be recorded. A read cache can avoid some lookups; it cannot safely make all writes disappear.

### Predict before you run

At average demand 40 requests/s and read ratio 0.9, expected read demand is about 36/s and write demand about 4/s. With no cache hits, the database sees both streams. With a 90% read-hit assumption, only about 3.6 reads/s plus 4 writes/s continue to the database: roughly 7.6 visits/s before finite-run effects.

The engine uses random arrivals and read/write choices, so exact counts differ from this arithmetic. Cache hits are an input probability; the model does not learn keys, TTLs or an eviction policy.

### Exact UI procedure

1. Wait at least 61 seconds after the preceding pair if the quota window is still active.
2. Choose **Practice → Caching** and recheck all common controls from section 4.
3. The preset contains Client → Load balancer → Java service → Read cache → Database. Confirm service `serviceMs = 20`, `concurrency = 4`, database `serviceMs = 50`, and default database read ratio 0.9. The supplied JSON makes the read ratio explicit; it has no general numeric editor in the basic node inspector.
4. Set the lab’s **read hit ratio** slider to **0**. Write a prediction explaining that most reads will reach the slow database. Run and pin the baseline.
5. Change only **read hit ratio to 0.90**. Run again with the same seed, workload and options.
6. Compare database visits, errors, success count and successful-request p95. Database visits should be substantially lower, not zero, because misses and writes still reach it.
7. Optionally click **Check my understanding** after the improved run. A passed checkpoint means the implemented numeric rule passed; it does not prove a production cache design is correct.

The JSON requests are [zero read hits](demos/02-cache-before.json) and [90 percent read hits](demos/02-cache-after.json). Only cache `hitRatio` changes within this pair.

### Explain the result to an interviewer

“I isolated a read-heavy database bottleneck and changed only the read-cache hit probability. The model showed fewer database visits and improved completion and latency. I would still discuss invalidation, stale values and write handling separately, because this simulator does not implement a real cache or prove application consistency.”

## 7 Run both test cases automatically and inspect evidence

From the ArchArena root, while the real API and worker are running:

```powershell
python scripts/demo_simulations.py
```

It submits four distinct jobs, checks their persisted outcomes and exports, and prints one summary per run. It automatically waits on HTTP 429 rather than weakening the quota. A full run can therefore take over a minute even though the virtual engine itself runs quickly. Press Ctrl+C to interrupt the runner; that does not cancel a job already submitted to the server.

The runner also checks that the same idempotency key with the same input returns the same saved job ID, and that a changed input under that key returns HTTP 409. Reusing a saved job is **not** proof that the engine ran twice; exact engine replay is independently covered in the Java tests.

The summary is [owner-demo-results.json](evidence/owner-demo-results.json). Full requests/results, analytic previews and Markdown exports are saved under ignored `.local/owner-demo/<batch>/`. The four portable input fixtures live in `docs/demos/`.

### Observed results from the verified local runs

| Run | Successful / total | Errors | Successful-request p95 ms | Key observation |
| --- | --- | ---: | ---: | --- |
| Service, 1 replica | 198 / 1192 | 994 | 1997.524 | Service max queue 99 |
| Service, 4 replicas | 1192 / 1192 | 0 | 201.498 | Service max queue 9 |
| Cache, 0% read hits | 554 / 1192 | 638 | 1993.885 | DB visits 1192; max queue 87 |
| Cache, 90% read hits | 1192 / 1192 | 0 | 98.382 | DB visits 227; max queue 3 |

All figures are modeled values for engine 2.0.0, seed 42, 40 average virtual requests/s and a 30-second input window. They are not production benchmarks or a guarantee that another architecture will improve by the same amount. Expected arrivals are 1200; the actual seeded workload has 1192 logical arrivals.

### Read the results correctly

- **Successes, errors, policy rejections:** each logical request ends in exactly one category. The runner checks `requests = successful + errors + rejected`.
- **p95:** 95% of successful logical requests completed within this latency. Failed requests are excluded. A low p95 with many errors can be misleading; always show the success/error counts too. Zero successes produces zero quantiles, not proof of instant responses.
- **Throughput:** total successful logical requests divided by input duration. Completion may occur during the bounded drain period, so this is not a clean production steady-state capacity benchmark.
- **Queue depth:** how much modeled work is waiting. Maximum depth is a whole-run maximum; the replay table shows sampled momentary depth.
- **Utilization:** occupied slot time divided by available slot time over the run/drain horizon. A database aggregates separate read and write pools in event mode; a busy read pool can coexist with an idle write pool. Inspect queue/failure evidence, not only a single color or average percentage.
- **Analytic preview:** a fast steady-state estimate. Its p95/p99 are rough mean multipliers; the 2000 ms saturated-stage value is a display sentinel. It is different from the seeded experiment’s observed virtual-event quantiles.

### Why 30 virtual seconds can finish in less than 30 real seconds

The engine moves its virtual clock directly to the next arrival, completion, timeout or sample. It does not sleep for every modeled millisecond. The application’s real worker execution time and the model’s virtual request latency are different measurements. A 30-second arrival window plus the 2-second overall deadline permits a replay horizon of 32 virtual seconds; this is a bounded drain period, not two additional seconds of new arrivals.

## 8 Trace one experiment through the real code

Use VS Code **Ctrl+P** to open the listed path, then **Ctrl+F** for the named method. The linked references are generated from the inspected source lines; Java/application code is unchanged by this documentation handoff.

1. **Collect input:** `App` derives an `Experiment` from graph, traffic, fixed duration, seed and options. `execute()` sends `POST /api/runs` with a fresh `Idempotency-Key`. [App.tsx:130](../frontend/src/App.tsx#L130)
2. **Forward locally:** Vite proxies `/api` to the Spring API at 8080. This is why the correct frontend URL matters. [vite.config.ts:7](../frontend/vite.config.ts#L7)
3. **Check the request boundary:** `AccessFilter.doFilterInternal()` adds correlation/security headers, checks host/origin/token conditions, applies a quota and caps mutation bodies. [AccessFilter.java:21](../backend/src/main/java/dev/archarena/api/AccessFilter.java#L21)
4. **Validate the model:** `ArenaController.run()` calls `GraphValidator.validate()` before accepting a job. [ArenaController.java:24](../backend/src/main/java/dev/archarena/api/ArenaController.java#L24) [GraphValidator.java:9](../backend/src/main/java/dev/archarena/engine/GraphValidator.java#L9)
5. **Persist the job:** `JobRepository.submit()` canonicalizes and hashes input, locks admission, handles duplicate keys and inserts QUEUED. It returns HTTP 202 with the saved job. [JobRepository.java:30](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L30)
6. **Claim work separately:** `SimulationWorker.poll()` asks `JobRepository.claim()` for a job. Claiming assigns RUNNING, a lease token and an attempt count. [SimulationWorker.java:17](../backend/src/main/java/dev/archarena/worker/SimulationWorker.java#L17) [JobRepository.java:53](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L53)
7. **Execute virtual events:** `DiscreteEventEngine.run()` validates again, generates seeded arrivals and processes a priority queue of events under safety bounds. [DiscreteEventEngine.java:45](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L45) [DiscreteEventEngine.java:76](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L76)
8. **Store only a valid completion:** `JobRepository.complete()` accepts a bounded result only when job ID, RUNNING state and lease token still match. [JobRepository.java:63](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L63)
9. **Poll and display:** `App` fetches `/api/runs/{id}` until a terminal state and compares the returned request with current inputs. Old results are not presented as current after a graph edit. [App.tsx:114](../frontend/src/App.tsx#L114) [types.ts:24](../frontend/src/types.ts#L24)
10. **Inspect/export:** `SimulationReplay` uses returned samples and bounded traces; `ArenaController.export()` writes the request, seed, engine version, results and assumptions to Markdown. [SimulationReplay.tsx:3](../frontend/src/ui/SimulationReplay.tsx#L3) [ArenaController.java:48](../backend/src/main/java/dev/archarena/api/ArenaController.java#L48)

An accepted HTTP request is not the same as a completed simulation. The job lifecycle is QUEUED → RUNNING → DONE, with FAILED or TIMED_OUT alternatives. The worker’s claim attempt count is also different from a virtual customer request’s retry count.

## 9 Functionality catalogue with purpose and implementation

### Editable architecture graph

**Introduction:** Users describe a request path using nodes and connections. **Need:** changing a diagram is easier than rebuilding real infrastructure for every introductory experiment. **Implementation:** React Flow nodes are converted to `Model.Graph`; graph edits, selection, undo/redo and browser drafts are handled in `App`. The backend is still the authority for supported topology. [App.tsx:92](../frontend/src/App.tsx#L92) [Model.java:8](../backend/src/main/java/dev/archarena/engine/Model.java#L8)

### Model validation and bounded inputs

**Introduction:** invalid or oversized experiments are rejected before work is queued. **Need:** a visual editor can create disconnected paths, cycles or expensive requests. **Implementation:** `GraphValidator.validate()` requires one client, reachable acyclic paths, terminal database/external-API nodes, finite/ranged parameters and bounded traffic/options. Only load balancers branch in this model; that is a simulator restriction, not a universal system-design law. [GraphValidator.java:9](../backend/src/main/java/dev/archarena/engine/GraphValidator.java#L9)

Limits include 30 nodes, 60 edges, average arrival rate 0.1–500/s, input duration 5–120 seconds and an expected-arrival envelope of 8000. Event execution separately limits logical arrivals, event count, pending events, trace storage and wall time. The UI’s normal controls are narrower than some API bounds.

### Instant analytic estimate

**Introduction:** show a quick indication of pressure before running an event experiment. **Need:** users should see feedback while changing controls. **Implementation:** `AnalyticEngine.run()` traverses nodes in topological order, propagates read/write demand and uses an M/M/c mean-wait calculation for independent exponential queueing assumptions. The strategy implements the same `SimulationEngine` interface as event mode. [AnalyticEngine.java:42](../backend/src/main/java/dev/archarena/engine/AnalyticEngine.java#L42) [AnalyticEngine.java:33](../backend/src/main/java/dev/archarena/engine/AnalyticEngine.java#L33) [SimulationEngine.java:5](../backend/src/main/java/dev/archarena/engine/SimulationEngine.java#L5)

It ignores several event-mode features, including incident windows, retries, breakers and delayed scaling. Do not compare its rough percentile multipliers as though they were exact event measurements.

### Seeded discrete-event simulation

**Introduction:** simulate the order of virtual arrivals and completions. **Need:** finite queues, deadlines and temporary failures are easier to explore through events than through one static mean. **Implementation:** a `PriorityQueue<Event>` orders by time and then sequence number. A seeded generator creates arrivals; per-request/node/attempt random streams stabilize the modeled draws. [DiscreteEventEngine.java:29](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L29) [DiscreteEventEngine.java:45](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L45) [DiscreteEventEngine.java:239](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L239) [EngineTest.java:28](../backend/src/test/java/dev/archarena/engine/EngineTest.java#L28)

This is deterministic for identical supported inputs and engine behavior. Changing the seed, graph, options or engine version changes the experiment contract.

### Service capacity, caching and database pools

**Introduction:** represent processing slots and selectively bypass downstream reads. **Need:** test “where is the bottleneck?” instead of assuming every new component helps. **Implementation:** `capacity()`, `arrive()` and `start()` manage slots and finite waiting queues. `complete()` ends eligible read hits at a CACHE/CDN node; writes and misses continue. Database reads and writes use separate pools, and replicas add read capacity. [DiscreteEventEngine.java:100](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L100) [DiscreteEventEngine.java:116](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L116) [DiscreteEventEngine.java:136](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L136) [DiscreteEventEngine.java:143](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L143)

The cache has no real keys, eviction or learned hit ratio. Separate database pools are a simplification of resource contention, not an actual database storage engine.

### Failure injection, retries and circuit breakers

**Introduction:** explore what happens when a dependency is slow or unavailable. **Need:** retries can increase load and a timeout does not always stop downstream work. **Implementation:** incident windows affect selected virtual nodes. `fail()` can schedule a bounded full-path retry with exponential backoff/jitter inside one overall deadline. `nodeFailure()` and arrival checks maintain consecutive-failure breaker state and a half-open probe. [DiscreteEventEngine.java:171](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L171) [DiscreteEventEngine.java:186](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L186) [DiscreteEventEngine.java:116](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L116)

Maximum retries is 0–3. Retry attempts restart the modeled path; they do not make virtual writes idempotent. `holdUpstream = 1` models occupied upstream slots while waiting for dependencies. It is off by default; mention the chosen setting when discussing cascading pressure.

### Delayed scale-out and synthetic replication lag

**Introduction:** inspect some time-dependent trade-offs. **Need:** extra capacity is not instantaneous and a follower may be behind a write. **Implementation:** `sample()` observes pressure and schedules `scale()` after a delay; no scale-in is implemented. `replicate()` tracks one synthetic shared record and can flag stale follower reads. [DiscreteEventEngine.java:196](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L196) [DiscreteEventEngine.java:212](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L212) [DiscreteEventEngine.java:190](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L190)

These are local model state transitions. They do not provision AWS, emulate Kubernetes scheduling or implement database consensus, failover or data durability. Some short lesson copy predates v2; the code and versioned result assumptions are the authority for current model behavior.

### Durable simulation job queue

**Introduction:** save expensive work before executing it. **Need:** an HTTP controller should not monopolize its request thread while a bounded engine runs, and accepted work should remain inspectable. **Implementation:** `simulation_runs` stores input, status, attempts, lease and result. The API submits; a separate worker claims and executes. The same JAR runs with different startup properties. [V1__core.sql:21](../backend/src/main/resources/db/migration/V1__core.sql#L21) [JobRepository.java:30](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L30) [SimulationWorker.java:17](../backend/src/main/java/dev/archarena/worker/SimulationWorker.java#L17)

This is a local JDBC/H2 design. Do not describe it as SQS, Kafka or a verified horizontally scalable job platform. A global admission row and a one-RUNNING check intentionally serialize work in this demo.

### Idempotent HTTP submissions

**Introduction:** duplicate clicks with the same key/input reuse one job. **Need:** clients can retry after losing a response and should not create duplicate expensive work unintentionally. **Implementation:** canonical JSON ordering and SHA-256 hashing identify request content; a unique `(owner_id, idempotency_key)` constraint and transactional admission lock protect submission. A changed request under the same key returns 409. [JobRepository.java:25](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L25) [JobRepository.java:30](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L30) [V1__core.sql:21](../backend/src/main/resources/db/migration/V1__core.sql#L21)

This is not “exactly-once execution.” It is also separate from business/payment idempotency and from the simulator’s virtual retry behavior.

### Worker leases and stale-result fencing

**Introduction:** a worker receives temporary ownership of one job. **Need:** a worker can crash, stall or report a late result after another claim. **Implementation:** `claim()` requeues expired RUNNING leases while attempts remain, otherwise marks them TIMED_OUT. A new claim gets a UUID lease token with a 30-second expiry. `complete()`/`fail()` update only a matching active lease. [JobRepository.java:53](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L53) [JobRepository.java:63](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L63) [JobRepository.java:68](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L68)

A useful analogy is collecting a parcel with a current claim ticket. An old ticket cannot overwrite the new holder’s result. There is no heartbeat-based distributed worker fleet here; bounded engine execution and serialized claiming are important limitations.

### Saved designs and optimistic version checks

**Introduction:** store a graph and detect conflicting edits. **Need:** two tabs should not silently overwrite the same saved design version. **Implementation:** `save()` writes designs and immutable design-version rows; updates match ID, owner and expected version before incrementing. A conflicting or unavailable update returns 409. [JobRepository.java:73](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L73) [V1__core.sql:21](../backend/src/main/resources/db/migration/V1__core.sql#L21)

Owner predicates exist in the repository, but the local HTTP owner is configured, not derived from real authenticated users. This is not a completed public multi-tenant authorization system.

### Replay, bounded traces and experiment exports

**Introduction:** inspect evidence rather than only a final headline. **Need:** explain how a queue, failure or retry evolved over virtual time and retain enough input to discuss the run later. **Implementation:** returned global/per-node samples support the replay slider and 1×/4×/8× stepping. Traces include selected early requests, capped at 1500 events. The export includes immutable input, versions, seed, assumptions and resilience counters. [DiscreteEventEngine.java:196](../backend/src/main/java/dev/archarena/engine/DiscreteEventEngine.java#L196) [SimulationReplay.tsx:3](../frontend/src/ui/SimulationReplay.tsx#L3) [ArenaController.java:48](../backend/src/main/java/dev/archarena/api/ArenaController.java#L48)

Node p95 is not an instantaneous time-series metric. Missing trace events do not prove nothing happened: traces cover only the first sixteen logical requests, and the UI displays a bounded recent subset at the chosen sample.

### Learn, worksheets and rule-based review

**Introduction:** connect reading and experimentation to an explicit design argument. **Need:** a diagram alone leaves requirements, ownership and concurrency assumptions unexplained. **Implementation:** `LearnLibrary` renders the reference material; `PracticeGuide` keeps per-scenario worksheets in localStorage; `reviewDesign()` checks missing fields, basic supported topology and current-run evidence. [LearnLibrary.tsx:12](../frontend/src/system-design/LearnLibrary.tsx#L12) [PracticeGuide.tsx:12](../frontend/src/system-design/PracticeGuide.tsx#L12) [review.ts:16](../frontend/src/system-design/review.ts#L16)

Text presence does not prove correctness. The API’s scripted clarification is for the fixed URL-shortener exercise, and AI is disabled. The scorecard numerically summarizes modeled success for one dimension; most interview dimensions remain “not assessed.” [ArenaController.java:35](../backend/src/main/java/dev/archarena/api/ArenaController.java#L35) [ArenaController.java:42](../backend/src/main/java/dev/archarena/api/ArenaController.java#L42)

### Checkpoints, Studio and retention

**Introduction:** preserve a small amount of learning and design state. **Need:** revisit work and show a coherent set of decisions. **Implementation:** `LessonCatalog.checkpoint()` evaluates narrow numeric conditions after a completed current run; `DesignStudio` stores six browser-local artifacts and exports JSON; repository retention trims old detailed telemetry and eventually removes old terminal records/designs. [LessonCatalog.java:21](../backend/src/main/java/dev/archarena/learning/LessonCatalog.java#L21) [DesignStudio.tsx:11](../frontend/src/system-design/DesignStudio.tsx#L11) [JobRepository.java:90](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L90)

Studio capture is an explicit detached snapshot. It is not automatically kept synchronized with later Practice edits. Browser drafts, server graph saves, experiment exports and Studio bundles are different storage paths; export important work before clearing browser storage.

### Local request protection and errors

**Introduction:** reject unsupported access and avoid unbounded request bodies or work. **Need:** even a personal demo should not accept arbitrary data or expose raw failures. **Implementation:** `AccessFilter` checks allowed local host/origin conditions, optional owner token, request rate and a 64 KiB mutation body cap. `Errors` maps invalid input, conflict, missing object, capacity and storage failures to controlled HTTP responses with a correlation ID. JDBC values use bound parameters. [AccessFilter.java:21](../backend/src/main/java/dev/archarena/api/AccessFilter.java#L21) [Errors.java:11](../backend/src/main/java/dev/archarena/api/Errors.java#L11) [JobRepository.java:30](../backend/src/main/java/dev/archarena/persistence/JobRepository.java#L30)

These are scoped local safeguards. Public identity mapping, session/CSRF design, PostgreSQL isolation/RLS decisions, MFA and deployment/dynamic testing remain open. Keep the local API on loopback rather than describing it as ready for arbitrary public users.

## 10 Explain the project to an interviewer

### A 30 second introduction

“ArchArena is a system-design practice lab. Users draw a small architecture, predict a bottleneck and compare a baseline with one controlled change. I use a Java/Spring Boot API, a durable SQL-backed job queue and a separate Java worker. The worker runs a bounded seeded simulation and saves results for replay and export. Its values are educational model outputs, not real deployment benchmarks.”

### A 90 second introduction

“The problem I wanted to address is that system-design learners can memorize components without understanding the trade-off. ArchArena makes them state a hypothesis and compare evidence. For example, I hold the database fast and change service replicas, then separately test a cache in front of a slow read-heavy database.

The frontend captures a graph and explicit settings. The Spring API validates and stores a job instead of doing the simulation inside the HTTP request. A separate worker claims the job with a lease token, runs a bounded event engine and persists the result. The browser polls and shows successful-request latency, failures, queues and replay samples. Duplicate submissions are handled with idempotency keys, and conflicting saved-design edits use version checks.

The current storage adapter is JDBC/H2 and AI is disabled. The strongest backend parts are controlled asynchronous execution, transaction boundaries, idempotency, stale-result fencing and reproducible tests. Public authentication and verified PostgreSQL deployment are future work.”

### A five minute live presentation

1. **First minute:** explain the café bottleneck analogy and separate the real app from the modeled graph.
2. **Second minute:** show the local Engine connected state and describe POST → QUEUED → worker → DONE. Open `ArenaController.run()` and `SimulationWorker.poll()`.
3. **Third minute:** show the two saved before/after results from this guide. Explain the single changed variable and the unchanged seed/workload.
4. **Fourth minute:** open `JobRepository.submit()` and `complete()`. Explain duplicate requests, a transaction and a stale lease result.
5. **Fifth minute:** show the result export, state two model limits and explain one concrete next improvement. Use pre-run saved evidence if the quota window prevents another pair; do not pretend prerecorded evidence is a newly executed run.

### A real business example without overclaiming

For an Uber-inspired discussion, first identify location lookup, nearby-driver candidates, assignment, trip state and payment. The generic model can explore pressure or timeouts along a simplified request path. It cannot prove that two riders never get the same driver. That requires a separate conditional-assignment invariant, ownership checks and concurrent transactional tests. Explaining this boundary is a strength, not a weakness to hide.

## 11 Is it worthy of a Java backend resume

Yes, it can be a worthwhile project for Java backend applications **if you can demonstrate and defend the implemented flow**. The engineering evidence is stronger than a technology list: an actual controller/worker split, transactional SQL persistence, idempotency, version conflicts, bounded execution and tests. This is an assessment of the code and demo, not a guarantee of interviews or an ATS-vendor score.

Your immediate learning priorities are: run the two experiments, trace one real job across the application, change a parameter and predict the effect, and explain one failure/recovery path. Do not memorize features you cannot find in the code. If asked about how it was built, describe your own contributions and any AI/tool assistance honestly.

### Strong points to discuss

- A real asynchronous application flow, not only CRUD endpoints.
- SQL transactions and constraints with explicit duplicate/conflict behavior.
- A separate bounded worker with lease tokens and guarded result updates.
- A deterministic virtual-event core behind a simple engine interface.
- Evidence-rich results and exports with explicit assumptions and resource limits.
- Unit/API/property-style checks, plus real local HTTP and browser evidence.

### Accurate project bullets

- Built a Java 21 and Spring Boot API with a separate worker for bounded, seeded architecture experiments and reproducible result exports.
- Implemented JDBC/Flyway persistence, idempotent job submission, lease-token result fencing and version-checked saved-design updates using the verified H2 adapter.
- Tested model accounting, replay, validation and resilience behavior with 40 Java tests; demonstrated two matched-seed before/after experiments through the real local API and worker.

Use these only after you can explain the corresponding code. Do not claim production throughput gains, real Redis/SQS integration, AI grading, JPA/Hibernate implementation, verified PostgreSQL/container behavior, AWS deployment or real Uber correctness based on this project’s current evidence.

## 12 Questions you should be able to answer

**Why not run the engine in the controller?** A worker separates acceptance from execution and lets a saved job have a lifecycle. The current demo still serializes work; this is a controlled queueing design, not proof of unlimited scale.

**Why SQL instead of SQS?** A local SQL queue keeps the demo runnable without cloud resources and allows transactions/constraints to be inspected. The trade-off is database contention and limited concurrency. A broker migration would require a clear delivery/retry/duplicate design, not merely changing a library.

**Where is OOP used?** `SimulationEngine` is the strategy interface; analytic and event engines implement it. Java records represent input/output contracts. The controller, repository and worker have distinct responsibilities. Identify the boundary first; avoid naming design patterns that are not actually implemented.

**What makes a run repeatable?** The full graph, options, seed, traffic profile and engine/assumption versions matter. A saved job can be retrieved without rerunning. The Java replay test independently executes the engine twice with identical input and checks equality.

**What happens after a worker crash?** Its RUNNING lease eventually expires. A later `claim()` can requeue it while attempts remain; a matching lease token fences completion. If no worker is polling, nothing claims or recovers work until one starts.

**Does idempotency mean exactly once?** No. The same HTTP key/input returns one saved job, while execution recovery and virtual retries have separate semantics. The simulated writes are explicitly not made business-idempotent.

**Why can adding replicas fail to help?** Another stage may be saturated. For database nodes, replicas increase the modeled read pool, not the primary write pool. A fixed dependency, cache miss rate or holding setting can dominate.

**Why measure p95 rather than only an average?** A minority can wait much longer than the average. But this p95 excludes failed requests, so it must be interpreted with success/error counts and input assumptions.

**Is the coach an LLM?** No. Current coaching is deterministic rule-based feedback and limited scripted clarification. Most design correctness still requires human review.

**What happens at 10× load on the real app?** Admission quotas, one active job and a global SQL lock restrict throughput. The application would need measured capacity, a production database/queue strategy, authenticated ownership, observability and isolation work. The simulator’s replica setting does not scale the real worker.

**What would you improve next?** First fix novice onboarding and conflicting legacy copy. Then verify PostgreSQL and concurrent persistence behavior, design real public identity/session/ownership, add evaluated domain-invariant tests, and measure frontend/backend deployment budgets. AI or cloud hosting should follow a defined need and evaluation plan.

## 13 Troubleshooting without guessing

| Symptom | First check and correct action |
| --- | --- |
| Run is disabled | Use local port 5173; wait for Engine connected; fill a prediction in concept labs; wait for an active run |
| API health is UP but job stays QUEUED | Check the separate worker log/process. A healthy API is not proof of a working worker |
| HTTP 429 / two experiments per minute | Wait for the quota window. The automated runner handles this; do not raise limits just to finish a demo |
| HTTP 409 on submission | Do not reuse one idempotency key for a changed request; the runner creates a new key per distinct run |
| JAR cannot be replaced on Windows | Stop recorded owned processes before packaging, then restart |
| Java release 21 unsupported | Select a Java 21 JDK/JAVA_HOME or the local tool cache; do not silently lower the target |
| Frontend shows HTML/JSON parse errors for API calls | Use the Vite dev server and its proxy, not a plain file/static preview server |
| Still shows GitHub Pages preview locally | Check whether VITE_STATIC_DEMO was explicitly enabled; use the local dev configuration rather than the static build |
| A changed graph has no current result | Run again. Old results are intentionally treated as stale for the changed input |
| Browser drafts disappeared | They are local to that browser/profile; server graph saves and exported Studio bundles are separate |
| I want to simulate Uber matching correctly | Write domain rules and concurrent tests separately; the generic queueing engine does not validate assignment correctness |

Do not paste secrets into graph labels, worksheets or logs. If custom DB/token environment variables were configured for another project, inspect their presence and intended purpose before starting this app; never publish the local-owner API to bypass a setup problem.

## 14 A short preparation plan and exit checklist

**First session:** explain the café analogy and the two layers, start the local application, run both pairs and read an export. **Second session:** trace the controller, repository, worker and engine using the code references. **Third session:** explain idempotency, a stale lease and a saved-design conflict, then answer the questions without reading a script.

Before presenting, confirm:

- I can start and stop the project in VS Code and show the correct local URL.
- I can explain the real SQL job queue separately from a modeled queue node.
- I know which single input changed in each pair and why the seed stays fixed.
- I read errors alongside successful-request latency and can state at least three model limits.
- I can find `run`, `submit`, `claim`, worker `poll`, engine `run` and `complete` in the code.
- I can distinguish JDBC from JPA and rule-based feedback from live AI.
- I can show actual saved run evidence and explain which measurements are virtual.
- I can state one verified strength and one next improvement without inventing a completed feature.

If those statements are not yet comfortable, use this as a learning project and continue rehearsing with real code changes. The goal is understanding, not reciting a large feature list.
