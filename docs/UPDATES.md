# Official SpaceTheme updates with custom controls

The fork includes official SpaceTheme history through ddfbbbe (4 November 2026).
Upstream's current collection sidebar, settings styles, resize handle and wallet
option fix are included. Changes specific to this edition remain in their own
header/settings/responsive styles and header module where possible; integration
points and manifest safety fixes remain deliberate small upstream-file changes.

## Update route

Every six hours GitHub Actions fetches SpaceTheme/Steam main and attempts a normal
three-way merge. It never uses an overwrite strategy or force-push. Asset/script
scope checks, nine header widths, dropdown interactions, wallet placement, settings
layout, web page columns, observer/recycled-label checks and the Windows installer
tests must pass before the merged commit is pushed to this fork and a release ZIP
is created. The custom module, integration call, installer, updater identity and
Size on Disk exclusion are explicitly checked.

Millennium's regular theme updater reads this fork's GitHub identity, so verified
upstream changes arrive with the custom additions. Users must leave normal theme
update checks enabled and apply updates when Millennium requests it. This adds no
background updater process or task to Windows. The six-hour schedule runs on
GitHub, may be delayed, and can be disabled by GitHub after prolonged inactivity.

If upstream changes conflict with local edits or verification fails, the workflow
fails without pushing that merge. A maintainer needs to resolve it. No automatic
merge can guarantee compatibility with arbitrary future Steam/internal API changes.

## Current fixes and checks

- Dropdown remains available in windowed and maximized Steam, with pinned News,
  Notifications and Friends controls unchanged.
- Profile moves 12px left, with a 14px name, 26px avatar, 11px wallet line and 36px
  height. Hidden-wallet settings remain supported.
- Quick settings no longer uses translated/scaled placement; it fits the window,
  has clear 14px text and scrolls. Settings are styled without loading the inherited
  DOM-reparenting script, preserving React's ownership of option controls.
- Product/bundle columns use actual viewport width and stack below 900px. The
  footer fits the viewport; search input expansion is constrained on narrow pages.
- Five JavaScript suites and the CMD/PowerShell installer suite cover these changes.

Tests remain representative DOM/browser checks, not proof of every Steam page,
account, language, optional plugin or future upstream state. Live Windows captures
and release notes record the additional checks actually performed.
