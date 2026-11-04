# Windows automatic installer

Extract the release ZIP, then double-click `Steam/Install.cmd`. Steam is detected
automatically; no copying into Steam or selecting the theme manually is needed.
Millennium must already be installed and have been run once.

The CMD launcher runs the adjacent PowerShell script with a process-only execution
policy override. It does not persistently change Windows execution policy or
download/execute remote scripts. It uses built-in Windows PowerShell 5.1.

Detection checks HKCU Valve SteamPath, then the 32-bit and 64-bit HKLM Valve
InstallPath values, then the standard Program Files (x86) Steam directory. The
selected directory must contain steam.exe. Advanced use:

```
Install.cmd -SteamPath "D:\Steam"
Install.cmd -SteamPath "D:\Steam" -NoLaunch
```

Steam is asked to shut down normally, with a 60-second timeout. An active game
reported by Steam blocks installation. No process is force-killed. Configuration
is reread after Steam closes. Only theme activation, script/style permissions,
CSS/JS injection, and the top-right profile condition are set; other values remain.

The installer stages and hash-checks the package, backs up configuration and moves
any previous theme into a unique backup directory, then installs the theme and
atomically replaces config.json. A failed installation attempts rollback and
prints the backup path. Linked folders are rejected rather than followed.
Backups and failed staging files are retained for recovery, not deleted.

## Verification

Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tests/installer.ps1`
from a development checkout. It uses isolated fake Steam folders outside the
repository and exercises the actual CMD launcher with spaces in paths, theme
activation, preserved settings/plugins, old-theme backups, repeat installation,
malformed config rejection and rollback when config replacement is locked.

Real Steam shutdown/restart, registry detection on another PC, restricted install
permissions, and third-party antivirus handling require recipient-PC checks.
The installer does not install/update Millennium itself or alter game files.
