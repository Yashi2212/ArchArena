# ArchArena session log

## November 18 2026 — initial planning and prototype

- Phase 0 scoped a personal demo for Java interview candidates: Learn plus basic Practice; Studio deferred. Interpreted “9” as hours/week and proposed 24 weeks/216 hours, with 27 contingency hours. These remain planning assumptions.
- Wrote product stories, numeric targets, cost worksheet, competitor sample, roadmap and seven initial ADRs. The planning validator reported 31 passes; these were document checks, not runtime measurements.
- User then authorized continuing phases and requested HLD, LLD, issues, interview questions, problem discussion and startup documentation. Created those documents and began a thin local prototype.
- PATH exposed Java 17 and Node 24. Downloaded official Microsoft Java 21 into ignored `.tools`, reused cached Maven and isolated its dependency cache. No system Java change or AWS deployment.
- Implemented Java graph records, validation, analytic approximation and seeded event engine. Added workload/node/event bounds, finite queues, deadlines, read-cache behavior, simplified read/write DB pools, token bucket, spike and two simplified failure inputs. Retries, cascading failures, autoscaling, lag, CDN/external API behavior remain absent.
- Added Spring MVC API, Flyway migration, JDBC persistence, H2 development adapter and PostgreSQL configuration; durable jobs, owner-scoped repository calls, quotas, idempotency and lease fencing. This is JDBC, not JPA/Hibernate. Application queue is DB backed, not SQS/outbox.
- Added separate worker configuration and local launcher. API, worker and Vite returned readiness/page responses. One browser-observed seeded run completed, backed by a worker log; not a full E2E suite or benchmark.
- Added React canvas, controls, previews, chart, findings, saved-design modal, drafts, baseline, checkpoint, export and basic Practice. UI remains the initial cream/sage design.
- React Flow 13 changed handler exports; inspected installed source/types and corrected integration. Recharts required `react-is`; installed it. Production build passed.
- Initial npm audit found five high package findings through glob dependencies. Downgraded Vite/plugin per that report's suggestion. This was not proof of remediation; a later audit found Vite itself affected.
- Added Compose/Dockerfiles, Nginx security-header config and CI workflow, but no real PostgreSQL/container isolation or remote CI run occurred. Files are configuration evidence only.
- Browser follow-up was rejected because automatic approval review could not complete after a usage limit, not because it found the action unsafe. No approval bypass was attempted.

## November 18 2026 — master prompt and redesign gate

### User steering

- User supplied UI redesign/master prompts, requested a canonical `prompt.md`, a short `docs/STATUS.md`, and notes from three PDFs for eventual original lessons.
- Latest scope is UI Step 0/1, then a visual-direction pause. Backend/API stay unchanged. This supersedes the earlier continuous phase cadence.
- Preserved original `prompt.md.txt` and empty `status.md.txt`; active files are `prompt.md` and `docs/STATUS.md`.

### Evidence

- Read frontend/contracts/tests/configuration. No frontend application or backend source changed in this step.
- Reran Java tests: 8 engine +10 API/persistence +2 access filter =20 passes on H2. Tests alone do not update an older packaged JAR.
- Current production build passed: JS 921.21 kB / gzip 283.96 kB, with a large-chunk warning.
- `npm test -- --list`: exit 1, zero tests. Frontend unit/component/axe/E2E/snapshot/performance suites do not exist yet.
- npm audit: one high-severity affected package, Vite, with multiple advisories; report suggests patch 6.4.6. Dependency inputs remain unchanged at this docs-only gate. CI is not green/verified.
- API has aggregate node metrics and global time samples only. Exact per-node historical playback cannot be invented in the frontend.

### Deliverables

- UI audit/design brief: A Signal Deck and B Expedition Console, recommendation A; proposed tokens, components, responsive hierarchy, prediction/playback/inspector/local-XP specs and required tests.
- STATUS, canonical master prompt, detailed log, updated issues, README/startup instructions and a backend freeze check.
- Five short original concept-note drafts with inspected-page claim references, all unverified/unpublished. No source books, extracts or diagrams became public assets.
- Supplied 218-page DDIA second-edition file is an incomplete early release; unavailable chapters are not treated as sources. No claim to have read all three books fully.
- Content structure/publication rejection tests, claim-line index and proposal-only contrast checks. These do not prove accuracy, originality, legal clearance or runtime accessibility.

