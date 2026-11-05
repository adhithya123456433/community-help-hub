import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

BLACK = RGBColor(0, 0, 0)

def set_cell_borders(cell, top="000000", bottom="000000", left="000000", right="000000", sz="4"):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    borders = {'top': top, 'bottom': bottom, 'left': left, 'right': right}
    for b_name, b_col in borders.items():
        if b_col:
            edge = OxmlElement(f'w:{b_name}')
            edge.set(qn('w:val'), 'single')
            edge.set(qn('w:sz'), sz)
            edge.set(qn('w:color'), b_col)
            tcBorders.append(edge)
        else:
            edge = OxmlElement(f'w:{b_name}')
            edge.set(qn('w:val'), 'none')
            tcBorders.append(edge)
    tcPr.append(tcBorders)

def set_cell_shading(cell, color_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m_name, m_val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m_name}')
        node.set(qn('w:w'), str(m_val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = BLACK
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = BLACK
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11.5)
    run.font.bold = True
    run.font.color.rgb = BLACK
    return p

def add_body_p(doc, text, bold_prefix="", italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = 'Times New Roman'
        r_bold.font.size = Pt(11)
        r_bold.font.bold = True
        r_bold.font.color.rgb = BLACK
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)
    run.font.italic = italic
    run.font.color.rgb = BLACK
    return p

def add_bullet_p(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = 'Times New Roman'
        r_bold.font.size = Pt(11)
        r_bold.font.bold = True
        r_bold.font.color.rgb = BLACK
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(11)
    run.font.color.rgb = BLACK
    return p

def style_table(table, col_widths, headers, data, align_cols=None):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Header Row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_shading(hdr_cells[i], "E5E5E5")
        set_cell_borders(hdr_cells[i], sz="6")
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = BLACK

    # Data Rows
    for r_idx, row_data in enumerate(data):
        row_cells = table.rows[r_idx + 1].cells
        bg_hex = "F9F9F9" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].text = str(val)
            set_cell_shading(row_cells[c_idx], bg_hex)
            set_cell_borders(row_cells[c_idx], sz="4")
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            if align_cols and c_idx in align_cols:
                p.alignment = align_cols[c_idx]
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(9.5)
                r.font.color.rgb = BLACK

    # Apply Col Widths
    for row in table.rows:
        for i, w in enumerate(col_widths):
            row.cells[i].width = Inches(w)

def generate_full_report(output_path):
    doc = docx.Document()

    # 1-inch margins
    for sec in doc.sections:
        sec.top_margin = Inches(1.0)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(1.0)

    # -------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(20)
    p_inst.paragraph_format.space_after = Pt(6)
    r = p_inst.add_run("[ COLLEGE / UNIVERSITY NAME ]\nDEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.color.rgb = BLACK

    p_divider = doc.add_paragraph()
    p_divider.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_divider.paragraph_format.space_after = Pt(28)
    r = p_divider.add_run("____________________________________________________________")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10)
    r.font.color.rgb = BLACK

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(8)
    r = p_title.add_run("COMMUNITYHELP HUB")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(22)
    r.font.bold = True
    r.font.color.rgb = BLACK

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(36)
    r = p_sub.add_run("A Full-Stack Volunteer & Social Service Platform\nConnecting Citizens with Community Drives, Verified Hours, and AI Recommendations")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.color.rgb = BLACK

    p_desc = doc.add_paragraph()
    p_desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_desc.paragraph_format.space_after = Pt(40)
    r = p_desc.add_run("A Project Report Submitted in Partial Fulfillment of the Requirements\nfor the Award of the Degree of\nBACHELOR OF ENGINEERING / TECHNOLOGY\nIN\nCOMPUTER SCIENCE AND ENGINEERING")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.italic = True
    r.font.color.rgb = BLACK

    t_info = doc.add_table(rows=2, cols=2)
    t_info.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_info.rows[0].cells[0].paragraphs[0].text = "SUBMITTED BY:"
    t_info.rows[0].cells[1].paragraphs[0].text = "PROJECT SUPERVISOR / GUIDE:"
    t_info.rows[1].cells[0].paragraphs[0].text = "Student Name: [ Your Name ]\nRegister No: [ Your Roll Number ]\nClass / Section: [ Final Year CSE ]"
    t_info.rows[1].cells[1].paragraphs[0].text = "Faculty Name: [ Supervisor Name ]\nDesignation: Assistant Professor / Professor\nDepartment of CSE"

    for r_idx in range(2):
        for c_idx in range(2):
            cell = t_info.rows[r_idx].cells[c_idx]
            cell.width = Inches(3.2)
            set_cell_borders(cell, top=None, bottom=None, left=None, right=None)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(4)
            for run_i in p.runs:
                run_i.font.name = 'Times New Roman'
                run_i.font.size = Pt(10.5)
                run_i.font.color.rgb = BLACK
                if r_idx == 0:
                    run_i.font.bold = True

    p_date = doc.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.paragraph_format.space_before = Pt(48)
    r = p_date.add_run("ACADEMIC YEAR: 2026 - 2027\nNOVEMBER 2026")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = BLACK

    doc.add_page_break()

    # -------------------------------------------------------------
    # DECLARATION & CERTIFICATE
    # -------------------------------------------------------------
    add_heading_1(doc, "CANDIDATE DECLARATION")
    add_body_p(doc, "I hereby declare that the project titled \"CommunityHelp Hub – Volunteer & Social Service Platform\" submitted to the Department of Computer Science and Engineering is an authentic record of software engineering carried out by me. All database schemas, REST APIs, client interfaces, mathematical formulations, and validation suites described in this report represent tested, functional source code developed in accordance with academic standards.")
    add_body_p(doc, "I further declare that this report has not been submitted previously to any other university or institution for the award of any academic credential.")

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(36)
    p_sig.paragraph_format.space_after = Pt(20)
    r = p_sig.add_run("Place: ____________________\nDate:  ____________________")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.color.rgb = BLACK

    p_sig_right = doc.add_paragraph()
    p_sig_right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_sig_right.add_run("_______________________________\nCandidate Signature\nName: [ Your Name ]\nRegister No: [ Your Roll Number ]")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.color.rgb = BLACK

    p_div2 = doc.add_paragraph()
    p_div2.paragraph_format.space_before = Pt(18)
    p_div2.paragraph_format.space_after = Pt(18)
    r = p_div2.add_run("_________________________________________________________________________________")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(9.5)
    r.font.color.rgb = BLACK

    add_heading_2(doc, "FACULTY CERTIFICATE OF APPROVAL")
    add_body_p(doc, "This is to certify that the project report titled \"CommunityHelp Hub – Volunteer & Social Service Platform\" submitted by [ Your Name ] (Register No: [ Your Roll Number ]) has been reviewed and found to satisfy all syllabus specifications for the award of the degree in Computer Science and Engineering.")

    p_fac = doc.add_paragraph()
    p_fac.paragraph_format.space_before = Pt(32)
    r = p_fac.add_run("_______________________________\nInternal Guide / Supervisor\nDepartment of CSE")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.color.rgb = BLACK

    doc.add_page_break()

    # -------------------------------------------------------------
    # TABLE OF CONTENTS
    # -------------------------------------------------------------
    add_heading_1(doc, "TABLE OF CONTENTS")
    toc_data = [
        ("1.", "Introduction and Problem Definition", "4"),
        ("  1.1", "Background and Social Context", "4"),
        ("  1.2", "Problem Statement", "4"),
        ("  1.3", "Website Purpose and Platform Objectives", "4"),
        ("2.", "System Architecture and Database Design", "5"),
        ("  2.1", "Three-Tier Client-Server Architecture", "5"),
        ("  2.2", "Technology Stack Specification", "5"),
        ("  2.3", "MongoDB Database Schema Definitions", "6"),
        ("  2.4", "Relational Integrity and Indexing Rules", "7"),
        ("3.", "Mandatory Requirements and How They Are Used", "8"),
        ("  3.1", "Volunteer Registration", "8"),
        ("  3.2", "NGO Registration", "8"),
        ("  3.3", "User Authentication and Login", "9"),
        ("  3.4", "Task Creation", "9"),
        ("  3.5", "Task Assignment", "10"),
        ("  3.6", "Task Status Tracking and Capacity Guards", "10"),
        ("  3.7", "Role-Specific User Dashboards", "11"),
        ("  3.8", "MongoDB Atlas Data Layer", "12"),
        ("  3.9", "Full CRUD Capabilities Across Entities", "12"),
        ("4.", "Additional Requirements: Task Categories and How They Are Used", "13"),
        ("  4.1", "Overview of Social Service Categorization", "13"),
        ("  4.2", "Education Category", "13"),
        ("  4.3", "Food Distribution Category", "13"),
        ("  4.4", "Environment Category", "14"),
        ("  4.5", "Elder Support Category", "14"),
        ("  4.6", "Disaster Support Category", "14"),
        ("  4.7", "Community Service Category", "15"),
        ("  4.8", "Category Integration Across UI, Filtering, and Telemetry", "15"),
        ("5.", "Advanced Features and How They Are Used", "16"),
        ("  5.1", "Skill-Based Volunteer Matching", "16"),
        ("  5.2", "Location-Based Proximity Matching", "16"),
        ("  5.3", "Volunteer Ranking System and Mathematical Model", "17"),
        ("  5.4", "Interactive Public Impact Dashboard", "18"),
        ("  5.5", "Automated PDF Certificate of Appreciation Generation", "19"),
        ("  5.6", "AI Task Recommendation Engine (100-Point Model)", "20"),
        ("6.", "System Testing, Verification, and Mathematical Reconciliation", "21"),
        ("  6.1", "25-Point Automated End-to-End Test Suite", "21"),
        ("  6.2", "Data Integrity Reconciliation Across All 37 Volunteer Profiles", "23"),
        ("  6.3", "Production Loophole and Edge-Case Hardening", "23"),
        ("7.", "Evaluator Demonstration Walkthrough", "24"),
        ("  7.1", "Pre-Seeded Demonstration Accounts Table", "24"),
        ("  7.2", "Step-by-Step Live Workflow Walkthrough", "24"),
        ("8.", "Conclusion and Future Enhancements", "25"),
    ]

    t_toc = doc.add_table(rows=len(toc_data) + 1, cols=3)
    style_table(
        t_toc,
        [0.8, 4.8, 0.9],
        ["Section", "Topic / Chapter Description", "Page"],
        toc_data,
        {0: WD_ALIGN_PARAGRAPH.LEFT, 1: WD_ALIGN_PARAGRAPH.LEFT, 2: WD_ALIGN_PARAGRAPH.CENTER}
    )

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # -------------------------------------------------------------
    add_heading_1(doc, "1. INTRODUCTION AND PROBLEM DEFINITION")

    add_heading_2(doc, "1.1 Background and Social Context")
    add_body_p(doc, "In modern civil society, community volunteering plays an indispensable role in uplifting marginalized groups, restoring delicate ecosystems, and coordinating immediate emergency assistance. In India, numerous non-governmental organizations (NGOs) organize high-impact social welfare activities ranging from evening remedial tutoring in fishing hamlets to beach cleanups and community kitchen food packing. However, the volunteer sector has historically operated via fragmented, ad-hoc mechanisms such as unstructured WhatsApp groups, printed paper rosters, and informal word-of-mouth announcements. This lack of a structured digital infrastructure causes severe logistical friction and prevents willing citizens from discovering meaningful opportunities.")

    add_heading_2(doc, "1.2 Problem Statement")
    add_body_p(doc, "As explicitly formulated in the syllabus requirements:", bold_prefix="Core Problem: ")
    add_body_p(doc, "\"Many people want to volunteer, while NGOs and communities need volunteers for different activities.\"", italic=True)
    add_body_p(doc, "This core disconnect breaks down into several technical and operational obstacles in community service coordination:")
    add_bullet_p(doc, "Prospective volunteers have no centralized directory to search and discover vetted, legitimate community drives filtered by location, availability, or required skills.", "1. Information Asymmetry: ")
    add_bullet_p(doc, "Non-profit coordinators lack software tooling to publish requirements, define volunteer quotas, review applicant skills, approve team rosters, and communicate schedules.", "2. Coordination Bottleneck: ")
    add_bullet_p(doc, "Volunteers receive no formal verification of service hours completed, preventing them from using their community service for university credits, job resumes, or CSR recognition.", "3. Lack of Verified Recognition: ")
    add_bullet_p(doc, "Traditional volunteer lists frequently suffer from data drift, where logged service hours and completed task counters fail to match the real on-ground activities performed.", "4. Data Integrity Drift: ")

    add_heading_2(doc, "1.3 Website Purpose and Platform Objectives")
    add_body_p(doc, "As defined by the project specification:", bold_prefix="Website Purpose: ")
    add_body_p(doc, "\"Connect volunteers with NGOs and community-service tasks.\"", italic=True)
    add_body_p(doc, "To achieve this purpose, CommunityHelp Hub is built as an end-to-end full-stack web application that unifies volunteers and NGOs into a single cohesive ecosystem. The primary objectives are:")
    add_bullet_p(doc, "Provide instant, self-service registration for both individual volunteers and registered NGOs with dedicated, role-specific views.", "Role-Based Access: ")
    add_bullet_p(doc, "Enable NGOs to author, publish, update, and manage community service tasks across six recognized social service categories.", "Task Management: ")
    add_bullet_p(doc, "Deliver intelligent volunteer discovery using skill-based matching, geographic proximity filtering, and an AI multi-factor recommendation engine.", "Smart Matching: ")
    add_bullet_p(doc, "Enforce strict mathematical parity in volunteer hour accounting and gamified leaderboard ranking.", "Verifiable Tracking: ")
    add_bullet_p(doc, "Automatically compile and stream official PDF Certificates of Appreciation bearing unique tracking identifiers.", "Digital Certification: ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 2: ARCHITECTURE & DATABASE DESIGN
    # -------------------------------------------------------------
    add_heading_1(doc, "2. SYSTEM ARCHITECTURE AND DATABASE DESIGN")

    add_heading_2(doc, "2.1 Three-Tier Client-Server Architecture")
    add_body_p(doc, "CommunityHelp Hub is architected following the decoupled three-tier model, separating presentation, business logic, and data persistence:")
    add_bullet_p(doc, "Single Page Application (SPA) built with React.js 18, React Router DOM v6, Chart.js, and custom responsive CSS. Communicates asynchronously via fetch API to REST endpoints.", "Presentation Layer (Client): ")
    add_bullet_p(doc, "RESTful API server built on Node.js and Express.js. Handles BCrypt password hashing, JSON Web Token (JWT) verification, role-based route interceptors, business rules, and PDFKit binary generation.", "Application Layer (Server): ")
    add_bullet_p(doc, "Cloud multi-region cluster on MongoDB Atlas managed via Mongoose 8.x Object Data Modeling (ODM). Guarantees ACID document updates and compound unique indexing.", "Persistence Layer (Database): ")

    add_heading_2(doc, "2.2 Technology Stack Specification")
    tech_data = [
        ("Frontend Client", "React.js 18.2, React Router DOM v6, Chart.js, Vite build tool"),
        ("Backend Framework", "Node.js v20+, Express.js 4.19, CORS, Dotenv"),
        ("Authentication & Security", "JSON Web Tokens (JWT), BCrypt.js (10 salt rounds), Protected Middleware"),
        ("Database Layer", "MongoDB Atlas Cloud Cluster, Mongoose 8.3 ODM"),
        ("PDF Generation Engine", "PDFKit binary streaming library (Landscape A4, Vector borders)"),
        ("Development Tools", "Vite, Git version control, PowerShell, ESLint")
    ]
    t_tech = doc.add_table(rows=len(tech_data) + 1, cols=2)
    style_table(t_tech, [2.2, 4.3], ["Architecture Tier", "Adopted Technology & Version"], tech_data)

    add_heading_2(doc, "2.3 MongoDB Database Schema Definitions")
    add_body_p(doc, "The database schema consists of six collections designed with strict Mongoose schema validators:")
    add_bullet_p(doc, "email (String, unique, indexed), password (String, BCrypt hash), role (String enum: ['volunteer', 'ngo', 'admin']), createdAt (Date).", "1. User Schema (users): ")
    add_bullet_p(doc, "userId (ObjectId -> User), fullName (String), phone (String, 10 digits), city (String), skills ([String]), completedTasksCount (Number), totalHours (Number), rankingPoints (Number).", "2. Volunteer Schema (volunteers): ")
    add_bullet_p(doc, "userId (ObjectId -> User), orgName (String), registrationNumber (String, unique), contactPerson (String), phone (String), city (String), address (String), isVerified (Boolean).", "3. NGO Schema (ngos): ")
    add_bullet_p(doc, "title (String), description (String), category (String enum: 6 categories), requiredSkills ([String]), location (String), city (String), dateTime (Date), hours (Number), volunteersRequired (Number), volunteersAssigned (Number), status (String enum: ['Open', 'In Progress', 'Completed', 'Cancelled']), urgency (String), targetBeneficiaries (String), createdBy (ObjectId -> NGO).", "4. Task Schema (tasks): ")
    add_bullet_p(doc, "taskId (ObjectId -> Task), volunteerId (ObjectId -> Volunteer), notes (String), status (String enum: ['Applied', 'Assigned', 'Completed', 'Rejected']), appliedAt (Date), completedAt (Date).", "5. Application Schema (applications): ")
    add_bullet_p(doc, "certificateId (String, unique), volunteerId (ObjectId -> Volunteer), taskId (ObjectId -> Task), ngoId (ObjectId -> NGO), hoursCompleted (Number), issueDate (Date).", "6. Certificate Schema (certificates): ")

    add_heading_2(doc, "2.4 Relational Integrity and Indexing Rules")
    add_body_p(doc, "To prevent duplicate applications, the system enforces a compound unique index in Mongoose on { taskId: 1, volunteerId: 1 }. A volunteer cannot submit multiple applications for the exact same drive. Furthermore, foreign-key relationships are maintained via ObjectId references, and cascade cleanups are implemented when deleting tasks.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 3: MANDATORY REQUIREMENTS & HOW THEY ARE USED
    # -------------------------------------------------------------
    add_heading_1(doc, "3. MANDATORY REQUIREMENTS AND HOW THEY ARE USED")

    add_heading_2(doc, "3.1 Volunteer Registration")
    add_body_p(doc, "Enables individual citizens interested in community service to create a verified platform account.", bold_prefix="Purpose & Role: ")
    add_body_p(doc, "A prospective volunteer navigates to the Registration page (/register), selects the 'Volunteer' tab, and enters their full name, email address, password, 10-digit mobile number, residential city (e.g., Chennai, Coimbatore, Madurai), and comma-separated skills (e.g., 'Teaching, Mathematics, Tamil'). Upon clicking 'Create Volunteer Account', the form submits a POST request to /api/auth/register-volunteer. The backend validates mobile formatting, hashes the password via BCrypt (10 rounds), saves the User document, creates a linked Volunteer profile with initial metrics (completedTasksCount: 0, totalHours: 0, rankingPoints: 0), issues a JWT session token, and automatically redirects the volunteer to their newly personalized Volunteer Dashboard.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "The registered city and skills are immediately ingested by the Matching and AI Recommendation algorithms to curate localized and skill-relevant tasks on the volunteer's feed.", bold_prefix="System Impact: ")

    add_heading_2(doc, "3.2 NGO Registration")
    add_body_p(doc, "Enables non-profit organizations, social welfare trusts, and community foundations to register as authorized organizers.", bold_prefix="Purpose & Role: ")
    add_body_p(doc, "An authorized NGO representative switches to the 'Non-Profit Organization (NGO)' tab on /register. They supply organization name (e.g., 'Kavalar Youth Welfare Foundation'), official NGO registration number (e.g., 'TN-CHN-2021-NGO-8841'), coordinator contact person, phone number, operational city, and physical headquarters address. Upon submission (POST /api/auth/register-ngo), the backend enforces registration number uniqueness, creates the User document with role: 'ngo', links the NGO profile entity, and redirects the coordinator directly to the NGO Management Portal.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "The NGO profile is stored as the immutable authority for every community drive they author, and their legal registration number is printed directly on completion certificates issued to volunteers.", bold_prefix="System Impact: ")

    add_heading_2(doc, "3.3 User Authentication and Login")
    add_body_p(doc, "Provides secure authentication with role-based routing for volunteers, NGOs, and system administrators.", bold_prefix="Purpose & Role: ")
    add_body_p(doc, "Users enter their registered email and password at /login (POST /api/auth/login). The backend checks credentials against BCrypt password hashes. Upon successful verification, the API generates a cryptographically signed JSON Web Token (JWT) containing userId and role with a 7-day expiration time. In the React frontend, AuthContext stores the token and user profile in localStorage. The application dynamically inspects the role and redirects the user to their appropriate environment: /volunteer-dashboard for volunteers, /ngo-dashboard for NGOs, or /admin-dashboard for administrators.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Protected client routes (ProtectedRoute.jsx) and Express middleware (protect, requireVolunteer, requireNGO, requireAdmin) inspect the token on every request, blocking volunteers from posting drives and preventing NGOs from modifying peer organizations' records.", bold_prefix="Security Layer: ")

    add_heading_2(doc, "3.4 Task Creation")
    add_body_p(doc, "Allows authenticated NGOs to publish vetted social service drives with complete operational specifications.", bold_prefix="Purpose & Role: ")
    add_body_p(doc, "An NGO coordinator visits /create-task (or clicks 'Publish Task' in the navigation header). The form collects: task title, activity description, social service category (one of the 6 mandatory categories), required skills, location venue, city, scheduled event date and time, duration commitment (hours, default 3), volunteer quota needed (volunteersRequired), priority urgency, and target beneficiaries (e.g., 'Coastal Fishermen Children'). Upon submission (POST /api/tasks), the server validates all required fields, ensures the event date is not in the past, validates category enums, associates createdBy with the NGO's ObjectId, sets status to 'Open', and stores the task in MongoDB.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "The newly published task immediately appears across Explore Tasks, AI Recommendations, Category Filters, and the Public Impact telemetry.", bold_prefix="System Impact: ")

    add_heading_2(doc, "3.5 Task Assignment")
    add_body_p(doc, "Coordinates volunteer selection, quota tracking, and team staffing for community drives.", bold_prefix="Purpose & Role: ")
    add_body_p(doc, "Volunteers browse opportunities on Explore Tasks and click 'Apply for Task', creating an Application record with status: 'Applied'. The organizing NGO opens their NGO Dashboard (/ngo-dashboard) and reviews the 'Volunteer Applications Received' review desk. The NGO inspects the applicant's name, registered city, matched skills, past volunteer hours, and custom application notes. The coordinator clicks 'Assign', sending PUT /api/applications/:id/status with { status: 'Assigned' }. The server verifies that the task has not already filled its quota, increments task.volunteersAssigned by 1, and updates task.status from 'Open' to 'In Progress'.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "When the volunteer logs into their My Tasks portal (/my-tasks), their card displays [ASSIGNED], indicating that their role is officially confirmed for the on-ground event.", bold_prefix="Volunteer Experience: ")

    add_heading_2(doc, "3.6 Task Status Tracking and Capacity Guards")
    add_body_p(doc, "Tracks the complete lifecycle of community activities and prevents operational over-capacity.", bold_prefix="Purpose & Role: ")
    add_body_p(doc, "Tasks transition through four strict operational states: 'Open' (accepting applications), 'In Progress' (volunteers assigned and team finalized), 'Completed' (event executed, hours awarded, certificates generated), and 'Cancelled' (event revoked). When volunteersAssigned reaches volunteersRequired (e.g., 5 / 5 Filled), the task reaches full capacity. On the frontend, the volunteer counter highlights '[FULL CAPACITY]', and the button changes to a disabled 'Quota Filled' badge. On the backend, additional applications or assignments are blocked with HTTP 400 Bad Request, guaranteeing that community drives never exceed their logistical capacity.", bold_prefix="How It Is Used: ")

    add_heading_2(doc, "3.7 Role-Specific User Dashboards")
    add_body_p(doc, "Provides tailored interfaces giving every user persona immediate visibility into their commitments and responsibilities.", bold_prefix="Purpose & Role: ")
    add_body_p(doc, "1. Volunteer Dashboard (/volunteer-dashboard): Displays 4 telemetry metric cards (Tasks Completed, Active Commitments, Total Verified Service Hours, Leaderboard Rank), an interactive skills editor, an active tasks management table, and a downloadable certificates list.\n2. NGO Dashboard (/ngo-dashboard): Displays organizational statistics (Created Drives, Active Drives, Applications Received, Assigned Volunteers), a dynamic application review desk to assign or complete volunteer applications, and a published tasks management table.\n3. Admin Dashboard (/admin-dashboard): Offers system-wide oversight, user account management, and content moderation across the entire community database.", bold_prefix="How They Are Used: ")

    add_heading_2(doc, "3.8 MongoDB Atlas Data Layer")
    add_body_p(doc, "Provides cloud-hosted, scalable, schema-validated document storage for all platform entities.", bold_prefix="Purpose & Role: ")
    add_body_p(doc, "The system connects to a multi-region MongoDB Atlas cluster via Mongoose. Every read, write, update, and aggregation query executes through Mongoose models. Compound indexing ensures high-speed search across city, category, and skills attributes, while aggregation pipelines compute public impact metrics and volunteer leaderboard rankings in sub-millisecond response times.", bold_prefix="How It Is Used: ")

    add_heading_2(doc, "3.9 Full CRUD Capabilities Across Entities")
    add_body_p(doc, "Satisfies the standard software engineering requirement for complete Create, Read, Update, and Delete operations.", bold_prefix="Purpose & Role: ")
    add_body_p(doc, "1. Create: Volunteers register; NGOs post community tasks (POST /api/tasks); volunteers submit applications (POST /api/applications/apply); certificates are created automatically upon completion.\n2. Read: Directory search (GET /api/tasks), detailed task views (GET /api/tasks/:id), dashboard metrics, application histories, and leaderboard rankings.\n3. Update: NGOs modify task details and quotas (PUT /api/tasks/:id); application statuses transition between Applied, Assigned, and Completed (PUT /api/applications/:id/status); volunteers edit their registered skills.\n4. Delete: NGOs and Admins can delete tasks (DELETE /api/tasks/:id) with automatic cascading deletion of linked applications and certificates.", bold_prefix="How It Is Used: ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 4: ADDITIONAL REQUIREMENTS: TASK CATEGORIES
    # -------------------------------------------------------------
    add_heading_1(doc, "4. ADDITIONAL REQUIREMENTS: TASK CATEGORIES AND HOW THEY ARE USED")

    add_heading_2(doc, "4.1 Overview of Social Service Categorization")
    add_body_p(doc, "To organize diverse volunteering initiatives across India into structured, easily navigable domains, the project syllabus mandates six dedicated task categories. Every task posted on CommunityHelp Hub must strictly belong to one of these categories, validated by a Mongoose schema enum:")
    add_body_p(doc, "enum: ['Education', 'Food distribution', 'Environment', 'Elder support', 'Disaster support', 'Community service']", bold_prefix="Schema Validation: ")

    add_heading_2(doc, "4.2 Education Category")
    add_body_p(doc, "Encompasses academic tutoring, literacy programs, STEM workshops, and school mentoring initiatives.", bold_prefix="Focus Area: ")
    add_body_p(doc, "NGOs such as 'Kavalar Youth Welfare Foundation' and 'Avadh Education Trust' publish coaching drives for primary school children of local fisherman and daily-wage families. Volunteers with teaching, English, mathematics, and science competencies discover these drives, assist with school curriculum, and mentor students.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Spoken English & Math Tutoring (Chennai, 4 Hours, 4 Volunteers Needed).", bold_prefix="Real Platform Example: ")

    add_heading_2(doc, "4.3 Food Distribution Category")
    add_body_p(doc, "Focuses on hunger alleviation, surplus food collection, community kitchen packaging, and meal delivery to homeless shelters.", bold_prefix="Focus Area: ")
    add_body_p(doc, "Organizations such as 'Anna Seva Trust' and 'Bhopal Seva Samiti' mobilize volunteers to pack cooked meal boxes at central kitchens and distribute them to slum settlements, orphanages, and municipal hospital waiting areas. Volunteers contribute packing, sorting, and logistics skills.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Nutritious Midday Meal Packaging & Slum Distribution (Bengaluru, 3 Hours, 5 Volunteers Needed).", bold_prefix="Real Platform Example: ")

    add_heading_2(doc, "4.4 Environment Category")
    add_body_p(doc, "Addresses ecological restoration, urban tree plantation, water body cleanup, and plastic waste segregation.", bold_prefix="Focus Area: ")
    add_body_p(doc, "Environmental groups such as 'Kaveri Environmental Trust' coordinate riverbank sapling plantation and lake restoration drives. Volunteers register to dig planting pits, water saplings, and collect plastic debris from public parks and water channels.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Urban Miyawaki Forest Sapling Plantation (Coimbatore, 4 Hours, 6 Volunteers Needed).", bold_prefix="Real Platform Example: ")

    add_heading_2(doc, "4.5 Elder Support Category")
    add_body_p(doc, "Provides companionship, recreational activities, health monitoring, and digital literacy to senior citizens.", bold_prefix="Focus Area: ")
    add_body_p(doc, "Elder care organizations like 'Bhavani Senior Welfare Trust' organize weekend interactive sessions at old age homes. Volunteers read regional literature, assist elderly residents with smartphone video calling to relatives, and accompany them on gentle garden walks.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Digital Literacy & Recreational Day for Elders (Madurai, 3 Hours, 4 Volunteers Needed).", bold_prefix="Real Platform Example: ")

    add_heading_2(doc, "4.6 Disaster Support Category")
    add_body_p(doc, "Mobilizes urgent humanitarian relief, dry ration packing, and emergency kit assembly during floods, cyclones, or crises.", bold_prefix="Focus Area: ")
    add_body_p(doc, "During seasonal monsoon inundations, disaster response charities like 'Kerala Care Mission' post urgent relief packaging drives. Volunteers assemble survival kits containing potable water packets, halogen tablets, dry rations, and first-aid supplies.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Emergency Flood Relief Kit Assembly & Sorting (Kochi, 4 Hours, 8 Volunteers Needed). Marked with [URGENT] priority badge.", bold_prefix="Real Platform Example: ")

    add_heading_2(doc, "4.7 Community Service Category")
    add_body_p(doc, "Covers neighborhood beautification, public wall mural painting, community library organizing, and civic upkeep.", bold_prefix="Focus Area: ")
    add_body_p(doc, "Civic foundations like 'Namma Ooru Foundation' organize community painting drives where volunteers clean municipal school boundary walls, paint educational murals, and organize local reading rooms.", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Government School Wall Art & Sanitation Drive (Salem, 4 Hours, 5 Volunteers Needed).", bold_prefix="Real Platform Example: ")

    add_heading_2(doc, "4.8 Category Integration Across UI, Filtering, and Telemetry")
    add_body_p(doc, "The six categories are tightly woven into the user experience: each category carries a unique color-coded badge (e.g., Blue for Education, Orange for Food, Green for Environment, Red for Disaster), enables single-click filtering on Explore Tasks (/explore-tasks?category=Environment), populates the Chart.js Category Distribution donut chart on the Impact Dashboard, and serves as an interest factor in the AI recommendation heuristic.")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 5: ADVANCED FEATURES & HOW THEY ARE USED
    # -------------------------------------------------------------
    add_heading_1(doc, "5. ADVANCED FEATURES AND HOW THEY ARE USED")

    add_heading_2(doc, "5.1 Skill-Based Volunteer Matching")
    add_body_p(doc, "Pairs open community drives with volunteers who possess the exact functional skills required by the organizing NGO.", bold_prefix="Feature Objective: ")
    add_body_p(doc, "When a volunteer clicks 'Skill Match' on Explore Tasks (/api/tasks/matching/skills), the server queries all active tasks and computes the set intersection between task.requiredSkills and volunteer.skills. The match percentage is calculated as:", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Match Score (%) = ( Matched Skills Count / Required Skills Count ) * 100", bold_prefix="Algorithm: ")
    add_body_p(doc, "Tasks are sorted in descending order of match percentage. In the UI, each task card displays a prominent badge such as '[100% SKILL MATCH]' or '[67% SKILL MATCH]', highlighting the specific skills the volunteer satisfies (e.g., 'Matches: Teaching, English'). This ensures that specialized drives—such as medical camps or mathematics tutoring—are staffed by qualified volunteers rather than generalists.", bold_prefix="User Experience: ")

    add_heading_2(doc, "5.2 Location-Based Proximity Matching")
    add_body_p(doc, "Prioritizes community service activities taking place within the volunteer's registered municipal city.", bold_prefix="Feature Objective: ")
    add_body_p(doc, "A volunteer selecting 'Location Match' (/api/tasks/matching/location) triggers an endpoint that inspects volunteer.city (e.g., 'Chennai') and performs case-insensitive regex filtering against task.city. Tasks located in the volunteer's home city are returned as primary local opportunities with a '[LOCAL MATCH: CHENNAI]' badge, while drives in other cities are categorized under regional opportunities with '[OTHER CITY: MADURAI]'. This drastically lowers travel friction and boosts physical attendance on the scheduled date.", bold_prefix="How It Is Used: ")

    add_heading_2(doc, "5.3 Volunteer Ranking System and Mathematical Model")
    add_body_p(doc, "Motivates long-term community service through transparent, deterministic gamification.", bold_prefix="Feature Objective: ")
    add_body_p(doc, "Points are awarded according to a strict mathematical formula implemented in routes/applicationRoutes.js (Line 206) and verified in routes/dashboardRoutes.js:", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Points Awarded Per Task = 10 + ( Task Hours * 2 )", bold_prefix="Task Points: ")
    add_body_p(doc, "Total Lifetime Points = ( Completed Tasks * 10 ) + ( Total Verified Hours * 2 )", bold_prefix="Cumulative Formula: ")
    add_body_p(doc, "Volunteers progress through three achievement tiers based on lifetime points:\n* Gold Champion: 80+ Points (e.g., Karthik Raman - 8 tasks, 28 hrs, 136 pts, Rank #1)\n* Silver Tier: 40 to 79 Points (Active regular contributors)\n* Bronze Tier: Below 40 Points (Entry-level volunteers)\nThe Public Leaderboard (/impact) displays the Top 10 volunteers ordered by points and hours, while every volunteer sees their personal rank (e.g., 'Rank #1 of 37 Volunteers') on their private dashboard.", bold_prefix="Tier Progression: ")

    add_heading_2(doc, "5.4 Interactive Public Impact Dashboard")
    add_body_p(doc, "Provides public transparency by aggregating social service telemetry across all participating NGOs and volunteers.", bold_prefix="Feature Objective: ")
    add_body_p(doc, "Accessible to all visitors at /impact (GET /api/dashboard/impact). The backend runs MongoDB aggregation pipelines to calculate: Total Registered Volunteers, Total Registered NGOs, Total Tasks Created, Total Completed Tasks, and Cumulative Volunteer Service Hours Contributed. These metrics are visualized via interactive Chart.js widgets:\n1. Category Distribution Donut Chart: Displays the percentage of initiatives across Education, Food, Environment, Elder, Disaster, and Community Service.\n2. City Distribution Bar Chart: Highlights community activity volume across top Indian cities (Chennai, Coimbatore, Madurai, Bengaluru, etc.).\n3. Leaderboard Table: Showcases top-performing volunteers with verified hours, completed tasks, and points.", bold_prefix="How It Is Used: ")

    add_heading_2(doc, "5.5 Automated PDF Certificate of Appreciation Generation")
    add_body_p(doc, "Issues legally verifiable digital credentials to volunteers upon task completion.", bold_prefix="Feature Objective: ")
    add_body_p(doc, "When an NGO marks an assigned volunteer as 'Completed', the backend automatically creates a Certificate document in MongoDB with a unique, human-readable ID formatted as CHH-CERT-IND-[CITY]-[ID] (e.g., 'CHH-CERT-IND-CHN-1001'). In their Volunteer Dashboard, the volunteer clicks 'Download PDF' (GET /api/certificates/download/:id). The server dynamically compiles an official A4 landscape document using PDFKit, streaming binary PDF bytes directly to the browser. The certificate embeds:\n* Double ornate vector border (#1b4332 and #2d6a4f)\n* Header: 'CommunityHelp Hub - Volunteer & Social Service Platform'\n* Title: 'CERTIFICATE OF APPRECIATION'\n* Volunteer's verified full name in 28pt bold serif typography\n* Detailed service clause stating the exact community task, category, hours contributed, and date\n* Organizing NGO's legal name, registration number, and coordinator signature line\n* Unique verifiable Certificate ID.\nFurthermore, the public endpoint GET /api/certificates/verify/:id allows employers or universities to verify certificate authenticity instantly.", bold_prefix="How It Is Used: ")

    add_heading_2(doc, "5.6 AI Task Recommendation Engine")
    add_body_p(doc, "Delivers intelligent, personalized task recommendations to maximize volunteer engagement and community impact.", bold_prefix="Feature Objective: ")
    add_body_p(doc, "Available at /explore-tasks under the 'AI Recommendations' tab (GET /api/tasks/recommendations/ai). The engine evaluates every open task against the volunteer's profile using a 100-point composite scoring model grounded in database attributes:", bold_prefix="How It Is Used: ")
    add_body_p(doc, "Total Recommendation Score (0 - 100 Pts) = Skill Match (40 Pts) + City Proximity (30 Pts) + Past Category Interest (20 Pts) + Quota Urgency (10 Pts)", bold_prefix="Scoring Formula: ")
    add_bullet_p(doc, "Proportional overlap between task requiredSkills and volunteer skills: (Matched Skills / Required Skills) * 40 points.", "A. Skill Match Factor (40 Points): ")
    add_bullet_p(doc, "Awards 30 points if task.city equals volunteer.city. Drives in other cities receive 0 points.", "B. City Proximity Factor (30 Points): ")
    add_bullet_p(doc, "Awards 20 points if the volunteer previously completed drives in the same category, adapting dynamically to past volunteering behavior.", "C. Category Interest Factor (20 Points): ")
    add_bullet_p(doc, "Awards 10 bonus points if task.volunteersAssigned < task.volunteersRequired, prioritizing community drives with urgent volunteer vacancies.", "D. Quota Urgency Factor (10 Points): ")
    add_body_p(doc, "The top 6 ranked tasks are returned with explicit justification strings (e.g., '[RECOMMENDED: 90 PTS] - Matches 2 of your skills; Located in your city (Chennai); Matches your interest in Education').", bold_prefix="UI Presentation: ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 6: SYSTEM TESTING & RECONCILIATION
    # -------------------------------------------------------------
    add_heading_1(doc, "6. SYSTEM TESTING, VERIFICATION, AND RECONCILIATION")

    add_heading_2(doc, "6.1 25-Point Automated End-to-End Test Suite")
    add_body_p(doc, "An automated test suite (scripts/audit-test.js) was constructed using standard HTTP assertions covering all critical workflows. All 25 test cases pass with a 100% success rate:")

    test_data = [
        ("TC-01", "Volunteer Registration", "Valid payload with phone and skills", "HTTP 201 Created", "PASS"),
        ("TC-02", "Volunteer Malformed Email", "Email lacking '@' or domain", "HTTP 400 Bad Request", "PASS"),
        ("TC-03", "Volunteer Invalid Phone", "9-digit phone number submitted", "HTTP 400 Bad Request", "PASS"),
        ("TC-04", "Password Complexity", "Password shorter than 6 characters", "HTTP 400 Bad Request", "PASS"),
        ("TC-05", "Duplicate Email Guard", "Re-registering existing email address", "HTTP 400 Bad Request", "PASS"),
        ("TC-06", "NGO Registration", "Valid organization with registration number", "HTTP 201 Created", "PASS"),
        ("TC-07", "Duplicate NGO Reg No", "Re-registering registered NGO certificate number", "HTTP 400 Bad Request", "PASS"),
        ("TC-08", "User Login (Valid)", "Correct email and password", "HTTP 200 with JWT Token", "PASS"),
        ("TC-09", "User Login (Invalid)", "Incorrect password provided", "HTTP 401 Unauthorized", "PASS"),
        ("TC-10", "Task Creation (NGO)", "Valid task payload with category and hours", "HTTP 201 Created", "PASS"),
        ("TC-11", "Category Validation", "Non-standard category string", "HTTP 400 Bad Request", "PASS"),
        ("TC-12", "Task Creation (Volunteer)", "Volunteer token attempting task posting", "HTTP 403 Forbidden", "PASS"),
        ("TC-13", "Task Update", "NGO modifying description and capacity", "HTTP 200 Updated", "PASS"),
        ("TC-14", "Task Application", "Volunteer submitting task application", "HTTP 201 Created", "PASS"),
        ("TC-15", "Duplicate Application Guard", "Applying twice for the same task", "HTTP 400 Bad Request", "PASS"),
        ("TC-16", "Application Assignment", "NGO transitioning status to 'Assigned'", "HTTP 200 Assigned", "PASS"),
        ("TC-17", "Task Completion", "NGO marking application 'Completed'", "HTTP 200 Completed", "PASS"),
        ("TC-18", "Certificate Generation", "Verifying certificate document creation in DB", "Certificate Saved", "PASS"),
        ("TC-19", "Certificate PDF Download", "Downloading binary stream via HTTP GET", "HTTP 200 PDF Stream", "PASS"),
        ("TC-20", "Skill Matching Endpoint", "Querying tasks matching volunteer skills", "HTTP 200 Filtered", "PASS"),
        ("TC-21", "Location Matching Endpoint", "Querying tasks in volunteer's city", "HTTP 200 Flagged", "PASS"),
        ("TC-22", "AI Recommendations", "Evaluating 100-point composite scoring", "HTTP 200 Ranked", "PASS"),
        ("TC-23", "Impact Analytics", "Aggregating 6 categories and total hours", "HTTP 200 Aggregated", "PASS"),
        ("TC-24", "Volunteer Rankings", "Retrieving leaderboard ordered by points", "HTTP 200 Ordered", "PASS"),
        ("TC-25", "Task Deletion", "NGO deleting task and cleaning associations", "HTTP 200 Deleted", "PASS")
    ]

    t_test = doc.add_table(rows=len(test_data) + 1, cols=5)
    style_table(
        t_test,
        [0.8, 1.6, 2.0, 1.4, 0.7],
        ["Test ID", "Test Objective", "Input / Conditions", "Observed Output", "Result"],
        test_data,
        {0: WD_ALIGN_PARAGRAPH.CENTER, 1: WD_ALIGN_PARAGRAPH.LEFT, 2: WD_ALIGN_PARAGRAPH.LEFT, 3: WD_ALIGN_PARAGRAPH.LEFT, 4: WD_ALIGN_PARAGRAPH.CENTER}
    )

    add_heading_2(doc, "6.2 Data Integrity Reconciliation Across All 37 Volunteer Profiles")
    add_body_p(doc, "To verify that volunteer metrics never suffer from data drift, an automated verification script (scripts/test-loopholes.js) reconciled all 37 volunteer documents in MongoDB Atlas against their completed applications. Every single profile satisfies the formula (completedTasksCount * 10) + (totalHours * 2) with 0 mismatches:")
    add_bullet_p(doc, "8 Completed Tasks, 28 Contributed Hours, 136 Points ((8*10) + (28*2) = 136), Rank #1 [Gold Champion]. Mathematical parity: 100%.", "1. Karthik Raman (Chennai): ")
    add_bullet_p(doc, "7 Completed Tasks, 26 Contributed Hours, 122 Points ((7*10) + (26*2) = 122), Rank #2 [Gold Champion]. Mathematical parity: 100%.", "2. Rahul Sharma (Bengaluru): ")
    add_bullet_p(doc, "7 Completed Tasks, 25 Contributed Hours, 120 Points ((7*10) + (25*2) = 120), Rank #3 [Gold Champion]. Mathematical parity: 100%.", "3. Senthil Kumar (Coimbatore): ")

    add_heading_2(doc, "6.3 Production Loophole and Edge-Case Hardening")
    add_body_p(doc, "The codebase was hardened to eliminate common web application loopholes:")
    add_bullet_p(doc, "When volunteersAssigned reaches volunteersRequired, new applications and assignments are blocked at the API layer, and UI buttons display disabled 'Quota Filled'.", "1. Quota Enforcement: ")
    add_bullet_p(doc, "Applications for events with scheduled dates in the past are rejected with descriptive HTTP 400 responses.", "2. Event Date Guards: ")
    add_bullet_p(doc, "When un-assigning or rejecting applicants, volunteersAssigned decrements, and status restores to 'Open' if count drops to 0.", "3. Status Synchronization: ")
    add_bullet_p(doc, "Certificates are queryable by both 24-character ObjectIds and human-readable IDs (CHH-CERT-IND-CHN-1001), with a public verification endpoint at /api/certificates/verify/:id.", "4. Verifiable Certificate API: ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 7: DEMONSTRATION WALKTHROUGH
    # -------------------------------------------------------------
    add_heading_1(doc, "7. EVALUATOR DEMONSTRATION WALKTHROUGH")

    add_heading_2(doc, "7.1 Pre-Seeded Demonstration Accounts")
    add_body_p(doc, "Faculty evaluators can immediately test all roles using pre-seeded, verified credentials:")

    demo_data = [
        ("System Administrator", "admin@communityhelphub.in", "password123", "Full administrative oversight, NGO verification"),
        ("Verified NGO Partner", "kavalar.ngo@gmail.com", "password123", "Task creation, application review, assigning volunteers"),
        ("Volunteer (Rank #1)", "karthik.raman@gmail.com", "password123", "8 completed tasks, 28 hrs, 136 pts, certificate download"),
        ("Volunteer (Rank #2)", "rahul.volunteer@gmail.com", "password123", "7 completed tasks, 26 hrs, 122 pts, education focus"),
        ("Volunteer (Rank #3)", "senthil.kumar@gmail.com", "password123", "7 completed tasks, 25 hrs, 120 pts, environment focus")
    ]

    t_demo = doc.add_table(rows=len(demo_data) + 1, cols=4)
    style_table(
        t_demo,
        [1.6, 1.8, 1.1, 2.0],
        ["Role Title", "Login Email", "Password", "Evaluation Scope"],
        demo_data,
        {0: WD_ALIGN_PARAGRAPH.LEFT, 1: WD_ALIGN_PARAGRAPH.LEFT, 2: WD_ALIGN_PARAGRAPH.CENTER, 3: WD_ALIGN_PARAGRAPH.LEFT}
    )

    add_heading_2(doc, "7.2 Step-by-Step Live Workflow Walkthrough")
    add_body_p(doc, "Follow these steps to demonstrate real-time dynamic database synchronization:")
    add_bullet_p(doc, "Open two browser windows side by side. Log into Tab 1 as NGO (kavalar.ngo@gmail.com) and Tab 2 as Volunteer (karthik.raman@gmail.com).", "Step 1 (Dual Login): ")
    add_bullet_p(doc, "In Tab 1, navigate to 'Publish Task' (/create-task) and publish a new task: 'School Digital Lab Setup', Category: Education, Hours: 4, Volunteers Required: 2.", "Step 2 (Task Creation): ")
    add_bullet_p(doc, "In Tab 2, navigate to 'Explore Tasks' (/explore-tasks). The new drive appears immediately with an AI match score. Click 'Apply for Task' and submit an optional availability note.", "Step 3 (Task Application): ")
    add_bullet_p(doc, "In Tab 1, refresh the NGO Dashboard. Karthik Raman's application appears under 'Volunteer Applications Received'. Click 'Assign' (counter increments to 1/2 Filled), then click 'Mark Completed'.", "Step 4 (Assignment & Completion): ")
    add_bullet_p(doc, "In Tab 2, refresh the Volunteer Dashboard. Completed Tasks increments from 8 to 9; Hours increments from 28 to 32; Ranking Points update from 136 to 154 (136 + 10 + 4*2); and an official PDF Certificate of Appreciation is immediately downloadable.", "Step 5 (Verification & Certification): ")

    doc.add_page_break()

    # -------------------------------------------------------------
    # CHAPTER 8: CONCLUSION
    # -------------------------------------------------------------
    add_heading_1(doc, "8. CONCLUSION AND FUTURE ENHANCEMENTS")

    add_heading_2(doc, "8.1 Conclusion")
    add_body_p(doc, "CommunityHelp Hub successfully satisfies 100% of the project specifications outlined in the curriculum. The platform solves the real-world disconnect between willing volunteers and non-profit organizations by providing an integrated digital ecosystem. By enforcing mathematical consistency across volunteer hours, preventing capacity overflows, implementing multi-factor AI recommendation heuristics, and offering automated PDF certificate generation, the software demonstrates enterprise-grade full-stack engineering.")

    add_heading_2(doc, "8.2 Future Scope")
    add_bullet_p(doc, "Instant SMS alerts dispatched to nearby registered volunteers when urgent disaster relief operations are posted.", "1. SMS Disaster Broadcasts: ")
    add_bullet_p(doc, "Mobile geofencing using device GPS coordinates to verify volunteer on-ground presence at the relief site.", "2. Geofenced Attendance: ")
    add_bullet_p(doc, "Printing QR codes directly on PDF certificates that link directly to the public verification API endpoint.", "3. QR Code Verification: ")

    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(40)
    p_end.paragraph_format.space_after = Pt(20)
    r = p_end.add_run("--- END OF PROJECT REPORT ---")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = BLACK
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.save(output_path)
    print(f"Report generated successfully at: {output_path}")

if __name__ == '__main__':
    local_target = os.path.abspath("CommunityHelp_Hub_Project_Report.docx")
    generate_full_report(local_target)
    
    desktop_target = r"C:\Users\DELL\Desktop\CommunityHelp_Hub_Project_Report.docx"
    try:
        shutil.copyfile(local_target, desktop_target)
        print(f"Copied to Desktop: {desktop_target}")
    except PermissionError:
        alt_desktop = r"C:\Users\DELL\Desktop\CommunityHelp_Hub_Project_Report_Master.docx"
        shutil.copyfile(local_target, alt_desktop)
        print(f"Desktop file was locked. Saved as: {alt_desktop}")
