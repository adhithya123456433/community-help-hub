import docx

doc = docx.Document(r"C:\Users\DELL\Desktop\CommunityHelpHub_FullStackReport.docx")
print("Total sections:", len(doc.sections))

for s_idx, sec in enumerate(doc.sections):
    print(f"=== Section {s_idx} Footer ===")
    footer = sec.footer
    print("Footer paragraphs:", len(footer.paragraphs))
    for p_idx, p in enumerate(footer.paragraphs):
        print(f"  P{p_idx} text: '{p.text}', align: {p.alignment}")
        print(f"  P{p_idx} xml snippet: {p._element.xml[:200]}")
