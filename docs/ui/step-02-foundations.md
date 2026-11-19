# Step 2 Expedition Console foundations

User choice: **B — Expedition Console**. Scope is tokens, typography, base components, dependency remediation and tests. The complete hero layout, Canvas2D traffic, scrubber, prediction lock, XP, skill-tree behavior and command palette remain later steps. No backend, API, engine or domain files are changed.

## What changed and why

The first theme made required labels too small and compressed the architecture. The foundation now uses warm charcoal surfaces, warm white text, teal traffic/action signals and amber route accents. Readable labels and distinct status words/icons matter more than decorative effects. It remains the existing workbench structure rather than claiming the final expedition-map layout is complete.

Technically, [tokens.css](../../frontend/src/styles/tokens.css) is the single source for color, type, spacing, radii, motion and layer tokens. [workbench.css](../../frontend/src/styles/workbench.css) replaces the old stylesheet; it has no literal theme hex values. All text size tokens are at least 14px. Fitted graph zoom can still make node text visually small on narrow screens: that is an open Step 3 layout/inspection issue, not a WCAG pass.

## Components and data honesty

- [Shared foundations](../../frontend/src/ui/foundations.tsx): Button, StatusBadge, NodeLoad, ModelNotice, MetricInstrument, AlertBanner and RulesPanel.
- [Original SVG icons](../../frontend/src/ui/Icon.tsx): no external icon framework or emoji-based status indicators.
- [Formatting helpers](../../frontend/src/ui/format.ts): demand relative to capacity, readable ms/s with exact accessible values, approximate analytic wording and illustrative cost labels.
- The model notice stays visible in Learn, Practice, Studio, loading and error paths. Analytic arrival demand is not called successful throughput. Event quantiles and node statistics remain whole-run values.
- Sidebar and experiment complementary landmarks have unique accessible names. Lesson and saved-design actions remain visible on mobile.

All existing API requests and server-owned checkpoint behavior remain unchanged. No new learning content is published; source-note verification remains pending.

## Fonts and licensing

Sora Variable 5.3.0 and IBM Plex Mono 5.3.0 are OFL-1.1 packages. Their original notices are retained in [Sora license](../../frontend/public/licenses/sora-OFL.txt) and [IBM Plex Mono license](../../frontend/public/licenses/ibm-plex-mono-OFL.txt). Only two local WOFF2 files are served: 33,652 and 14,708 bytes, total 48,360 bytes. No runtime font-CDN requests are needed. Source packages include other scripts/weights, but they are not imported into the bundle.

Testing Library/Vitest/jsdom are development-only tools. Axe is MPL-2.0 and used in tests; it is not shipped as an application runtime dependency. The direct test versions and lockfile are committed. [UI ADR 002](../adr/ui-002-expedition-foundations.md) records alternatives and 10x consequences.

## Verification design

Vitest runs [format tests](../../frontend/src/ui/format.test.ts), [actual-token/font checks](../../frontend/src/ui/theme.test.ts) and [component tests](../../frontend/src/ui/foundations.test.tsx). Token checks read the actual implementation CSS, not a duplicated JSON palette. The jsdom axe test disables only visual contrast because jsdom has no layout; real-browser axe runs separately with its normal contrast rules.

Playwright uses a separate loopback test server on port 5174. It mocks API data with deterministic fixtures, explicitly labeled as UI fixtures, and serves the Markdown attachment as a real HTTP response. This avoids the canceled intercepted-download behavior observed in Edge. No browser security flags or protections are disabled. These are presentation/regression tests, not proof of real simulator or database behavior.

The browser suite covers 1440/1024/768/390px, all lessons, saved designs, error states, static reduced motion, a keyboard-only existing prediction/run/checkpoint/export flow, and axe on Learn, saved dialog, Practice and locked Studio. Twelve screenshot baselines cover the three main screens across those four widths. Baselines must be reviewed; never regenerate automatically merely to make CI green.

## Screenshot critique

The captured theme avoids gradients, glass effects, emoji icons and the old cream/white-card palette. Required labels are larger and contrast is explicit. Whole-run/approximation wording and the model disclosure remain visible. Mobile access to lessons and saved designs is restored.

Still unfinished: the current graph is fitted small on narrow screens, the sidebar consumes too much vertical space there, four metric cards remain, and some old prototype lesson microcopy is unchanged. Step 3 must prioritize the architecture and improve inspection at mobile sizes; the later content track must replace unverified prototype curriculum through the approved knowledge gate. These screenshots do not establish 300-node performance or complete accessibility.

## Risks, verification and exit

Use [Step 2 evidence](../evidence/step-02-verification.md) for actual final counts, build sizes, audit snapshots and limitations. Dependency audit feeds can change: an older report showed a glob-matching finding, while the November 19 full audit returned zero. No ignore rule, forced downgrade or security bypass was used; do not infer a permanent security guarantee from a clean snapshot.

- [x] User's chosen direction implemented as foundations.
- [x] Fonts self-hosted with license notices; honest metric formatting and semantic statuses added.
- [x] Tests and reviewed screenshots prepared; backend freeze checked.
- [ ] Complete hero layout, animation, all-state accessibility, performance and remote CI are later gates.

What could go wrong: graph scaling can reduce legibility, browser/font differences can alter baselines, and future dependency advisories can change the audit result. Verify with the saved tests/screenshots and repeatable commands; do not claim production readiness from foundation tests.

Interview answers: local fonts remove third-party runtime fetches; unit/token tests do not replace real-browser checks; deterministic presentation fixtures do not establish actual engine performance. Expanded answers are in the project's interview question bank.
