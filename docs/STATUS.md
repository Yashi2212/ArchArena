# ArchArena status

Updated: 2026-11-19, Asia/Calcutta. Read `../prompt.md` section 26.

**Published source:** https://github.com/Yashi2212/ArchArena on main, with history, detailed README, repository description and topics. Verified publishing account: Yashi2212. No force-push.

**Live static preview:** https://yashi2212.github.io/ArchArena/ . Actual page/video/captions return HTTPS 200. Desktop/phone checks on the live site pass.

**Static boundary:** Learn, tutorial, browser-local graph/worksheet editing, rule-based feedback and Studio export work. Java simulations, analytic previews, server saves/checkpoints/exports require the local backend. Visible banner and API fence prevent fabricated server behavior. AWS remains deferred.

**Remote CI:** Release code 53f752b passes all four GitHub jobs: documentation, backend, frontend and browser. Java 40/40 tests; 77 runtime artifacts, zero advisory matches. Frontend 97 tests. Pages build/deploy succeeds. See evidence/pages-remote-ci.json.

**Static QA:** Two local and two actual public browser cases pass at 1440/390, including real video playback, local editing/export and no API requests or script errors. Scanned Studio states have zero axe violations. Existing four-width fixture suite and twelve baselines pass in GitHub CI.

**Corrections:** Initial Pages deploy ran before Pages was enabled; enabling workflow-based Pages and retrying fixed it. Initial Java job failed Maven prefix resolution before tests; separate verify plus fully qualified dependency-plugin 3.9.0 inventory and fresh resolution pass. Failed runs retained; no check removed.

**Private outputs:** Owner-action checklist/readiness review and resume Word/PDF files remain outside this Git checkout. Remote tree checked: no resume, DOCX/PDF, source-book or .env file. Personal resume facts are not copied into this public status.

**Learn/Studio:** 24 HLD + 16 LLD original readings, twenty company proposals, six local Studio artifacts. Editorial review pending; five book-source notes remain unverified. AI and semantic/domain grading remain unimplemented.

**Backend gate:** Full public Java hosting is NOT READY. Identity/owner/session/CSRF, PostgreSQL roles/RLS, MFA, deployment/container/dynamic/load checks and content review remain open. Current verified adapter is JDBC/H2, not JPA or certified PostgreSQL.

**Other gaps:** Large JS chunk, game hero/particles/synchronized visuals, mobile graph readability, FPS/Lighthouse, AI evaluations, AWS eligibility/operations/restore and full launch evidence remain pending. Static build JS 1,025.93 kB / 318.60 kB gzip.

**Next:** Keep static preview available; continue backend security/isolation and editorial review before full hosting. AWS only after account/cost eligibility and explicit provisioning scope. Detail: PHASE-AUDIT.md, evidence/pages-verification.md, ../ISSUES.md, session-log.md.
