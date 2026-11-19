# ArchArena risk and evidence register

Updated November 19, 2026. Owner: project developer. Original product risks remain open; prototype/foundation controls have partial evidence, not a production sign-off. T2 Step 2 is locally verified, with source notes still unpublished. See current evidence below rather than treating historical Phase 0 implementation rows as today's inventory.

| ID / category | Risk and decision | Implementation status | Required proof to close | Review gate |
|---|---|---|---|---|
| R01 Cost | Existing AWS account may have expired or insufficient credit. ADR 005: local first, conditional hosted demo, no paid fallback | No resources created; budget worksheet exists. Account date/plan/balance unknown | Dated Billing/Free Tier/Credits evidence, service eligibility, regional Calculator export, scheduled-stop and teardown inventory; zero unexpected usage | Before any cloud provisioning |
| R02 Reliability and model accuracy | Plausible-looking metrics could teach false conclusions. ADR 003: explicit assumptions and versioned result provenance | Requirements only; no engine | Closed-form M/M/1 and M/M/c fixtures with declared tolerance and sampling error, seed replay tests, invalid-model cases; show limits in UI | Phase 3 before lessons |
| R03 Security and scaling | Malicious graph, huge queue or event storm exhausts API/worker. ADR 004: separate bounded worker | Target caps specified; no enforcement | Oversized input, invalid topology, timeout, event/arrival/queue cap tests; measured container memory peak and worker-kill isolation | Phases 3–4 before non-loopback access |
| R04 Security and privacy | Unauthorized design/job access or exposed DB. ADR 007: owner-only demo; no open registration | No server or identity; nothing exposed | Unauthenticated and wrong-owner negative tests for every endpoint; graph IDs cannot bypass ownership; network scan and credential-free repo scan | Phase 9 subset before hosted access |
| R05 AI | Fabricated metrics, prompt injection or hidden-spec leak. ADR 006: rules first and validated citations | No gateway or prompts | Eval fixtures for invented values, untrusted labels and secret questions; observed hallucinated-metric/leak rates, timeout fallback; full 30+ design suite still later | Before optional AI enabled |
| R06 AI and cost | Free-provider quota disappears, or tokens produce expense. ADR 006: no paid fallback | No provider selected; $0 availability unverified | Current provider terms/quotas, requests/tokens limits, disabled-provider and quota-exhaustion tests, no credentials in React bundle | Phase 5 subset |
| R07 Browser and accessibility | Graph canvas is hard to use on keyboard/mobile, animations cause discomfort, stale results overwrite new edits. ADR 001: React plus explicit alternatives | Acceptance criteria only; no UI | Playwright critical flows, keyboard-only walkthrough, reduced-motion screenshot, browser matrix, out-of-order response test and frame timings | Phase 8 subset |
| R08 Reliability and data | Single-host failure loses designs or SSE/job state. ADR 005: accept demo failure domain, backup and recover | RPO/RTO targets and retention policy only | Restore drill timed to ≤2 h and data loss ≤24 h, worker-crash recovery, duplicate delivery and SSE reconnect tests; retained backups bounded | Before launch |
| R09 Delivery and scope | Original fifteen-phase product exceeds 216-hour allowance. ADR 002: narrow launch and keep 27 hours contingency | Roadmap and explicit exclusions documented | Actual hours logged weekly, week-7 and week-16 working demos, accepted replans when evidence differs; plan assumptions confirmed | Each phase boundary |
| R10 Product claims | “Unique”, “production accurate” or resume numbers overstate work. ADR 006: cite evidence and distinguish targets | Primary-source competitor sample and target labels documented | Peer feedback, provenance/correctness evidence, dated benchmark report with hardware; review README/resume against actual implemented scope | Before portfolio publication |

## Planning evidence and open inputs

