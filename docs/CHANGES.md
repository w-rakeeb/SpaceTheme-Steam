# Change map

Compared with SpaceTheme/Steam `91a380421757233340e17040fae2b866c43c2f20`.

| File | Change |
| --- | --- |
| `skin.json` | Top-right/original-sidebar setting; update metadata points to this fork. |
| `options/general/userpanel/topRight.css` | Header position, centered navigation, profile, pinned icons, reload/storage styling, responsive dropdown. |
| `src/js/headerControls.js` | Groups original controls; adds reload, dropdown and Storage; handles dismissal and leftward placement. |
| `src/js/libraryroot.custom.js` | Imports and initializes the module after the utility container is built. |
| `src/css/steam/sidebar.css` | Conditional spacing and idle download icon. |
| `options/general/alwaysShowDownloadbar.css` | Uses the same profile spacing variables. |
| `src/css/libraryroot.custom.css` | Removes Size on Disk styling import. |
| `src/css/plugins/sizeOnDisk.css` | Removed; plugins are installed separately. |
| `tests/header-layout.cjs` | Browser fixture regression/layout checks. |
| Documentation/screenshots | Fork instructions, changes, validation, attribution. |

Store, Community, Friends & Chat, game pages, overlay, downloading, library data,
theme colors, fonts, and other options retain their upstream code apart from
the changes listed above. This is a source comparison, not an exhaustive test of
every inherited feature.

## Implementation details

- Reload calls `Browser.RestartJSContext()`; disabled if the API is absent.
- Storage calls `URL.ExecuteSteamURL('steam://open/settings/storage')`; disabled
  if unavailable. It opens settings, without moving or uninstalling games.
- The menu's right edge aligns to its arrow's right edge so it opens leftward,
  with a lower bound at the header group's left edge.
- A null `focusout.relatedTarget` no longer dismisses the dropdown before a
  non-focusable Steam icon receives its click.
- The pinned group retains the upstream container class so existing hide-button
  rules continue to reach News, Notifications, and Friends.
- Avatar holder, inner avatar, and image use the same dimensions. Profile
  overflow is not clipped.
- When the top-right stylesheet is absent, spacing variables fall back to the
  original sidebar values.

No plugin source/build, local configuration, activation utility, machine backup,
credential, crash dump, or system-maintenance script is shipped.