### Next gate

Wait for A/B, then implement Step 2 only. Owner review of the knowledge pack separately gates future original Story/Simple/Pro lesson publication. The guide persona name remains undecided.

### Step checks and version control

Seven knowledge-gate tests passed; five notes and 13 claim references validated; the publish command intentionally rejected all five drafts. All 14 proposed contrast pairs passed, with runtime accessibility still unverified. Documentation checks covered 14 entry files, 35 local links and 13 claim-line references. The freeze covered 22 backend/API files with no changes. Initialized local Git because no repository existed; source PDFs, private `.local` inventory, original user prompt/status `.txt` inputs and build/dependency artifacts are excluded. No remote push or CI execution is claimed.

The historical Phase 0 link checker initially reported 37 failures after dependencies were installed because it scanned third-party/generated Markdown. Updated that documentation script to exclude node_modules, build outputs and private tool/state folders, matching the current doc checker's scope. This is a validator correction, not an application/backend change; rerun output is included in the evidence record.

## November 18–19 2026 — Expedition Console Step 2

The user chose B — Expedition Console. Implemented warm charcoal/teal/amber tokens, self-hosted Sora and IBM Plex Mono with original OFL notices, replacement base CSS and shared SVG/button/status/metric/alert/rules components. Existing API calls, graph model, worker and server checkpoint were preserved; the backend freeze still matches 22 files.

Added persistent model disclosure, precise analytic/event wording, accessible exact latency alongside humanized display, illustrative cost qualifiers and demand/capacity state words/icons. Mobile lesson and saved-design controls remain visible. This is a foundation pass, not the final hero layout or animated skill tree.

Added pinned Vitest/RTL/jsdom/axe testing tools, 79 frontend tests and four-width Playwright fixtures/baselines. The older Vitest candidate exposed critical advisories; switched to compatible 5.1.1 and Vite 6.4.6. November 18's full audit still flagged five glob-chain package entries; November 19's full audit returned zero with the same direct versions and no ignore rule. The feed-change cause was not established. Do not claim a permanent security guarantee.

Initial browser failures were retained and investigated: a numeric text assertion ignored the unit, axe found duplicate unnamed complementary regions, and Edge canceled intercepted attachment downloads. Corrected the assertion and landmark labels; the test-only loopback server now sends a real HTTP Markdown attachment, with normal browser protections. API fixture data remain explicitly separate from engine evidence.

An automatic-approval usage limit interrupted the rerun on November 18. User resumed November 19; the 1440px check passed 8/8, followed by the full 32/32 matrix at 1440/1024/768/390. Keyboard prediction/run/checkpoint/export passed; twelve main-screen baselines matched; all sixteen scanned browser axe states had zero violations. Java regression passed 20/20 on H2, and unit/component/token/font tests passed 79/79. Both normal local preview and API health returned HTTP 200 independently of the UI test server.

Build: JS 926.02 kB/285.71 kB gzip, CSS 43.77 kB/8.15 kB gzip and 48.36 kB of local fonts. Large-chunk warning and small fitted mobile graph text remain open. No FPS/Lighthouse, complete AA, cross-browser or public-launch claim. Browser/CI jobs configured but not executed remotely. Sources stay unverified/unpublished; no new books or lessons distributed.

Updated prompt, STATUS, ISSUES, design brief, run instructions, interview answers, ADR and verification evidence. Stop after the local Step 2 commit; user types `next` for Step 3 hero/static diagram/readable mobile inspection, then illustrative Canvas2D. No backend/API change, cloud deployment or paid AI fallback.

## November 19 — system-design learning/practice request

User explicitly requested distinct HLD/LLD views, twenty company system designs, basic-to-advanced content and Uber-style practice assistance, and asked whether simulation was complete. Explained that the bounded prototype works but retries/cascades/autoscaling/replication lag/performance validation remain incomplete. Latest request supersedes the prior Step 3-only wait. No backend/API changes or cloud work.

