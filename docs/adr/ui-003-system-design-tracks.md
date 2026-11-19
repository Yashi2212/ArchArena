# ADR UI-003: separate artifacts, shared bounded engine

Date: 2026-11-19. Status: implemented frontend slice, verification recorded separately.

Problem: a single URL-shortener screen does not support the user's HLD/LLD learning and company-inspired practice goals. A queueing result alone cannot assess a business design.

Options: duplicate full workbenches; extend engine/API now; or separate HLD/LLD presentation and structured worksheets over existing contracts. Duplicate workbenches increase state drift. A new domain engine and live AI gateway require a much larger validated backend scope. Choose separate frontend artifacts with the existing bounded engine unchanged.

HLD exposes topology, assumptions and model metrics. LLD Learn and Practice hide the generic simulator and shows contracts, invariants and tests. Twenty scenario briefs are data, while forty learning briefs explicitly distinguish exercise availability from pending theory. A deterministic coach flags missing decisions and basic graph restrictions. It never certifies prose or a domain invariant, and it cites only a matching current run. AI remains disabled.

Trade-offs: browser-local worksheets are convenient but not authoritative, portable or included in backend exports. Topology rules are only the model subset; advanced systems require a separate domain flow. The catalog is illustrative and not a company ranking. No unreviewed book notes are published to fill the content gap.

At 10×: move the catalog into versioned reviewed content packages with source/claim mappings, use paginated/searchable navigation, persist scenario artifacts with ownership/version checks, introduce independently tested domain rubrics and an optional evaluated AI gateway. Do not multiply generic nodes and call that a validated production architecture.
