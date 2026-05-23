param(
  [string]$ProjectRoot = (Resolve-Path ".").Path,
  [string]$CodexRoot = (Join-Path $env:USERPROFILE ".codex")
)

$ErrorActionPreference = "Stop"

$workflowRoot = Join-Path $ProjectRoot ".ccgs-core\workflows"
$standardSkillsRoot = Join-Path $workflowRoot "skills"
$codexSkillsRoot = Join-Path $CodexRoot "skills"

if (-not (Test-Path -LiteralPath $workflowRoot)) {
  throw "CCGS workflows directory not found: $workflowRoot"
}

New-Item -ItemType Directory -Force -Path $codexSkillsRoot | Out-Null

$created = 0
$updated = 0
$existing = 0
$skipped = 0

function Write-ManagedTextFile {
  param(
    [string]$Path,
    [string]$Content
  )

  $needsWrite = $true
  if (Test-Path -LiteralPath $Path) {
    $existingContent = Get-Content -Raw -Encoding UTF8 -LiteralPath $Path
    $needsWrite = ($existingContent -ne $Content)
  }

  if ($needsWrite) {
    Set-Content -Encoding UTF8 -LiteralPath $Path -Value $Content
    return $true
  }

  return $false
}

function Test-IsManagedBy {
  param(
    [string]$TargetPath,
    [string]$SourcePath
  )

  $sourceMarker = Join-Path $TargetPath ".ccgs-source"
  if (-not (Test-Path -LiteralPath $sourceMarker)) {
    return $false
  }

  $managedSource = (Get-Content -Raw -Encoding UTF8 -LiteralPath $sourceMarker).Trim()
  return $managedSource -eq $SourcePath
}

function Set-ManagementMarkers {
  param(
    [string]$TargetPath,
    [string]$SourcePath,
    [string]$Kind
  )

  Set-Content -Encoding UTF8 -LiteralPath (Join-Path $TargetPath ".ccgs-source") -Value $SourcePath
  Set-Content -Encoding UTF8 -LiteralPath (Join-Path $TargetPath ".ccgs-kind") -Value $Kind
}

function Install-StandardSkill {
  param([System.IO.DirectoryInfo]$SkillDir)

  $skillName = $SkillDir.Name
  $targetPath = Join-Path $codexSkillsRoot $skillName
  $sourcePath = $SkillDir.FullName

  if ((Test-Path -LiteralPath $targetPath) -and -not (Test-Path -PathType Container -LiteralPath $targetPath)) {
    Write-Host "SKIP ${skillName}: target exists and is not a directory"
    $script:skipped += 1
    return
  }

  if (Test-Path -LiteralPath $targetPath) {
    if (-not (Test-IsManagedBy -TargetPath $targetPath -SourcePath $sourcePath)) {
      $marker = Join-Path $targetPath ".ccgs-source"
      if (-not (Test-Path -LiteralPath $marker)) {
        Write-Host "SKIP ${skillName}: existing non-CCGS skill directory"
        $script:skipped += 1
        return
      }
      Write-Host "SKIP ${skillName}: managed by another CCGS source"
      $script:skipped += 1
      return
    }
    $script:existing += 1
  } else {
    New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
    $script:created += 1
  }

  Get-ChildItem -LiteralPath $sourcePath -Force | ForEach-Object {
    $dest = Join-Path $targetPath $_.Name
    if ($_.PSIsContainer) {
      if (Test-Path -LiteralPath $dest) {
        Remove-Item -Recurse -Force -LiteralPath $dest
      }
      Copy-Item -Recurse -Force -LiteralPath $_.FullName -Destination $dest
      $script:updated += 1
    } else {
      $copy = $true
      if (Test-Path -LiteralPath $dest) {
        $srcHash = Get-FileHash -Algorithm SHA256 -LiteralPath $_.FullName
        $dstHash = Get-FileHash -Algorithm SHA256 -LiteralPath $dest
        $copy = ($srcHash.Hash -ne $dstHash.Hash)
      }
      if ($copy) {
        Copy-Item -Force -LiteralPath $_.FullName -Destination $dest
        $script:updated += 1
      }
    }
  }

  Set-ManagementMarkers -TargetPath $targetPath -SourcePath $sourcePath -Kind "skill"
  Write-Host "OK   $skillName"
}