- Phase 0 documents and ADRs are present; `scripts/validate_phase0.py` checks consistency. See `docs/phase-0/validation-report.txt` for the actual run.
- The user selected interview candidates, Learn/basic Practice, a personal demo and a post-July-2025 AWS account.
- “9” is interpreted as hours/week, and 24 weeks is provisional. Neither a precise deadline nor account expiry/balance has been confirmed. Planning can proceed; deployment cannot infer these missing facts.
- Local machine RAM/CPU, free LLM quota and LocalStack feature availability/licensing must be checked in the relevant implementation phases.
- A known model simplification (fixed read-replica routing without lag) is allowed only with visible disclosure; this does not close R02.

## Status changes

- Phase 0: created this register with ten open risks, mitigation decisions and explicit proof requirements. No runtime, security, cloud-cost or AI risk is marked resolved.

## Current prototype evidence

- R02/R03: eight engine tests pass, including deterministic replay, compatible closed-form fixtures, invalid inputs, request accounting and policy rejection. Engine resource bounds exist, but full adversarial/container/load evidence is incomplete.
- R04/R08: ten API/repository tests plus two access-filter tests pass on H2, covering owner scoping, idempotency, concurrent duplicates, queue cap, lease fencing/recovery and stale saves. This does not prove real PostgreSQL behavior, public OIDC/IDOR coverage or restore capability.
- R07: Step 2 now has 79 frontend tests, 32 fixture-based browser tests across four widths, 12 visual baselines and zero axe violations in 16 scanned states. Keyboard checkpoint/export is verified with fixtures and a native HTTP attachment. Real-backend browser, full manual/all-state accessibility and frame measurements remain open.
- R05/R06: live AI remains disabled; scripted facts and deterministic findings are available. No provider/gateway/eval implementation is claimed.
- Detailed commands/results: `docs/evidence/step-01-verification.txt`; Java reports in `docs/evidence/java-tests-2026-11-18.txt`; UI audit in `docs/ui/repo-audit.md`.
- Current Step 2 results: `docs/evidence/step-02-verification.md`, unit/browser/audit JSON and `step02/java-tests.txt`. Backend freeze remains 22 unchanged files; 20 Java tests rerun successfully on H2.

## UI redesign risks

| ID | Decision / implementation | Proof and remaining gap | Status |
|---|---|---|---|
| UI01 Performance | No animation framework; Canvas2D/quality/performance remain future | Current JS 952.80 kB/295.31 kB gzip and fonts 48.36 kB; build warning persists. No frame/Lighthouse measurement | OPEN |
| UI02 Accessibility | Text tokens ≥14px, semantic statuses, distinct complementary landmarks | Actual token tests, keyboard fixture flow and 16 zero-violation browser axe scans. Fitted graph text remains small on mobile; full modal/manual/all-state checks pending | PARTIAL |
| UI03 Motion | Existing animated edges become static under reduced motion | Browser checks pass at all four widths; future Canvas2D/offscreen handling still pending | PARTIAL |
| UI04 Color readability | Expedition tokens and words/icons instead of color alone | Actual CSS contrast comparisons, status tests and reviewed screenshots pass; complete manual/color-blind review not performed | PARTIAL |
| UI05 Honesty | Persistent model notice, approximate analytic label, whole-run node/p95, illustrative cost | Formatting/component and browser tests pass. Future playback/particle mapping remains unimplemented | PARTIAL |
| UI06 Feature preservation | Mobile lesson/save access restored; existing actions preserved | Four-width tests cover lessons, save/open, keyboard checkpoint/export and errors; screenshots match. Real-backend browser/complete regression coverage pending | PARTIAL |
| UI07 Dependency security | Vite 6.4.6, Vitest 5.1.1; no audit-ignore/security bypass | Nov 19 full audit reports zero. Nov 18 five glob-chain entries remain historical; reason for feed change unknown. Continual scans still needed | CURRENT AUDIT CLEAR |
| UI08 Testing and approval | B selected; Step 2 complete and new system-design slice authorized, backend frozen | Current 86 frontend tests/full 44 browser cases and 24 visual/separation follow-up pass; 12 snapshots, 22-file freeze. Prior 20 Java tests are historical for this frontend slice. Prior approval interruption resolved on resume; remote CI not executed | PARTIAL |

