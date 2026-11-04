$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot
$root = Join-Path (Split-Path $repo) ('work\installer-test-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $root -Force | Out-Null

function Assert($Condition, $Message) {
    if (-not $Condition) { throw $Message }
}
function New-Fixture([string]$Name, [string]$Json) {
    $path = Join-Path $root $Name
    New-Item -ItemType Directory -Path (Join-Path $path 'millennium\config') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $path 'millennium\bin') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $path 'millennium\themes\Steam') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $path 'steam.exe') -Value ''
    Set-Content -LiteralPath (Join-Path $path 'millennium\config\config.json') -Value $Json
    Set-Content -LiteralPath (Join-Path $path 'millennium\themes\Steam\old.txt') -Value 'keep me'
    return $path
}
function Install([string]$Path) {
    '' | & (Join-Path $repo 'Install.cmd') -SteamPath $Path -NoLaunch | Out-Host
    return $LASTEXITCODE
}

$fixture = New-Fixture 'Steam with spaces' '{"general":{"keep":42},"plugins":{"enabledPlugins":["keep-plugin"]},"themes":{"conditions":{"Steam":{"Font":"Keep font"}},"activeTheme":"old"}}'
Assert ((Install $fixture) -eq 0) 'Installation failed.'
$config = Get-Content -LiteralPath (Join-Path $fixture 'millennium\config\config.json') -Raw | ConvertFrom-Json
Assert ($config.themes.activeTheme -eq 'Steam') 'Theme was not activated.'
Assert ($config.themes.conditions.Steam.'Userpanel position' -eq 'Top right') 'Profile position missing.'
Assert ($config.themes.conditions.Steam.Font -eq 'Keep font') 'Existing theme settings lost.'
Assert ($config.general.keep -eq 42 -and $config.plugins.enabledPlugins[0] -eq 'keep-plugin') 'Unrelated configuration changed.'
$backup = Get-ChildItem -LiteralPath (Join-Path $fixture 'millennium\backups') -Directory | Select-Object -First 1
Assert (Test-Path -LiteralPath (Join-Path $backup.FullName 'previous-theme\old.txt')) 'Original theme was not backed up.'
Assert ((Get-FileHash (Join-Path $fixture 'millennium\themes\Steam\skin.json')).Hash -eq (Get-FileHash (Join-Path $repo 'skin.json')).Hash) 'Installed theme mismatch.'
Assert ((Install $fixture) -eq 0) 'Repeat installation failed.'

$invalid = New-Fixture 'invalid config' '{broken'
Assert ((Install $invalid) -ne 0) 'Malformed configuration was accepted.'
Assert (Test-Path -LiteralPath (Join-Path $invalid 'millennium\themes\Steam\old.txt')) 'Invalid install modified the original theme.'
$unsupported = New-Fixture 'unsupported config' '{"themes":42}'
Assert ((Install $unsupported) -ne 0) 'Unsupported configuration structure was accepted.'
Assert (Test-Path -LiteralPath (Join-Path $unsupported 'millennium\themes\Steam\old.txt')) 'Unsupported config modified the original theme.'

$locked = New-Fixture 'locked configuration' '{}'
$lockedConfig = Join-Path $locked 'millennium\config\config.json'
$handle = [IO.File]::Open($lockedConfig, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
try { Assert ((Install $locked) -ne 0) 'Locked configuration unexpectedly replaced.' } finally { $handle.Dispose() }
Assert (Test-Path -LiteralPath (Join-Path $locked 'millennium\themes\Steam\old.txt')) 'Rollback did not restore the original theme.'
Assert ((Get-Content -LiteralPath $lockedConfig -Raw).Trim() -eq '{}') 'Failed installation changed config.'
Write-Host "PASS: activation, preserved settings/plugins, backups, repeat install, malformed config, and rollback. Fixtures: $root"
