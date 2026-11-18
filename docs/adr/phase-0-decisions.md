# Phase 0 decision records

Status: planning decisions for an owner-operated portfolio release. These describe choices and consequences; they do not prove implemented controls. Revisit during Phase 1 HLD and record changes rather than silently replacing assumptions.

## ADR 001 React app without server rendering

**Options:** React/Vite SPA; Next.js with server rendering; plain JavaScript UI.

**Trade-offs:** Next.js adds server/client boundaries and deployment choices useful for SEO and server-rendered content. A canvas-centric demo gains little from those features. Plain JavaScript reduces tooling but loses React's established component/state ecosystem.

**Choice:** React + TypeScript with Vite, proposed React Flow canvas and a chart library. Verify supported library versions and APIs at implementation. Static assets and Java API remain separate concerns. Do not add a Node application server without a concrete need.

**At 10x:** initial bundles, graph rerenders and concurrent SSE connections need profiling; Next.js alone does not fix these. Cache static assets, virtualize where appropriate and reduce graph updates. A 300-node promise requires independent testing.

## ADR 002 Narrow the first launch

**Options:** all three modes and gamification; Learn only; Learn plus one basic Practice scenario.

**Trade-offs:** all modes show more breadth but add artifact/version consistency work before engine correctness. Learn alone is cheaper but misses the primary interview candidate persona.

**Choice:** five focused lessons plus one URL-shortener Practice flow, scripted clarification, deterministic scorecard and optional grounded AI. Design Studio and advanced gamification are deferred. Plan 24 weeks at assumed 9 hours/week, with 27 contingency hours.

**At 10x:** content authoring and assessment maintenance become bottlenecks. Content schemas and reusable lesson behaviors help; more modes should not be added merely to increase feature count.

## ADR 003 Share one server-owned modeling contract

**Options:** separate client simulations per lesson; shared Java engine with analytic and event strategies; real infrastructure load generation.

**Trade-offs:** local browser estimates feel instantaneous but duplicate semantics and cannot establish trusted scores. Real infrastructure tests create substantial cost and security exposure. Backend models add latency and must disclose assumptions.

**Choice:** one graph/result contract, analytic and seeded discrete-event strategies in Java, separate worker for event runs. React visualizes returned time series only; previews use debounced server calls. Cache/replication behaviors in the first release are simplified explicitly. No arbitrary user code.

**At 10x:** worker CPU, bounded queue wait and preview traffic saturate first. Scale bounded workers, enforce fair quotas and use versioned result caching after measurements. Never remove resource limits to increase throughput.

## ADR 004 Modular monolith and one isolated worker

**Options:** microservices per feature; a monolith running simulation threads inline; modular Spring Boot API plus worker process.

**Trade-offs:** many services add deployments, network failures and overhead for one developer. Inline runs simplify startup but couple API health and simulator memory exhaustion. A worker is one justified process boundary.

**Choice:** Java 21/Spring Boot 3 modules with PostgreSQL/Flyway; separate worker with external CPU/memory limits. SQS interface with LocalStack locally and eligible managed SQS later; Redis optional behind an interface. Detailed boundaries and queue mechanics belong to Phases 1–4. EKS, service mesh and multi-service orchestration are over-engineering for this demo.

**At 10x:** split or scale workers first; DB connections, admission fairness and queue backlog become shared limits. Extract other modules only when evidence supports independent scale or ownership.

## ADR 005 Local first and conditional AWS

**Options:** always-on multi-AZ AWS; scheduled single-host AWS; local demo with recording.

**Trade-offs:** a full environment demonstrates operations but conflicts with $0. A single host is cheap to rehearse but fails as a unit and is not highly available. Local operation lacks a public URL but preserves the product after credits expire.

**Choice:** build/test locally; use an optional, short-lived lean AWS demo only after verifying remaining credits, plan, service eligibility and current prices. No paid upgrade, no NAT/ALB/EKS/managed Redis in lean. A 2 vCPU/4 GiB envelope is a sizing assumption, not a claim of free-tier eligibility.

**At 10x:** a single host's CPU, RAM and failure domain are inadequate for a public service. The documented full profile requires funding, independent sizing and multi-AZ restore/availability tests. It is not a $0 production architecture.

## ADR 006 AI is optional commentary

**Options:** AI-only scoring; rules-only product; deterministic core plus a provider-agnostic optional AI adapter.

**Trade-offs:** AI helps explain reasoning but free availability is uncertain, and unvalidated text can invent metrics or leak problem details. Rules are reproducible but assess fewer subjective dimensions.

**Choice:** deterministic capacity/rubric findings and scripted clarification always work. AI receives bounded structured evidence, must cite known metric paths/values and has no paid fallback or AWS AI service requirement. Unknown rubric dimensions remain unassessed. A small eval set gates the demo; the full 30+ design evaluation program remains a later requirement.

**At 10x:** provider quotas and abuse dominate. Enforce per-user/global token quotas, bounded deadlines and graceful disablement. Do not claim reliability of an external free service.

## ADR 007 Owner-operated access before public accounts

**Options:** open anonymous public demo; public Cognito registration; local/owner access with restricted hosted sessions.

**Trade-offs:** public access enables easy sharing but needs stronger tenant controls and abuse handling. Owner mode reduces first-launch risk but does not demonstrate public-scale reliability.

**Choice:** local loopback by default; optional owner-authenticated or tunnel-only hosted demo, with no public registration and no unprotected simulation endpoint. Model user ownership for future isolation, but implement no auth or networking in Phase 0. Exports are local and no public share links are included.

**At 10x:** multiple untrusted owners require full OIDC/JWT validation, repository authorization tests, quotas, privacy/delete flows and audit logging. A hidden URL is not authentication. Revisit this ADR before enabling public users.
