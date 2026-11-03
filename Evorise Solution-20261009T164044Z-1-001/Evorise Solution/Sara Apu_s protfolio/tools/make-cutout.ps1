<#
  make-cutout.ps1
  Removes the solid black studio backdrop from the hero portrait and writes a
  transparent PNG (assets/hero-cutout.png) that the website layers over the
  orange arch, exactly like the PDF design.

  Usage (from the project folder):
    powershell -ExecutionPolicy Bypass -File tools\make-cutout.ps1
    powershell -ExecutionPolicy Bypass -File tools\make-cutout.ps1 -Source assets\my-photo.jpg
#>
param(
  [string]$Source = "assets\hero.jpg",
  [string]$Dest   = "assets\hero-cutout.png"
)

$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root $Source
$dst  = Join-Path $root $Dest
if (-not (Test-Path $src)) { Write-Error "Source image not found: $src"; exit 1 }

Add-Type -AssemblyName System.Drawing
$code = @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class Cutout {
  public static string Run(string src, string dst) {
    Bitmap orig = new Bitmap(src);
    int w = orig.Width, h = orig.Height;
    Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
    using (Graphics g = Graphics.FromImage(bmp)) { g.DrawImage(orig, 0, 0, w, h); }
    orig.Dispose();
    BitmapData d = bmp.LockBits(new Rectangle(0,0,w,h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int stride = d.Stride;
    byte[] px = new byte[stride * h];
    Marshal.Copy(d.Scan0, px, 0, px.Length);

    int T = 48; // max-channel threshold for "background black"
    bool[] bg = new bool[w * h];
    Func<int,int,bool> dark = (x, y) => {
      int i = y * stride + x * 4;
      int m = Math.Max(px[i], Math.Max(px[i+1], px[i+2]));
      return m < T;
    };
    // sanity check: the top-left corner must be near-black
    if (!dark(2, 2) && !dark(w - 3, 2)) {
      bmp.UnlockBits(d); bmp.Dispose();
      return "ERROR: this photo does not have a black background, so no cutout was made.";
    }
    Queue<int> q = new Queue<int>();
    Action<int,int> seed = (x, y) => {
      int k = y * w + x;
      if (!bg[k] && dark(x, y)) { bg[k] = true; q.Enqueue(k); }
    };
    for (int x = 0; x < w; x++) seed(x, 0);
    for (int y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }
    // bottom corners (background only, never the dark clothing strip in the middle)
    for (int x = 0; x < w / 6; x++) seed(x, h - 1);
    for (int x = w - w / 6; x < w; x++) seed(x, h - 1);
    int[] dx = {1,-1,0,0};
    int[] dy = {0,0,1,-1};
    while (q.Count > 0) {
      int k = q.Dequeue();
      int x = k % w, y = k / w;
      for (int n = 0; n < 4; n++) {
        int nx = x + dx[n], ny = y + dy[n];
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        int nk = ny * w + nx;
        if (bg[nk]) continue;
        if (dark(nx, ny)) { bg[nk] = true; q.Enqueue(nk); }
      }
    }
    // soft edge band so there is no dark halo over the orange arch
    int R = 3;
    int bgCount = 0;
    for (int y = 0; y < h; y++) {
      for (int x = 0; x < w; x++) {
        int k = y * w + x;
        int i = y * stride + x * 4;
        if (bg[k]) { px[i+3] = 0; px[i] = 0; px[i+1] = 0; px[i+2] = 0; bgCount++; continue; }
        bool near = false;
        for (int yy = Math.Max(0, y - R); yy <= Math.Min(h - 1, y + R) && !near; yy++)
          for (int xx = Math.Max(0, x - R); xx <= Math.Min(w - 1, x + R); xx++)
            if (bg[yy * w + xx]) { near = true; break; }
        if (near) {
          int m = Math.Max(px[i], Math.Max(px[i+1], px[i+2]));
          double a = Math.Min(1.0, Math.Max(0.0, (m - 20) / 215.0));
          if (a < 0.02) a = 0.02;
          for (int c = 0; c < 3; c++) {
            double v = px[i + c] / a;
            if (v > 255) v = 255;
            px[i + c] = (byte)v;
          }
          px[i+3] = (byte)(a * 255);
        }
      }
    }
    Marshal.Copy(px, 0, d.Scan0, px.Length);
    bmp.UnlockBits(d);
    bmp.Save(dst, ImageFormat.Png);
    bmp.Dispose();
    return "OK " + w + "x" + h + " - removed " + bgCount + " background pixels";
  }
}
"@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
$result = [Cutout]::Run($src, $dst)
Write-Host $result
if ($result -like "OK*") { Write-Host "Saved: $dst" }
