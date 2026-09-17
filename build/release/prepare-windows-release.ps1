[CmdletBinding()]
param(
    [string]$DistDir = '',
    [string]$OutputDir = ''
)

$ErrorActionPreference = 'Stop'
$repoRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))

if (-not $DistDir) {
    $DistDir = Join-Path $repoRoot 'dist'
}
if (-not $OutputDir) {
    $OutputDir = Join-Path $repoRoot 'release-assets'
}

$DistDir = [IO.Path]::GetFullPath($DistDir)
$OutputDir = [IO.Path]::GetFullPath($OutputDir)

if ($DistDir.TrimEnd('\') -eq $OutputDir.TrimEnd('\')) {
    throw 'DistDir and OutputDir must be different. Release assets require an isolated staging directory.'
}

$packageJsonPath = Join-Path $repoRoot 'package.json'
$packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
$version = [string]$packageJson.version
if ($version -notmatch '^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$') {
    throw "Invalid package.json version: $version"
}

$versionedInstallName = "Antigravity-ZH-Hant-TW-ALT-$version-Windows.exe"
$versionedRestoreName = "Antigravity-ZH-Hant-TW-ALT-$version-Windows-Restore.exe"
$publicInstallName = 'Antigravity-ZH-Hant-TW-ALT-Windows.exe'
$publicRestoreName = 'Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe'
$checksumName = 'SHA256SUMS.txt'

$sources = @(
    @{ Source = Join-Path $DistDir $versionedInstallName; TargetName = $publicInstallName },
    @{ Source = Join-Path $DistDir $versionedRestoreName; TargetName = $publicRestoreName }
)

foreach ($item in $sources) {
    if (-not (Test-Path -LiteralPath $item.Source -PathType Leaf)) {
        throw "Missing Windows build artifact: $($item.Source)"
    }
    if ((Get-Item -LiteralPath $item.Source).Length -le 0) {
        throw "Windows build artifact is empty: $($item.Source)"
    }
}

$expectedNames = @($publicInstallName, $publicRestoreName, $checksumName)
if (Test-Path -LiteralPath $OutputDir) {
    $unexpected = Get-ChildItem -LiteralPath $OutputDir -Force | Where-Object { $expectedNames -notcontains $_.Name }
    if ($unexpected) {
        $names = ($unexpected | ForEach-Object { $_.Name }) -join ', '
        throw "Release staging directory contains unexpected files; refusing to continue: $names"
    }
} else {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

foreach ($name in $expectedNames) {
    $existing = Join-Path $OutputDir $name
    if (Test-Path -LiteralPath $existing) {
        Remove-Item -LiteralPath $existing -Force
    }
}

$checksumLines = @()
foreach ($item in $sources) {
    $target = Join-Path $OutputDir $item.TargetName
    Copy-Item -LiteralPath $item.Source -Destination $target

    $sourceHash = (Get-FileHash -LiteralPath $item.Source -Algorithm SHA256).Hash.ToLowerInvariant()
    $targetHash = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($sourceHash -ne $targetHash) {
        throw "Release staging copy checksum mismatch: $($item.TargetName)"
    }

    $checksumLines += "$targetHash *$($item.TargetName)"
}

$checksumPath = Join-Path $OutputDir $checksumName
[IO.File]::WriteAllLines($checksumPath, $checksumLines, (New-Object Text.UTF8Encoding($false)))

$actualNames = @(Get-ChildItem -LiteralPath $OutputDir -File | ForEach-Object { $_.Name } | Sort-Object)
$expectedSorted = @($expectedNames | Sort-Object)
if (($actualNames -join "`n") -ne ($expectedSorted -join "`n")) {
    throw "Release staging output does not match the expected asset set. Actual: $($actualNames -join ', ')"
}

Write-Host "Windows Release assets staged for ALT ${version}:"
foreach ($name in $expectedNames) {
    Write-Host "  $(Join-Path $OutputDir $name)"
}
Write-Host 'Create or verify the GitHub Release manually and upload only the three files listed above.'