Implemented forty original exercise briefs (24 HLD/16 LLD), three levels and five links to existing labs. HLD uses a system-map sequence, LLD a Java blueprint. Twenty original company-inspired scenarios have requirements, an invariant, operations and a deep dive; no ranking or actual-company implementation claims. Uber requires location freshness, exclusive assignment, trip lifecycle and failure reasoning.

Practice separates HLD assumptions/canvas from LLD contract/invariant/test worksheets. The coach flags missing inputs, basic graph restrictions and current-run modeled evidence; supplied reasoning is unassessed. Scenario changes clear results and local polling but do not cancel durable server jobs. The old URL-shortener scripted clarification is hidden for other scenarios. AI remains disabled. Worksheets persist browser-locally by scenario with safe type/length restoration and visible memory fallback. Backend saves/exports omit them, disclosed in the UI.

No unverified source notes are published. All forty entries are exercise briefs rather than completed theory lessons; missing theory/source notes are listed in docs/knowledge/missing-from-knowledge-pack.md. No PDFs, book diagrams, code, distinctive examples or private source paths added to public assets.

Initial focused browser run: 5/12 passed; three restored textarea-label failures and four ESM require errors. Changed worksheet labels to explicit label/input ids and used ESM-compatible axe path resolution. The unit suite passed 86 tests. Final regression/visual/axe/build/freeze/docs outcomes are recorded in docs/evidence/system-design-verification.md; initial report preserved separately.

Final results: 86 unit/component/token tests; full 44-case browser pass; 24-case post-separation/visual pass matching twelve baselines with 32 zero-violation axe states; final eight filter-reset/accessibility cases pass. LLD Learn hides the HLD lab, has its own heading/subtitle and resets route state when switching tracks. Final production JS 952.80 kB/295.31 kB gzip, CSS 46.62/8.76 kB gzip, fonts 48.36 kB; large-chunk warning remains. Twenty-two backend files unchanged; seven knowledge tests and five-note/13-claim validation pass; publishing intentionally blocks all unverified notes. Normal frontend/API health returned 200. No new Java run, audit, remote CI, public deployment or AI connection implied. Historical Step 2 evidence images/results preserved; current fixtures use system-design filenames.

## November 19 — bounded simulation v2 and twenty security checks (in progress)

User authorized continuing phases and backend/API changes, prioritizing simulation and then public-readiness checks. Implemented CDN/external terminals, bounded retry/deadline policy, fixed-stage delays, synthetic failures, held upstream dependencies, breaker reset/probe, delayed service scale-out, shared-record lag/fresh reads, integrated node occupancy, sampled replay, bounded traces and resource/result limits. Added focused behavior tests; fixed breaker reset happening before downstream success. Backend 38-test suite passed on the intermediate Boot 3.5.16 stack; frontend 91 tests pass. Thirty-node sequential benchmark under 128 MiB heap originally reported p95 129.269 ms, max 153.490 ms and sum-of-pool peak 58.59 MiB; this is not full-stack/RSS evidence and needs final rerun after dependency migration.

Added hostile SQL/owner, origin/host/fetch-metadata, rate-limit, unsupported upload/form and URL-config rejection tests; disabled multipart, added API CSP/Permissions-Policy, removed worker raw exception logging, blocked proxy map/hidden-file paths. All twenty controls now have an explicit review in docs/security-review.md and a machine inventory/check script. Public identity, sessions/CSRF, PostgreSQL roles/RLS, admin MFA and deployment scans are still open; no public hosting.

Runtime OSV scan: 65 matches on Boot 3.5.8. Official Maven metadata verified 3.5.16 plus patched Tomcat/Jackson/logging; intermediate scan reduced to three. The remaining Spring MVC findings concern unused SSE-fragment/XSLT view rendering, but current public fixes are Framework 7. PostgreSQL fixed driver also available. Migrating to official Boot 4.0.9 modular starters and supported Jackson 2 compatibility module; do not claim final compatibility/security until tests and scan pass. Prior automatic review interruption was a usage-limit review failure; the user resumed, later metadata/test actions were approved, no bypass attempted.

