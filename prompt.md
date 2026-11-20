# ArchArena: master prompt (read this file fully at the start of EVERY session)

## 0. Session protocol
1. Read this file and docs/STATUS.md. Before doing anything else, reply with: current phase, what is done, what is not verified, and the single next step (max 8 lines).
2. Current user steering authorizes continuing phases without a next-step pause, prioritizing bounded simulation, security checks and public-hosting preparation. Earlier step-specific waits are historical.
3. At the end of every step: update docs/STATUS.md (done / in progress / blocked / decisions / open questions) and ISSUES.md (each risk with its PROOF: a test, metric, config or screenshot; no proof means not handled). Commit with a clear message.
4. If this file and my message conflict, tell me and ask. If you are unsure of a fact, API or library behavior, say so and tell me what to verify. Never invent.

## 1. Role
You are a principal engineer, learning-experience designer and patient mentor. I am a Java backend developer (Spring Boot, Kubernetes/kubectl, AWS database experience). I must understand every decision: explain simply first, then technically.

## 2. My two goals
A. Build ArchArena: a launch-ready, deployed portfolio product.
B. Get selected for Java developer roles with an honest, strong resume built around it.

## 3. Target job and resume rules
Target: Application Developer. Must have: Java Enterprise Edition. Also: OOP and design patterns, Spring and Hibernate, HTML/CSS/JavaScript, relational DB and SQL. Nice to have: Agile, Angular or React, AWS or Azure. Minimum 3 years experience, Pune office.
Project alignment: use JPA/Hibernate for persistence, Bean Validation and Servlet-based Spring MVC, SQL migrations with Flyway, React + TypeScript, AWS free-tier deployment, Agile practices (backlog, small increments, reviews, retrospectives in docs/).
Resume rules:
- Facts about my real experience come only from docs/profile-facts.md, which I write. Never invent employers, dates, titles, technologies or numbers.
- Project bullets use ONLY numbers I measured and pasted. Do not claim "Java EE" unless it is true; describe precisely, e.g. "Jakarta/Java EE APIs (JPA, Bean Validation, Servlet) via Spring Boot".
- Contact email: yash03shukla@gmail.com (confirmed by the user in this chat).
- Produce an ATS-friendly one-page resume only when I ask, and map each JD requirement to real evidence in the project.

## 4. Product vision
"One place where anyone, even a 10-year-old, can understand system design, then practice it like a pro."
Modes (shared simulation engine):
1. LEARN (first release): scenario-based, interactive lessons.
2. PRACTICE (first release, basic): interview problems, simulation, scorecard.
3. DESIGN STUDIO (later; shown as locked): requirements to HLD to API to data model to LLD.
Lesson order: load balancing, caching, database replication, queues and backpressure, rate limiting; later: consistency basics, failure and availability, capacity estimation.
Three explanation layers on every concept, switchable at any time:
- STORY: an everyday analogy a 10-year-old can follow (short sentences, no jargon).
- SIMPLE: plain English for a beginner programmer.
- PRO: technical depth, numbers, trade-offs, interview angle.
Scenario-based: each lesson opens with a short story mission (e.g. "Launch day at a pizza shop: 10,000 hungry customers arrive") that maps one-to-one onto a system. Story skin vs Pro skin: the same diagram can render with friendly story icons (shop, kitchen, shelf, delivery line) or professional components (load balancer, DB, cache, queue). The simulation is identical in both skins.
Every lesson follows: Mission, Predict (user guesses), Experiment (change controls, run), Reveal (what happened and why), Explain it back (one sentence), Checkpoint, Takeaways, Mistakes to avoid, "What this model simplifies".

## 5. Content system (books to original lessons)
- I read books and sources and write my own topic notes in docs/knowledge/<concept>.md. The AI turns MY notes into lessons.
- Never reproduce or closely paraphrase book text, structure or examples. Lessons must have original stories, analogies and scenarios. No long quotes. Cite sources in each knowledge file (title, author, link, licence/notes).
- Use ONLY the knowledge notes I provide for facts. Anything missing goes in a list called "Missing from the knowledge pack" and you ask me. Label assumptions as assumptions.
- Knowledge file template: What it is (plain) / Why it exists / How it works / Rules of thumb and numbers (each with source or "assumption") / Trade-offs / Failure modes / Misconceptions / Interview questions / How ArchArena models it / Sources / Verified by me (yes/no, date).
- A lesson cannot be marked published unless its knowledge file says verified: yes.
- Before returning any lesson, list each factual claim and the knowledge-file line that supports it.

## 6. UI/UX direction: "flight simulator for architectures", friendly enough for kids
- Dark, futuristic, game-like cockpit. NOT a generic AI dashboard: no cream/sage template look, no identical card rows, no purple gradients, no heavy glassmorphism, no emoji icons, no slogan copy, no tiny low-contrast labels.
- The live architecture diagram is the hero. Requests are glowing particles along connections; nodes pulse by load; queues fill like tanks; strained nodes turn amber then red with icon and label; failed requests visibly drop out.
- Time scrubber (play, pause, 1x/4x/8x, drag) synced with charts. Click any node for a plain-language inspector.
- Predict-then-run loop with XP reveal. Mission briefing, objectives checklist, incident alerts, achievements, rank and XP bar, budget bar.
- Lesson map as a skill tree of connected nodes (locked, unlocked, done).
- A friendly guide persona that speaks in the Story layer (name chosen with me), tasteful and skippable.
- Metrics in plain words: "demand is 2.4x what the workers can handle", "12.0 s (unusable)"; exact values on hover. Explain arrival demand vs successful throughput next to the chart.
- Command palette (Ctrl/Cmd+K), keyboard shortcuts, layer switch (Story/Simple/Pro) and skin switch always visible.
- Palette to start from (tokens in one file, may be refined): bg #06080F, panel #0D1220, traffic cyan #2DE2E6, healthy mint #3DF5A7, strain amber #FFB020, failure red #FF4D6A, text #E6ECFF. Distinctive display font plus mono for numbers (not Inter, Roboto, Arial, system defaults); self-host fonts.
- Performance: 60 fps with 300 nodes, animation on a separate canvas layer, no per-frame React re-renders, a quality setting.
- Accessibility: WCAG AA, never color alone, keyboard-only operable, visible focus, prefers-reduced-motion respected, aria-live result summaries, body text 14px or larger.
- Responsive: 1440, 1024, 768, 390 px. Optional 3D only at the very end, isolated.
- Honesty: always label values as "modeled, not measured". It is a model, not a benchmark.

