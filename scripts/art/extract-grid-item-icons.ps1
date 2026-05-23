param(
  [string]$ManifestPath = "public/assets/grid-dungeon/manifest.json",
  [string]$OutputRoot = "public/assets/grid-dungeon",
  [int]$GreenTolerance = 92,
  [int]$AlphaFloor = 32
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Resolve-ProjectPath([string]$Path) {
  if ([System.IO.Path]::IsPathRooted($Path)) { return $Path }
  return (Join-Path (Get-Location) $Path)
}

function New-TransparentBitmap([int]$Width, [int]$Height) {
  $bitmap = [System.Drawing.Bitmap]::new($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.Dispose()
  return $bitmap
}

function Test-ChromaGreen([System.Drawing.Color]$Pixel, [int]$Tolerance) {
  $maxNonGreen = [Math]::Max([int]$Pixel.R, [int]$Pixel.B)
  $exactKey = $Pixel.G -ge (255 - $Tolerance) -and $Pixel.R -le $Tolerance -and $Pixel.B -le $Tolerance
  $spillKey = $Pixel.G -ge 96 -and $Pixel.R -le ($Tolerance + 38) -and $Pixel.B -le ($Tolerance + 38) -and (($Pixel.G - $maxNonGreen) -ge 42)
  return $exactKey -or $spillKey
}

function Remove-ChromaGreen([System.Drawing.Bitmap]$Bitmap, [int]$Tolerance) {
  for ($y = 0; $y -lt $Bitmap.Height; $y += 1) {
    for ($x = 0; $x -lt $Bitmap.Width; $x += 1) {
      $pixel = $Bitmap.GetPixel($x, $y)
      if (Test-ChromaGreen $pixel $Tolerance) {
        $Bitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
      }
    }
  }
}

function Test-AdjacentTransparent([System.Drawing.Bitmap]$Bitmap, [int]$X, [int]$Y) {
  for ($dy = -1; $dy -le 1; $dy += 1) {
    for ($dx = -1; $dx -le 1; $dx += 1) {
      if ($dx -eq 0 -and $dy -eq 0) { continue }
      $nx = $X + $dx
      $ny = $Y + $dy
      if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $Bitmap.Width -or $ny -ge $Bitmap.Height) { return $true }
      if ($Bitmap.GetPixel($nx, $ny).A -eq 0) { return $true }
    }
  }
  return $false
}

function Despill-GreenEdges([System.Drawing.Bitmap]$Bitmap) {
  for ($y = 0; $y -lt $Bitmap.Height; $y += 1) {
    for ($x = 0; $x -lt $Bitmap.Width; $x += 1) {
      $pixel = $Bitmap.GetPixel($x, $y)
      if ($pixel.A -eq 0) { continue }
      $maxNonGreen = [Math]::Max([int]$pixel.R, [int]$pixel.B)
      if (($pixel.G - $maxNonGreen) -gt 22 -and (Test-AdjacentTransparent $Bitmap $x $y)) {
        $newGreen = [Math]::Min([int]$pixel.G, $maxNonGreen + 18)
        $Bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($pixel.A, $pixel.R, $newGreen, $pixel.B))
      }
    }
  }
}

function Clean-AlphaFloor([System.Drawing.Bitmap]$Bitmap, [int]$AlphaFloor) {
  for ($y = 0; $y -lt $Bitmap.Height; $y += 1) {
    for ($x = 0; $x -lt $Bitmap.Width; $x += 1) {
      $pixel = $Bitmap.GetPixel($x, $y)
      if ($pixel.A -gt 0 -and $pixel.A -lt $AlphaFloor) {
        $Bitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
      }
    }
  }
}

function Resize-Bitmap([System.Drawing.Bitmap]$Bitmap, [int]$Width, [int]$Height) {
  $resized = New-TransparentBitmap $Width $Height
  $graphics = [System.Drawing.Graphics]::FromImage($resized)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
  $graphics.DrawImage($Bitmap, 0, 0, $Width, $Height)
  $graphics.Dispose()
  return $resized
}

$manifest = Get-Content -Raw -LiteralPath (Resolve-ProjectPath $ManifestPath) | ConvertFrom-Json
$outputFullRoot = Resolve-ProjectPath $OutputRoot
$sourceCache = @{}
$written = @()

function Get-SourceBitmap([string]$Path, [hashtable]$Cache) {
  $fullPath = Resolve-ProjectPath $Path
  if (!(Test-Path -LiteralPath $fullPath)) { throw "Source image not found: $fullPath" }
  if (!$Cache.ContainsKey($fullPath)) {
    $Cache[$fullPath] = [System.Drawing.Bitmap]::new($fullPath)
  }
  return $Cache[$fullPath]
}

try {
  $iconAssets = $manifest.assets | Where-Object {
    $_.PSObject.Properties.Name -contains "sourceImage" -and [string]$_.sourceImage -like "*item-icons-*"
  }
  foreach ($asset in $iconAssets) {
    $source = Get-SourceBitmap ([string]$asset.sourceImage) $sourceCache
    $rect = [System.Drawing.Rectangle]::new(
      [int]$asset.sourceRect.x,
      [int]$asset.sourceRect.y,
      [int]$asset.sourceRect.w,
      [int]$asset.sourceRect.h
    )
    if ($rect.Right -gt $source.Width -or $rect.Bottom -gt $source.Height) {
      throw "Source rect for $($asset.id) exceeds source image bounds."
    }

    $cropped = $source.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $final = Resize-Bitmap $cropped ([int]$asset.outputSize.w) ([int]$asset.outputSize.h)
    $cropped.Dispose()
    Remove-ChromaGreen $final $GreenTolerance
    Despill-GreenEdges $final
    Clean-AlphaFloor $final $AlphaFloor

    $outPath = Join-Path $outputFullRoot ([string]$asset.file)
    $outDir = Split-Path -Parent $outPath
    New-Item -ItemType Directory -Force $outDir | Out-Null
    $final.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $final.Dispose()
    $written += $outPath
  }
} finally {
  foreach ($source in $sourceCache.Values) {
    $source.Dispose()
  }
}

"Extracted $($written.Count) item icons."
$written | ForEach-Object { " - $_" }
