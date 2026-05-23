param(
  [string]$ManifestPath = "public/assets/grid-dungeon/manifest.json",
  [string]$AssetRoot = "public/assets/grid-dungeon"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Resolve-ProjectPath([string]$Path) {
  if ([System.IO.Path]::IsPathRooted($Path)) { return $Path }
  return (Join-Path (Get-Location) $Path)
}

$manifest = Get-Content -Raw -LiteralPath (Resolve-ProjectPath $ManifestPath) | ConvertFrom-Json
$root = Resolve-ProjectPath $AssetRoot
$missing = @()
$invalidSize = @()
$transparentFailures = @()

foreach ($asset in $manifest.assets) {
  $path = Join-Path $root ([string]$asset.file)
  if (!(Test-Path -LiteralPath $path)) {
    $missing += $asset.id
    continue
  }
  $bitmap = [System.Drawing.Bitmap]::new($path)
  try {
    $width = [int]$bitmap.Width
    $height = [int]$bitmap.Height
    if ($width -ne [int]$asset.outputSize.w -or $height -ne [int]$asset.outputSize.h) {
      $invalidSize += "$($asset.id) expected $($asset.outputSize.w)x$($asset.outputSize.h), got ${width}x${height}"
    }
    $transparentPixels = 0
    $samplePoints = @(
      @(0, 0),
      @(($width - 1), 0),
      @(0, ($height - 1)),
      @(($width - 1), ($height - 1))
    )
    foreach ($point in $samplePoints) {
      if ($bitmap.GetPixel($point[0], $point[1]).A -eq 0) { $transparentPixels += 1 }
    }
    $allowsFullFrame = $asset.category -eq "tiles" -or [bool]$asset.fullFrameOverlay
    if (!$allowsFullFrame -and $transparentPixels -eq 0) { $transparentFailures += $asset.id }
  } finally {
    $bitmap.Dispose()
  }
}

if ($missing.Count -gt 0) { throw "Missing assets: $($missing -join ', ')" }
if ($invalidSize.Count -gt 0) { throw "Invalid sizes: $($invalidSize -join '; ')" }
if ($transparentFailures.Count -gt 0) { throw "No transparent corner samples: $($transparentFailures -join ', ')" }

"Validated $($manifest.assets.Count) grid-dungeon assets."