New replay browser flow initially failed on page-load/engine readiness; a later run hit Vite server startup allowance. Host-side initialization was also slow (observed Spring test context 55.6 s versus earlier ~7 s); attribution of browser failures remains an inference until corrected reruns. Raised only test-server cold-start budget and the targeted cold-start flow budget; no model/functional assertion removed.

Final engine-v2 verification: 40 Java tests and 91 frontend tests pass. Boot 4.0.9 with Framework 7.0.10 and patched maintenance versions produces zero OSV matches across 77 runtime artifacts, versus initial 65 and intermediate 3; npm remains zero. Full fixture run 45/48; three keyboard total-budget timeouts pass focused checks with assertions intact. Twelve baselines match; new replay scroll-region axe failures fixed with named keyboard focus and visible outline; four final replay/axe checks pass. Actual API/queue/worker smoke: 417 logical requests, 837 attempts, 420 retries, 572 circuit rejections, 35 synthetic stale reads, 72 samples, 212 traces and exported counters. Real 1440px browser API/worker/replay/native export test passes without mocks.

Packaged runtime restart initially hit JAR locking; attempted live SQL dump failed because the old running JAR could no longer load an H2 class. Stopped only recorded/command-line-verified processes, preserved closed-file and standalone SQL backups privately, rebuilt and reopened the existing database. H2 simultaneous-open race then stopped worker startup; loopback H2 bind and API-before-worker sequencing resolve it. Real smoke/browser prove worker execution. H2/Flyway newer-than-verified warning remains. Final benchmark on busy host: p95 1079.448 ms/max 1186.589 ms, sum-of-heap-pool peaks 58.58 MiB under 128 MiB heap (not RSS/SLO). Final build JS 959.60/297.55 kB gzip, CSS 47.34/8.89 kB gzip, fonts 48.36 kB; chunk warning remains.

All twenty security controls reviewed; fifteen local automated checks pass and public readiness intentionally fails. Open: HTTP identity/owner mapping, CSRF/session design, PostgreSQL roles/RLS, admin MFA, trusted TLS/secret rotation and container/dynamic scans. No public launch, cloud operations, live AI or copied book/repository assets. CI runtime scan is configured but not remotely executed. STATUS/prompt/issues/architecture/run/interview/source registers updated; save locally without push.


## November 19: original-prompt audit and product separation continuation

User resumed the interrupted continuation. Re-read current prompt/status and preserved original prompt, inspected the existing frontend/tests, and audited T0-T7 rather than equating the verified bounded engine with the full original definition of done. Public deployment remains blocked. Latest direct instructions supersede interactive Learn and Studio-later.

Implemented LearnLibrary with 24 HLD/16 LLD source-linked original readings, Story/Simple/Pro layers, all topic headings and twenty original company studies. Uber explicitly separates dated primary-source H3/fulfillment context from our proposed schema/assignment/trip design. Book-source notes remain unchanged/unverified; local reference edition is marked review-pending. Updated content policy to describe this local preview separately; no copied book/repository assets.

Moved all editable simulation/concept experiments into Practice; Learn no longer triggers analytic preview POSTs. Preserved the checkpoint flow, graph saves, bounded options/incidents/replay and separate company worksheets. Studio now supports six bounded local artifacts, numerical capacity assumptions, detached Practice graph snapshot, missing-versus-manual-review feedback and native JSON export. No AI, semantic correctness or Java execution claimed.

Installed imageio-ffmpeg 0.6.0 only into ignored .tools/video-libs and used Pillow plus offline Windows Zira speech to create an original 72-second H.264/AAC tutorial, poster, captions and transcript. All six narration WAV durations are below 12-second chapter bounds. Decode verifies 864 frames, 1280x720, 12 fps and audio. Visually inspected a decoded frame and initial desktop layout. Browser tests exercise native playback, captions, chapter seeking, readonly Learn, worksheets, Studio restore/export and accessibility.

Packaged MSIX PowerShell failed sandbox launch; unpackaged Windows PowerShell with login:false runs local commands. This is a shell selection fix, not a permission bypass. Initial production build and 95 unit tests pass. Browser/regression outcomes and any failures are retained in the dated verification report. No backend mutation, remote CI/push, public deployment, cloud resource creation or paid AI service.

