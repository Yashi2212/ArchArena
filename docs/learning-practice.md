# Learn and Practice: system-design vertical slice

The product concentrates on learning system design and practicing interview decisions. **November 19 update:** Learn is now a read-only library with forty original source-linked reference readings and twenty company studies; Practice owns all editable worksheets, graphs and simulation controls. Studio is unlocked as a six-artifact browser-local workspace. The details below about exercise-only Learn and locked Studio describe the previous slice and are superseded by [the phase audit](PHASE-AUDIT.md) and [reference edition](knowledge/local-reference-edition.md).

## What is available

Learn provides 24 HLD and 16 LLD original exercise briefs, ordered Foundation → Intermediate → Advanced. Each has a mission, challenge question and checkpoint deliverable. HLD covers requirements, estimates, networking, the five simulation concepts, storage, consistency, transactions, messaging, search, real-time connections, media, geospatial matching, coordination, regions, observability, security and cost. LLD covers responsibilities, interfaces, value objects, API contracts, persistence mapping, state machines, concurrency, idempotency, transactions, events, patterns, tests, evolution, resilience and authorization.

Five topic links launch the existing load-balancing, caching, replication, queues and rate-limiting labs. Other topics explicitly show that guided theory is pending review. These briefs structure practice; they do not constitute a complete system-design textbook. The five previously written knowledge drafts remain unpublished and are not silently promoted into the website.

Practice offers twenty original company-inspired exercises. This is a selected interview catalog, not an objective “top company” ranking or an account of actual company infrastructure.

| Inspiration | Exercise | Primary design challenge |
|---|---|---|
| TinyURL | URL shortener | Alias uniqueness and popular links |
| Uber | Ride hailing | Fresh location and exclusive driver assignment |
| Netflix | Video streaming | Playback authorization and media boundaries |
| YouTube | Video publishing | Resumable upload and processing recovery |
| WhatsApp | Messaging | Reconnect, duplicates and membership |
| Instagram | Photo feed | Visibility, pagination and hot publishers |
| X | Microblog timeline | Fan-out and deletion |
| Facebook | Social graph | Relationship state and privacy |
| Amazon | Shopping | Inventory reservation and payment uncertainty |
| Flipkart | Flash sale | Admission and stock ownership |
| Google | Web search | Ingestion, indexing and serving boundaries |
| Dropbox | File synchronization | Versions and concurrent edits |
| Spotify | Music playlists | Ordering and offline edits |
| Slack | Team collaboration | Workspace isolation and retention |
| Zoom | Meeting coordination | Admission and coordinator recovery |
| Airbnb | Booking | Overlapping-date reservations |
| LinkedIn | Professional network | Privacy and search projections |
| Stripe | Payment workflow | Idempotency and reconciliation |
| DoorDash | Delivery | Order, restaurant and courier races |
| Ticketmaster | Tickets | Seat holds and expiry races |

## Try the Uber exercise

1. Open Practice, select Uber and start the scenario. Save an existing graph before replacing it. The starter is deliberately incomplete, not a reference solution.
2. In HLD, write scope, scale assumptions, entities/queries, failure recovery and trade-offs. Build a bounded request-flow graph and run it. No real Uber workload numbers are supplied.
3. Switch to LLD. Write Java/API contracts, the concurrency invariant and behavioral tests. Explain how two riders racing for one driver produce only one assignment. Java text is neither compiled nor semantically graded.
4. Select Review my design. Missing sections get actionable prompts. Supplied prose is explicitly unassessed/manual review. Basic topology checks describe simulator restrictions, not universal architectural laws.
5. Current-run evidence includes successful requests, errors, policy rejections, successful-request p95, seed and saturated whole-run nodes. Editing inputs makes old evidence ineligible. A good latency result cannot prove correct matching or payments.

Only the URL-shortener scenario retains the old scripted clarifier and fixed capacity calculator. Other scenarios use their own requirements and worksheet. Live AI is disabled everywhere; no remote provider is called.

## State and failure boundaries

The scenario selector is staged: changing the select does not replace the graph until Start is pressed. The selected scenario resets result evidence, baseline, selected node and saved-design identity; an already queued job may finish on the server. Worksheet drafts are isolated by scenario in browser storage, validated on restore, and fall back to memory with a visible notice. Browser-local storage is not secure storage or cross-device persistence.

Backend saves and run exports contain only existing graph/model artifacts, not worksheet content or scenario metadata. Switching modes keeps the shared graph draft. No domain correctness, formal verification, server-trusted grades, executable Java or AI critique is implemented by this slice.

## What could go wrong and how to verify

- Empty text or buzzwords could look like mastery: tests require missing-input feedback and manual-review wording; no overall pass score exists.
- A previous run could be cited after edits/scenario changes: current canonical experiment matching and explicit reset prevent the coach from citing it.
- One scenario's reasoning could leak into another: browser tests switch Uber → shortener → Uber and reload to check isolation/persistence.
- Responsive controls could disappear or labels become unstable: four-width browser tests exercise new views, restored textarea labels and axe checks.
- Users could confuse exercises with verified lessons or real architectures: persistent availability/provenance language and unchanged knowledge gate make that limit explicit.

Exit checklist: distinct views; 20 selectable scenarios; five functional lab links; actionable Uber gaps; honest feedback boundaries; storage warning; unit/browser/build/docs checks; backend freeze; state documentation; local commit. Verification results are in [the evidence record](evidence/system-design-verification.md).
