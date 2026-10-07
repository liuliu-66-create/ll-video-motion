param(
  [string]$CodexHome = ""
)

$ErrorActionPreference = 'Stop'
$sourceSkill = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..\..')).Path

if ([string]::IsNullOrWhiteSpace($CodexHome)) {
  if (-not [string]::IsNullOrWhiteSpace($env:CODEX_HOME)) {
    $CodexHome = $env:CODEX_HOME
  } else {
    $CodexHome = Join-Path $env:USERPROFILE '.codex'
  }
}

$codexRoot = [System.IO.Path]::GetFullPath($CodexHome)
$skillsRoot = Join-Path $codexRoot 'skills'
$target = Join-Path $skillsRoot 'll-video-motion'
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $skillsRoot ("ll-video-motion.backup-" + $stamp)
$stage = Join-Path $skillsRoot ("ll-video-motion.installing-" + [guid]::NewGuid().ToString('N'))

New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null

$validator = Join-Path $skillsRoot '.system\skill-creator\scripts\quick_validate.py'
if (-not (Test-Path -LiteralPath $validator)) {
  throw "Skill validator not found: $validator"
}

& py -X utf8 $validator $sourceSkill
if ($LASTEXITCODE -ne 0) { throw 'Source skill validation failed. Installed copy was not changed.' }

Copy-Item -LiteralPath $sourceSkill -Destination $stage -Recurse
$runtime = @{ projectRoot = $projectRoot } | ConvertTo-Json
Set-Content -LiteralPath (Join-Path $stage 'runtime.local.json') -Value $runtime -Encoding UTF8

$hadExisting = Test-Path -LiteralPath $target
try {
  if ($hadExisting) {
    Move-Item -LiteralPath $target -Destination $backup
  }
  Move-Item -LiteralPath $stage -Destination $target
  & py -X utf8 $validator $target
  if ($LASTEXITCODE -ne 0) { throw 'Installed skill validation failed.' }
} catch {
  if ((-not (Test-Path -LiteralPath $target)) -and $hadExisting -and (Test-Path -LiteralPath $backup)) {
    Move-Item -LiteralPath $backup -Destination $target
  }
  throw
}

[pscustomobject]@{
  ok = $true
  source = $sourceSkill
  target = $target
  backup = $(if ($hadExisting) { $backup } else { $null })
  projectRoot = $projectRoot
} | ConvertTo-Json -Depth 4
