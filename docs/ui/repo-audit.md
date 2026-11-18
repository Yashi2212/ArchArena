# UI redesign Step 0 audit

Inspected November 18, 2026. Scope: read the implementation, run existing checks, record gaps. No frontend application source, backend source, domain logic or API contracts are changed in this step.

## Current structure

| File | Actual responsibility | Redesign implication |
|---|---|---|
| `frontend/src/main.tsx` | React StrictMode entry, React Flow CSS and application CSS | Keep entry simple; load licensed self-hosted fonts in the approved foundation step |
| `frontend/src/App.tsx` | Almost the entire workbench: modes, lesson navigation, graph state, previews, polling, saves, modal, capacity form, chart, rules and export | Refactor into tested components incrementally; preserve behavior before changing appearance |
| `ArchitectureCard` in App | Custom React Flow node with label, configuration summary and aggregate utilization | Keep semantic node data separate from decorative animation |
| `Metric` in App | Repeated metric-card presentation | Replace with accessible instruments; do not relabel arrival demand as completed throughput |
| `frontend/src/types.ts` | API records, fetch/error wrapper, graph labels and canonical request comparison | Preserve API shape; move new UI-only formatting/playback helpers into separate testable modules |
| `frontend/src/styles.css` | Cream/sage visual system, dark sidebar, small text and responsive rules | Replace only after direction approval; current labels often fall below the new 14px requirement |
| `frontend/vite.config.ts` | Loopback dev server and `/api` proxy | Keep proxy contract; verify dev-server dependency advisories before implementation |
| `backend/.../Model.java` | Graph/request/result records consumed by the UI | Frozen for this UI track |

Installed frontend: React/React DOM 19.3.1; React Flow 13.0.2; Recharts 3.11.0; Vite 6.2.7; React plugin 5.2.0; TypeScript 7.0.2; Playwright 1.65.1. The previous turn changed Vite after an advisory report. The current audit still finds a high-severity Vite package finding. It is not resolved merely because the build succeeds.

React Flow 13 uses `NodeChangeset` / `EdgeChangeset` and `changes.applyTo(...)`. Do not paste older `applyNodeChanges` examples without checking installed exports. Current source uses the installed API and compiles.

## Existing behavior to preserve

- Five fetched lessons and presets; baseline/spike profile; service-kill/cache-flush controls.
- Debounced server analytic preview, stale-result detection and seeded event runs.
- Job polling and reload recovery; canonical request comparison.
- Graph add/connect/remove, configuration, undo/redo, browser drafts and a cross-tab warning.
- Server-backed save/load/delete with optimistic versions; saved designs modal.
- Prediction text, backend checkpoint, baseline pinning, Markdown experiment export.
- Practice facts selector, capacity worksheet and deterministic scorecard; AI explicitly disabled.
- Model assumption disclosure. Studio is a future teaser, not an implemented mode.

A presence in source is not browser-test proof. One seeded run was observed through the browser in the previous turn; it does not establish the complete lesson/export or keyboard workflow.

## Data the presentation can honestly use

`Result.nodes` has **whole-run** node metrics: arrivalRate, utilization, meanLatencyMs, maxQueueDepth, visits and dropped. `Result.timeline` has global sample fields timeSeconds, throughputRps, errorRate and queueDepth. There are no per-node time-series samples, edge traversal traces or individual failure events. The single timeline errorRate combines unsuccessful outcomes; it does not split service failure from policy rejection per moment. Whole-run errors and rejections are separate fields.

Consequences for the brief:

1. Playback can synchronize exact global samples with the chart cursor and a global queue display.
2. Node gauges and node maximum queue indicators remain labeled whole-run values.
3. Particle paths, per-edge density and drop-off effects must be labeled illustrative. They cannot claim to replay actual request events.
4. p50/p95/p99 are whole-run successful-request quantiles for the event model. Analytic tail values are rough estimates. Scrubbing cannot fabricate instant p95.
5. Backend graph cap is 30 nodes. A 300-node rendering test is a synthetic UI fixture, not an expanded simulation feature.

## Tests actually checked

| Check | Result | Limitation |
|---|---|---|
| `npm run build` | Passed on Vite 6.2.7 | 921.21 kB minified JS / 283.96 kB gzip reported; large-chunk warning. This is a build size, not a load-performance result |
| `npm test -- --list` | Failed: no tests found; 0 tests / 0 files | Playwright is installed, but there are no frontend unit, component, E2E or snapshot test files |
| Existing Java tests rerun | 20 passed: 8 engine, 10 API/persistence, 2 access-filter | H2, not PostgreSQL/Testcontainers; no full production isolation proof |
| `npm audit --json` | One high-severity affected package (`vite`); audit exits 1 | Multiple advisories grouped under that package; current suggested patch is 6.4.6, not yet installed in this documentation-only step |
| Axe / contrast / reduced motion | Not run | Existing CSS preference rule is configuration, not accessibility proof |
| 1440/1024/768/390 screenshots | Not captured for this step | Previous browser follow-up was stopped by automatic approval review due to account usage limits; this was not an unsafe-action determination |
| 300-node / Lighthouse | Not implemented or measured | No 60 fps claim |

## Interaction and presentation risks found by reading

- Tiny 6–11px labels dominate the interface. Root font size 14px does not make those labels compliant.
- Four nearly identical metric cards and substantial supporting panels compete with a relatively small graph.
- Local device/browser theme previously affected React Flow's background; current CSS forces light canvas, but needs screenshot regression coverage.
- Mobile CSS hides `.lesson-nav` and `.sidebar-bottom`, removing visible lesson/saved-design navigation without a replacement.
- Saved-design modal declares ARIA dialog semantics but has no implemented focus trap or tested focus restoration.
- The graph has keyboard features from React Flow, but an end-to-end keyboard lesson and accessible routing alternative have not been verified.
- Baseline state currently stores Result without the full input context needed for robust matched-workload comparisons.
- There is no locked prediction target, explain-back field, local XP ledger, layer/skin switch, command palette, time scrubber or Canvas2D animation layer yet.
- Current lessons are original prototype text but lack the new owner-verified knowledge-file publication gate. Do not claim them as reviewed/published curriculum.

## Exit

The current structure and evidence are recorded. Step 1 provides a concrete visual and interaction plan; Step 2 must first add tests and resolve the dependency finding after the user chooses a direction. No application redesign is implemented at this gate.
