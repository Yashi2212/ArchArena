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
