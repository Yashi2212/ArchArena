# Original local reference edition

November 19, 2026. Latest user steering requests substantive read-only knowledge, company-wise studies and editable Practice. This edition supplements the earlier five guarded book-source drafts; it does not change their `verified: no` metadata, publish them or claim owner approval.

## Authorship and provenance

- `frontend/src/system-design/knowledge.ts`: forty independently worded introductory-to-advanced readings, each with Story/Simple/Pro, an original flow, example, trade-off, pitfall and source keys. Every record remains `ownerVerified: false` and `status: source-linked-local-preview`.
- `frontend/src/system-design/companyKnowledge.ts`: twenty original interview reference proposals. Their flows, schemas and failure choices are proposed teaching designs. They are not assertions about current company infrastructure, a ranking, an endorsement or copied case studies.
- Uber historical context cites Uber Engineering's H3 article (2018) and fulfillment rearchitecture article (2021). These are limited contextual facts, separate from our proposed acceptance transaction, schemas and trip/payment boundaries. No current full Uber blueprint or company workload figures are claimed.
- Source registry in `knowledge.ts`: Donne Martin's System Design Primer, MDN HTTP, official PostgreSQL replication/isolation documentation, Dev.java classes/objects, Oracle Java 21 records/concurrency and Spring transaction documentation. Links are further reading, not blanket licensing permission. No third-party code, artwork, prose passages, logos or book diagrams are reproduced.
- Supplied books and the liquidslr repository were not imported into the application. Earlier source-register/license limitations remain active. Original prose on general technical concepts reduces expression-copying risk; it does not guarantee clearance or correctness.

## Review and public release gate

This local preview is visibly marked editorial-review-pending. Before public publication, review every explanation and worked example for accuracy, original expression, adequate attribution and suitability for the intended audience. Add claim-level source mappings and named/date-stamped reviewer evidence. Review the company context against the linked dated primary pages; keep proposals labeled. Do not change owner verification merely because an AI drafted content or a test passed.

The existing `validate_knowledge.py --publish` intentionally still rejects the five unverified book-source drafts. It does **not** validate the new TypeScript reference edition; this explicit limitation prevents confusing the old validator with clearance for all new content. Unit tests cover catalog/reference integrity, not factual or legal review. Public readiness remains blocked independently by the security and deployment gates.

## Tutorial media

The 72-second MP4, poster, captions and transcript in `frontend/public/media` are generated from original text and Pillow drawings, with offline Windows Microsoft Zira synthetic narration. No book images, external video, company screenshots, music or remote media are included. Animated paths illustrate the workflow; they are not recorded telemetry or benchmark evidence.

Rebuild: Windows PowerShell `scripts/narrate-intro.ps1`, then `python scripts/create-intro-video.py` with Pillow and isolated `imageio-ffmpeg==0.6.0` in `.tools/video-libs`. Generated intermediate audio/frames stay in ignored `.local/intro-video`; only the final product assets are versioned. Generated narration is identified as synthetic in the transcript/UI and is a platform guide, not a human endorsement.
