$pdfPath = "C:\Users\DELL\Desktop\24BAD048_TeamHelpHub_FullStackReport.pdf"
if (Test-Path $pdfPath) {
    $bytes = [System.IO.File]::ReadAllBytes($pdfPath)
    $text = [System.Text.Encoding]::ASCII.GetString($bytes)
    $regex = [regex]"/Type\s*/Page[^s]"
    $matches = $regex.Matches($text)
    Write-Output "PDF Page Count approximation: $($matches.Count)"
} else {
    Write-Output "PDF not found"
}
