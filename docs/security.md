# Local demo security boundaries

This is a security design and test map, not a public-production security sign-off.

| Threat | Existing local control | Proof / remaining work |
|---|---|---|
| Spoofing owner | Loopback bind by default; non-loopback API refuses startup without configured bearer token | AccessFilterTest checks token rejection/success and bind guard; real OIDC/JWT lifecycle remains unimplemented |
| Tampering with score or graph | Server validates graph and computes checkpoint from an owner-scoped stored run | EngineTest and ApiTest; UI prediction text is not proof of understanding |
| Repudiation | Correlation ID in response/log context; immutable graph/request snapshot per run | API test verifies headers/context cleanup; durable actor audit ledger remains future work |
| Disclosure | Owner-bound repository queries; no raw HTML rendering or frontend LLM credentials; no public DB port in Compose | Repository isolation tests; public multi-tenant endpoint authorization matrix and secret scanning still required |
| Denial of service | 64 KiB body cap including streamed reads; node/edge/arrival/event bounds; quotas; queue cap; wall deadline | Engine/API tests cover input and queue limits; container memory isolation and load/slow-body limits not yet verified |
| Privilege escalation | No arbitrary user code/remote target execution; no canvas-to-AWS provisioning | Engine is Java-only data processing; cloud IAM/OIDC not implemented |

## Browser and request handling

Vite proxies same-origin `/api` calls to loopback. The API rejects origins outside an exact local allowlist; no wildcard credentialed CORS. There are no session cookies or public login in this local slice. Do not claim this is a complete CSRF strategy for a later cookie-authenticated deployment. Owner token is optional only on loopback. The Compose reverse proxy inserts its internal token server-side; never embed it in a public React bundle. Compose exposes only `127.0.0.1:5173`.

Nginx includes a CSP, nosniff, frame protection and referrer policy. Inline styles remain permitted because React Flow positions nodes using inline styles; scripts remain same-origin only. HSTS requires a correctly configured HTTPS deployment and is not added to a local HTTP server. CSP headers in an unrun container are configuration evidence, not verified browser enforcement.

## Data and AI

Text labels are rendered by React as text; no `dangerouslySetInnerHTML`. Node labels, notes and questions never become executable instructions. The current clarification path is a fixed fact selector, explicitly not AI. Live model prompting, citation/schema validation, quotas and evals are still pending; keeping AI disabled is the honest current behavior.

Raw time series are trimmed after seven days; run summaries and designs are deleted after thirty days by worker retention. The retention routine needs boundary tests and a real DB restore/erasure drill. There are no S3 objects yet. Deleting a design does not erase a separate immutable run snapshot; do not call it account erasure. Backups are not implemented yet.

## Before any public deployment

Implement OIDC and per-endpoint IDOR tests, token/refresh/CSRF strategy, request and SSE abuse limits, image/dependency scans, encrypted backup/restore, complete retention/erasure, provider abuse defenses, TLS and exact hosted origins. Verify cloud costs and IAM separately. Do not expose the local profile on the public Internet.
