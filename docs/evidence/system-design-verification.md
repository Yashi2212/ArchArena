# System-design learning/practice verification

Date: 2026-11-19. Local Windows, Node 24, Playwright 1.65.1 and Edge. All browser API metrics are deterministic fixtures, not simulator/infrastructure measurements.

## Results

| Check | Observed result | Evidence |
|---|---|---|
| Frontend unit/token/component tests | 86 passed, zero failed (79 existing + 7 new) | [Vitest JSON](system-design-unit-results.json) |
| Full browser suite | 44 passed, zero skipped/flaky/failed across 1440/1024/768/390 | [Full report](system-design-browser-full.json) |
| LLD separation and visual follow-up | 24 passed; twelve screenshot baselines matched without update mode | [Follow-up report](system-design-browser-refinement.json) |
| Final learning reset/accessibility follow-up | 8 passed, zero failed at all four widths | [Latest report](system-design-browser-results.json) |
| Browser axe | Zero violations in 32 scanned view/state combinations in the 24-case follow-up | Existing Learn/dialog/Practice/Studio plus new HLD/LLD Learn/Practice, each at four widths |
| Production build | Passed; JS 952.80 kB / 295.31 kB gzip; CSS 46.62 / 8.76 kB gzip; fonts 48.36 kB | Local npm build output, existing large-chunk warning remains |
| Backend/API freeze | 22 files, zero changes | `python scripts/check_backend_freeze.py` |
| Documentation | 14 entry files, 74 local links, 13 claim references, zero issues | `python scripts/validate_docs.py` |
| Phase 0 planning | 96 checks passed, zero failed | `python scripts/validate_phase0.py`; planning only |
| Knowledge guard | Seven tests pass; five drafts/13 claim references valid; publishing rejects all five unverified notes | `test_knowledge.py`, `validate_knowledge.py`, `--publish` expected nonzero exit |
| Normal preview/API health | HTTP 200 at 127.0.0.1:5173 and 8080/actuator/health | Loopback HTTP checks; availability only, not an end-to-end live engine test |

The existing 20 Java/H2 tests passed during Step 2; they were not rerun for this frontend-only slice. No backend source changed. No dependency changes; the zero-finding Nov 19 audit remains the earlier dated snapshot, not a fresh scan for this slice.

## Failures and corrections

Initial focused browser run: 5/12 passed. Restored textarea labels failed exact lookup in three viewports; explicit labels/ids fix the association. Four axe checks failed because the ESM test used `require`; replaced with ESM-compatible path resolution. [Initial report](system-design-browser-initial.json) preserved. Initial documentation validation found this evidence link before the file existed; subsequent validation passed. Initial non-escalated loopback probes were denied by the socket sandbox; authorized read-only probes later returned 200. No security setting was disabled.

The full 44-case pass generated updated baselines for the intentional curriculum/scenario UI changes. After visual review, the 24-case follow-up matched all twelve baselines without update mode. Final refinement hides the HLD lab in LLD Learn as well as LLD Practice and resets topic filters when returning from a different track; its targeted run is recorded separately. Final visual review removed horizontal background rules that interfered with LLD prose readability; the same targeted checks were rerun afterward. Historical Step 2 evidence images/results are preserved, and current test screenshots use a new filename prefix.

## Visual review

Desktop and mobile HLD/LLD screenshots were inspected. New controls and worksheets fit the viewport. The existing fitted graph still has small mobile labels; mobile navigation is tall. Full-page captures may show the skip link in its legitimate keyboard-focus state after accessibility checks. No all-state/manual accessibility certification is implied.

Representative fixtures: [HLD Learn desktop](system-design-learn-hld-width-1440.png), [LLD Learn desktop](system-design-learn-lld-width-1440.png), [LLD Practice desktop](system-design-practice-lld-width-1440.png), [LLD Practice mobile](system-design-practice-lld-width-390.png).

## Exit checklist and remaining limits

- Distinct system-map and Java-blueprint learning views, plus separate HLD/LLD practice artifacts implemented.
- Forty original exercise briefs at three levels, five existing lab links, twenty scenario briefs and Uber practice implemented. These are not forty completed theory lessons or verified company designs.
- Missing-decision, basic topology, stale-metric, scenario-isolation and reload behavior tested. Prose remains manual review; AI disabled; no overall architecture pass score.
- Browser-local worksheet storage is separate from backend graph saves/exports and disclosed in the UI.
- STATUS, prompt, issues, problem discussion, HLD/LLD, run guide, interview answers and ADR updated; local commit follows verification.

Not verified/implemented: full reviewed theory curriculum, domain correctness, executable Java grading, live AI/evals, PostgreSQL/Compose, real-backend browser execution, remote CI, animation performance, backup/restore, AWS cost or public deployment. The simulation remains a bounded prototype with no retries/cascades/autoscaling-delay/replication-lag support. No book assets were published and no legal-clearance claim is made.