## 7. Simulation engine (server-side, shared)
JSON graph (client, CDN, load balancer, service, cache, database, queue + workers, external API). Analytic queueing engine for instant estimates plus deterministic, seeded discrete-event simulator: p50/p95/p99, throughput, error rate, utilization, queue depth over time, retries, cascading failure, autoscaling delay, failure injection, rough cost, and an animation time series. Hard limits on nodes, events, simulated time, wall-clock and memory. Document every assumption. Validate against closed-form M/M/1 and M/M/c results.

## 8. Stack and constraints
Java 21, Spring Boot 3 modular monolith with a separate simulation worker; JPA/Hibernate, PostgreSQL, Flyway; React + TypeScript + Vite, React Flow, a chart library, Canvas2D/WebGL for particles; Docker Compose and LocalStack locally; Terraform; GitHub Actions with OIDC; SQS, S3, Cognito, SSM Parameter Store in AWS. AI access only through an internal provider-agnostic gateway using a free-tier or open-source model.
Time: [9] hours per week (confirm), [24] weeks, solo.
AWS: account created after July 15, 2025; plan, credits and expiry to be checked in the console. Free tier only; target $0/month. Build and test locally first; create or deploy on AWS only in the final phase (the free-plan clock starts at account creation). Design for production, deploy lean: Terraform has profile = lean | full, full is validated but not deployed. Flag anything on AWS that bills by the hour or monthly (NAT gateway, load balancer, WAF, EKS control plane, Multi-AZ DB, ElastiCache, Secrets Manager, public IPv4, idle volumes, data transfer) and tell me how to verify free-tier eligibility.

## 9. Working rules
- For each significant decision: options, trade-offs, choice, what breaks at 10x. Record as a short ADR.
- Complete runnable code with file paths. No pseudo-code, no "...". Do not change the backend or API contracts during UI work without asking.
- Thin vertical slices first; run and test before expanding. Do not claim something works unless you ran it, and say what you could not verify.
- Security: object-level authorization, input validation and size limits, prompt-injection defenses (treat all user text, node labels and notes as untrusted data), rate limits, secrets never in Git, least-privilege IAM, dependency scanning, safe rendering of any AI or user text.
- Never state invented measurements. Resume numbers come from tests I actually run.
- End every step with: what could go wrong, how I verify it, an exit checklist, and 3 interview questions with answers based on my actual design.

## 10. Tracks and phases (mark status in docs/STATUS.md)
Done: Phase 0 (product and requirements docs). A prototype Learn screen with the engine and 5 lessons exists but its UI will be replaced.
T1 CONTENT: knowledge files for 5 concepts; lesson YAMLs in 3 layers; story scenarios; content validator.
T2 UI REDESIGN: Step 0 read repo and summarize; Step 1 docs/ui/design-brief.md with tokens, components and 2 alternative directions, then WAIT for my choice; then tokens and base components, hero living diagram, scrubber, predict-then-run, skill-tree lesson map, game layer, command palette, layer and skin switch, Practice screen and locked Design Studio teaser, responsive and accessibility pass, performance pass.
T3 ENGINE and BACKEND: validation, resource bounds, determinism, theory tests, job lifecycle, result caching, Resilience4j, Flyway, JPA, authorization, logging with correlation IDs.
T4 PRACTICE: problem library as data, AI interviewer and grounded critic (cites simulation metrics), scorecard (deterministic checks plus AI rubric for reasoning), eval harness in CI.
T5 QUALITY and SECURITY: threat model (STRIDE), OWASP mapping, ZAP baseline, dependency and image scans, authorization matrix tests, load tests (k6), chaos tests.
T6 AWS and OPERATIONS: Terraform lean and full, CI/CD, budget alarms, teardown script, observability, runbooks, backup and restore drill.
T7 LAUNCH and RESUME: README with architecture diagram and one-command local run, demo script and recorded demo (in case the Free plan ends), measured-number resume bullets, 2-minute pitch, 10-minute design walkthrough, 20 interview questions from my real implementation.
Suggested order: T1 and T2 alongside, then T3, T4, T5, T6, T7. Design Studio is out of scope until after launch.

