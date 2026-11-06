try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open('C:\Users\DELL\Desktop\test_pn.docx')
    $doc.SaveAs([ref]'C:\Users\DELL\Desktop\test_pn.pdf', [ref]17)
    $doc.Close()
    $word.Quit()
    Write-Output "Successfully converted test_pn.pdf"
} catch {
    Write-Output "Error: $_"
}
