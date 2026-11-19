# ADR UI-004: read-only reference and editable design workspaces

Date: 2026-11-19. Status: implemented locally; public review gates remain open. Latest direct user steering supersedes interactive Learn and the Studio-later restriction in the preserved original prompt.

Problem: a shared editable Learn workbench confuses reference knowledge with the learner's own design. The locked Studio also prevents recording the requested end-to-end design artifacts. A company picker without explanatory reference content cannot teach why a design choice matters.

Decision: LearnLibrary renders original reference readings and company studies as React text with separate HLD/LLD indexes, source links and explicit provenance. Practice contains all editable model/worksheet experiments. DesignStudio provides six bounded browser-local artifacts with capacity assumptions, detached graph capture and JSON export. Reuse the existing simulator/API and rule-based coach; do not invent a second engine or claim semantic/AI grading. An original local video explains the workflow and its limits.

Alternatives: keep everything in one canvas; publish uploaded book summaries; or implement a full authenticated collaborative Studio now. The combined canvas weakens the teaching boundary. Imported protected expression is unnecessary and unapproved. Collaborative storage requires the outstanding public identity/ownership/versioning work. Choose local artifact authoring with visible storage/export boundaries.

Consequences: reference content and learner drafts have clear ownership and purpose. More original content increases editorial obligations: the new TypeScript edition is review-pending, outside the old five-note validator and not cleared for public publication. Company flows are proposals; dated Uber primary-source context is separately labeled. Local storage can be cleared or overwritten by another tab; exports preserve a portable copy, but multi-tab merge/cloud sync remain future work. At greater catalog size, add reviewed content packages and searchable navigation rather than embedding unlimited prose in the main bundle.

Verification: unit integrity/safe-restore tests, read-only/no-POST browser assertions, company-to-Practice handoff, keyboard checkpoint/export, Studio restore/snapshot/export, native media playback/captions/seek, responsive visual baselines and scoped axe scans. See [dated results](../evidence/library-studio-verification.md). No claim of production readiness follows from these local checks.