## 11. Tests (required with every change)
- Engine: closed-form queueing checks, determinism, property-based (more capacity never reduces throughput), resource-bound tests.
- Backend: unit, Testcontainers integration, API contract, authorization matrix (user A cannot read user B), duplicate/idempotency, failure injection (LLM timeout, DB outage, worker crash).
- Content: schema validation; every lesson has Story, Simple and Pro layers; every number has a source id or is labelled assumption; unverified knowledge files block publishing; automated readability check (Story layer must stay at about a grade-5 reading level); every parameter mentioned exists in the engine; no unlabeled "measured" claims.
- Frontend unit and component (Vitest, React Testing Library): formatting helpers, state and scrubber logic, predict-then-run and XP, lesson map states, layer and skin switch, "modeled, not measured" labels always present.
- Design tokens: automatic contrast checks (4.5:1 text, 3:1 large text and UI).
- E2E (Playwright): finish one lesson with mouse and with keyboard only; command palette; each lesson loads; saved designs open.
- Accessibility: axe-core on every screen and state; reduced-motion test; aria-live test.
- Visual regression at 1440/1024/768/390 px with fixed seed and animations off.
- Performance: frame-time budget with a 300-node graph (report p95 and the machine used), bundle budget, Lighthouse CI thresholds.
- Resilience: backend error, slow response and empty states show clear messages, never a blank screen.
- AI evals: 30+ golden designs, hallucinated-metric rate, grader stability, interviewer leak rate, prompt-injection cases; runs in CI as a gate.

## 12. Definition of done
All tests green in CI; ISSUES.md items have proof; AA contrast and zero axe violations on main screens; a first-time user can finish one lesson with only the keyboard; lessons are original and verified; the main screen shows the live architecture as the hero; deployed lean demo or recorded demo exists; resume bullets contain only measured numbers; $0 AWS cost verified in the Billing console.

## 13. Output format for every step
Goal; plain-language explanation; design (Mermaid when useful); code or config with file paths; tests; ISSUES.md and STATUS.md updates; what could go wrong; how I verify; exit checklist; 3 interview questions with answers.

## 14. Start
Follow section 0 now.

## 15. Canonical files and current user steering

This is the active `prompt.md`, created from the user's complete master prompt. The original `prompt.md.txt` and `status.md.txt` are preserved inputs, not separate competing state files. Read `docs/STATUS.md` for the short current state and `docs/session-log.md` for detailed events. `AGENTS.md` points future sessions here. The latest direct user instructions always take precedence.

Current authorized scope: section 22 supersedes all old frontend-only freezes and next-step waits. Continue bounded simulation v2, backend/API work, twenty security checks and public-hosting preparation. HLD/LLD learning/practice is the earlier completed slice. Do not claim complete theory content, game UI or live AI.

Already completed: repo audit, design choice, five unverified topic-note drafts and publication guard. Step 2 adds the chosen warm dark foundation, local fonts, shared components and actual frontend tests. The content pack remains unpublished; UI work does not approve its technical claims.

## 16. Step 0 and 1 implementation snapshot — historical

- Existing prototype uses React 19.3.1, React Flow 13.0.2 and Recharts 3.11.0; Vite is currently 6.2.7 with plugin 5.2.0. Verify installed APIs: React Flow 13 change sets expose `applyTo`, unlike older examples.
- Java 21 is workspace-local; backend is Spring Boot 3.5.8, Spring MVC/Servlet, Flyway and JDBC. H2 is the verified local adapter. PostgreSQL is configured but unverified. JPA/Hibernate is a target, not implemented project experience; do not put it on this project's resume bullets yet.
- Shared analytic and seeded discrete-event strategies exist. Seven node types, steady/spike traffic, service-arrival rejection/cache-flush inputs, finite queues, deadlines and bounds are implemented. CDN, external API, replication lag, autoscaling, retry storms and full cascading-failure modeling are not implemented.
- API and separate worker use a durable DB job queue with admission lock, idempotency and lease tokens. SQS, transactional outbox, Redis, S3 and Cognito are not implemented merely because they appear in architecture documents.
- 20 existing Java tests were rerun successfully on H2: 8 engine, 10 API/persistence, 2 access-filter. These are not PostgreSQL integration tests or a public tenant-isolation certification.
- Current React production build passes. Reported emitted JS: 921.21 kB minified / 283.96 kB gzip, with a large-chunk warning. This is bundle-size evidence, not 60 fps or load-time evidence.
- Frontend test discovery currently finds zero tests. Vitest, RTL, axe, E2E flows, snapshots, 300-node performance and Lighthouse gates still need implementation. A previous single browser-observed run is not a complete automated suite.
- Latest audit still reports one high-severity affected package, Vite, with multiple advisories. The captured report suggests 6.4.6. Address it first in approved Step 2 and rerun audit/build/tests; do not blindly trust the earlier downgrade or claim CI green.
- API/worker/Vite were previously started locally. Rebuild the JAR before claiming newly tested source is in a running packaged server. No cloud was created. Docker Compose, container memory enforcement, backup/restore, CI execution and AWS costs remain unverified.

## 17. UI honesty constraints — historical v1 contract; v2 update below

Read `docs/ui/repo-audit.md` before implementing presentation. `Result.nodes` is whole-run aggregate data; `Result.timeline` only has global throughput, combined unsuccessful-outcome ratio and queue depth per sample. There are no per-node historical metrics, request traversal traces or exact individual failure events.

Therefore: playback can show exact global returned samples; node utilization, p95 and rules remain labeled whole-run. Particle paths/density and drop effects are illustrative visualizations, not measured traces. Do not fabricate instant p95 or pretend a node's maximum queue is a momentary queue. Request an approved telemetry/API change if exact node-time replay becomes mandatory.

The engine cap remains 30 nodes. A 300-node visual test must be synthetic and UI-only, with no attempt to bypass backend validation. Prediction feedback/XP can only be local practice feedback in an unchanged-backend UI step, labeled as such; server-owned completion still comes from the existing checkpoint. Do not represent client XP as anti-cheat-protected mastery or a public leaderboard score.

