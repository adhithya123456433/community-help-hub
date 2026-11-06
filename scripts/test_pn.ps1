
\ = New-Object -ComObject Word.Application
\.Visible = \False
try {
    \ = \.Documents.Open('C:\\Users\\DELL\\Desktop\\test_num_styles.docx')
    Write-Output ('Sections: ' + \.Sections.Count)
    # Set Roman for Section 1
    \.Sections.Item(1).Footers.Item(1).PageNumbers.NumberStyle = 2  # wdPageNumberStyleLowercaseRoman
    # Set Arabic for Section 2
    if (\.Sections.Count -ge 2) {
        \.Sections.Item(2).Footers.Item(1).LinkToPrevious = \False
        \.Sections.Item(2).Footers.Item(1).PageNumbers.RestartNumberingAtSection = \True
        \.Sections.Item(2).Footers.Item(1).PageNumbers.StartingNumber = 1
        \.Sections.Item(2).Footers.Item(1).PageNumbers.NumberStyle = 0  # wdPageNumberStyleArabic
    }
    \.Save()
    Write-Output 'Page numbers configured successfully via Word COM!'
    \.Close()
} catch {
    Write-Output ('Error: ' + \)
} finally {
    \.Quit()
}
