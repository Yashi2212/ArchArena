# Knowledge pack and publication gate

These are **unpublished draft notes**, not owner-verified lessons and not chapter-by-chapter book summaries. They cover five selected ideas in original wording and connect them to the current ArchArena model. Read the [source register](sources.md) and [content policy](content-policy.md).

| Draft | Source basis | Review state |
|---|---|---|
| [Load balancing](load-balancing.md) | SDI1 PDF pages 13–14 | Awaiting owner review |
| [Caching](caching.md) | SDI1 PDF pages 20–21 | Awaiting owner review |
| [Database replication](replication.md) | DDIA1 PDF pages 207, 217–218 | Awaiting owner review |
| [Queues and backpressure](queues.md) | SDI1 PDF page 34; DDIA1 PDF pages 581–582 | Awaiting owner review |
| [Rate limiting](rate-limiting.md) | SDI1 PDF pages 72–73 | Awaiting owner review |

`verified: no` means the owner has not checked the note. AI drafting, passing a validator and source citation are not owner verification or legal permission. Only the owner can change verification to yes, name the reviewer and date it after reviewing claims, sources and original expression.

Workflow: private source inspection → original topic notes → owner corrections and verification → original three-layer lesson drafts → claim-to-note line map and readability tests → review → publish. No new lesson content has been added to the running website in this step. Existing prototype lessons have not yet been migrated to this gate.

The content validator checks structure, source IDs, model parameters and the explicit publication flag. It cannot prove accuracy, originality or legal clearance. Run `python scripts/validate_knowledge.py`; `--publish` must fail while any required note remains unverified. Tests use temporary fixtures to prove that the guard rejects unverified/malformed inputs.

## Missing from the knowledge pack

- Your review/corrections and verified-by/date for all five drafts.
- A verified complete second-edition source for topics absent from the supplied early release, if you want second-edition-specific claims.
- Approved original Story/Simple/Pro lesson wording, explain-back prompts and takeaways. These are not generated as publishable curriculum before note verification.
- Chosen guide persona name and story-skin labels. No guide has been invented as an approved product choice.
- Any deployment-specific performance/cost facts. Model settings are assumptions, not book facts or benchmarks.

Do not silently fill these gaps from memory, unrelated web material or an LLM. Ask for the needed knowledge or mark an explicit product/model assumption.
