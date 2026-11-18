# Phase 0 review and handoff

## What was delivered

Product requirements, personas, user stories with acceptance criteria for all three modes, a first-release/v2/later boundary, numeric non-functional targets, capacity formulas, conditional lean/full cost worksheets, primary-source competitor research, a 24-week plan, seven ADRs and ten open risks. React with TypeScript is the frontend direction. Phase 0 does not create the React application; scaffolding here would skip the requested requirements/HLD gates.

## What could go wrong

- The interpretation of “9” or the provisional 24-week horizon may be wrong; revise the budget before committing to delivery dates.
- The existing AWS account may already have exhausted its plan or credits. Use the local demo instead of a paid upgrade.
- The first engine implementation may not meet the stated timing or correctness targets. Test and rescope; never present a model as a benchmark.
- A free LLM may be unavailable. The deterministic Practice path must remain usable and visibly identify scripted responses.
- The original brief has much more than 216 hours of production work. Deferred functionality remains deferred, not quietly claimed complete.

## How to verify this phase

From the ArchArena directory, with Python 3 installed, run:

```powershell
python scripts/validate_phase0.py
```

The standard-library-only validator checks the work budget, run/queue capacity envelope, scenario arithmetic, cost worksheet arithmetic, required files, local Markdown links and exactly ten risk IDs. It exits nonzero on failure and does not call AWS, an LLM or a running application. This is planning validation, not a simulator or security test. The recorded run is in [validation-report.txt](validation-report.txt).

Read every acceptance criterion and ensure targets are labeled unmeasured. Review the official AWS pages linked in the cost worksheet now; verify account-specific eligibility in Billing before any provisioning. Review the deferred-mode boundary before using this project on a resume.

## Phase 0 exit checklist

- [x] Primary persona and demo launch mode recorded from user answers.
- [x] React/TypeScript direction recorded; tool choices have alternatives and consequences.
- [x] Hours and timeline assumptions visible; 189 delivery +27 contingency =216 hours.
- [x] Five lessons, one Practice scenario and deferred Design Studio acceptance criteria defined.
- [x] API, simulation, graph, retention, accessibility, recovery and availability targets stated numerically.
- [x] Capacity/cost formulas distinguish modeled workload from hosting traffic and gross cost from net cash.
- [x] Competitor comparison uses primary sources and avoids unverified uniqueness claims.
- [x] ADRs include options, trade-offs, choice and 10x consequences.
- [x] ISSUES.md contains ten open risks with decisions, implementation status and required proof.
- [ ] Confirm “9 hours/week” and accept or revise the provisional 24-week horizon at review.
- [ ] Before any cloud work, capture actual account plan, expiry and credits. This is a future deployment gate, not a blocker to local HLD.

The automated check result is recorded separately; do not mark runtime requirements complete based on it. Stop here and wait for **next** before Phase 1.

## Three interview questions with answers

**1. Why use React/Vite and a modular Spring Boot backend rather than Next.js and many microservices?**

The main UI is an interactive canvas rather than a search-indexed site, so client-rendered React is sufficient for the first demo. A modular monolith keeps transactions, development and deployment manageable for one developer. Simulation is the justified separate process because its CPU and memory limits differ from the API. At higher measured demand I would scale workers first, then revisit boundaries. These are planning choices, not completed infrastructure.

**2. How can a small server handle a problem about 100 million URLs per day?**

It does not handle that real traffic. The exercise computes roughly 1,157 creates per second and states the read ratio and peak factor. A bounded model represents the fictional workload with declared normalization, at most 10,000 arrivals and 200,000 processed events per run. The resulting metrics describe assumptions. Closed-form validation and seeded replay are required before I claim the model is correct; they do not prove a real service achieves the same latency.

**3. How do you keep the project within $0 while using AWS and AI?**

The runnable local demo is the baseline. A post-July-2025 account's eligibility depends on its actual plan, remaining credits and expiry, so I must inspect Billing before provisioning. The illustrative scheduled AWS worksheet is $6.70 gross per month, not inherently free. If coverage is unavailable I do not deploy. AI has no paid fallback; deterministic feedback and scripted clarification keep the demo usable. Budget alerts are a notification aid, not a hard spending cap.