## Learning-content risks

| ID | Decision / implementation | Proof and remaining gap | Status |
|---|---|---|---|
| C01 Copyright/provenance | Original short topic drafts; no book/code/diagram assets or chapter rewrite; private source inventory | Source register, claim references and publication guard exist. Owner expression/rights review remains necessary; no legal-clearance claim | OPEN |
| C02 Accuracy/edition | All five notes unverified; source edition/page explicitly identified | Supplied DDIA early release marks later chapters unavailable. No claims sourced from missing chapters; user review pending | OPEN |
| C03 Publication | Guard rejects unverified notes and unknown model parameters | Guard tests and CLI rejection evidence; old prototype content importer not yet connected to this workflow | OPEN |

## Session continuity

Canonical `prompt.md`, short `docs/STATUS.md` and detailed `docs/session-log.md` are maintained; user originals preserved. Local Git history exists and Step 2 is committed after verification. No push, remote CI execution or public deployment is implied. The latest direct request authorizes the separate system-design learning/practice slice; older Step 3-only waiting is superseded.

## System-design learning and practice risks

| ID | Implementation | Proof / remaining gap | Status |
|---|---|---|---|
| SD01 Curriculum completeness | Forty original exercise briefs across HLD/LLD and three levels, five existing lab links | Catalog/unit checks and browser navigation; full theory lessons and reviewed sources are missing, explicitly disclosed. See docs/knowledge/missing-from-knowledge-pack.md | PARTIAL |
| SD02 Company provenance | Twenty original company-inspired exercises | Catalog data/tests; no claimed ranking, endorsement or actual private architecture. Requirements and workloads are exercise assumptions | PARTIAL |
| SD03 Design feedback honesty | Missing-decision/topology/current-model coach; prose manual review, no overall score, AI disabled | Negative rubric tests, stale-run browser check and visible limitations. Domain invariants/Java semantics not assessed; AI gateway/evals pending | PARTIAL |
| SD04 Practice artifact storage | Per-scenario browser-local worksheets, safe restore and visible memory fallback | Browser isolation/reload checks. Backend save/export does not contain worksheet/scenario metadata; cross-device/versioned storage remains unimplemented | PARTIAL |
| SD05 Simulation scope | Existing bounded generic engine unchanged | Backend freeze check; no matching/geospatial/payment correctness, retries/cascades/autoscaling/lag or animation performance proof | OPEN |
| SD06 Separate views and accessibility | HLD route/canvas, LLD Java contract view; explicit restored textarea labels | New four-width navigation/axe checks recorded in system-design verification. Full manual and real-backend browser review still pending | PARTIAL |

## Engine v2 and security continuation

| ID | Result | Proof and remaining gap | Status |
|---|---|---|---|
| E01 Resilience semantics | Bounded attempts/deadlines, holding/cascades, breakers, scale-out, synthetic lag and nine node types | 40 Java tests plus actual API/worker/export evidence. Domain correctness, arbitrary fan-out/consensus and real cloud behavior remain outside the model | VERIFIED BOUNDED CORE |
| E02 Resource/performance | Event/pending/arrival/result bounds and bounded traces; worker heap 128 MiB | Final 30-node benchmark p95 1079.448 ms, pool peaks 58.58 MiB; not RSS, API SLO or 300-node renderer/FPS proof | PARTIAL |
| E03 Runtime advisories | Boot 4.0.9 migration; compatible patched dependencies | 65 initial / 3 intermediate / 0 final OSV matches, 77 runtime artifacts; npm zero. Build-plugin/container/OS scans and Jackson 2 bridge removal pending | CURRENT RUNTIME AUDIT CLEAR |
| E04 Replay accessibility | Explicit failure label, named focusable scrolling table | Four-width replay/axe pass after caught failures; 12 baseline images match. Full manual/all-state and mobile fitted-node readability remain open | PARTIAL |
| E05 Local upgrade/worker | Private SQL/closed-file backups; H2 loopback binding and API-readiness sequencing | Actual persisted-job and browser/worker/export pass after JAR-lock/DB-open failures. H2/Flyway warning and real PostgreSQL/restore validation remain open | PARTIAL |
| S01 Twenty-control review | Each requested control has tested-local, N/A, partial or open evidence | scripts/check_security.py: 15 local checks pass; --public intentionally nonzero. Public identity, CSRF/session, DB roles/RLS, MFA and deployed dynamic/container checks pending | PUBLIC BLOCKED |

