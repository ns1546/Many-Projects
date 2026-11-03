[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($null -eq $engine) {
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("en-US"))
}

$files = Get-ChildItem -Path "extracted_docx_media\poster_*.png" | Sort-Object Name
foreach ($f in $files) {
    try {
        $storageFile = [Windows.Storage.StorageFile]::GetFileFromPathAsync($f.FullName).GetAwaiter().GetResult()
        $stream = $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read).GetAwaiter().GetResult()
        $decoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream).GetAwaiter().GetResult()
        $bitmap = $decoder.GetSoftwareBitmapAsync().GetAwaiter().GetResult()
        $result = $engine.RecognizeAsync($bitmap).GetAwaiter().GetResult()
        Write-Host "=== $($f.Name) ==="
        Write-Host $result.Text
    } catch {
        Write-Host "Error reading $($f.Name): $_"
    }
}
