# Compatibility fixes — 1 November 2026

## Problems addressed

- Steam's newer Store classes no longer matched several old theme selectors.
- Six CSS imports and four manifest references pointed at files that did not exist.
- The Store sidebar-position option loaded Broadcast CSS instead of its sidebar CSS.
- General native-window and overlay scripts were requested on web pages where
  they had no work to do. Steam's content security policy rejected those requests.
- Community home had no dedicated stylesheet and retained inconsistent native
  panels/search controls.
- `waitForElement` created an observer even when its element was already present,
  and observed the whole document rather than the requested parent.
- Reused virtualized Library rows retained a previous game's hover label.
- Optional HLTB styling hid the plugin's original icon in favor of a missing asset.

## Changes

Current Store, home-page, game-playbar and Fluent-icon styles were taken from
SpaceTheme/Steam `c54e644`, while preserving this fork's header and sidebar layout.
This is a selective compatibility update, not adoption of upstream's new sidebar
virtualization/layout or its class-name updater workflow.

Removed missing/unneeded imports and empty-script patches, corrected the
screenshot-manager CSS path, and corrected the sidebar option target. General
settings JavaScript and overlay JavaScript are limited to native UI contexts;
remote helpers are limited to Store search and Community friends-that-play pages.
No content security policy was disabled or relaxed.

Community home receives a dedicated, semantically scoped stylesheet. The wait
helper returns immediately for existing elements and observes its requested
parent otherwise. Library labels update when a row is recycled. Width writes
are idempotent, and missing-resizer cleanup is guarded. HLTB keeps its native SVG
instead of requesting an absent replacement.

## Checks

- `node tests/theme-integrity.cjs`: all configured local CSS/JS/assets resolve;
  native/web/overlay script scopes and Store-sidebar option wiring are checked.
- `node tests/utils.cjs`: immediate/scoped observer behavior and a recycled
  Library row updating from one game's name to another.
- `node tests/webkit-layout.cjs`: current Store navbar width, radius and colors;
  Community panel/search colors and fields.
- `node tests/header-layout.cjs`: original header/dropdown/shortcuts regression
  suite, including six widths.
- All source JavaScript passes `node --check`; `git diff --check` passes.
- Installed Windows Steam checks covered Store home, search with the grid/list
  helper present, a product page, Community home, Library home, a Library game
  page, and Downloads. Steam preferences were not intentionally changed.
- No new relevant theme-script errors or Millennium crash records were observed
  during the post-install checks.

## Limits

Live game overlay, Big Picture/VR, optional HLTB behavior and mixed-DPI setups
were not exercised. Community feeds and Store media still depend on Steam's
network services. Future Steam/Millennium changes may require more updates.
These checks do not certify every inherited theme option or guarantee that Steam
will never encounter an error.
