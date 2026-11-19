# ArchArena

Learn system design by changing an architecture, running a model, and explaining what happened.

ArchArena is a planned portfolio application for Java backend developers preparing for system design interviews. The first release combines interactive Learn lessons with a basic Practice workflow. Both use the same server-side simulation engine. Design Studio is a later milestone.

**Current:** Bounded resilience engine v2 on Java 21 / Boot 4.0.9, sampled replay, distinct HLD/LLD views, forty exercise briefs, five existing labs and twenty company-inspired scenarios. See [simulation scope](docs/simulation-v2.md) and [twenty security checks](docs/security-review.md). Full theory lessons, domain correctness and live AI remain pending. Read [prompt.md](prompt.md), [docs/STATUS.md](docs/STATUS.md), [the walkthrough](docs/learning-practice.md) and [engine/security verification](docs/evidence/engine-v2-verification.md). [Step 2 evidence](docs/evidence/step-02-verification.md) is historical.

## Your agreed direction

- Frontend: React with TypeScript, Vite, React Flow and Recharts are implemented locally.
- Backend direction: Java 21, Spring Boot 4 modular monolith, separate bounded simulation worker, PostgreSQL with Flyway.
- Work budget: interpreted as **9 hours per week**. Confirm this interpretation if “9” meant weeks.
- Launch horizon: **24 weeks, 216 hours**, a planning assumption rather than a deadline you supplied. Includes 27 hours of contingency; the complete original product is substantially larger.
- Audience: Java developers preparing for system design interviews.
- Release: personal portfolio demo, Learn plus basic Practice. No public registrations.
- AWS: account created after July 15, 2025. Exact creation date, current plan, remaining credits and expiry are unknown. Existing account eligibility does not restart when this project deploys.
- Target new cloud spend: $0/month. Local operation is the default and remains the launch fallback.

## Read the Phase 0 deliverables

1. [Product requirements and acceptance criteria](docs/phase-0/product-requirements.md)
2. [Capacity assumptions and cost comparison](docs/phase-0/capacity-and-cost.md)
3. [Competitor evidence and honest positioning](docs/phase-0/competitors.md)
4. [Week-by-week delivery plan](docs/phase-0/roadmap.md)
5. [Architecture decision records](docs/adr/phase-0-decisions.md)
6. [Risks and evidence register](ISSUES.md)
7. [Verification, exit checklist and interview answers](docs/phase-0/review.md)

Machine-readable planning inputs live in [planning.json](docs/phase-0/planning.json). Validate their arithmetic and document references using Python 3:

```powershell
python scripts/validate_phase0.py
```

This validates the Phase 0 plan only. Current Windows prototype commands are in [howtorun.md](howtorun.md). Compose/PostgreSQL and remote CI remain unverified. No AWS resources were created; AI is disabled.

## Product loop

```mermaid
flowchart LR
    A[Predict the bottleneck] --> B[Edit React canvas or lesson controls]
    B --> C[Submit graph and seed to shared backend model]
    C --> D[Inspect modeled metrics and animated flow]
    D --> E[Explain a trade off]
    E --> A
    D --> F[Practice scorecard citing the run]
```

The diagram is a product concept, not the Phase 1 technical architecture. Simulated latency and throughput describe explicit assumptions; they are not measurements of a real deployed architecture.

## Current project documents

- [Problem discussion](problemstatement.md), [HLD](hld.md), [LLD](lld.md), [interview questions](interviewquestions.md), [issues](ISSUES.md).
- [UI audit](docs/ui/repo-audit.md), [design brief and alternatives](docs/ui/design-brief.md).
- [Unpublished knowledge pack](docs/knowledge/README.md) and [content policy](docs/knowledge/content-policy.md). No supplied books are website assets.
- [Detailed session log](docs/session-log.md) distinguishes implementation, tests, assumptions and unresolved work.

Latest protocol: one approved step at a time. The user chose B — Expedition Console. Wait for `next` before Step 3; unfinished tracks are not launch-ready.
