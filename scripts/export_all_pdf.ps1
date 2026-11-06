try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    
    $docs = @(
        @{ In = "C:\Users\DELL\Desktop\24BAD048_TeamHelpHub_FullStackReport.docx"; Out = "C:\Users\DELL\Desktop\24BAD048_TeamHelpHub_FullStackReport.pdf" },
        @{ In = "C:\Users\DELL\Desktop\24BAD048_FullStackReport.docx"; Out = "C:\Users\DELL\Desktop\24BAD048_FullStackReport.pdf" },
        @{ In = "C:\Users\DELL\Desktop\Full_Stack_Project_Report_Template.docx"; Out = "C:\Users\DELL\Desktop\Full_Stack_Project_Report_Template.pdf" }
    )
    
    foreach ($item in $docs) {
        Write-Output "Converting $($item.In) -> $($item.Out)..."
        $doc = $word.Documents.Open($item.In)
        $doc.SaveAs([ref]$item.Out, [ref]17)
        $doc.Close()
        Write-Output "Successfully exported: $($item.Out)"
    }
    
    $word.Quit()
} catch {
    Write-Output "Word COM Error: $_"
}
