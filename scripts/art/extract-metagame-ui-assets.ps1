param(
  [Parameter(Mandatory = $true)]
  [string]$Source,

  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$sourceDir = Join-Path $ProjectRoot "CCGS-Data\design\art\source\metagame-ui"
$outDir = Join-Path $ProjectRoot "public\assets\grid-dungeon\ui"
New-Item -ItemType Directory -Force -Path $sourceDir, $outDir | Out-Null

$sourceCopy = Join-Path $sourceDir "metagame-ui-shell-iter01.png"
Copy-Item -LiteralPath $sourcePath -Destination $sourceCopy -Force

function Test-ChromaKeyPixel {
  param([System.Drawing.Color]$Color)
  return $Color.G -gt 130 -and $Color.G -gt ($Color.R * 1.35) -and $Color.G -gt ($Color.B * 1.35)
}

function Export-Crop {
  param(
    [System.Drawing.Bitmap]$SourceImage,
    [string]$FileName,
    [int]$X,
    [int]$Y,
    [int]$W,
    [int]$H,
    [int]$OutW,
    [int]$OutH,
    [bool]$Transparent = $true
  )

  $crop = New-Object System.Drawing.Bitmap $W, $H, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($crop)
  $graphics.DrawImage($SourceImage, 0, 0, (New-Object System.Drawing.Rectangle $X, $Y, $W, $H), [System.Drawing.GraphicsUnit]::Pixel)
  $graphics.Dispose()

  if ($Transparent) {
    for ($py = 0; $py -lt $crop.Height; $py++) {
      for ($px = 0; $px -lt $crop.Width; $px++) {
        $pixel = $crop.GetPixel($px, $py)
        if (Test-ChromaKeyPixel $pixel) {
          $crop.SetPixel($px, $py, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
      }
    }
  }

  $output = New-Object System.Drawing.Bitmap $OutW, $OutH, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $outGraphics = [System.Drawing.Graphics]::FromImage($output)
  $outGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $outGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $outGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $outGraphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  $outGraphics.DrawImage($crop, 0, 0, $OutW, $OutH)
  $outGraphics.Dispose()
  $crop.Dispose()

  if ($Transparent) {
    for ($py = 0; $py -lt $output.Height; $py++) {
      for ($px = 0; $px -lt $output.Width; $px++) {
        $pixel = $output.GetPixel($px, $py)
        if ((Test-ChromaKeyPixel $pixel) -or ($pixel.A -lt 18)) {
          $output.SetPixel($px, $py, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
      }
    }
  }

  $target = Join-Path $outDir $FileName
  $output.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
  $output.Dispose()
  return $target
}

$sourceImage = [System.Drawing.Bitmap]::FromFile($sourceCopy)

$assets = @(
  @{ id = "ui-shell-hero-bg"; file = "ui-shell-hero-bg.png"; x = 30; y = 34; w = 1232; h = 430; ow = 1280; oh = 448; alpha = $true },
  @{ id = "ui-tab-active"; file = "ui-tab-active.png"; x = 32; y = 506; w = 414; h = 106; ow = 360; oh = 96; alpha = $true },
  @{ id = "ui-tab-idle"; file = "ui-tab-idle.png"; x = 482; y = 506; w = 370; h = 106; ow = 360; oh = 96; alpha = $true },
  @{ id = "ui-shop-header"; file = "ui-shop-header.png"; x = 892; y = 520; w = 594; h = 104; ow = 640; oh = 112; alpha = $true },
  @{ id = "ui-loadout-crate"; file = "ui-loadout-crate.png"; x = 30; y = 668; w = 426; h = 184; ow = 512; oh = 224; alpha = $true },
  @{ id = "ui-stash-locker"; file = "ui-stash-locker.png"; x = 484; y = 688; w = 504; h = 158; ow = 560; oh = 176; alpha = $true },
  @{ id = "ui-panel-frame-wide"; file = "ui-panel-frame-wide.png"; x = 1004; y = 680; w = 500; h = 172; ow = 560; oh = 192; alpha = $true },
  @{ id = "ui-brand-mark"; file = "ui-brand-mark.png"; x = 30; y = 878; w = 116; h = 116; ow = 96; oh = 96; alpha = $true },
  @{ id = "ui-divider-strip"; file = "ui-divider-strip.png"; x = 176; y = 928; w = 812; h = 32; ow = 640; oh = 28; alpha = $true },
  @{ id = "ui-button-plate"; file = "ui-button-plate.png"; x = 1018; y = 890; w = 290; h = 90; ow = 320; oh = 96; alpha = $true }
)

$manifestEntries = @()
foreach ($asset in $assets) {
  $target = Export-Crop -SourceImage $sourceImage -FileName $asset.file -X $asset.x -Y $asset.y -W $asset.w -H $asset.h -OutW $asset.ow -OutH $asset.oh -Transparent $asset.alpha
  $manifestEntries += [pscustomobject]@{
    id = $asset.id
    category = "ui"
    file = "ui/$($asset.file)"
    sourceImage = "CCGS-Data/design/art/source/metagame-ui/metagame-ui-shell-iter01.png"
    sourceRect = @{ x = $asset.x; y = $asset.y; w = $asset.w; h = $asset.h }
    outputSize = @{ w = $asset.ow; h = $asset.oh }
  }
  Write-Host "Wrote $target"
}

$sourceImage.Dispose()
$manifestPath = Join-Path $sourceDir "metagame-ui-shell-iter01-assets.json"
$manifestEntries | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
Write-Host "Wrote $manifestPath"
