# Official SpaceTheme updates with custom controls

The fork includes official SpaceTheme history through `65bc106` (12 November 2026).
Upstream's current collection sidebar, settings styles, resize handle and wallet
option fix are included. Changes specific to this edition remain in their own
header/settings/responsive styles and header module where possible; integration
points and manifest safety fixes remain deliberate small upstream-file changes.

## Update route

Maintainers fetch and review official SpaceTheme changes manually, resolve any
conflicts with the custom controls, and run the regression checks before publishing
a release ZIP. GitHub Actions runs validation on pushes to `main` and on manual
request. The workflow has read-only permissions.

Millennium sends the theme's GitHub identity to SteamBrew's update service. In
November 2026 the service returned the official repository but omitted this fork
when queried for both. Until that service lists the fork, update by extracting
the latest release ZIP and running `Steam/Install.cmd` after closing any running game.

Theme settings are available under **Top Right Edition** in the settings dropdown.
**Profile layout** contains the position setting, and **Header shortcuts** contains
the Reload and Storage switches.

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
- Moved native controls retain handlers and forward only their own reconciliation
  insert/replace/remove operations from their original parents, avoiding the
  `insertBefore` rendering error reproduced while opening quick settings.
- Release ZIPs include Millennium update metadata; the installer preserves it.
- Six JavaScript suites and the CMD/PowerShell installer suite cover these changes.

Tests remain representative DOM/browser checks, not proof of every Steam page,
account, language, optional plugin or future upstream state. Live Windows captures
and release notes record the additional checks actually performed.

Live checks on 4 November covered Library home with the current official sidebar,
Store home, Portal's Store page, Community, repeated quick-settings opening, and
the utility dropdown in a maximized 2560px window. The rendering exception was
reproduced before the moved-control fix. No further matching exception was seen
during the subsequent checks. No game was launched and no purchase was made.
