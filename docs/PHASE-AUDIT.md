# Original-prompt phase audit

Audited November 19, 2026 against preserved `prompt.md.txt`, current `prompt.md`, source code and local verification reports. **The original definition of done is not met. Public deployment is not ready.** A configured file, passing fixture or dependency scan is not deployed evidence.

| Phase | Status | Implemented evidence | Work still needed for the original exit |
|---|---|---|---|
| T0 · Product and plan | Mostly complete locally | Problem statement, requirements, scope, estimates, risks, ADRs and runbook | Confirm actual deadline, time accounting and AWS credit/plan eligibility before provisioning |
| T1 · Learning content | Partial | Five guarded book-source drafts; 40 original source-linked local readings in Story/Simple/Pro; twenty proposed company studies with a deeper Uber path | Owner/editorial verification, claim-level review and complete lesson/readability validation. Five book-derived notes remain unverified and unpublished |
| T2 · Experience and design | Partial | Expedition Console, distinct read-only HLD/LLD views, company library, editable Practice, unlocked six-artifact Studio, local tutorial video | Original game hero/particles, synchronized visual playback, XP/map, command palette/story skin, mobile graph readability, broader manual accessibility and measured 300-node/FPS/Lighthouse targets |
| T3 · Java simulation | Core bounded v2 verified locally; full phase partial | Nine node kinds, retries/deadlines, breakers, held dependencies/cascades, delayed scale-out, synthetic lag/fresh reads, incident modes, bounded telemetry; 40 Java tests and actual API/queue/worker/browser flow | PostgreSQL/Testcontainers, planned JPA/Hibernate adapter, Resilience4j/result-cache decisions, full container memory/isolation/load evidence. Current adapter is JDBC/H2; synthetic lag is not real replication |
| T4 · Practice and feedback | Partial | Twenty scenario worksheets, separate HLD/LLD playgrounds, deterministic improvement guidance and simulation evidence | Domain-correctness rubrics, optional AI gateway with safe structured outputs and fallback, 30+ golden/evaluation designs, calibrated feedback. Current coach flags omissions and requires manual review; AI disabled |
| T5 · Security and validation | Partial; public gate fails closed | All twenty requested categories inventoried; fifteen automated local evidence/hygiene checks; npm zero findings and OSV zero matches across 77 runtime artifacts in dated scans | HTTP principal/owner mapping, session/CSRF design, PostgreSQL runtime roles/RLS, admin MFA, deployment TLS/proxy/secrets, STRIDE closure, ZAP/k6, image/OS scans and deployed negative tests |
| T6 · Operations and AWS | Not complete | Local launcher, private backups, infrastructure/Compose planning and bounded worker | Verified PostgreSQL/Compose deployment, current billing eligibility/cost gate, Terraform/OIDC and selected AWS services, actual monitoring, deployment, restore/teardown drills. No AWS resources created |
| T7 · Launch and portfolio | Partial | Static GitHub Pages preview is live; detailed README, tutorial, remote quality and Pages workflows pass | Full hosted backend readiness, peer feedback, verified curriculum, actual AWS operations/cost/restore evidence and the remaining original launch goals |

## Latest scope changes

The user explicitly requested read-only educational Learn, an editable Practice playground, an unlocked Studio and an introduction video. This supersedes the original interactive-Learn/Studio-later restriction. The existing simulator is preserved in Practice, including the five concept experiments and checkpoint API. Studio now authors local artifacts; it does not implement the originally planned semantic consistency engine.

The new reference library is independently written explanatory prose linked to public documentation, not a publication of the supplied books or their five draft notes. It is a **local review edition**, visibly marked editorial-review-pending. Sources support further reading; source links and automated tests do not establish legal clearance. Company diagrams are original reference proposals, not verified internal architectures. Uber's dated public engineering context is explicitly separated from the proposal.

## Deployment decision

Continue using loopback preview. Do not expose the current single-owner API publicly. Next: implement and verify identity/ownership and session/CSRF decisions, then PostgreSQL roles/RLS and deployment controls; complete content review before publication. Re-run the twenty-control public gate and deployed checks after those changes. A static public preview would still require content clearance and an explicit decision about disabled/protected backend features.

## Evidence boundaries

Engine results: [engine v2 verification](evidence/engine-v2-verification.md). Current UI/video results: [library and Studio verification](evidence/library-studio-verification.md). Security: [twenty-control review](security-review.md). Source policy: [local reference edition](knowledge/local-reference-edition.md). These reports distinguish current measurements from historical results, fixtures and unrun gates.

November 19 publication update: the latest direct user request authorizes a static GitHub Pages review preview and repository push while AWS remains deferred. The preview is live at https://yashi2212.github.io/ArchArena/ and exposes no Java backend. Remote configured quality checks pass; this does not close unimplemented original tests or public-backend/content-review gates. See [Pages release evidence](evidence/pages-verification.md). Earlier loopback-only deployment language above describes the pre-publication decision.
