# GitHub Pages static preview verification

Date: 19 November 2026. User explicitly authorizes publishing this project to Yashi2212/ArchArena and a GitHub-hosted preview, with AWS deferred. This supersedes the earlier no-push/local-preview restriction for this static release only. Full public Java backend readiness remains blocked.

## Scope

The Pages workflow builds the React app with base `/ArchArena/` and `VITE_STATIC_DEMO=true`. A persistent banner identifies the static preview. The bundle loads an immutable copy of the five concept descriptions locally; API calls fail locally before network access. Learn, original company references, tutorial, graph editing, worksheets, rule-based coaching and local Studio exports remain available. Simulation execution, analytic previews, backend persistence, checkpoints and server exports are unavailable and are not fabricated.

The Java backend is not hosted, tunneled or exposed by this deployment. The private owner checklist and all resume deliverables are outside the Git checkout and excluded from publication. No resumes, PDFs, source-book assets or `.env` files were found in repository history filenames before the initial push.

## Local evidence

- Normal build passes. Static `/ArchArena/` build passes: JS 1,025.93 kB / 318.60 kB gzip; the existing large-chunk warning remains.
- Desktop and phone static browser checks pass (2/2): actual tutorial metadata/playback, correct project-site media paths, company-to-Practice navigation, disabled run action, graph edits, worksheet feedback, Studio save/restore and native bundle export. No API requests or browser script errors; scanned Studio states have zero axe violations and no horizontal overflow.
- Two new unit cases verify static network refusal and retained real local API access. Final unit suite: 97/97 pass.
- The separate full-backend and engine security gates remain open. This is a static portfolio preview, not a claim that those gates passed.

Evidence: [local static browser run](pages-browser-results.json), [unit run](pages-unit-tests.json). GitHub deployment and remote CI outcomes will be appended only after observed.

## First remote publication

Source pushed to Yashi2212/ArchArena at db08f20. Repository description, topics and homepage configured under the verified Yashi2212 account. Initial Pages deploy reached the deploy step before the repository Pages setting was enabled, returning 404. Enabled workflow-based Pages and retried the failed job; it succeeded. The actual page, MP4 and VTT return HTTPS 200 at https://yashi2212.github.io/ArchArena/.

The first quality run passed frontend and documentation jobs. Its backend failed during Maven plugin-prefix resolution before tests ran, reporting missing artifacts and no `dependency` prefix. Official Maven Central probes return 200/ZIP signatures for the referenced plugin artifacts. CI now separates Java verification from inventory, forces fresh resolution and uses the verified fully qualified dependency-plugin 3.9.0 goal with an explicitly created output directory. No test or advisory check is removed. Retain the failed run and record the new observed outcome separately.

## Final observed outcomes

- Published release code: `53f752b6da4034a303efd7c3b09cfbcd7dfcde47` on main. [Quality workflow](https://github.com/Yashi2212/ArchArena/actions/runs/44550545418) succeeds in documentation, backend, frontend and browser jobs. Forty Java tests pass with zero failures/errors/skips; runtime scan covers 77 artifacts with zero matches. Frontend unit suite is 97/97. Existing four-width browser/visual checks pass remotely.
- [Pages workflow](https://github.com/Yashi2212/ArchArena/actions/runs/44550545404) builds and deploys successfully. Public URL: https://yashi2212.github.io/ArchArena/ . Actual HTML, MP4 and VTT return HTTPS 200.
- [Actual deployed-site browser checks](pages-live-browser-results.json): 2/2 pass at 1440 and 390, including native video playback, company handoff, local graph/worksheet edits, Studio persistence and native JSON export, no backend requests/script errors and zero violations in the scanned Studio states.
- [Observed remote metadata and jobs](pages-remote-ci.json) contains the successful code SHA and public run URLs. Remote-tree check reports no private resume/checklist, DOCX/PDF or .env paths. No source books or private intermediates were pushed.
- Final handoff changes are documentation/evidence only. They do not change the deployed static bundle; their commit skips rebuilding unchanged release code. Local documentation links are validated separately.

GitHub Pages hosts no Java service. The full backend security gate still fails closed, and unverified knowledge notes are not promoted. Static review-edition publication is explicitly requested; it is not owner verification or copyright clearance. No AWS resources, paid AI or public database was created.
