[CmdletBinding()]
param(
    [ValidateSet('x64', 'arm64')]
    [string]$Arch = 'x64',
    [string]$IsccPath = '',
    [switch]$Offline
)

$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$payloadDir = Join-Path $repoRoot ".build\windows-$Arch\payload"
$distDir = Join-Path $repoRoot 'dist'

$nodeCommand = (Get-Command node.exe -ErrorAction Stop).Source
$prepareArgs = @(
    (Join-Path $repoRoot 'build\common\prepare-payload.js'),
    '--platform', 'windows',
    '--arch', $Arch,
    '--output', $payloadDir
)
if ($Offline) { $prepareArgs += '--offline' }
& $nodeCommand @prepareArgs
if ($LASTEXITCODE -ne 0) { throw "Payload preparation failed with exit code $LASTEXITCODE" }

& $nodeCommand (Join-Path $repoRoot 'build\common\verify-payload.js') $payloadDir windows
if ($LASTEXITCODE -ne 0) { throw "Payload verification failed with exit code $LASTEXITCODE" }

if (-not $IsccPath) {
    $candidates = @(
        (Join-Path ${env:ProgramFiles(x86)} 'Inno Setup 6\ISCC.exe'),
        (Join-Path $env:ProgramFiles 'Inno Setup 6\ISCC.exe'),
        (Join-Path $env:LOCALAPPDATA 'Programs\Inno Setup 6\ISCC.exe')
    )
    $IsccPath = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1
}
if (-not $IsccPath -or -not (Test-Path -LiteralPath $IsccPath)) {
    throw 'Inno Setup 6 ISCC.exe was not found. Install Inno Setup 6 on the build machine or pass -IsccPath.'
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
$issPath = Join-Path $repoRoot 'build\windows\installer.iss'
$archDirective = if ($Arch -eq 'arm64') { 'arm64' } else { 'x64compatible' }

foreach ($mode in @('Install', 'Restore')) {
    & $IsccPath "/DSourceRoot=$payloadDir" "/DOutputDir=$distDir" "/DMode=$mode" "/DTargetArch=$archDirective" $issPath
    if ($LASTEXITCODE -ne 0) { throw "Inno Setup $mode build failed with exit code $LASTEXITCODE" }
}

Write-Host "Windows ALT 1.0.0 artifacts created in $distDir"
