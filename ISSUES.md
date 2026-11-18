# ArchArena risk and evidence register

Updated November 18, 2026. Owner: project developer. The original ten product risks remain open; prototype controls now have partial test evidence, but no production sign-off. Current gate is T2 Step 0/1 plus unpublished content drafts. A proposal or file configuration is not runtime proof. See the current evidence below rather than treating the historical Phase 0 rows as today's implementation inventory.

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
- R07: React production build passes; no frontend test files. One prior browser run completed, but no complete lesson/export/keyboard suite, axe, snapshots or frame measurements exist.
- R05/R06: live AI remains disabled; scripted facts and deterministic findings are available. No provider/gateway/eval implementation is claimed.
- Detailed commands/results: `docs/evidence/step-01-verification.txt`; Java reports in `docs/evidence/java-tests-2026-11-18.txt`; UI audit in `docs/ui/repo-audit.md`.

## UI redesign risks

| ID | Decision / implementation | Proof and remaining gap | Status |
|---|---|---|---|
| UI01 Performance | Separate Canvas2D overlay proposed; quality/static modes; synthetic 300-node UI test only | Brief specifies caps; no animation/frame or Lighthouse measurements. Current bundle 921.21 kB JS, 283.96 kB gzip | OPEN |
| UI02 Accessibility | Minimum 14px, keyboard alternatives, focus and live summaries proposed | No axe/keyboard/runtime contrast tests; current CSS has much smaller labels and modal focus gaps | OPEN |
| UI03 Motion | Reduced motion must become static, no shake; pause hidden/offscreen | Existing CSS rule only; no behavioral test or animation implementation | OPEN |
| UI04 Color readability | Every state must have text/icon/pattern; proposed palette pairs checked separately | Proposal contrast check does not certify the rendered application or color-blind usability | OPEN |
| UI05 Honesty | Global playback only; node/p95/rules whole-run; particles illustrative | Existing contract inspected and brief specifies mapping; implementation/label tests not written | OPEN |
| UI06 Feature preservation | All lesson/run/checkpoint/baseline/export/save/assumption actions remain reachable | Source audit finds mobile navigation hidden; full E2E and regression snapshots absent | OPEN |
| UI07 Dependency security | Inspect suggested Vite patch before Step 2 | Latest npm audit: one high-severity affected package Vite; suggested 6.4.6. Not remediated at docs-only gate | OPEN |
| UI08 Testing and approval | Direction A/B gate; tests before new UI implementation; backend freeze | No frontend tests; browser follow-up earlier blocked by automatic-review usage limit. New screenshots not captured | OPEN |

## Learning-content risks

| ID | Decision / implementation | Proof and remaining gap | Status |
|---|---|---|---|
| C01 Copyright/provenance | Original short topic drafts; no book/code/diagram assets or chapter rewrite; private source inventory | Source register, claim references and publication guard exist. Owner expression/rights review remains necessary; no legal-clearance claim | OPEN |
| C02 Accuracy/edition | All five notes unverified; source edition/page explicitly identified | Supplied DDIA early release marks later chapters unavailable. No claims sourced from missing chapters; user review pending | OPEN |
| C03 Publication | Guard rejects unverified notes and unknown model parameters | Guard tests and CLI rejection evidence; old prototype content importer not yet connected to this workflow | OPEN |

## Session continuity

Canonical `prompt.md` and short `docs/STATUS.md` created, preserving original user `.txt` files. `docs/session-log.md` records detailed events. A backend hash manifest detects changes during the frozen UI track. A local Git history is being initialized because no repository existed; record the commit result rather than claiming a push/CI run.