Detailed evidence: docs/evidence/engine-v2-verification.md and docs/security-review.md. Prior UI freezes and one-step waits are historical; user explicitly authorized further phases. No public/AWS work or fabricated experience.


## Latest product audit and local reference edition

- Original-prompt audit: [T0-T7](docs/PHASE-AUDIT.md). The full definition of done is not met and public deployment remains blocked; prior checklist/configuration evidence is not a launch sign-off.
- Learn/Practice separation implemented: Learn is read-only with 40 original source-linked readings and 20 company-inspired reference studies. HLD and LLD have separate indexes; Uber has deeper ownership/failure reasoning and limited dated documented context. Five book-source drafts remain unverified. New TypeScript references are a local review edition; the old publication validator does not clear them. Accuracy, claim mapping, original-expression/attribution and named editorial review remain open before public release.
- Studio is unlocked as a six-artifact browser-local workspace with capacity assumptions, detached graph capture, coverage review and JSON export. Semantic consistency checks, Java execution, account sync and multi-tab merge are not implemented. Export is necessary to preserve work when browser storage is cleared.
- Intro tutorial is actual self-hosted MP4 with original animation, offline synthetic narration, captions, chapters and transcript. It is a workflow guide, not recorded telemetry, cloud operation evidence or a company blueprint.
- Initial updated build passes (JS 1,022.28 kB / 317.14 kB gzip); 95 unit tests pass. Final browser/visual/video/security checks are recorded in [current verification](docs/evidence/library-studio-verification.md); do not infer them from implementation. Bundle-size warning remains open. Backend engine/security historical evidence is unchanged; no backend changes in this slice.

Final slice verification: 95 unit tests, 64 fixture browser cases, separate actual API/worker/replay/native-export flow pass. Twelve image baselines match after explicit async-preview readiness fixed 1024/390 screenshot stabilization; failed comparison evidence retained. Forty-four axe scans in the full run have zero violations (not 44 distinct states). Final JS 1,023.05/317.33 kB gzip; warning remains. Fifteen local evidence/hygiene checks and documentation validation pass. Public security/publication gates deliberately remain blocked. See the dated verification report for scoped evidence and unfinished original-prompt exits.

## GitHub static preview boundary

User authorizes publishing the source and static preview on Yashi2212/ArchArena, with AWS deferred. Local static browser tests pass at 1440/390, with zero backend calls, working media and local exports. Ninety-seven unit tests pass. A compile-time static-mode API fence and visible banner prevent confusion with hosted Java execution. The full public backend gates remain open; publication and CI outcomes are tracked in docs/evidence/pages-verification.md. Private owner-action and resume deliverables are outside this repository and are not pushed.

Static publication verified: repository and detailed README are public under Yashi2212; Pages live URL is https://yashi2212.github.io/ArchArena/ . Code commit 53f752b passes remote documentation/backend/frontend/browser jobs and Pages deploy, plus two real public-site browser checks. Backend 40 tests and 77-runtime-artifact zero-match scan now have remote evidence. Full public API gates remain open; static mode exposes none. Private owner-action and resume documents are verified absent from the remote tree. See docs/evidence/pages-verification.md for initial failures/corrections and exact run URLs.