Final initial full browser run: 64 passed, four opt-in live cases skipped at 1440/1024/768/390. Forty-four axe scans have zero violations (some repeated states). Comparison-only follow-up initially 18/20: 1024/390 Practice captured during analytic-preview layout hydration. Final actual and accepted images are pixel-identical; the test now explicitly waits for the visible database-demand result before capture. Failure report is preserved, with no changed pixel budget, timeout or baseline for the correction. Final corrected/live outcomes follow in evidence.

Final handoff: corrected four-width Practice/Studio comparison 4/4 passes without changed image budget, timeout or baselines; all twelve baselines match. Separate actual 1440px browser/API/worker flow passes with current UI, v2 result/accounting, node history, replay and native Markdown export; JSON and screenshot saved under library-studio names, preserving engine-v2 history. Final 95 unit tests and production build pass (JS 1,023.05/317.33 kB gzip; existing chunk warning). Eighteen normalized-caption cues validate within 72 seconds. Fifteen local security evidence/hygiene checks pass; public gate and all five owner-unverified note publications intentionally reject. Docs validation and diff whitespace checks pass. Local commit and test-server cleanup follow; no public or AWS deployment.

## November 19 GitHub static publication

Latest user authorizes pushing to the empty public Yashi2212/ArchArena repository with a detailed README and a GitHub-hosted preview, deferring AWS. Verified Yashi2212 credential identity and admin/push permission using account-specific GCM lookup without exposing credentials. Prepared static mode, base-aware media and least-privilege Pages workflow. API network access is fenced in static mode; no fake model results. Desktop/phone static tests pass with actual video/local exports and no backend calls. Private owner-action and resume documents live outside the Git checkout and are not publication artifacts. Remote results follow after observation.

Final static release: https://yashi2212.github.io/ArchArena/ is live, actual page/MP4/VTT HTTPS 200. Public desktop/phone Playwright cases pass, including real video playback, browser-local edits, Studio restore/download and zero API calls/script errors. All four quality jobs and the Pages build/deploy pass at code commit 53f752b. Java: 40 tests, zero failures/errors/skips; 77 runtime artifacts, zero scan matches. Frontend: 97 unit tests; browser/visual job passes. Initial Pages-enable ordering and Maven prefix failures are retained and fixed without dropping checks. Remote tree confirms no private artifacts. An automatic review usage-limit failure interrupted a final status read; user resumed and later reviewed status/export actions succeeded without bypass. Private resume/profile corrections were kept outside Git and rendered in hidden Word because the bundled Windows runtime has no LibreOffice. All final pages visually checked. Final public documentation/evidence update skips rebuilding unchanged release code.

## November 20 owner playbook and local simulation handoff

Inspected current application code and original prompt/status before explaining behavior. Rebuilt JAR (40 Java tests pass), confirmed 97 frontend unit tests, removed only stale recorded launcher state and started the real loopback API, separate worker and Vite. Four seed-matched demo jobs completed through persisted H2 storage; both controlled comparisons, accounting, bounded telemetry, duplicate reuse, changed-payload 409 and Markdown exports pass. Summary/input hashes and exact portable fixtures are committed documentation evidence; full raw local batch stays ignored.

Created the original beginner-to-technical playbook with 45 source anchors and a current runbook, optional standard-library Python demo runner, offline evidence/link validator and five VS Code tasks. Service test isolates the bottleneck with a 5 ms database; cache test leaves writes/misses flowing downstream. Definitions, analogies, virtual-time distinction, full application flow, feature purpose/implementation, interview scripts and honest resume assessment are included. Private Word/PDF editions use the bundled document runtime and native hidden Word export, followed by packaged rasterizer visual QA; they are outside the repository.

Actual browser walkthrough initially timed out locating Practice before job submission; no conclusive cause established. Standalone diagnostic loaded the app. Reviewed-access retry passes one real test including worker result, replay at 32 virtual seconds and native export. No test selectors/timeouts/app code changed. New owner-named report/result/screenshot preserve the observed pass; the fixed-path test outputs were copied before restoring both historical library-studio files byte-for-byte. See evidence/owner-handoff-verification.md. Legacy replication explanation mismatch remains an open editorial issue; no public backend readiness or owner mastery claimed. Local processes remain running for practice, AWS deferred.
