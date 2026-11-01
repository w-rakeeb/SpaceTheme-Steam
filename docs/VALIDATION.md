# Validation

The [1 November 2026 compatibility check](COMPATIBILITY-2026-11-01.md) adds
complete local-asset validation, native/web script-scope checks, Store/Community
layout checks, observer lifecycle checks and recycled-row regression coverage.

## Automated checks

`tests/header-layout.cjs` creates a representative Steam header DOM and applies
the relevant theme CSS. It checks:

- widths of 1010, 1188, 1280, 1400, 1682, and 1920 CSS pixels;
- centered navigation without profile/header overlap;
- visible pinned News, Notifications, and Friends controls;
- menu placement to the left of its arrow;
- 24 px inner avatar and unclipped profile overflow;
- reload and Storage dispatch to the expected native methods/URI;
- the lost-click regression for a non-focusable utility;
- Enter, Escape, outside-click and resize dismissal;
- sidebar hover/right-side CSS, account-warning spacing, always-visible
  download-bar spacing, and original-sidebar fallback.

The lost-click check failed before the focus fix and passed afterward. Native
calls are stubbed in the fixture, so that portion checks dispatch. JavaScript
syntax and `git diff --check` are checked separately.

### Running the fixture

Node.js and Playwright are development/test tools, not theme runtime dependencies.

```powershell
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/header-layout.cjs
node tests/theme-integrity.cjs
node tests/utils.cjs
node tests/webkit-layout.cjs
```

An installed Edge browser may be selected through `PLAYWRIGHT_CHANNEL=msedge`.
The fixture does not write Steam settings or call real reload/Storage APIs.

## Installed Windows client — 2026-10-29

- Viewed the final header, profile, pinned controls, download footer, and
  left-opening dropdown in the running Steam client.
- Clicked Storage in the dropdown and confirmed Steam Settings opened on
  **Storage**, without changing a setting or game location.
- Clicked reload and checked that Steam rebuilt and restored its interface.
- Captured actual library, dropdown and Storage screenshots for the README.
- Checked installed changed files against the source.

Review of the delta found no added system command, native library, persistence
mechanism, file deletion, credential access, or game-modification code. Existing
upstream theme behavior is inherited.

## Limits

This is not exhaustive certification of every theme option, game page, Linux,
Big Picture/VR action, text-scale setting, or mixed-DPI/multi-monitor layout.
Steam/Millennium updates may change internal APIs and CSS classes. The fixture
cannot prove live popover/React behavior on future versions.

The source review and listed checks reduce risk. They cannot promise Steam,
Millennium, or this theme will never have an issue.