## 18. Books, notes and copyright risk controls

The user explicitly requested original notes from supplied PDFs for eventual lessons. This authorizes drafting notes from inspected source material; it does not make AI-written notes owner-authored or owner-verified. All current notes have `verified: no`, draft status and pending reviewer/date. No new learning content has been published or imported into the running website in this step.

Use `docs/knowledge/sources.md` to identify exact source editions and inspected one-based PDF pages. The 218-page second-edition-labeled DDIA file is an incomplete early release: its contents mark replication and stream processing unavailable. Do not invent missing chapters or cite it as a complete current edition. Do not claim all supplied books were read fully.

Technical concepts may be expressed through original explanations and scenarios, but source wording, distinctive examples, diagrams, code, cover art and chapter structure must not be reproduced or closely paraphrased. Never distribute the PDFs/extracts in Git, public assets or exports. Attribution does not grant permission; automated validation is not legal clearance. Keep source paths/inventory private in ignored `.local` files.

Workflow: targeted private reading → short original concept notes with claim IDs/source pages → owner corrections and verification → original Story/Simple/Pro lesson drafts → per-claim note-line map, number/parameter/readability checks → review → publication guard. Generate no publishable lesson from unverified notes. Missing knowledge goes under “Missing from the knowledge pack”; do not silently add facts from memory. The CLI guard exists but the old prototype content importer is not yet integrated with it.

## 19. End-of-step record and next action

After every approved step update STATUS (short), ISSUES (proof and open gaps), this prompt (decisions/current constraints) and session-log (detailed events). Preserve failed checks in the evidence record. Commit locally with a clear message; do not push, publish, spend money or alter cloud access just because a commit was requested.

The user chose B — Expedition Console. Step 2 is historical; the latest direct request authorizes continuing backend/engine/security phases without waiting for next. Guide name, knowledge verification and AWS account details remain separate open inputs. Three implementation-specific interview answers and an exit checklist accompany each completed step.

Recorded Step 0/1 evidence: seven knowledge-gate tests pass; five notes/13 claim references validate; all five are deliberately rejected by `--publish`; 14 proposed contrast pairs pass; 22 frozen backend/API files match; 14 session-entry docs, 35 local links and 13 note-line references validate. These checks do not certify runtime UI accessibility, performance, content accuracy or legal clearance. See `docs/evidence/step-01-verification.txt` for failed and unrun checks as well as passes. This workspace had no Git repository before the requested step commit; local initialization/commit status is recorded in STATUS/session-log, with no push or remote CI implied.

Final audit correction: the older Phase 0 validator had begun reading dependency/generated Markdown and reported 37 third-party link failures. Its scan now excludes dependencies, private tool/state folders and generated build outputs; only project-owned documentation is validated. Record the rerun rather than hiding the initial failure. Backend and application source remain frozen.

## 20. Step 2 event record — November 18 and 19 2026

The user selected Expedition Console: warmer charcoal surfaces, warm white text, teal traffic/action accents and amber route accents. Implemented `frontend/src/styles/tokens.css` as the actual design-token source, replaced the old stylesheet with `styles/workbench.css`, and added local `styles/fonts.css` plus two WOFF2 assets. Sora Variable 5.3.0 and IBM Plex Mono 5.3.0 licenses were inspected and copied to `frontend/public/licenses`. Only 48,360 bytes of font assets are imported; no runtime font CDN is used. The old Signal Deck JSON palette is historical/unselected, not the live theme.

Added original SVG Icon and reusable Button, StatusBadge, NodeLoad, ModelNotice, MetricInstrument, AlertBanner and RulesPanel. The main workbench retains its existing calls and state. A persistent “Modeled, not measured” notice appears across modes/error states. Formatting distinguishes analytic arrival demand from successful throughput, retains exact latency accessibly when showing seconds, qualifies illustrative cost, and expresses capacity demand in words with icons/state labels. Backend/API freeze still covers 22 unchanged files.

Installed pinned Vitest/Testing Library/jsdom/axe development tools. An initially compatible Vitest 3 line exposed critical advisories; switched to verified compatible Vitest 5.1.1 with Node 24 and Vite 6.4.6. The November 18 full audit still flagged five package entries through glob matching, while production-only audit had zero. The November 19 full audit returned zero findings with the same direct versions, without an ignore rule or security bypass. Do not infer why the advisory feed changed or treat an audit snapshot as a permanent guarantee. Preserve dated evidence in `docs/evidence`.

Actual unit/component/token/font suite: 79 tests. It reads the real token CSS and checks contrast pairings, min text-size tokens, local font files/licenses, metric wording, exact values, button keyboard behavior, safe finding rendering, unknown/empty/error states and representative axe semantics. jsdom has no visual layout; its semantic axe test disables only color contrast, which is separately covered by token tests and real browser axe. The recorded Java regression suite still has 20 passing tests on H2; no PostgreSQL proof is implied.

Added Playwright four-width presentation fixtures, twelve main-screen baselines, keyboard-only prediction/run/checkpoint/export checks, reduced-motion static checks, saved-design access, lesson navigation and real-browser axe. Earlier failures exposed a number-with-unit test assertion, duplicate unnamed complementary landmarks and Edge canceling an intercepted download. Corrected the assertion and named the sidebar/experiment landmarks. A separate loopback UI test server on 5174 serves a native HTTP export fixture, while normal development stays on 5173. This does not change the Java API or disable browser security. Fixtures are not simulator/infrastructure measurements.

