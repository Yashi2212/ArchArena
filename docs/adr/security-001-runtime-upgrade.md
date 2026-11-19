# ADR Security-001: patched runtime and explicit public gate

Date: 2026-11-19. Runtime migration implemented and tested locally; public deployment remains blocked.

The initial resolved Java runtime scan returned 65 OSV package/advisory matches on Boot 3.5.8. Upgrading to the latest inspected 3.5 maintenance release with patched Tomcat/Jackson/logging left two critical Spring MVC advisories and a PostgreSQL driver advisory. The MVC issues require SSE fragments or XSLT view rendering, which the current JSON-only API does not use; nevertheless, the inspected public fixes were on Framework 7.

Options: maintain configuration-based exceptions on Boot 3, mix Framework 7 into Boot 3, or adopt a maintained Boot 4 release with compatibility tests. Choose Boot 4.0.9/Framework 7.0.10 on Java 21, following the [official migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide). Use modular Web MVC/Flyway/test starters and Servlet 6.1/Tomcat 11. The Spring major versions are kept aligned.

Verified maintenance overrides: Tomcat 11.0.29, Jackson 2 BOM 2.21.8, Logback 1.5.38 and Log4j2 2.26.1. Boot manages the PostgreSQL driver at 42.7.14. The final OSV snapshot has zero matches across 77 runtime artifacts; npm also has zero. These are advisory snapshots, not universal security guarantees or build-plugin/container scans.

HTTP uses Boot's Jackson 3 path with compatibility defaults; the supported deprecated Jackson 2 module preserves existing repository/test JSON handling. Unknown-input rejection, DTOs, stored telemetry and legacy idempotent requests are tested. Removing the Jackson 2 bridge is future maintenance, with stored-format migration tests required. H2 2.4.240 emits a Flyway “newer than verified version” warning; the migration/API tests pass, but PostgreSQL remains unverified.

At 10×, runtime updates need repeatable SBOMs, image/plugin scanning, staged rollouts and rollback drills. Current local SQL/closed-file backups protect this development upgrade, not a production restore certification. Public identity, CSRF/session behavior, DB roles/RLS, account MFA, TLS and deployment scans remain explicit gates rather than being inferred from an audit result.
