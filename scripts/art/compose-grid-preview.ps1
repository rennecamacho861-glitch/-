param(
  [string]$ManifestPath = "public/assets/grid-dungeon/manifest.json",
  [string]$AssetRoot = "public/assets/grid-dungeon",
  [string]$OutputPath = "CCGS-Data/production/qa/evidence/art/grid-dungeon/preview-iter01.png"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Resolve-ProjectPath([string]$Path) {
  if ([System.IO.Path]::IsPathRooted($Path)) { return $Path }
  return (Join-Path (Get-Location) $Path)
}

function New-Canvas([int]$Width, [int]$Height, [System.Drawing.Color]$Color) {
  $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear($Color)
  $graphics.Dispose()
  return $bitmap
}

function Load-AssetMap($manifest, [string]$root) {
  $map = @{}
  foreach ($asset in $manifest.assets) {
    $path = Join-Path $root ([string]$asset.file)
    if (!(Test-Path -LiteralPath $path)) { throw "Missing asset for $($asset.id): $path" }
    $map[$asset.id] = [System.Drawing.Bitmap]::new($path)
  }
  return $map
}

function Draw-Image($graphics, $assets, [string]$id, [int]$x, [int]$y, [int]$w = 0, [int]$h = 0) {
  $image = $assets[$id]
  if ($null -eq $image) { throw "Asset not loaded: $id" }
  if ($w -le 0) { $w = $image.Width }
  if ($h -le 0) { $h = $image.Height }
  $graphics.DrawImage($image, $x, $y, $w, $h)
}

function Draw-Text($graphics, [string]$text, [int]$x, [int]$y, [int]$size = 14) {
  $font = [System.Drawing.Font]::new("Microsoft YaHei", $size, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(218, 226, 212))
  $graphics.DrawString($text, $font, $brush, $x, $y)
  $brush.Dispose()
  $font.Dispose()
}

$manifestFullPath = Resolve-ProjectPath $ManifestPath
$assetFullRoot = Resolve-ProjectPath $AssetRoot
$outputFullPath = Resolve-ProjectPath $OutputPath

$manifest = Get-Content -Raw -LiteralPath $manifestFullPath | ConvertFrom-Json
$tile = [int]$manifest.tileSize
$canvas = New-Canvas 1120 820 ([System.Drawing.Color]::FromArgb(5, 7, 8))
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$assets = Load-AssetMap $manifest $assetFullRoot

try {
  $mapX = 120
  $mapY = 92
  $center = 4

  for ($y = 0; $y -lt 9; $y += 1) {
    for ($x = 0; $x -lt 9; $x += 1) {
      $dx = [Math]::Abs($x - $center)
      $dy = [Math]::Abs($y - $center)
      $max = [Math]::Max($dx, $dy)
      $tileId = if ($max -le 1) {
        "floor-lit"
      } elseif ($max -le 2) {
        "floor-memory"
      } else {
        "floor-fog"
      }
      if ($x -eq 7 -and $y -eq 7) { $tileId = "floor-exit" }
      Draw-Image $graphics $assets $tileId ($mapX + $x * $tile) ($mapY + $y * $tile) $tile $tile
    }
  }

  $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(52, 62, 64), 1)
  for ($i = 0; $i -le 9; $i += 1) {
    $graphics.DrawLine($pen, $mapX, $mapY + $i * $tile, $mapX + 9 * $tile, $mapY + $i * $tile)
    $graphics.DrawLine($pen, $mapX + $i * $tile, $mapY, $mapX + $i * $tile, $mapY + 9 * $tile)
  }
  $pen.Dispose()

  # Boundary walls: draw on grid edges, then overlay corner/T components to prove reusable assembly.
  Draw-Image $graphics $assets "wall-horizontal" ($mapX + 2 * $tile) ($mapY + 2 * $tile - 36) 216 72
  Draw-Image $graphics $assets "wall-horizontal" ($mapX + 4 * $tile) ($mapY + 5 * $tile - 36) 216 72
  Draw-Image $graphics $assets "wall-horizontal" ($mapX + 1 * $tile) ($mapY + 7 * $tile - 36) 216 72
  Draw-Image $graphics $assets "wall-vertical" ($mapX + 2 * $tile - 36) ($mapY + 2 * $tile) 72 216
  Draw-Image $graphics $assets "wall-vertical" ($mapX + 6 * $tile - 36) ($mapY + 1 * $tile) 72 216
  Draw-Image $graphics $assets "wall-vertical" ($mapX + 7 * $tile - 36) ($mapY + 4 * $tile) 72 216
  Draw-Image $graphics $assets "wall-corner-se" ($mapX + 5 * $tile - 36) ($mapY + 2 * $tile - 36) 144 144
  Draw-Image $graphics $assets "wall-corner-nw" ($mapX + 2 * $tile - 36) ($mapY + 5 * $tile - 36) 144 144
  Draw-Image $graphics $assets "wall-door-blocked" ($mapX + 6 * $tile) ($mapY + 3 * $tile - 36) 216 72

  Draw-Image $graphics $assets "prop-wall-lamp" ($mapX + 4 * $tile - 36) ($mapY + 3 * $tile - 56) 144 72
  Draw-Image $graphics $assets "actor-player" ($mapX + 4 * $tile) ($mapY + 4 * $tile - 72) 72 144
  Draw-Image $graphics $assets "prop-cache-box" ($mapX + 5 * $tile) ($mapY + 4 * $tile) 72 72
  Draw-Image $graphics $assets "prop-debris" ($mapX + 1 * $tile) ($mapY + 5 * $tile) 144 72
  Draw-Image $graphics $assets "prop-red-leak" ($mapX + 7 * $tile) ($mapY + 2 * $tile) 72 72

  Draw-Image $graphics $assets "ui-top-hud-frame" 64 20 500 72
  Draw-Text $graphics "Turn 14   Danger 34%   Loot 3/7   HP 21/32" 86 42 18
  Draw-Image $graphics $assets "ui-inventory-strip" 1018 96 72 504
  $itemIds = @("item-pistol", "item-bandage", "item-long-knife", "item-trap", "item-glasses", "item-glow-stick", "item-echo-needle")
  for ($i = 0; $i -lt $itemIds.Count; $i += 1) {
    Draw-Image $graphics $assets $itemIds[$i] 1018 (108 + $i * 70) 72 72
  }
  Draw-Image $graphics $assets "ui-log-panel" 64 604 288 180
  Draw-Text $graphics "You found a cache box." 92 638 16
  Draw-Text $graphics "A low electric hum leaks through the wall." 92 672 16

  New-Item -ItemType Directory -Force (Split-Path -Parent $outputFullPath) | Out-Null
  $canvas.Save($outputFullPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  foreach ($bitmap in $assets.Values) { $bitmap.Dispose() }
  $graphics.Dispose()
  $canvas.Dispose()
}

"Composed preview: $outputFullPath"