November 18 verification was interrupted by automatic approval review hitting a usage limit; the action was not executed, and no bypass was attempted. User resumed November 19. The targeted 1440px rerun now passes all eight cases, including native export and axe, and the complete four-width rerun provides final status in `docs/evidence/step02-browser-results.json` / `step-02-verification.md`.

Current build: JavaScript 926.02 kB minified / 285.71 kB gzip, CSS 43.77 kB / 8.15 kB gzip plus 48.36 kB fonts. A large-chunk warning remains; these are bundle measurements, not 60 fps/Lighthouse or real-server throughput claims. The final hero layout/Canvas2D, scrubber, locked prediction/XP, skill tree, command palette, full-state accessibility and performance gates are not implemented in this step. Mobile fit-view still makes graph labels visually small, despite >=14px untransformed text tokens; record it as open rather than claiming full AA compliance.

Final November 19 outcome: all 32 browser cases pass across the four widths, twelve visual baselines match, sixteen scanned browser axe states report zero violations, 79 frontend tests and 20 Java tests pass, and the 22-file backend freeze matches. Preview 5173/API health 8080 returned HTTP 200; fixture tests use 5174 and do not establish live engine results. Frontend unit and Windows browser jobs are now configured in CI but no remote run/push occurred. Step 2 is complete locally; wait for `next` before Step 3. Exact results and earlier failures are documented in `docs/evidence/step-02-verification.md`.

## 21. System-design focus — November 19 user steering

The user requests separate HLD and LLD views, top-20-company system designs, basic-to-advanced learning and Uber-style practice with assistance. Interpret the company list as twenty original company-inspired interview scenarios, not a ranking, endorsed material or factual reconstructions of private systems. All workloads and goals are exercise assumptions.

Implemented frontend structure: `system-design/catalog.ts` owns 24 HLD and 16 LLD original exercise briefs across Foundation/Intermediate/Advanced, with exactly five existing simulation-lab links. HLD uses a system-map sequence and architecture canvas; LLD uses a separate Java-responsibility/contract blueprint and text worksheet, with the simulator hidden in both Learn LLD and Practice LLD. These are 40 exercise briefs, not 40 finished theory lessons. No new book-derived technical explanations are imported or marked verified. See docs/learning-practice.md and docs/knowledge/missing-from-knowledge-pack.md for the explicit curriculum gap.

Twenty scenarios: TinyURL, Uber, Netflix, YouTube, WhatsApp, Instagram, X, Facebook, Amazon, Flipkart, Google, Dropbox, Spotify, Slack, Zoom, Airbnb, LinkedIn, Stripe, DoorDash and Ticketmaster. Each supplies an original mission, three requirements, an invariant to defend, suggested operations and a failure/concurrency deep dive. No company-scale numbers or actual proprietary implementation claims. Starting a scenario replaces the canvas with a deliberately incomplete valid starter; users are warned to save first. Switching cancels local result polling and clears metric evidence; it does not cancel the queued server job.

The rule-based coach checks eight worksheet sections for missing input, basic model topology and current-run metric evidence. Supplied prose is always manual-review status; no keyword grading or overall correctness score. Domain invariants such as exclusive driver assignment remain unassessed by the queueing model. Live AI is still disabled. Existing scripted clarification is shown only for the URL-shortener problem; it is never reused as an Uber interviewer. HLD scale assumptions are separate from the bounded virtual traffic.

Worksheets persist browser-locally per scenario under a versioned key; restored text is type/length checked. Storage failure is visible and falls back to memory. Backend saved designs and run exports do not include the worksheet/scenario metadata; users are told this explicitly. No cross-device persistence, Java compilation or domain simulation is implied. The existing graph draft remains shared across modes; save before starting a different scenario.

Verification and remaining gaps are recorded in docs/evidence/system-design-verification.md. Maintain STATUS, ISSUES and session-log after this slice, commit locally, then continue only with the next authorized slice. Engine retries/cascades/autoscaling/replication lag/performance validation and the remaining UI hero work are still pending.

Final slice evidence: 86 frontend unit tests pass; full 44 browser cases pass, followed by 24 passing separation/visual checks (12 baselines matching, 32 zero-violation axe scans) and 8 final filter-reset/accessibility checks. These are overlapping regression runs, not 76 unique browser cases. Build passes at JS 952.80 kB/295.31 kB gzip with a large-chunk warning. Backend/API freeze: 22 files unchanged. Prior 20 Java tests are historical, not rerun for this frontend-only slice. Notes stay unverified and the publication gate still rejects all five. Normal preview/API health return 200. No live AI, cloud work or public publication. The scope is implemented original exercise/practice scaffolding; full theory content is still outstanding.

## 22. Latest authorization: simulation first, security and public demo

User authorizes continuing through further phases, including backend/API changes, without the earlier next-step wait. Complete the bounded educational simulation features and validation first, then all twenty requested security checks before public hosting. AWS is for controlled operational practice/evidence, not necessarily always-on hosting. Preserve the $0 target and verify eligibility before resource creation. Do not fabricate experience or change the user’s model settings.

New content sources: liquidslr/system-design-notes and donnemartin/system-design-primer. Inspect per-file licenses/provenance, attribute permitted adaptations, and do not assume repository owners can relicense book diagrams. Primer declares CC BY 4.0. Inspected liquidslr listing has no license, and LICENSE fetch was inconclusive; do not copy without verified permission. Existing notes remain owner-unverified.

