[CmdletBinding()]
param(
    [string]$SteamPath,
    [switch]$NoLaunch
)

$ErrorActionPreference = 'Stop'

function Set-Property($Object, [string]$Name, $Value) {
    $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value -Force
}

function Read-Configuration([string]$Path) {
    $value = Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
    if ($null -eq $value -or $value -isnot [pscustomobject]) { throw 'Millennium configuration must be a JSON object.' }
    foreach ($section in @($value, $value.general, $value.themes, $value.themes.conditions, $value.themes.conditions.Steam)) {
        if ($null -ne $section -and $section -isnot [pscustomobject]) {
            throw 'Millennium configuration has an unsupported structure. No configuration was changed.'
        }
    }
    if ($null -eq $value) { throw 'Millennium configuration is empty.' }
    return $value
}

function Assert-NoLink([string]$Path) {
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
    while ($null -ne $item) {
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
            throw "Linked folders/files are not supported by this installer: $($item.FullName)"
        }
        $item = $item.Parent
    }
}

$backup = $null
$oldThemeMoved = $false
$newThemeMoved = $false
$configWriteStarted = $false
try {
    Write-Host 'SpaceTheme - Top Right Edition' -ForegroundColor Cyan
    foreach ($required in @('skin.json', 'src', 'options', 'LICENSE')) {
        if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot $required))) {
            throw 'Extract the complete theme ZIP first, then run Install.cmd inside the extracted folder.'
        }
    }
    $manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'skin.json') -Raw | ConvertFrom-Json
    if ($manifest.github.owner -ne 'w-rakeeb' -or $manifest.github.repo_name -ne 'SpaceTheme-Steam') {
        throw 'This installer requires the SpaceTheme Top Right Edition package.'
    }

    if (-not $SteamPath) {
        $candidates = @(
            (Get-ItemProperty 'HKCU:\Software\Valve\Steam' -ErrorAction SilentlyContinue).SteamPath
            (Get-ItemProperty 'HKLM:\SOFTWARE\WOW6432Node\Valve\Steam' -ErrorAction SilentlyContinue).InstallPath
            (Get-ItemProperty 'HKLM:\SOFTWARE\Valve\Steam' -ErrorAction SilentlyContinue).InstallPath
            (Join-Path ${env:ProgramFiles(x86)} 'Steam')
        )
        $SteamPath = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath (Join-Path $_ 'steam.exe')) } | Select-Object -First 1
    }
    if (-not $SteamPath -or -not (Test-Path -LiteralPath (Join-Path $SteamPath 'steam.exe'))) {
        throw 'Steam was not found. Install Steam, or run Install.cmd -SteamPath "C:\your\Steam".'
    }
    $SteamPath = (Resolve-Path -LiteralPath $SteamPath).Path
    $millennium = Join-Path $SteamPath 'millennium'
    $configPath = Join-Path $millennium 'config\config.json'
    $themes = Join-Path $millennium 'themes'
    $target = Join-Path $themes 'Steam'
    Assert-NoLink $SteamPath
    Assert-NoLink $configPath
    Assert-NoLink $themes
    Assert-NoLink $target
    if (-not (Test-Path -LiteralPath $configPath) -or -not (Test-Path -LiteralPath (Join-Path $millennium 'bin'))) {
        throw 'Install Millennium from https://steambrew.app/ and start Steam once, then run this installer again.'
    }
    if ($PSScriptRoot.TrimEnd('\') -eq $target.TrimEnd('\') -or $PSScriptRoot.StartsWith($target.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
        throw 'Run this installer from an extracted download outside the installed theme folder.'
    }
    # Validate configuration before asking Steam to close or changing any files.
    $null = Read-Configuration $configPath
    Write-Host "Detected Steam: $SteamPath"
    $steamExe = Join-Path $SteamPath 'steam.exe'
    $steamProcesses = @(Get-Process -Name steam -ErrorAction SilentlyContinue)
    if ($steamProcesses | Where-Object { -not $_.Path }) {
        throw 'A Steam process cannot be inspected. Close Steam normally, then run this installer again.'
    }
    $running = @($steamProcesses | Where-Object { $_.Path -eq $steamExe })
    if ($running.Count) {
        $runningGame = (Get-ItemProperty 'HKCU:\Software\Valve\Steam' -ErrorAction SilentlyContinue).RunningAppID
        if ($runningGame -and $runningGame -ne 0) {
            throw 'A Steam game is running. Close the game and run Install.cmd again.'
        }
        Write-Host 'Closing Steam normally. No process will be force-killed.'
        Start-Process -FilePath $steamExe -ArgumentList '-shutdown'
        $deadline = [DateTime]::UtcNow.AddSeconds(60)
        do {
            Start-Sleep -Milliseconds 500
            $running = @(Get-Process -Name steam -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $steamExe })
        } while ($running.Count -and [DateTime]::UtcNow -lt $deadline)
        if ($running.Count) { throw 'Steam is still open. Close it normally, then run Install.cmd again.' }
    }

    $config = Read-Configuration $configPath
    foreach ($section in @('general', 'themes')) {
        if ($null -eq $config.$section) { Set-Property $config $section ([pscustomobject]@{}) }
    }
    if ($null -eq $config.themes.conditions) { Set-Property $config.themes 'conditions' ([pscustomobject]@{}) }
    if ($null -eq $config.themes.conditions.Steam) { Set-Property $config.themes.conditions 'Steam' ([pscustomobject]@{}) }
    Set-Property $config.themes 'activeTheme' 'Steam'
    Set-Property $config.themes 'allowedScripts' $true
    Set-Property $config.themes 'allowedStyles' $true
    Set-Property $config.general 'injectCSS' $true
    Set-Property $config.general 'injectJavascript' $true
    Set-Property $config.themes.conditions.Steam 'Userpanel position' 'Top right'
    $json = $config | ConvertTo-Json -Depth 100

    $backup = Join-Path $millennium ('backups\SpaceTheme-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
    Assert-NoLink (Join-Path $millennium 'backups')
    New-Item -ItemType Directory -Path $backup -Force | Out-Null
    Copy-Item -LiteralPath $configPath -Destination (Join-Path $backup 'config.json')
    $stage = Join-Path $backup 'new-theme'
    New-Item -ItemType Directory -Path $stage | Out-Null
    foreach ($name in @('skin.json', 'src', 'options', 'LICENSE')) {
        $source = Join-Path $PSScriptRoot $name
        Assert-NoLink $source
        if (Get-ChildItem -LiteralPath $source -Recurse -Force | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) {
            throw "The package contains linked files: $name"
        }
        Copy-Item -LiteralPath $source -Destination $stage -Recurse
    }
    foreach ($file in Get-ChildItem -LiteralPath $stage -File -Recurse) {
        $relative = $file.FullName.Substring($stage.Length + 1)
        if ((Get-FileHash -LiteralPath $file.FullName).Hash -ne (Get-FileHash -LiteralPath (Join-Path $PSScriptRoot $relative)).Hash) {
            throw "Copy verification failed: $relative"
        }
    }
    New-Item -ItemType Directory -Path $themes -Force | Out-Null
    if (Test-Path -LiteralPath $target) {
        Move-Item -LiteralPath $target -Destination (Join-Path $backup 'previous-theme')
        $oldThemeMoved = $true
    }
    Move-Item -LiteralPath $stage -Destination $target
    $newThemeMoved = $true
    $tempConfig = Join-Path (Split-Path $configPath) ('config-' + [guid]::NewGuid().ToString('N') + '.tmp')
    [IO.File]::WriteAllText($tempConfig, $json, (New-Object Text.UTF8Encoding($false)))
    [IO.File]::Replace($tempConfig, $configPath, (Join-Path $backup 'config-before-replace.json'))
    $configWriteStarted = $true
    Write-Host 'Installed and enabled SpaceTheme with the top-right profile.' -ForegroundColor Green
    Write-Host "Backup: $backup"
    if (-not $NoLaunch) { Start-Process -FilePath $steamExe -WorkingDirectory $SteamPath }
    exit 0
} catch {
    $failure = $_.Exception.Message
    try {
        if ($configWriteStarted) { Copy-Item -LiteralPath (Join-Path $backup 'config.json') -Destination $configPath -Force }
        if ($newThemeMoved) { Move-Item -LiteralPath $target -Destination (Join-Path $backup 'failed-theme') }
        if ($oldThemeMoved) { Move-Item -LiteralPath (Join-Path $backup 'previous-theme') -Destination $target }
    } catch {
        Write-Host "Automatic rollback needs attention: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host "Installation stopped: $failure" -ForegroundColor Red
    if ($backup) { Write-Host "Recovery files: $backup" }
    exit 1
}
