# First-release delivery plan

## Budget and sequencing

Assumption: 9 hours/week for 24 weeks = **216 hours**. Twenty-one delivery weeks consume 189 hours; weeks 8, 16 and 24 reserve 27 hours for failures, learning and rescoping. A normal delivery week allocates approximately 2 hours to understanding/design, 5 to implementation and 2 to tests/documentation. Capacity is a limit, not a productivity prediction. Re-estimate after the first working engine slice.

The full fifteen-phase brief cannot realistically be completed to public-production quality in this budget. This plan delivers an owner-operated slice and preserves later requirements as a backlog. No deployment or future-phase implementation is authorized by this document. At each phase boundary, review evidence and wait for the user to type **next**.

| Week | Hours | Work and reviewable exit evidence | Original phase mapping |
|---|---:|---|---|
| 1 | 9 | Product scope, acceptance criteria, target/cost worksheet, ADRs and risk register; clarify planning assumptions | 0 |
| 2 | 9 | HLD, lean/full trust boundaries, async lifecycle, failure/degradation table | 1 |
| 3 | 9 | Minimal domain, schema, ownership, graph contract, run API and idempotency design | 2 subset |
| 4 | 9 | Java analytic engine slice, explicit assumptions and closed-form fixtures | 3 |
| 5 | 9 | Seeded event loop, service queues, timeouts and bounded arrivals/events | 3 |
| 6 | 9 | Cache/read-routing/queue/rate-limit behaviors, graph validation | 3 |
| 7 | 9 | Spike profile, service kill/cache flush; correctness, determinism and hard-limit tests | 3 subset gate |
| 8 | 9 | Contingency; if correctness slips, stop UI expansion and repair engine | Buffer |
| 9 | 9 | API and worker lifecycle, database migrations and local compose slice | 4 |
| 10 | 9 | Bounded job queue, retry/idempotency, result provenance, SSE/local AWS adapter checks | 4 subset |
| 11 | 9 | React/TypeScript/Vite shell and React Flow graph editor; keyboard baseline | 8 foundational slice |
| 12 | 9 | Charts, result-driven 2D flow, progress/error/stale-result states; browser smoke tests | 8 subset |
| 13 | 9 | Load balancing and caching lessons with server-checked checkpoints | 6 subset |
| 14 | 9 | Replication, queue and rate-limit lessons with honest simplifications | 6 subset |
| 15 | 9 | URL-shortener Practice, estimation formulas, scripted clarification and evidence scorecard | 5/6 subset |
| 16 | 9 | Contingency; usable no-AI demo milestone and scope review | Buffer |
| 17 | 9 | Optional free-provider AI gateway, output schema, metric-citation rejection, no-paid fallback | 5 subset |
| 18 | 9 | Minimal AI eval fixtures, prompt-injection cases and outage path; omit live AI if gates fail | 5/10 subset |
| 19 | 9 | Security review: owner isolation, auth/access route, limits, secrets, retention and negative tests | 9 subset |
| 20 | 9 | Critical-flow browser tests, load test, backup/restore drill and local operations checks | 10/13 subset |
| 21 | 9 | CI checks and image scans; cost eligibility decision; lean Terraform design/validation if feasible | 11/12 subset |
| 22 | 9 | Optional short-lived AWS demo only if eligible and verified; otherwise local deployment rehearsal | 11/12 conditional |
| 23 | 9 | Clean-machine setup, docs, recording, incident notes and resume bullets from actual results | 15 subset |
| 24 | 9 | Contingency, release audit and teardown verification; finish evidence or delay release | Buffer |

Phases remain review gates even when a week's implementation touches a necessary dependency. The early frontend slice exists to demonstrate Learn; it does not claim completion of all Phase 8 requirements. Phase 7 Design Studio and Phase 14 production scaling are intentionally outside this first release. Full Terraform, 30+ AI golden designs and the full launch/legal/public-auth program require a later estimate; do not mark them complete after a subset.

## Scope cut order

1. Remove optional live AI; retain deterministic findings and visibly scripted questions.
2. Remove optional hosted AWS demonstration; keep reproducible local setup and recording.
3. Reduce visual animation polish, retaining static metrics, keyboard access and reduced motion.
4. Defer gamification beyond completion tracking, extra failure profiles and more Practice problems.
5. If the five lessons and validated simulator still do not fit, call the result a preview and revise the launch date rather than silently reducing correctness or security.

Never cut server resource bounds, graph validation, truthful result labeling, access control for a hosted demo, or test evidence to hit a date. A paid LLM or larger AWS deployment is not an acceptable schedule shortcut under the $0 constraint.

## Decision checkpoints

- End of week 7: engine correctness and resource limits determine whether the plan is viable. Reforecast remaining effort from actual hours.
- End of week 16: demonstrate the complete no-AI user loop. If missing, spend contingency before adding an AI provider.
- Before week 21: read actual account expiry and balance. This account's eligibility clock has already started; a six-month roadmap may extend beyond it. Local launch remains the default.
- End of week 23: review actual completion against requirements; keep unmet requirements open in ISSUES.md. Never translate targets into resume achievements.