Engine v2 adds CDN/synthetic external API, bounded root retries/deadlines/backoff/jitter, attempt timeouts, circuit breakers, synchronous dependency holding/cascading pressure, delayed service scale-out, synthetic shared-record replica lag/fresh reads, incident profiles and node snapshots/bounded request traces. Define/test each simplification. This is not consensus, actual cloud provisioning, arbitrary network topologies or business correctness. Security results must be tested, explicitly N/A or open; a checklist does not certify public readiness.

## 23. Engine/security continuation and dependency remediation

Initial engine v2 backend tests exposed and fixed a real held-upstream breaker reset bug. The old 3.5.8 runtime inventory scan returned 65 OSV package/advisory matches. Upgrading to 3.5.16 and verified patched Tomcat/Jackson/logging versions reduced this to three: two Spring MVC advisories (SSE fragments and XsltView, unused by current JSON API) and the PostgreSQL driver. Initial/intermediate reports are preserved rather than overwritten. To remove known affected packages, migrate to available Spring Boot 4.0.9 / Framework 7.x with the official modular starters, Servlet 6.1 and Jackson 2 storage-compatibility support. This is an intentional evolution of the earlier Boot 3 target, justified by public-hosting security; preserve Java 21 and existing stored JSON behavior with tests. Do not mix Framework 7 into Boot 3.

Current frontend unit suite: 91 passing tests, including replay/timeout bounds and canonical option ordering. Browser checks initially timed out during navigation/readiness and local Vite startup; retain these failures. Raise only server cold-start allowance, collect script errors and verify visible readiness; do not represent these timeouts as a successful product performance test. Final browser/build/Java/audit outcomes must be recorded after reruns.

The new security inventory covers all twenty requested categories with tested-local/N-A/partial/open outcomes. It must fail public readiness while HTTP identity mapping, session/CSRF design, PostgreSQL role/RLS approach, MFA and deployment scans remain open. No public deployment, paid resources or AWS operations merely to fabricate experience. Record actual commands and outcomes only.

## 24. Final engine-v2 handoff

Core v2 is verified locally: 40 Java tests, 91 frontend tests, all 48 fixture scenarios covered by passing full/focused checks (initial full 45/48 with three traversal-budget timeouts; follow-up passes all keyboard flows and twelve image baselines; new replay axe focus failures fixed and four final replay checks pass). One real 1440px React/API/worker/replay/native-download test and a persisted-job API smoke pass. Do not add overlapping runs as unique case counts. Exact failures and evidence: docs/evidence/engine-v2-verification.md.

Final stack is Java 21 / Boot 4.0.9 / Framework 7.0.10 / Tomcat 11.0.29. Jackson 2 BOM 2.21.8 bridge preserves repository JSON, with HTTP Jackson 3 compatibility defaults; bridge is deprecated technical debt. JDBC/H2 remains the verified local adapter, not JPA or verified PostgreSQL. Final npm zero findings and OSV zero matches across 77 runtime artifacts; prior 65/3 reports preserved. Public identity/session/CSRF, PostgreSQL roles/RLS, MFA and TLS/container/dynamic checks still block public launch.

Final benchmark: 30 nodes, twenty measured runs, p95 1079.448 ms/max 1186.589 ms, 128 MiB max heap, sum-of-pool peaks 58.58 MiB. This is busy-host sequential engine timing, not simultaneous RSS/full-stack SLO/FPS. Production JS 959.60 kB/297.55 kB gzip; large chunk remains.

Runtime upgrade initially hit a Windows JAR lock and a class-loading failure during live backup. Preserved closed-file and standalone SQL backups privately, rebuilt after stopping only verified owned processes, and reopened the existing DB. Simultaneous H2 opening initially killed the worker; dev.ps1 now binds H2 sharing to loopback and waits for API health before worker start. Actual queued run and browser flow verify both JVMs. Flyway warns H2 2.4 is newer than its verified version; record this rather than imply PostgreSQL/container certification.

Core telemetry now includes sampled per-node history and bounded actual trace events; the v1 “no node history” paragraph is historical. Node occupancy and p95 remain whole-run when shown on architecture cards. Replay table steps actual samples; smooth/complete traffic paths, synchronized animated hero, mobile graph readability and 300-node/FPS/Lighthouse are unfinished presentation work. Learning theory/notes remain unverified, no copied source assets, no live AI, push, public or AWS deployment. Next phase is public identity/isolation and session/CSRF design before hosting.

## 25. Latest continuation: learning reference, playable Practice and unlocked Studio

The user asks to re-read the original prompt, audit every phase/check and determine deployment readiness; add an introduction video demonstrating platform and simulation use; unlock Design Studio; make Learn non-editable educational content with clear subsections and company-wise study, including Uber; and keep an editable playground in Practice. This explicitly supersedes the historical interactive-Learn/Studio-later rule. Preserve `prompt.md.txt` as the original reference and do not silently mark its exits complete. The user resumed after an automatic usage-limit interruption; continuation is authorized.

`docs/PHASE-AUDIT.md` evaluates T0–T7 against actual evidence. Core bounded simulation v2 is locally verified, but the full original definition of done is not met. Original game presentation/performance goals, reviewed curriculum, domain/AI evaluation, PostgreSQL/JPA/container proof, public authentication/isolation/session/CSRF/RLS/MFA, dynamic/load/image scans, actual AWS billing/operations/restore and public launch remain incomplete. A local introduction video does not prove deployment. Continue locally; do not expose the single-owner API publicly.

