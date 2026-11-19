# Engine v2 and security verification

Date: 2026-11-19. Local Windows/Java 21/Node 24/system Edge. No remote CI, public deployment or AWS operation is implied.

## Final outcomes

| Area | Actual result | Evidence |
|---|---|---|
| Backend | 40 tests, zero failures/errors/skips; Boot 4.0.9 verify/package succeeds | [Java summary and case names](engine-v2-java-tests.json) |
| Frontend | 91 tests pass, including replay, legacy telemetry, timeout bounds and option order | [Vitest report](engine-v2-frontend-tests.json) |
| Full fixture browser run | 45/48 passed; three keyboard flows exceeded their original 30-second total budget | [Initial full report](engine-v2-browser-initial-full.json) |
| Keyboard/visual follow-up | All four keyboard flows pass with unchanged assertions and a 90-second traversal budget; twelve visual baselines match. Two newly added replay axe scans initially failed | [Follow-up report](engine-v2-browser-followup-initial.json) |
| Corrected replay | 4/4 pass at 1440/1024/768/390, with zero axe violations in each replay state | [Final replay report](engine-v2-browser-results.json) |
| Existing accessibility states | Zero violations in 32 original Learn/dialog/Practice/Studio/HLD/LLD scans in the full run; new replay adds four corrected scanned states | Fixture evidence only; full manual/all-state AA certification remains open |
| Actual API → persisted queue → separate worker | DONE; 417 logical requests, 219 successes, 198 errors, 837 attempts, 420 retries, 572 circuit rejections, 35 synthetic stale reads, 72 node samples, 212 bounded trace events; native export includes counters | [Live smoke JSON](engine-v2-live-smoke.json) |
| Actual browser → API/worker | Opt-in 1440px flow passes, verifies engine version/current result/replay/accounting and real downloaded Markdown; no route mocks | [Live screenshot](engine-v2-live-browser.png); `tests/live-simulation.spec.ts` |
| Production build | Pass; JS 959.60 kB / 297.55 kB gzip, CSS 47.34 kB / 8.89 kB gzip, local fonts 48.36 kB; large-chunk warning persists | [Asset sizes](engine-v2-build-assets.json) |
| Runtime dependency scans | npm zero findings; OSV zero matches across 77 Maven runtime artifacts | [npm](engine-v2-npm-audit.json), [Java](engine-v2-java-audit.json) |
| Twenty-control security review | Fifteen local automated evidence/hygiene checks pass; all twenty categories inventoried. Public gate intentionally exits nonzero | [Machine inventory](security-checks.json), [review and open gates](../security-review.md) |
| Knowledge | Seven guard tests pass; five drafts/13 claims validate; owner verification still missing, so publication remains blocked | Existing knowledge validator/guard; no new book/repository material published |

The browser runs overlap. Do not add 48 + 16 + 4 and call them unique flows. All 48 fixture scenarios have passing coverage after the focused corrections; only the single real-browser case uses the actual backend. Fixture metrics are not performance measurements or simulator evidence.

## Measured engine execution

The [final benchmark](engine-v2-benchmark.txt) runs a 30-node/29-edge model at 20 virtual requests/s for 120 virtual seconds, seeds 0–19, after five warmup runs, in a sequential Java process with `-Xmx128m`. On this Windows 11 machine (AMD Ryzen 5 3550H, eight visible logical processors), execution p50 was **684.740 ms**, p95 **1079.448 ms**, max **1186.589 ms**. The twenty runs generated 47,799 logical arrivals and processed 3,013,777 events; maximum pending events was 5,037.

Sum of heap-pool peak usage was 58.58 MiB against a 128 MiB max heap. Pool peaks are not simultaneous RSS. Other local work was active; this is not an isolated machine benchmark, API throughput, queue-wait/startup SLO, container memory proof, 300-node renderer test or 60 fps claim. Earlier faster observations are historical, not substituted for the final run.

## Failures retained and corrected

- The initial breaker test found upstream failure counts resetting at local completion before a held dependency returned. Held success now depends on downstream success; regression covers opening and recovery.
- Initial Java scan: [65 matches](engine-v2-java-audit-initial.json). Boot 3.5.16 plus patched maintenance overrides left [three matches](engine-v2-java-audit-intermediate.json). The MVC advisories concern unused SSE-fragment/XSLT rendering, but published fixes were on Framework 7. Migration to Boot 4.0.9 and verified compatible dependencies removed known matches without advisory ignores.
- Windows packaging failed while old JVMs held the target JAR. The first live SQL export then encountered an old-process class-loading error. The recorded processes were stopped; a closed database copy and successful standalone old-driver SQL export were preserved privately before opening the upgraded DB. The final package succeeds.
- Simultaneous H2 startup caused the worker to fail with a database lock. The launcher now binds H2 sharing to loopback and waits for API readiness before starting the worker. Both start successfully; the real queued job and browser run confirm worker operation.
- Initial browser attempts timed out during navigation/readiness and one Vite startup. A retained test server and explicit cold-start allowance made the functional failure observable: an implicit select label was unstable. Added an explicit label/id. No functional assertion was removed.
- Three full-suite keyboard cases exceeded the total 30-second budget; their actual full Tab traversal now has 90 seconds. The follow-up passes at all four sizes, including a 41.8-second mobile run. This is test-runner evidence, not a fast keyboard UX claim.
- New replay axe scans found `scrollable-region-focusable` at 1024/768. The table wrapper now has a named region, keyboard focus and visible focus styling. Final replay scans pass at all four widths.
- H2 2.4.240 still emits Flyway's “newer than verified version” warning. Migration/API tests and the existing local file open successfully; this does not establish PostgreSQL compatibility or a production restore drill.

## Exit state and boundaries

Core v2 model, server validation/resource limits, compatibility tests, UI controls/sampled replay and real local integration are implemented. The normal API/worker/React preview remain running on loopback. SQL and closed-file backups remain ignored/private. Historical Step 2/system-design evidence was preserved; current screenshots use engine-v2 filenames.

Public readiness remains false: request identity/owner mapping, cookie/session CSRF design, PostgreSQL roles/RLS approach, account/admin MFA, TLS/trusted proxy, secret rotation, container/OS/plugin scans and dynamic deployed testing remain open. Smooth particles, synchronized hero animation, full mobile graph readability, 300-node/60 fps/Lighthouse and complete reviewed theory content are also unfinished. No live AI, public publishing, push or cloud resource creation occurred.

Model scope and assumptions: [simulation v2](../simulation-v2.md). Decisions: [resilience model](../adr/engine-002-bounded-resilience.md), [runtime/security migration](../adr/security-001-runtime-upgrade.md).
