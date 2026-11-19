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
