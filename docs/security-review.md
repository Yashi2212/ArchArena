# Twenty requested security checks

This is a local review with named tests and explicit deployment gaps. It is not a penetration-test certificate. Run `python scripts/check_security.py` after backend tests, frontend build and dependency scans. `python scripts/check_security.py --public` intentionally exits nonzero until the public controls below are implemented and verified.

| # | Check | Current evidence and outcome |
|---|---|---|
| 1 | SQL injection | **Tested locally.** Prepared JDBC parameters; hostile title and owner strings remain data in `ApiTest.sqlPayloadRemainsDataAndDoesNotEscapeOwnerScope`. No dynamic user-selected table/column names. |
| 2 | XSS | **Tested locally / deployment review pending.** React text rendering; hostile finding component test; no raw HTML sink in application source. Nginx CSP restricts scripts; public response headers still need verification. |
| 3 | CSRF | **Partial.** Exact-origin and fetch-metadata rejection; form content rejected. Current API has bearer/no-cookie local access. A public cookie/session design requires synchronizer tokens and new tests. |
| 4 | File uploads | **Not applicable to current product.** No upload route; multipart disabled and upload/form bodies rejected. This does not authorize adding uploads without validation. |
| 5 | IDOR / object authorization | **Partial.** Repository owner read/write/delete checks and tests exist. HTTP API still uses one configured local owner; public requests lack a verified principal-to-owner mapping. |
| 6 | Rate limiting | **Tested locally.** Global bounded 240 API requests/minute; preview quota; persisted global/per-owner run quotas and queue cap. Distributed/public-client quotas remain unverified. |
| 7 | JWT secrets | **Not applicable.** No JWT implementation. Non-loopback shared bearer token requires 32+ characters; this is neither entropy verification nor public user authentication. |
| 8 | Exposed secrets | **Local hygiene checks.** No high-confidence credential patterns or frontend auth secrets; server token is injected only at local proxy. Secret-store, rotation and deployment inspection are still needed. |
| 9 | Password hashing | **Not applicable.** No password login or password database. Use reviewed identity-provider flows if accounts are introduced. |
| 10 | MFA | **Open.** Hosting/AWS/admin account MFA cannot be proved by source code. Public identity/admin design and account verification are pending. |
| 11 | CORS | **Tested locally.** Explicit local origin allowlist, hostile/null origins rejected; no wildcard credentialed CORS. Public origin/ingress configuration not deployed. |
| 12 | Auth tokens in local storage | **Local source check.** Storage contains graph drafts, worksheet text and run ids; auth-token writes are absent. Local drafts are not secure storage. |
| 13 | Client-only permissions | **Partial.** Backend graph/resource validation and repository owner predicates exist. Public request identity must be enforced server-side before launch. |
| 14 | Row-level security | **Open.** PostgreSQL RLS/least-privilege runtime roles are not implemented/verified. Application owner predicates and H2 tests do not establish database RLS. |
| 15 | Webhook signatures | **Not applicable.** No webhook endpoints/integrations. A future webhook must verify provider signatures and replay windows before processing. |
| 16 | SSRF | **Tested locally.** External API nodes are synthetic numeric models; no supplied URL is fetched. Metadata-address/URL config payload rejected by schema/validator. |
| 17 | Source maps | **Local build check.** Vite source maps disabled; production dist checked. Proxy now rejects map/hidden-file paths, but Nginx/container behavior is not yet run or publicly scanned. |
| 18 | Default credentials | **Partial.** Blank H2 credentials are a local-development adapter. Public deployment must require PostgreSQL, distinct runtime/worker roles and injected random credentials. |
| 19 | Sensitive logs | **Local review.** Worker logs run id, status, duration and exception type, with raw exception payload/stack arguments removed. No body/token logging configured. Public log pipeline still needs inspection. |
| 20 | Vulnerable dependencies | **Scan required.** Full npm and resolved Maven runtime OSV scans are recorded. Initial Java scan found 65 package/advisory matches; the upgraded Boot 4.0.9 inventory has zero matches across 77 runtime artifacts. Build plugins, container/OS and deployed images require additional scans. |

## Public-hosting gate

The existing Nginx proxy injects a single owner bearer token. Publishing that configuration would let all visitors act as the same owner. Do not expose it as a multi-user service. Choose and implement isolated guest sessions or a reviewed identity provider, bind the server-derived principal to owner queries, and test user A versus user B through HTTP, including exports/checkpoints and stale updates.

Before public launch: establish TLS/trusted-proxy behavior, exact public origins, CSRF/session rules, credential injection and rotation, separate API/worker database privileges, RLS policy approach, production rate limits, admin/account MFA, backup/restore and dynamic/container scans. Keep source maps/private files and sensitive content out of published artifacts. No public or AWS resources have been created in this phase.

AWS remains a separate practice environment: use reproducible provisioning/teardown, billing eligibility checks and actual operation evidence. Do not claim AWS operation experience from unexecuted configuration. Public hosting need not be always-on AWS infrastructure.

## Reproduce the local checks

1. Run backend tests with `scripts/maven.ps1`.
2. Build/test the frontend and run `npm audit --json` into the dated evidence file.
3. Resolve Maven runtime `dependency:list` to `.local/runtime-dependencies.txt`; run `python scripts/scan_java_dependencies.py`. It fails on findings or incomplete responses and handles advisory pagination.
4. Run `python scripts/check_security.py`; inspect every partial/open control even when source hygiene passes.
5. Run `python scripts/check_security.py --public`; the expected current result is blocked. A successful local test is not permission to mark public readiness true.
