# UI ADR 002 Expedition Console foundations

Date: November 18, 2026. Approved scope: T2 Step 2. The user selected **B — Expedition Console**. Backend/API/domain code is frozen; no new simulation, progression, XP or playback behavior is introduced.

## Theme and typography

Options were the cooler Signal Deck and warmer Expedition Console. The user chose Expedition Console: warm charcoal surfaces, warm white text, teal traffic/action signals and amber navigation accents. Choose Sora for readable body/display text and IBM Plex Mono for numeric values. Both are installed as self-hosted font assets after checking package license metadata; retain actual bundled license notices. No runtime font CDN or animation framework.

Trade-off: self-hosted fonts add transfer bytes but remove a third-party runtime request and make visual tests deterministic. Load only Latin Sora variable and regular Latin mono, not all scripts/weights. At 10x graph density, typography alone does not solve DOM/rendering costs; later steps need level-of-detail and measured renderer budgets.

## Implementation boundary

Options: overwrite the entire screen now; append another theme override; or establish tokens/base components while retaining the existing workbench structure. Choose one token file plus a coherent replacement stylesheet and reusable Button, Icon, StatusBadge, ModelNotice, MetricInstrument, AlertBanner and RulesPanel. Keep current API calls/state/actions. Hero layout, Canvas2D, scrubber, prediction lock/XP and skill-tree progression remain later approved steps.

Trade-off: this step visibly changes the theme without delivering the final expedition map. It avoids duplicating a second screen and preserves functional seams for tests. At 10x, component boundaries allow charts/canvas to be split and profiled without a domain rewrite. Do not add a generic UI framework to solve a handful of controls.

## Security and tests

Patch the known Vite finding using the suggested compatible 6.4.6 release and rerun audit; do not assume that a version bump resolves every dependency advisory. Add compatible Vitest/Testing Library/jsdom and axe as dev-only testing tools, checking their installed APIs and licenses. Test formatting and actual token pairings, then component keyboard behavior and model labeling. Configure Playwright browser smoke/evidence separately from unit tests.

Trade-off: test tools expand development dependencies but do not enter the production bundle. Pin direct versions and retain the lockfile. At 10x team/test growth, separate unit and browser fixtures, keep tests deterministic, and do not confuse mocked UI evidence with real-backend integration.

## Honesty and accessibility

Keep a persistent **Modeled, not measured** notice. Show analytic values as approximate and node/event aggregates as whole-run. Cost remains illustrative, not an AWS quote. Latency formatting retains exact values accessibly. Meaningful text is at least 14px; status uses icons/words plus color. Token tests are necessary but do not establish complete WCAG compliance. No 60 fps claim is made at this step.
