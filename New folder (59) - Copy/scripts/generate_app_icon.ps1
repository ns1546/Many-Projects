Add-Type -AssemblyName System.Drawing

$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)

$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::Transparent)

# Helper function for rounded rectangle path
function Get-RoundedRectPath($rect, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $arc = New-Object System.Drawing.RectangleF($rect.X, $rect.Y, $diameter, $diameter)
    
    # Top Left
    $path.AddArc($arc, 180, 90)
    # Top Right
    $arc.X = $rect.Right - $diameter
    $path.AddArc($arc, 270, 90)
    # Bottom Right
    $arc.Y = $rect.Bottom - $diameter
    $path.AddArc($arc, 0, 90)
    # Bottom Left
    $arc.X = $rect.Left
    $path.AddArc($arc, 90, 90)
    
    $path.CloseFigure()
    return $path
}

# 1. Base Squircle Shape
$margin = [float]10.0
$squircleWidth = [float]($size - 20)
$squircleRect = New-Object System.Drawing.RectangleF($margin, $margin, $squircleWidth, $squircleWidth)
$squirclePath = Get-RoundedRectPath $squircleRect 50

# 2. bKash Brand Gradient (#E2136E to #800438)
$colorTop = [System.Drawing.Color]::FromArgb(255, 226, 19, 110)      # #E2136E
$colorBottom = [System.Drawing.Color]::FromArgb(255, 120, 3, 50)     # Deep royal magenta
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($squircleRect, $colorTop, $colorBottom, [float]45.0)
$g.FillPath($brush, $squirclePath)

# 3. Inner Border Highlight
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 255, 255, 255), [float]3.0)
$g.DrawPath($borderPen, $squirclePath)

# 4. White Center Circle
$circleSize = [float]130.0
$circleX = [float](($size - $circleSize) / 2)
$circleY = [float](($size - $circleSize) / 2 - 6)
$circleRect = New-Object System.Drawing.RectangleF($circleX, $circleY, $circleSize, $circleSize)

$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillEllipse($whiteBrush, $circleRect)

# Subtle shadow rim around white circle
$shadowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 0, 0, 0), [float]4.0)
$g.DrawEllipse($shadowPen, $circleRect)

# 5. Iconic Bengali Taka Symbol '৳'
$font = New-Object System.Drawing.Font("Arial", [float]68.0, [System.Drawing.FontStyle]::Bold)
$takaBrush = New-Object System.Drawing.SolidBrush($colorTop)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

$takaText = [string][char]0x09F3
$textRect = New-Object System.Drawing.RectangleF($circleX, $circleY, $circleSize, $circleSize)
$g.DrawString($takaText, $font, $takaBrush, $textRect, $format)

# 6. Small Golden Diamond in top right
$starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 215, 0)) # Gold
$p1 = [System.Drawing.PointF]::new(195.0, 48.0)
$p2 = [System.Drawing.PointF]::new(202.0, 58.0)
$p3 = [System.Drawing.PointF]::new(195.0, 68.0)
$p4 = [System.Drawing.PointF]::new(188.0, 58.0)
$poly = [System.Drawing.PointF[]]@($p1, $p2, $p3, $p4)
$g.FillPolygon($starBrush, $poly)

# 7. "LEDGERX" clean badge at bottom
$badgeFont = New-Object System.Drawing.Font("Segoe UI", [float]11.0, [System.Drawing.FontStyle]::Bold)
$badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 255, 255, 255))
$badgeRect = New-Object System.Drawing.RectangleF([float]0.0, [float]196.0, [float]$size, [float]26.0)
$g.DrawString("LEDGERX DESKTOP", $badgeFont, $badgeBrush, $badgeRect, $format)

# Flush graphics
$g.Flush()

# Save paths
$publicDir = Join-Path $PSScriptRoot "..\public"
$pngPath = Join-Path $publicDir "app-icon.png"
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "✅ Generated High-Res PNG: $pngPath"

$icoPath = Join-Path $publicDir "app-icon.ico"
$faviconPath = Join-Path $publicDir "favicon.ico"

# Convert to true Windows ICO format
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fileStream = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$icon.Save($fileStream)
$fileStream.Close()

Copy-Item -Path $icoPath -Destination $faviconPath -Force
Write-Output "✅ Generated Windows ICO: $icoPath and $faviconPath"

# Cleanup
$g.Dispose()
$bmp.Dispose()
