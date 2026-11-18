# How to run ArchArena

Current prototype: Windows local Java 21 API, separate worker and React/Vite, using H2 development storage. Read `docs/STATUS.md` first. PostgreSQL/Compose and public deployment are not verified. A high-severity Vite finding remains open; keep development local until the approved dependency-remediation step.

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

Java tests run against H2, not PostgreSQL/Testcontainers. Token checks cover a proposed palette, not current runtime accessibility. `python scripts/validate_knowledge.py --publish` deliberately rejects unverified notes. Inside frontend, `npm.cmd test -- --list` currently finds zero tests, and `npm.cmd audit` fails. Do not call those passing suites. Current evidence is recorded in `docs/evidence/step-01-verification.txt`.

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
