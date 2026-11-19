# ArchArena status

Updated: 2026-11-19, Asia/Calcutta. Read `../prompt.md`.

**Current:** Core bounded simulation v2 implemented and verified locally; user authorizes continuing phases/backend work. No next-step approval wait or old API freeze applies.

**Done:** Nine node types; bounded retries/backoff/jitter/deadlines; breakers; held-dependency cascading pressure; delayed service scale-out; synthetic follower lag/fresh reads; incidents; node snapshots/bounded traces; sampled replay; forty learning briefs/twenty practice scenarios.

**Verified:** 40 Java tests; 91 frontend tests. Full 48 fixture browser cases: 45 pass initially, three keyboard timeouts pass follow-up; twelve visual baselines match. Replay focus issue fixed; final four-width replay/axe checks pass. One actual browser/API/worker/export flow and real persisted-job smoke pass. See `evidence/engine-v2-verification.md`.

**Runtime:** Java 21 / Boot 4.0.9 / Framework 7; JDBC and H2 local adapter, not JPA/Hibernate. npm zero findings; OSV zero matches in 77 runtime artifacts. Deprecated Jackson 2 bridge preserves stored JSON; HTTP uses Jackson 3 compatibility defaults.

**Preview:** API/worker/React running at loopback 8080/5173. Local H2 backed up privately before upgrade. Launcher binds H2 to loopback and waits for API before worker. H2/Flyway compatibility warning remains recorded.

**Measured:** 30-node engine p95 1079.448 ms, max 1186.589 ms under 128 MiB heap; pool peaks 58.58 MiB (not RSS/full-stack SLO). JS 959.60 kB/297.55 kB gzip; large-chunk warning remains.

**Security:** All twenty items reviewed; fifteen local automated checks pass. Public gate intentionally blocked: identity/owner mapping, session/CSRF design, PostgreSQL roles/RLS, MFA and deployment/container/dynamic checks remain open.

**Content:** Five notes unverified/unpublished. Primer declares CC BY 4.0; liquidslr rights unresolved. No copied repository/book assets. AI disabled.

**Next:** Public identity/isolation and CSRF/session design, then PostgreSQL roles/RLS/deployment security. Remaining simulation UI: synchronized animated hero/particles, mobile graph readability, 300-node FPS/Lighthouse. Full theory lessons still need review. No push/public/AWS deployment.

Details: `simulation-v2.md`, `security-review.md`, `knowledge/open-source-register.md`, `session-log.md`, `../ISSUES.md`.