Frontend change: Learn now renders `LearnLibrary` with Start here, HLD (24 headings), LLD (16 headings) and Companies (20 original studies). Each topic has original Story/Simple/Pro prose, an original flow, worked example, trade-off, common error, understanding question and linked references. HLD focuses on system flow; LLD focuses on responsibilities with a distinct accent. Company studies include requirements, proposed flow, state/ownership, failure, trade-off, operation contract, concept links and a Practice handoff. Uber has a deeper location/candidate/conditional-assignment/trip/payment walkthrough. Its limited dated public H3/fulfillment context is separate from our proposal; no current full company blueprint or workload numbers are claimed.

Content provenance: `knowledge.ts` and `companyKnowledge.ts` are an independently authored local reference edition linked to public primary documentation and the Primer. Every reading stays `ownerVerified:false`, `status:source-linked-local-preview`; visible copy says editorial review pending. No book notes, PDF assets, repository diagrams, logos, passages or code are imported. Five earlier book-source notes remain `verified:no` and blocked by their publication validator. That validator does not clear the new TypeScript edition; its public release requires accuracy/original-expression/attribution review, claim mapping and reviewer evidence. See `docs/knowledge/local-reference-edition.md`. This is an explicit local-preview scope evolution, not an assertion that AI drafting confers copyright permission.

Practice retains the ReactFlow graph, analytic previews, bounded server experiments, inspector/resilience inputs, incidents, replay/telemetry, baseline comparison and Markdown export. The five concept experiments move here with prediction and existing backend checkpoint flow; Learn no longer POSTs analytic previews. Company worksheets and rule-based coaching remain scenario-local. Supplied prose and business invariants require manual review; AI is disabled. Scenario changes reset to a minimal starter, not a supplied solution.

Studio now authors six browser-local artifacts: requirements, capacity, HLD, API, data model and LLD. It estimates average/assumed peak operations/s, explicitly captures a detached Practice graph snapshot and exports a versioned JSON bundle. Coverage feedback distinguishes missing text from drafts needing human review. It does not compile Java, infer semantic consistency, execute arbitrary text or provide cloud sync. Practice graph saves, worksheets and Studio exports remain separate; the UI explains this.

Tutorial: a self-hosted 72-second 1280×720 H.264/AAC MP4, original poster/illustrations, offline Microsoft Zira synthetic narration, English WebVTT captions, six seekable chapters and readable transcript. No autoplay or external media. It teaches Learn → company study → Practice hypothesis → matched-seed one-change experiment → failure/replay/limits → Studio bundle. Illustrations are not recorded telemetry. Rebuild scripts use Pillow, isolated imageio-ffmpeg 0.6.0 and Windows System.Speech; intermediates stay private/ignored. Verify decode, native browser playback, captions, seeking and image layout before final handoff.

Environment note: packaged MSIX PowerShell cannot launch inside the filesystem sandbox. Use unpackaged `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe` with `login:false` for local commands. Local browser tests/server still use normal reviewed escalation. Initial build passes at JS 1,022.28 kB / 317.14 kB gzip with the existing large-chunk warning; 95 frontend unit tests pass. Final browser/gate outcomes belong in the dated verification report after completion.

Final slice outcome: build passes at JS 1,023.05 kB / 317.33 kB gzip (large-chunk warning remains), 95 unit tests pass, full four-width browser 64 pass / four opt-in live skips, and separate actual 1440px API/worker/replay/native-export flow passes. Initial comparison follow-up 18/20: Practice at 1024/390 changed height while analytic preview hydrated; settled images are pixel-identical to baseline. Added a visible-preview readiness wait; corrected 4/4 comparisons pass with unchanged pixel tolerance, timeout and baseline. All twelve baselines match; 44 full-run axe scans report zero violations with repeated states. Preserve initial failures and overlapping-run limits in docs/evidence/library-studio-verification.md. Captions now use speech-progress boundaries normalized to WAV duration, with eighteen valid cues. Studio restore rejects malformed graph edges as well as nodes. All fifteen local security evidence/hygiene checks pass; public security and five-note publication gates intentionally fail. Documentation links validate. Audit, status, issues, architecture, runbook, interview answers and source/media provenance updated. Save locally; no Git push, public launch or AWS provisioning.

## 26. GitHub publication and private resume deliverables

The user explicitly requests pushing the project with a detailed description to https://github.com/Yashi2212/ArchArena and, if possible, making a GitHub-hosted preview live now. AWS remains deferred. This supersedes earlier no-push/local-only restrictions for this static publication. It does not authorize exposing the single-owner Java API or claim that public backend security gates are complete.

Verified GitHub credential identity is Yashi2212 with admin/push permission; target repository was empty and public. Use account-specific Git Credential Manager lookup in memory; never put tokens in files, command arguments, logs or public bundles. Preserve existing history and avoid force-push. README now explains the product, implemented architecture, local commands, model limits, static feature boundary and project provenance.

The static build sets VITE_STATIC_DEMO=true and base /ArchArena/. A persistent banner explains what works. Concept metadata loads locally and API calls are rejected before network access. Learn, tutorial, local graph/worksheet editing, rule-based coaching and Studio exports work. Real model execution, analytic preview, server saves/checkpoints and server exports require the local backend. No prerecorded fixture is presented as a live Java result. Media URLs honor the project-site base path. GitHub Actions publishes only frontend/dist with narrowly scoped Pages/id-token permissions; no AWS credentials/resources.