function Get-WrapperKindAndInstruction {
  param([string]$Path)

  if ($Path -like "*\Tier1-Directors\*") {
    return @{
      Kind = "Tier 1 Director Agent"
      Instruction = "Read the source role definition in full, then adopt exactly this strategic director role for the user's requested work."
    }
  }
  if ($Path -like "*\Tier2-Leads\*") {
    return @{
      Kind = "Tier 2 Lead Agent"
      Instruction = "Read the source role definition in full, then adopt exactly this lead role for the user's requested work."
    }
  }
  if ($Path -like "*\Tier3-Specialists\*") {
    return @{
      Kind = "Tier 3 Specialist Agent"
      Instruction = "Read the source role definition in full, then adopt exactly this specialist role for the user's requested work."
    }
  }
  if ((Split-Path -Leaf $Path) -eq "pipeline-core.md") {
    return @{
      Kind = "Pipeline Core"
      Instruction = "Read the source workflow in full, then use it as the CCGS phase and gate protocol for the user's requested work."
    }
  }
  return @{
    Kind = "Workflow Document"
    Instruction = "Read and follow this workflow document for the user's requested work."
  }
}

function Install-WorkflowWrapper {
  param([System.IO.FileInfo]$Doc)

  $sourcePath = $Doc.FullName
  if ($sourcePath -like "*\workflows\skills\*\SKILL.md") {
    return
  }

  $skillName = [System.IO.Path]::GetFileNameWithoutExtension($Doc.Name)
  $targetPath = Join-Path $codexSkillsRoot $skillName

  if ((Test-Path -LiteralPath $targetPath) -and -not (Test-Path -PathType Container -LiteralPath $targetPath)) {
    Write-Host "SKIP ${skillName}: target exists and is not a directory"
    $script:skipped += 1
    return
  }

  if (Test-Path -LiteralPath $targetPath) {
    if (-not (Test-IsManagedBy -TargetPath $targetPath -SourcePath $sourcePath)) {
      $marker = Join-Path $targetPath ".ccgs-source"
      if (-not (Test-Path -LiteralPath $marker)) {
        Write-Host "SKIP ${skillName}: existing non-CCGS skill directory"
        $script:skipped += 1
        return
      }
      Write-Host "SKIP ${skillName}: managed by another CCGS source"
      $script:skipped += 1
      return
    }
    $script:existing += 1
  } else {
    New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
    $script:created += 1
  }

  $meta = Get-WrapperKindAndInstruction -Path $sourcePath
  $sourceForMarkdown = $sourcePath.Replace("\", "/")
  $content = @"
---
name: $skillName
description: "CCGS $($meta.Kind) wrapper for $skillName. Loads the original workflow document and applies it in Codex."
argument-hint: "[request/context]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# CCGS $($meta.Kind): $skillName

Source document: $sourceForMarkdown

## Invocation Protocol

1. Read the source document above in full before acting.
2. $($meta.Instruction)
3. Keep the active role or workflow scoped to this invocation unless another CCGS Skill explicitly routes to a different role.
4. For code changes, also follow .ccgs-core/workflows/pipeline-core.md, .ccgs-core/docs/technical-preferences.md, and .ccgs-core/docs/coding-standards.md.
5. If this wrapper conflicts with the source document, the source document wins.

This file is generated by scripts/install-ccgs-codex-skills.ps1; edit the source document instead of this wrapper.
"@

  $skillFile = Join-Path $targetPath "SKILL.md"
  if (Write-ManagedTextFile -Path $skillFile -Content $content) {
    $script:updated += 1
  }

  Set-ManagementMarkers -TargetPath $targetPath -SourcePath $sourcePath -Kind "workflow-doc"
  Write-Host "OK   $skillName"
}

if (Test-Path -LiteralPath $standardSkillsRoot) {
  Get-ChildItem -LiteralPath $standardSkillsRoot -Directory | Sort-Object Name | ForEach-Object {
    if (Test-Path -LiteralPath (Join-Path $_.FullName "SKILL.md")) {
      Install-StandardSkill -SkillDir $_
    }
  }
}

Get-ChildItem -LiteralPath $workflowRoot -Recurse -File -Filter "*.md" | Sort-Object FullName | ForEach-Object {
  Install-WorkflowWrapper -Doc $_
}

$summary = "CCGS Codex skills installed: created=$created updated=$updated existing=$existing skipped=$skipped target=$codexSkillsRoot"
Write-Host ""
Write-Host $summary
