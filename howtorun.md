# How to run ArchArena

Current prototype: Windows local Java 21 API, separate worker and React/Vite, using H2 storage. Expedition Console Step 2 foundations are verified locally. Read `docs/STATUS.md` first. PostgreSQL/Compose and public deployment remain unverified; the November 19 full npm audit reports zero findings, which is a dated scan rather than a permanent guarantee.

## Build and start the Windows prototype

From ArchArena with Java 21, Maven 3.9+ and Node 24 available:

```powershell
.\scripts\maven.ps1 -MavenArgs @('package')
Push-Location frontend
npm.cmd ci --legacy-peer-deps --no-fund
npm.cmd run build
Pop-Location
.\scripts\dev.ps1
```

Open [the local workbench](http://127.0.0.1:5173). Check `http://127.0.0.1:8080/actuator/health` for UP rather than assuming spawned processes are ready. The launcher records project process IDs and logs in ignored `.local`. It preserves local data and does not create AWS resources.

Previously observed: health UP, frontend HTTP 200, and one browser-triggered simulation completed in the worker. That is not proof of the complete lesson/export or keyboard workflow. Tests alone do not rebuild an older JAR; package before starting after backend edits.

To stop recorded project-owned processes without deleting local data:

```powershell
.\scripts\dev.ps1 -Stop
```

Stop a recorded session before restarting. Logs: `.local/api.log`, `api-error.log`, `worker.log`, `worker-error.log`, `frontend.log`, `frontend-error.log`. Check ownership before stopping anything else on ports 8080/5173.

## Current verification commands

```powershell
.\scripts\maven.ps1 -MavenArgs @('test')
python scripts/validate_knowledge.py
python scripts/test_knowledge.py
python scripts/check_proposed_tokens.py
python scripts/check_backend_freeze.py
python scripts/validate_docs.py
```

Java tests run against H2, not PostgreSQL/Testcontainers. `check_proposed_tokens.py` retains the historical unselected Signal Deck palette; the actual Expedition CSS token checks run in the frontend suite. `python scripts/validate_knowledge.py --publish` deliberately rejects all five unverified notes.

From frontend, run the new checks:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:e2e
npm.cmd audit
```

Current results: 79 frontend tests, 32 browser tests and a successful build; full npm audit zero on November 19. Browser checks use Microsoft Edge on Windows and an automatically managed loopback fixture server at 5174. They do not need a live Java backend and do not prove actual simulation performance. Normal development stays at 5173. Golden images are Windows/Edge baselines; review platform differences before changing them. Evidence: `docs/evidence/step-02-verification.md`.

For Docker later, inspect `.env.example`, generate local-only values in ignored `.env`, and run `docker compose up --build` on a Docker-equipped machine. The configuration has not been run here. Never publish the H2/local-owner profile or assume a file configuration proves cloud/security behavior.

## Phase 0 and design verification

From the ArchArena directory with Python 3 available:

```powershell
python scripts/validate_phase0.py
```

This checks planning arithmetic and document links only. It does not start an app or simulate traffic.

## Implementation prerequisites

The target stack is Java 21, Maven, Node.js/npm and Docker Compose for PostgreSQL and isolated processes. This machine initially had Java 17 on PATH and no Docker command. A workspace-local Java 21 JDK now exists under ignored `.tools/jdk21`; scripts select it without changing system Java. On a clean machine, install official tools/set JAVA_HOME; `.tools` and cached dependencies are not distributed in Git.

No AWS account or LLM key is needed for local development. Never put credentials in frontend source or commit `.env` files. Do not create cloud resources merely to work around a missing local prerequisite.

## Documentation map

- `problemstatement.md`: user problem, value and limitations.
- `hld.md`: modules, sequences, trust boundaries and failure behavior.
- `lld.md`: domain, persistence, job state and implementation contracts.
- `interviewquestions.md`: phase-related explanations with honest implementation status.
- `ISSUES.md`: risks, decisions, implementation evidence and unresolved work.

## Troubleshooting principles

If Java reports an unsupported release, select Java 21 explicitly rather than lowering the target silently. If dependency downloads fail, report that failure and use verified cached tools where possible; do not claim a build passed. If Docker is unavailable, engine/unit tests may still run, but real PostgreSQL integration and full-stack startup remain unverified. AWS deployment requires a separate eligibility/cost gate.

## New system-design views

With the normal local frontend/API/worker running, open Learn → System design learning path. Switch HLD/LLD and filter Foundation/Intermediate/Advanced. Only five topics have working simulation lab links; other entries are original exercises with theory explicitly pending review.

Open Practice → select Uber → Start selected scenario (save your current graph first). Complete HLD assumptions and model a bounded request flow; switch to LLD for Java contracts/invariants/tests. Review my design flags missing decisions and reports current model evidence without pretending to validate matching or Java code. AI is disabled. Worksheets are browser-local, whereas backend saves and exports preserve only the existing graph/model.

Validation commands from `frontend`: `npm.cmd test`, `npm.cmd run build`, `npm.cmd run test:e2e`. New focused browser checks: `npm.cmd run test:e2e -- tests/system-design.spec.ts`. See [scope and walkthrough](docs/learning-practice.md).

## Engine v2 / Boot 4 continuation

The verified local runtime uses Java 21 and Spring Boot 4.0.9. Stop the recorded API/worker before rebuilding the JAR on Windows; running JVMs lock it. Back up local data before a driver/runtime upgrade. This phase's private closed-file and SQL backups are under ignored `.local/backups/pre-engine-v2`; do not publish them.

`scripts/dev.ps1` now binds H2 automatic sharing to loopback and waits for API health before launching the separate worker, avoiding the observed simultaneous-open failure. Inspect both API and worker logs; API health alone does not prove worker readiness. The launcher still preserves local data and only stops command-line-verified recorded processes.

In the UI, expand Resilience settings for retry/deadline options. Select a node for advanced failure/breaker/holding/scaling/lag settings. Add CDN or synthetic external API nodes through the component selector; connect them before running. Replay steps through actual returned node samples at 1×/4×/8×, with p95 kept whole-run.

Run `python scripts/smoke_simulation.py` for one real API → queue → worker → telemetry/export check (it submits a synthetic job, using a fixed idempotency key). For an opt-in real-browser check, set `ARCHARENA_LIVE_TEST=1` only for `npm.cmd run test:e2e -- tests/live-simulation.spec.ts --project=width-1440 --reporter=list`; it submits one experiment through the normal preview. Default browser runs remain fixtures and skip this opt-in test.

Security reproduction and public blockers: [security review](docs/security-review.md). Model assumptions/limits: [simulation v2](docs/simulation-v2.md). Public hosting is not enabled by these commands.
