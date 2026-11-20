# Run ArchArena locally

Updated November 20, 2026. The tested local setup is **Java 21 + Spring Boot 4.0.9 API + separate worker + React/Vite + JDBC/H2**. No Docker, AWS account or LLM key is needed for this path. PostgreSQL/JPA/cloud deployment are not implied by these instructions.

For the full explanation, two worked experiments, observed results and code references, read [the project and interview playbook](docs/PROJECT-PLAYBOOK.md).

## 1 Open the correct folder in VS Code

Open the `ArchArena` folder containing `backend`, `frontend`, `scripts` and this file. Use Terminal → New Terminal → PowerShell. Run the following from that folder.

The prepared computer has a Java 21 JDK under ignored `.tools/jdk21`; the scripts select it. A fresh checkout does not include that cache. On a new computer, install Java 21, Maven 3.9+ and Node 24 and point JAVA_HOME at the JDK. Python 3 is optional for the automated demo/validation scripts; it is not the simulation runtime.

```powershell
node --version
npm --version
```

## 2 Build before starting

Stop any previously recorded ArchArena session first. On Windows, a running JVM can lock the JAR.

```powershell
.\scripts\dev.ps1 -Stop
.\scripts\maven.ps1 -MavenArgs @('package')
```

`package` runs the Java tests and creates the executable JAR. Running only `test` does not rebuild an older packaged server. The November 20 local package run passed all 40 Java tests.

Install frontend dependencies on first setup, or after a lockfile change:

```powershell
Push-Location frontend
npm.cmd ci --legacy-peer-deps --no-fund
Pop-Location
```

## 3 Start the three real processes

```powershell
.\scripts\dev.ps1
Invoke-RestMethod http://127.0.0.1:8080/actuator/health
```

Open **http://127.0.0.1:5173**. Health must say UP. Select **Practice**, then **Load balancing** or **Caching** in the concept-lab buttons. Wait for **Engine connected**. Complete a run to prove that the separate worker is operating; API health alone does not prove worker readiness.

The launcher starts the API, waits for its health, starts the worker and then Vite. H2 sharing is bound to loopback. It preserves existing local data. It records PIDs and logs in ignored `.local`.

Do not use VS Code Live Server, a double-clicked HTML file, `npm run preview`, or the GitHub Pages URL for the full local simulation flow. The Vite dev server on 5173 forwards `/api` to 8080. The [public Pages preview](https://yashi2212.github.io/ArchArena/) deliberately does not host Java simulation or server saves.

## 4 Run the two verified demos

```powershell
python scripts/demo_simulations.py
```

This submits four real jobs: service replicas 1 → 4 with a fast database, then cache read-hit ratio 0 → 0.9 with a slow database. Seed 42, 40 average virtual requests/s and 30 virtual seconds stay fixed. The script checks comparisons, accounting, saved export, duplicate-key reuse and changed-input conflict behavior.

It respects the server quota of **two new jobs/minute per owner** and waits 61 seconds when necessary. It accepts only a loopback HTTP API. A delayed quota window is not an engine failure. Results are modeled educational values, not production throughput benchmarks.

- Summary: [owner-demo-results.json](docs/evidence/owner-demo-results.json).
- Four editable inputs: `docs/demos/01-service-before.json`, `01-service-after.json`, `02-cache-before.json`, `02-cache-after.json`.
- Full local evidence: `.local/owner-demo/<batch>/` (ignored).
- Click-by-click UI steps and explanations: [playbook sections 5–7](docs/PROJECT-PLAYBOOK.md#5-test-case-one-add-capacity-at-the-actual-bottleneck).

In a concept lab, a blank prediction disables **Run experiment**. Keep profile Steady, seed 42, Failure None, retries 0 and both timeouts 2000 ms for these pairs. The current UI fixes the input duration at 30 seconds. After each baseline, choose **Pin result as baseline**, change one input and rerun.

## 5 Stop and restart safely

```powershell
.\scripts\dev.ps1 -Stop
```

The launcher stops only recorded processes whose command line still belongs to this project. It does not delete the local database or browser drafts. Do not kill unrelated port owners or delete `.local` to fix a problem.

Inspect `.local/api.log`, `api-error.log`, `worker.log`, `worker-error.log`, `frontend.log` and `frontend-error.log`. If the job stays QUEUED, inspect the worker. For HTTP 429, wait. For HTTP 409, use a new idempotency key for a changed request or reload the conflicting saved-design version.

If the local app displays the static-preview banner, check whether `VITE_STATIC_DEMO` was explicitly enabled in that terminal/configuration. Do not expose the default local-owner API publicly. Custom DB/token environment variables require intentional matching configuration; never paste secrets into frontend source.

## VS Code tasks and code reading

Terminal → Run Task provides install, backend package, start, stop and optional automated-demo tasks. Recommended Java tooling is listed in `.vscode/extensions.json`; the scripts also work without editor extensions.

To read a function, use Ctrl+P for the source path, then Ctrl+F for its method name. Start with `ArenaController.run`, `JobRepository.submit`, `SimulationWorker.poll`, `DiscreteEventEngine.run` and `JobRepository.complete`. For direct engine debugging, debug `EngineTest.replayIsExactAndNodeOrderDoesNotAffectIt` with a breakpoint in the event engine. The background worker is a different JVM from the API.

## Verification commands

```powershell
.\scripts\maven.ps1 -MavenArgs @('test')
python scripts/validate_docs.py
python scripts/validate_owner_guide.py
Push-Location frontend
npm.cmd test
npm.cmd run build
Pop-Location
```

The ordinary browser suite uses fixtures on 5174 and is not proof of real Java execution. An existing opt-in real-browser test uses the API/worker/frontend on 8080/5173 and submits one job:

```powershell
Push-Location frontend
$env:ARCHARENA_LIVE_TEST='1'
npm.cmd run test:e2e -- tests/live-simulation.spec.ts --project=width-1440 --reporter=list
Remove-Item Env:ARCHARENA_LIVE_TEST
Pop-Location
```

Wait for the job quota to clear before running that live check after the two demo pairs. It verifies actual run/replay/export behavior and preserves evidence; it is not a production load test.

## What each mode stores

Learn is read-only. Practice HLD contains the editable graph and bounded model; Practice LLD contains contracts/invariants/tests worksheets. Company worksheets and Studio’s six artifacts are browser-local. Backend design saves contain graph snapshots, not those worksheets. Studio export is a separate JSON bundle. Export important work before clearing browser storage.

The tutorial is available in Learn → Start here. No need to regenerate its media to run the app. Read [the phase audit](docs/PHASE-AUDIT.md), [model limits](docs/simulation-v2.md) and [security review](docs/security-review.md) before considering public backend/cloud hosting. Those gates remain open.
