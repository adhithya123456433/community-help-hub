try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $inDoc = "C:\Users\DELL\Desktop\CommunityHelpHub_FullStackReport.docx"
    $outPdf = "C:\Users\DELL\Desktop\CommunityHelpHub_FullStackReport.pdf"
    $doc = $word.Documents.Open($inDoc)
    $doc.SaveAs([ref]$outPdf, [ref]17)
    $doc.Close()
    $word.Quit()
    Write-Output "PDF exported successfully to $outPdf"
} catch {
    Write-Output "Word COM Error: $_"
}
