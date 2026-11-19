# Learn, Practice, Studio and introduction video verification

November 19, 2026. Local Windows, Node 24, system Edge, loopback frontend/API. Public deployment and remote CI are not implied. Latest scope supersedes the historical locked Studio and editable Learn.

## Current evidence

| Check | Observed result | Scope and limits |
|---|---|---|
| Production build | Final build passes; JS 1,023.05 kB / 317.33 kB gzip | CSS 52.80 kB / 9.86 kB gzip; no source maps; existing large-chunk warning remains |
| Frontend unit/component | 95 passing, zero failures | Catalog/source integrity, safe bounded Studio restore and hostile text rendering plus existing 91 tests. Not factual/legal content verification |
| Initial desktop browser | 16 fixture cases pass, one opt-in live case skipped | Read-only Learn and no preview POSTs, forty topic headings, company handoff, worksheets, graph saves, keyboard checkpoint/native export, Studio persistence/snapshot/export, video decode/play/seek/captions and axe checks |
| Actual browser/API/worker | One 1440px flow passes without route mocks | [Real run](library-studio-live-run.json), [browser report](library-studio-live-browser-results.json); verifies v2, request accounting, node history, replay and native Markdown download |
| Four-width browser/visual | 64 fixture checks pass; four opt-in live cases skipped | 1440/1024/768/390, twelve intentional new visual baselines. 44 axe scans report zero violations; some states repeat between cases, and this is automated scope only. All twelve baselines match after the corrected readiness check; one actual-engine browser/API/worker/replay/export flow passes. Do not add overlapping runs as unique cases |
| Video decode | 72.00 seconds, 864 frames, 1280×720, H.264, 12 fps, AAC mono audio; full decode exits zero | [Decoder output](library-studio-video-verification.txt). Six original illustrated chapters; no copied book/company artwork. Narration chapter durations 7.95/10.53/7.34/10.03/9.88/11.68 seconds, each below its 12-second slot |
| Visual inspection | Original decoded frame and initial desktop Learn preview inspected | No clipping in inspected frame; responsive screenshots/axe are additional scoped checks, not full manual AA certification |
| Local security inventory | Fifteen automated checks pass; all twenty categories inventoried | Reuses dated Java/npm scan and existing JUnit evidence; no backend edits/tests rerun in this slice. Public readiness remains blocked |
| Book-source drafts | Five notes / thirteen claim references validate; owner verification absent | New TypeScript reference edition is outside that old publication validator and separately review-pending |

## Product behavior and remaining risk

Learn has no editable graph/inputs or analytic-preview submission. Navigation, explanation depth and video controls remain interactive. Practice contains the existing graph engine and concept checkpoints, company HLD/LLD worksheets and deterministic improvement guidance. Studio stores six bounded artifacts locally and exports a versioned bundle; a captured graph is detached, and supplied text is only marked for human review. There is no semantic consistency engine, Java execution, cloud sync or live AI.

The new content is original explanatory prose with linked references, not verified company internals or a substitute for the supplied books. Source links and tests do not establish editorial accuracy or legal clearance. Five book-derived drafts remain unpublished. See [reference provenance and release gate](../knowledge/local-reference-edition.md).

Public deployment is **not ready**. The [original-prompt audit](../PHASE-AUDIT.md) records incomplete T0–T7 exits. HTTP principal/owner isolation, session/CSRF design, PostgreSQL roles/RLS, MFA, deployed TLS/proxy/secrets, dynamic/container/load checks and content review remain open. No paid service, public hosting, Git push or AWS resource was created.

## Commands and evidence

- `npm run build`; `npm test -- --reporter=json --outputFile=../docs/evidence/library-studio-frontend-tests.json`.
- `npx playwright test ... --project=width-1440 --update-snapshots`: [initial desktop report](library-studio-browser-desktop-initial.json).
- `npx playwright test --update-snapshots`: [four-width report](library-studio-browser-results.json), 64 passed / 4 opt-in skips.
- `scripts/narrate-intro.ps1`; `python scripts/create-intro-video.py`; FFmpeg full decode to null and sampled frame extraction. Intermediate frames/audio remain private and ignored.
- `python scripts/check_security.py`; `python scripts/validate_knowledge.py`; local evidence checks pass; public gate exits 1 as intended. `validate_docs.py`: 14 entry documents / 123 links / 13 claim references, zero issues at that checkpoint. `validate_knowledge.py --publish`: exits 1, all five notes blocked for missing owner verification.

Earlier [engine-v2 verification](engine-v2-verification.md) remains the evidence for forty Java tests, bounded engine measurements and actual API/worker execution. It is historical evidence, not newly executed backend tests for this frontend-only slice.

Caption timing uses offline speech-progress boundaries normalized to each output WAV duration, excluding silent chapter padding. Eighteen cues have ordered nonnegative bounds within 72 seconds. A temporary narration-helper C# compile error (missing generic collection reference) was fixed by using arrays; the rebuild then succeeds. This does not represent a product runtime failure.

## Visual follow-up correction

The first comparison-only follow-up passed 18/20 cases; Practice captures at 1024 and 390 exceeded the 10-second stable-screenshot window because the analytic preview changed page height during capture. In both cases the final actual image is pixel-identical to its accepted baseline. The correction waits for the visible database-demand preview before capture; no tolerance, timeout or baseline was changed for this fix. See [initial report](library-studio-browser-visual-initial.json) and [failure detail](library-studio-visual-initial-error.md). Corrected four-width Practice/Studio comparison: 4/4 pass with unchanged baselines, timeout and pixel tolerance. Combined with the four matching Learn images in the initial comparison run, all twelve baselines match. See [corrected report](library-studio-browser-final-visual.json).

Final production assets are recorded with byte sizes, gzip sizes and SHA-256 in [asset inventory](library-studio-build-assets.json). Final unit suite remains 95/95. Local security/hygiene checks pass and docs links validate with zero issues. The public security and unverified-note publication gates intentionally exit nonzero. No final claim of CI, PostgreSQL integration, deployed security, Lighthouse/FPS or content clearance is made.

The actual-engine run intentionally injects a service-arrival outage with retries/timeouts. Its 1,192 logical requests end in 43 successes, 1,149 errors and zero policy rejections. Passing the browser test verifies the pipeline, accounting, replay and export; it does not mean this deliberately faulted architecture meets an availability target.