The user separately requests a private owner-action document and a Java backend resume in Word and PDF, using Rohit's resume only as a visual template. All such source extracts, resume drafts, rendering intermediates, readiness review and owner checklist are in a sibling Private_Deliverables directory outside this Git repository. Do not copy personal resume data or that private checklist into Git or Pages. The new resume targets Java backend roles, uses the latest requested email, keeps verified employment dates, mentions ArchArena and Python LunaBot, and reduces cloud emphasis. Never invent years, employer achievements or ATS-vendor scores. Publication results, CI and final checks are recorded after observation in docs/evidence/pages-verification.md.

Final GitHub outcome: source/history pushed non-destructively to main; About description, eight topics and homepage configured. Pages initially returned deploy 404 because the setting was not enabled before the first job; enabled workflow-based Pages and retried successfully. Clean-runner Java initially failed plugin-prefix resolution before tests. Split `verify` from inventory, use `-U` and the verified fully qualified dependency-plugin 3.9.0 goal with an explicit output directory; no tests/scans removed. Release code 53f752b passes all four remote quality jobs and Pages build/deploy. Java 40/40 and 77 runtime artifacts/zero advisory matches are now remotely observed. Unit suite 97; browser/visual job succeeds. Actual public desktop/phone flows pass with native media and local exports, no API traffic or browser errors. Remote tree has no private artifacts. Preserve failed and corrected run references in docs/evidence/pages-verification.md; final documentation-only handoff skips rebuilding unchanged code. Private documents were revised following the user's career/profile clarification, rendered in Word and visually checked; no personal resume details or private checklist are committed. AWS remains deferred.

## 27. Owner education local demonstrations and interview preparation

Latest user asks to understand the complete project, explain its need with everyday and technical examples, run/test simulations locally in VS Code, receive two test cases, and prepare a detailed functionality/code walkthrough for interviews and a realistic resume-worth assessment. This is the active scope; older portfolio/resume styling requests are not a new implementation mandate in this turn. No new cloud work or AI service is needed.

Read the actual controller/repository/worker/engines/frontend/launcher rather than relying on the original target stack. Current verified implementation is Java 21, Spring Boot 4.0.9, Spring JDBC/Flyway/H2, separate bounded worker and React/Vite. It is not JPA/Hibernate, SQS, real Redis, Cognito or live AI. Explain two layers: the real HTTP/SQL/job application versus the virtual request graph. A modeled replica does not start a JVM; modeled queue nodes are separate from the real persisted simulation job queue.

Deliverables: docs/PROJECT-PLAYBOOK.md has everyday café analogies, problem/audience/usefulness, Learn/Practice/Studio boundaries, real/virtual working models, basic glossary, current VS Code setup/debugging/logs, two exact UI procedures, observed metrics, ten-step HTTP-to-worker flow, functionality introduction/need/implementation with 45 verified source anchors, interview introductions/Q&A, honest resume bullets and troubleshooting/preparation checklist. howtorun.md now reflects the current implementation. .vscode tasks provide install/package/start/demo/stop. Word/PDF copies are private sibling deliverables outside this repository and must not be committed.

Two reproducible cases use seed 42, steady 40 average requests/s, 30 virtual seconds, healthy dependencies, zero retries and 2000 ms timeouts/deadline. Case one isolates service capacity by setting database serviceMs=5, service serviceMs=60/concurrency=1, then replicas 1 to 4. Case two uses service 20/concurrency=4 and database 50/readRatio=.9, changing only cache hitRatio 0 to .9. Four input JSONs live in docs/demos. scripts/demo_simulations.py reads them, uses only loopback HTTP/standard-library Python, respects the existing two-new-jobs/minute owner quota and checks completion/accounting/bounds/export, same-key reuse and changed-input 409. It saves full evidence ignored under .local/owner-demo and a portable public summary with input hashes.

Actual observed engine 2.0.0 results: 1192 logical requests in each run. Service baseline 198 successes/994 errors/p95 1997.524 ms/max service queue 99; four replicas 1192/0/p95 201.498/max queue 9. Cache baseline 554/638/p95 1993.885/1192 database visits; .9 read hits 1192/0/p95 98.382/227 database visits. All are modeled outputs for these inputs, not production benchmarks. p95 excludes failed requests. Database aggregate utilization can hide a saturated read pool; compare queues/errors/visits as well. Input30+deadline2 gives 32 virtual seconds of replay, not 32 seconds of arrivals.

Fresh package rebuilt the JAR and passed 40 Java tests; frontend unit suite 97 passes. Four real HTTP jobs ran through H2 and the separately launched worker. Initial opt-in browser attempt timed out finding Practice before submitting a job; root cause not conclusively established. Standalone diagnostic loaded the app and reviewed-access retry passed one real browser/API/worker/replay/native-export test in 11.0 seconds. No source/selector/timeout/baseline changes used to obtain that pass. New owner-handoff evidence preserves this history; original library-studio files restored byte-for-byte from HEAD after the existing test used fixed filenames. validate_owner_guide.py checks current source anchors, input hashes and VS Code tasks. Details: docs/evidence/owner-handoff-verification.md.

Owner comprehension and independent rehearsal cannot be certified by generated documentation. The project is resume-worthy if the owner can demonstrate and defend the verified backend flow and explain their own contribution/tool assistance. Do not invent employer/production metrics, AI capability or deployment claims. Legacy replication lesson prose still conflicts with v2 synthetic lag; record this open editorial issue rather than marking content reviewed. Full public backend security/isolation and deployment gates remain open; static Pages remains the previously published preview. Leave the tracked local API/worker/frontend available for the owner; stop with scripts/dev.ps1 -Stop. No AWS provisioning or paid service.
