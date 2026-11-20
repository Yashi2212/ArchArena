# Owner walkthrough verification

Verified November 20, 2026 on the existing local Windows setup. This is local evidence, not a new public-backend release or deployment certification.

- Fresh `scripts/maven.ps1 -MavenArgs @('package')`: BUILD SUCCESS, 40 tests, zero failures/errors/skips. The package was rebuilt before the actual API and separate worker started.
- `frontend`: `npm.cmd test`, 97 tests across seven files pass.
- `python scripts/demo_simulations.py`: four real HTTP jobs completed through the persisted H2 queue and separate worker. Two paired comparisons, accounting, bounded telemetry, same-key reuse, changed-input HTTP 409 and native exports pass. Summary and input hashes: [owner-demo-results.json](owner-demo-results.json).
- The runner now reads the four committed input fixtures by default. Their hashes match the inputs actually executed; the offline validator checks this relationship.
- Initial normal-sandbox live browser attempt: timeout after 180 seconds while locating the Practice button, before any experiment was submitted. The root cause was not conclusively established. A standalone browser diagnostic subsequently loaded the actual app; no application, selector, timeout or visual baseline was changed.
- Repeated opt-in live browser command with normal reviewed browser/process access: one test passed in 11.0 seconds. It submitted a real run, checked version/accounting, used the replay slider through 32 virtual seconds, and downloaded the native Markdown export. Retry report (local checkout paths normalized): [owner-handoff-browser-retry.json](owner-handoff-browser-retry.json). Saved result: [owner-handoff-live-run.json](owner-handoff-live-run.json). Screenshot: [owner-handoff-live-browser.png](owner-handoff-live-browser.png).
- The test's fixed output paths initially replaced historical library-studio evidence. New outputs were copied to owner-handoff names, then both original tracked library-studio files were restored byte-for-byte from HEAD. Earlier evidence remains intact.
- `validate_owner_guide.py`: 45 source-line references, four executed-input hashes, two paired cases and five VS Code tasks pass. `validate_docs.py`: local links pass. These documentation checks do not certify full public hosting.

Application Java/TypeScript source is unchanged in this handoff. No AWS provisioning, paid AI integration or public Java API exposure. Public identity/session/isolation and production deployment gates remain open. The local API, worker and frontend remain running for the owner's practice; stop them with `scripts/dev.ps1 -Stop`.
