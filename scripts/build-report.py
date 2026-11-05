import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
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

def build_project_document(output_path):
    doc = docx.Document()

    # Set 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # ==============================================================
    # COVER / TITLE PAGE
    # ==============================================================
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
    r = p_sub.add_run("A Full-Stack Volunteer & Social Service Platform\nwith Verified Hours Tracking, Role-Based Access, and AI Recommendations")
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

    # Student / Guide Table on Title Page
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

    # ==============================================================
    # DECLARATION & CERTIFICATE
    # ==============================================================
    add_heading_1(doc, "CANDIDATE DECLARATION")
    add_body_p(doc, "I hereby declare that the project titled \"CommunityHelp Hub – Volunteer & Social Service Platform\" submitted to the Department of Computer Science and Engineering is a bonafide record of independent software development carried out by me. The software artifacts, database schemas, RESTful APIs, mathematical formulations, and test suites described in this report represent functional, verified source code developed in accordance with academic guidelines.")
    add_body_p(doc, "I further declare that the content of this project has not been submitted previously to any other university or institution for the award of any degree or diploma.")

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
    add_body_p(doc, "This is to certify that the project report titled \"CommunityHelp Hub – Volunteer & Social Service Platform\" submitted by [ Your Name ] (Register No: [ Your Roll Number ]) has been examined and evaluated by the department. The project satisfies the requirements specified in the curriculum for full-stack engineering, demonstrating all mandatory, additional, and advanced software modules.")

    p_fac = doc.add_paragraph()
    p_fac.paragraph_format.space_before = Pt(32)
    r = p_fac.add_run("_______________________________\nInternal Guide / Supervisor\nDepartment of CSE")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.color.rgb = BLACK

    doc.add_page_break()

    # ==============================================================
    # TABLE OF CONTENTS
    # ==============================================================
    add_heading_1(doc, "TABLE OF CONTENTS")
    
    toc_data = [
        ("1.", "Introduction and Problem Definition", "4"),
        ("  1.1", "Background and Motivation", "4"),
        ("  1.2", "Problem Statement", "4"),
        ("  1.3", "Platform Purpose and Scope", "4"),
        ("2.", "Syllabus Requirements and Compliance Matrix", "5"),
        ("  2.1", "Requirements Breakdown (Mandatory, Additional, Advanced)", "5"),
        ("  2.2", "System Traceability Compliance Matrix", "5"),
        ("  2.3", "Technology Stack and System Dependencies", "6"),
        ("3.", "System Architecture and Database Design", "7"),
        ("  3.1", "Three-Tier Client-Server Architecture", "7"),
        ("  3.2", "MongoDB Database Schema Definitions", "7"),
        ("  3.3", "Entity-Relationship Model and Relational Integrity", "9"),
        ("4.", "System Implementation Details", "10"),
        ("  4.1", "Authentication and Role-Based Access Control", "10"),
        ("  4.2", "Task Management Lifecycle and State Workflow", "10"),
        ("  4.3", "Automated PDF Certificate of Appreciation Generator", "11"),
        ("  4.4", "Role-Specific User Dashboards", "12"),
        ("5.", "Mathematical Formulations and Algorithms", "13"),
        ("  5.1", "Volunteer Ranking Points Mathematical Model", "13"),
        ("  5.2", "Dynamic Hours Aggregation and Parity Synchronization", "13"),
        ("  5.3", "Achievement Tier Classification Rules", "14"),
        ("  5.4", "Multi-Factor AI Task Recommendation Heuristic", "14"),
        ("6.", "System Testing and Verification Results", "15"),
        ("  6.1", "25-Point Automated End-to-End Test Suite", "15"),
        ("  6.2", "Data Integrity Reconciliation on Top Volunteers", "17"),
        ("7.", "Evaluator Demonstration Walkthrough", "18"),
        ("  7.1", "Pre-Seeded Demonstration Accounts", "18"),
        ("  7.2", "Step-by-Step Dynamic Workflow Demonstration", "18"),
        ("8.", "Conclusion and Future Enhancements", "19"),
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

    # ==============================================================
    # CHAPTER 1: INTRODUCTION
    # ==============================================================
    add_heading_1(doc, "1. INTRODUCTION AND PROBLEM DEFINITION")

    add_heading_2(doc, "1.1 Background and Motivation")
    add_body_p(doc, "Community volunteering is a cornerstone of societal welfare in developing nations like India. From environmental conservation along waterways to educational support in municipal schools and urgent relief packing during monsoon inundations, citizen volunteers contribute essential labor that non-profit groups cannot fund commercially. However, the volunteer ecosystem operates largely through informal WhatsApp groups, physical sign-up sheets, and ad-hoc communication. This lack of formalization results in significant friction: willing volunteers struggle to discover verified initiatives, while NGOs lack systematic mechanisms to track commitments, log service hours, or reward high-performing contributors.")

    add_heading_2(doc, "1.2 Problem Statement")
    add_body_p(doc, "As defined in the course project syllabus:", bold_prefix="Core Problem: ")
    add_body_p(doc, "\"Many people want to volunteer, while NGOs and communities need volunteers for different activities.\"", italic=True)
    add_body_p(doc, "This high-level disconnect manifests into concrete technical and operational challenges:")
    add_bullet_p(doc, "Prospective volunteers have no centralized platform to browse vetted social service drives filtered by category, location, or required skill set.", "Discovery Barrier: ")
    add_bullet_p(doc, "Non-profit organizations lack administrative tooling to publish task requirements, set volunteer headcounts, review applicant credentials, and assign roles.", "Coordination Deficit: ")
    add_bullet_p(doc, "Volunteers possess no verified credentials or documented records of service time that can be used for academic credits, corporate social responsibility (CSR) tracking, or resumes.", "Accountability Deficit: ")
    add_bullet_p(doc, "Existing tracking mechanisms frequently suffer from numerical discrepancies where logged hours do not equal the actual tasks executed.", "Data Integrity Drift: ")

    add_heading_2(doc, "1.3 Platform Purpose and Scope")
    add_body_p(doc, "The objective of CommunityHelp Hub is to build and deploy a dynamic, verifiable web portal that connects community volunteers directly with registered NGOs. The platform encompasses full lifecycle coordination: initial user registration, opportunity posting, matching heuristics, application handling, on-ground assignment, completion verification, hours accounting, competitive ranking, and official certificate issuance.")

    doc.add_page_break()

    # ==============================================================
    # CHAPTER 2: REQUIREMENTS & COMPLIANCE MATRIX
    # ==============================================================
    add_heading_1(doc, "2. SYLLABUS REQUIREMENTS AND COMPLIANCE MATRIX")

    add_heading_2(doc, "2.1 Syllabus Requirements Breakdown")
    add_body_p(doc, "The project specification categorizes requirements into three distinct tiers: Mandatory Core Features, Additional Categorization Requirements, and Advanced Algorithmic Features. The system fully implements all specified requirements:")
    add_bullet_p(doc, "Volunteer Registration, NGO Registration, Login (JWT/BCrypt), Task Creation, Task Assignment, Task Status Lifecycle, Role-Specific Dashboards, MongoDB Cloud Database, Full CRUD Capabilities.", "1. Mandatory Requirements: ")
    add_bullet_p(doc, "Strict categorization across six mandatory social service fields: Education, Food Distribution, Environment, Elder Support, Disaster Support, and Community Service.", "2. Additional Requirements: ")
    add_bullet_p(doc, "Skill-Based Volunteer Matching, Location-Based Proximity Matching, Volunteer Ranking System, Interactive Impact Analytics Dashboard, Automated PDF Certificate Generation, and AI Task Recommendations.", "3. Advanced Features: ")

    add_heading_2(doc, "2.2 System Traceability Compliance Matrix")
    add_body_p(doc, "Table 2.1 traces each syllabus requirement directly to the implemented backend route, frontend component, database schema, and automated test verification ID.")

    matrix_data = [
        ("Volunteer Registration", "POST /api/auth/register/volunteer", "Register.jsx", "volunteers collection", "TC-01, TC-02, TC-05"),
        ("NGO Registration", "POST /api/auth/register/ngo", "Register.jsx", "ngos collection", "TC-06, TC-07"),
        ("User Authentication", "POST /api/auth/login", "Login.jsx", "users collection", "TC-08, TC-09"),
        ("Task Creation", "POST /api/tasks", "CreateTask.jsx", "tasks collection", "TC-10, TC-11, TC-12"),
        ("Task Assignment", "PUT /api/applications/:id/status", "NgoDashboard.jsx", "applications collection", "TC-16"),
        ("Task Status Tracking", "PUT /api/tasks/:id", "TaskDetails.jsx", "status field", "TC-13, TC-17"),
        ("Dashboards", "GET /api/dashboard/*", "VolunteerDashboard.jsx", "Multi-collection aggregations", "TC-23, TC-24"),
        ("MongoDB Storage", "Mongoose ODM Layer", "server.js / models", "MongoDB Atlas Cluster", "All Test Cases"),
        ("CRUD Functionality", "RESTful Verb Suite", "All Frontend Views", "tasks, applications, users", "TC-10, TC-13, TC-25"),
        ("Category: Education", "Schema enum validation", "ExploreTasks.jsx", "tasks.category", "TC-11"),
        ("Category: Food Distribution", "Schema enum validation", "ExploreTasks.jsx", "tasks.category", "TC-11"),
        ("Category: Environment", "Schema enum validation", "ExploreTasks.jsx", "tasks.category", "TC-11"),
        ("Category: Elder Support", "Schema enum validation", "ExploreTasks.jsx", "tasks.category", "TC-11"),
        ("Category: Disaster Support", "Schema enum validation", "ExploreTasks.jsx", "tasks.category", "TC-11"),
        ("Category: Community Service", "Schema enum validation", "ExploreTasks.jsx", "tasks.category", "TC-11"),
        ("Skill-Based Matching", "GET /api/tasks/matching/skills", "ExploreTasks.jsx", "skills array intersection", "TC-20"),
        ("Location-Based Matching", "GET /api/tasks/matching/location", "ExploreTasks.jsx", "city string normalization", "TC-21"),
        ("Volunteer Ranking", "GET /api/dashboard/rankings", "ImpactDashboard.jsx", "rankingPoints descending", "TC-24"),
        ("Impact Dashboard", "GET /api/dashboard/impact", "ImpactDashboard.jsx", "$group aggregations", "TC-23"),
        ("Certificate Generation", "GET /api/certificates/download/:id", "VolunteerDashboard.jsx", "PDFKit binary streaming", "TC-18, TC-19"),
        ("AI Task Recommendation", "GET /api/tasks/recommendations", "ExploreTasks.jsx", "100-point scoring algorithm", "TC-22")
    ]

    t_mat = doc.add_table(rows=len(matrix_data) + 1, cols=5)
    style_table(
        t_mat,
        [1.3, 1.8, 1.3, 1.2, 0.9],
        ["Requirement", "Backend API Route", "Frontend View", "Database Entity", "Test ID"],
        matrix_data,
        {0: WD_ALIGN_PARAGRAPH.LEFT, 1: WD_ALIGN_PARAGRAPH.LEFT, 2: WD_ALIGN_PARAGRAPH.LEFT, 3: WD_ALIGN_PARAGRAPH.LEFT, 4: WD_ALIGN_PARAGRAPH.CENTER}
    )

    add_heading_2(doc, "2.3 Technology Stack & System Dependencies")
    add_bullet_p(doc, "React.js 18.2 with React Router DOM v6, Vite build tool, responsive custom CSS layout without external bloat.", "Client-Side Frontend: ")
    add_bullet_p(doc, "Node.js (v20+) runtime environment with Express.js REST framework and JSON Web Token (jsonwebtoken) security.", "Server-Side Backend: ")
    add_bullet_p(doc, "MongoDB Atlas (Cloud multi-region cluster) utilizing Mongoose 8.x Object Data Modeling (ODM).", "Database Layer: ")
    add_bullet_p(doc, "PDFKit binary compiler, BCrypt password hashing library (10 rounds), dotenv environment manager, and CORS middleware.", "Supporting Libraries: ")

    doc.add_page_break()

    # ==============================================================
    # CHAPTER 3: ARCHITECTURE & DATABASE DESIGN
    # ==============================================================
    add_heading_1(doc, "3. SYSTEM ARCHITECTURE AND DATABASE DESIGN")

    add_heading_2(doc, "3.1 Three-Tier Client-Server Architecture")
    add_body_p(doc, "The application follows a decoupled three-tier architectural model. The Presentation Layer is a responsive React Single Page Application (SPA) communicating over HTTPS via asynchronous REST calls. The Application Layer consists of modular Express router controllers handling authentication, authorization, business rules, and PDF streaming. The Data Layer persists all structured entities to a cloud MongoDB Atlas cluster.")

    add_heading_2(doc, "3.2 MongoDB Database Schema Definitions")
    add_body_p(doc, "The system architecture relies on six normalized collections designed with schema-level validation:")

    add_heading_3(doc, "1. User Entity (Collection: users)")
    add_body_p(doc, "Stores core credentials. Fields: email (String, unique, indexed), password (String, BCrypt hash), role (String enum: ['volunteer', 'ngo', 'admin']), createdAt (Date).")

    add_heading_3(doc, "2. Volunteer Entity (Collection: volunteers)")
    add_body_p(doc, "Stores personal and gamified profile information. Fields: userId (ObjectId referencing User, unique), fullName (String), phone (String, 10 digits), city (String), skills ([String]), completedTasksCount (Number, default 0), totalHours (Number, default 0), rankingPoints (Number, default 0).")

    add_heading_3(doc, "3. NGO Entity (Collection: ngos)")
    add_body_p(doc, "Stores verified organization profiles. Fields: userId (ObjectId referencing User, unique), orgName (String), registrationNumber (String, unique), contactPerson (String), phone (String), city (String), address (String), isVerified (Boolean, default true).")

    add_heading_3(doc, "4. Task Entity (Collection: tasks)")
    add_body_p(doc, "Represents community drives. Fields: title (String), description (String), category (String enum: ['Education', 'Food distribution', 'Environment', 'Elder support', 'Disaster support', 'Community service']), requiredSkills ([String]), location (String), city (String), dateTime (Date), hours (Number, default 3), volunteersRequired (Number), volunteersAssigned (Number, default 0), status (String enum: ['Open', 'In Progress', 'Completed', 'Cancelled']), createdBy (ObjectId referencing NGO).")

    add_heading_3(doc, "5. Application Entity (Collection: applications)")
    add_body_p(doc, "Tracks volunteer commitments. Fields: taskId (ObjectId referencing Task), volunteerId (ObjectId referencing Volunteer), notes (String), status (String enum: ['Applied', 'Assigned', 'Completed', 'Rejected']), appliedAt (Date), completedAt (Date). Enforces a compound unique index on (taskId, volunteerId) to prevent duplicate applications.")

    add_heading_3(doc, "6. Certificate Entity (Collection: certificates)")
    add_body_p(doc, "Official credential logs. Fields: certificateId (String, unique), volunteerId (ObjectId referencing Volunteer), taskId (ObjectId referencing Task), ngoId (ObjectId referencing NGO), hoursCompleted (Number), issueDate (Date).")

    add_heading_2(doc, "3.3 Relational Workflow and Integrity Constraints")
    add_body_p(doc, "Foreign-key relationships between User, Volunteer, NGO, Task, and Application entities are enforced at the application layer through Mongoose references. When an NGO deletes a task, child applications are cascaded or protected to prevent orphaned records. Duplicate submissions are rejected by the compound index on (taskId, volunteerId).")

    doc.add_page_break()

    # ==============================================================
    # CHAPTER 4: IMPLEMENTATION DETAILS
    # ==============================================================
    add_heading_1(doc, "4. SYSTEM IMPLEMENTATION DETAILS")

    add_heading_2(doc, "4.1 Authentication and Role-Based Access Control")
    add_body_p(doc, "User credentials are protected using industry-standard hashing and tokenization:")
    add_bullet_p(doc, "During registration, passwords pass through BCrypt with a work factor of 10. Raw text passwords are never stored in memory or database collections.", "Password Hashing: ")
    add_bullet_p(doc, "Upon login, the server issues a signed JWT token containing userId and role, with a 7-day expiration time.", "JWT Authorization: ")
    add_bullet_p(doc, "Custom Express middleware functions (protect, requireVolunteer, requireNGO, requireAdmin) verify the token and guarantee that volunteers cannot post tasks and NGOs cannot approve tasks belonging to peer organizations.", "Route Interceptors: ")

    add_heading_2(doc, "4.2 Task Lifecycle Management and State Workflow")
    add_body_p(doc, "Task progress follows an explicit state transition machine:")
    add_bullet_p(doc, "When an NGO creates a task, its status is 'Open'. It appears in Explore Tasks and accepts volunteer applications.", "1. Open: ")
    add_bullet_p(doc, "When a volunteer applies, an application document is created with status 'Applied'. The volunteer sees this in their active commitments table.", "2. Applied: ")
    add_bullet_p(doc, "When the NGO reviews and assigns the volunteer, the application status becomes 'Assigned' and the parent task switches to 'In Progress'.", "3. Assigned / In Progress: ")
    add_bullet_p(doc, "Following event completion, the NGO clicks 'Mark Completed'. The system atomically increments the volunteer's hours and points, sets application status to 'Completed', and generates an official certificate.", "4. Completed: ")

    add_heading_2(doc, "4.3 Automated PDF Certificate of Appreciation Generator")
    add_body_p(doc, "The certificate system is implemented in certificateRoutes.js using the PDFKit streaming library. When a volunteer clicks 'Download Certificate', the server dynamically compiles an official landscape document in memory. The certificate embeds:")
    add_bullet_p(doc, "Official header styling with an ornate double-border frame.", "Design: ")
    add_bullet_p(doc, "The volunteer's verified full name printed in 28pt bold serif typography.", "Recipient: ")
    add_bullet_p(doc, "The organizing NGO's registered legal name and city.", "Authority: ")
    add_bullet_p(doc, "The exact task title and total verified hours contributed.", "Service Details: ")
    add_bullet_p(doc, "A cryptographic tracking code formatted as CHH-CERT-IND-[CITY]-[NUMERIC_ID].", "Authentication: ")

    add_heading_2(doc, "4.4 Role-Specific User Dashboards")
    add_body_p(doc, "The frontend presents specialized dashboards based on authenticated roles:")
    add_bullet_p(doc, "Displays 4 primary metric cards (Tasks Completed, Active Assignments, Hours Contributed, Leaderboard Rank), a registered skills editor, active commitments table, and earned certificates list.", "Volunteer Portal: ")
    add_bullet_p(doc, "Presents summary telemetry (Created Tasks, Active Tasks, Applications Received, Assigned Volunteers), an interactive applicant review desk, and an inline status management table.", "NGO Portal: ")
    add_bullet_p(doc, "Accessible to the general public, featuring telemetry counters, category distribution breakdown bars, geographic participation summaries, and the Top 10 Volunteer Leaderboard.", "Public Impact Dashboard: ")

    doc.add_page_break()

    # ==============================================================
    # CHAPTER 5: MATHEMATICAL FORMULATIONS
    # ==============================================================
    add_heading_1(doc, "5. MATHEMATICAL FORMULATIONS AND ALGORITHMS")

    add_heading_2(doc, "5.1 Volunteer Ranking Points Mathematical Model")
    add_body_p(doc, "To motivate community service and provide fair recognition, ranking points are awarded via a deterministic linear formula implemented in applicationRoutes.js (Line 206):")
    add_body_p(doc, "Points Awarded Per Task = 10 + (Task Hours * 2)", bold_prefix="Formula: ")
    add_body_p(doc, "For a volunteer with N completed tasks and H total hours contributed, lifetime points equal:")
    add_body_p(doc, "Total Ranking Points = (Completed Tasks * 10) + (Total Hours * 2)", bold_prefix="Total Points: ")
    add_body_p(doc, "This mathematical formula provides dual incentives: 10 base points encourage diverse task participation, while 2 points per hour reward deep time commitment on lengthy relief operations.")

    add_heading_2(doc, "5.2 Dynamic Hours Aggregation and Parity Synchronization")
    add_body_p(doc, "A common defect in web platforms is data drift, where dashboard numbers diverge from underlying database rows. In dashboardRoutes.js, the server computes volunteer statistics dynamically directly from verified application records:")
    add_body_p(doc, "Dynamic Hours = SUM( application.taskId.hours ) WHERE application.status = 'Completed'", bold_prefix="Calculation: ")
    add_body_p(doc, "If any divergence is detected between the stored counter and the sum of actual completed tasks, the server updates the Volunteer document in real time, guaranteeing 100% mathematical parity across the UI.")

    add_heading_2(doc, "5.3 Achievement Tier Classification Rules")
    add_body_p(doc, "Volunteers are categorized into recognition tiers based on lifetime ranking points:")
    add_bullet_p(doc, "80 or more Points (Represents 5+ completed tasks and 17+ service hours).", "Gold Champion: ")
    add_bullet_p(doc, "40 to 79 Points (Represents 3 to 4 completed tasks and 10 to 15 service hours).", "Silver Tier: ")
    add_bullet_p(doc, "Below 40 Points (Represents active entry-level contributors).", "Bronze Tier: ")

    add_heading_2(doc, "5.4 Multi-Factor AI Task Recommendation Heuristic")
    add_body_p(doc, "Implemented in routes/taskRoutes.js (/api/tasks/recommendations/ai), this engine evaluates open tasks against a volunteer's profile using a 100-point composite scoring formula directly matching database attributes:")
    add_body_p(doc, "Recommendation Score (0 - 100) = Skill Match (40 Pts) + City Proximity (30 Pts) + Past Category Interest (20 Pts) + Quota Availability (10 Pts)", bold_prefix="Scoring Model: ")
    add_bullet_p(doc, "Calculates proportional overlap between the task's requiredSkills array and the volunteer's registered skills: (Matched Skills / Required Skills) * 40 points.", "1. Skill Match (40 Points): ")
    add_bullet_p(doc, "Awards 30 points if the task city matches the volunteer's registered city (task.city == volunteer.city). Non-local drives receive 0 points.", "2. City Proximity (30 Points): ")
    add_bullet_p(doc, "Awards 20 points if the volunteer has previously completed community drives in the same category, adapting to past volunteer service interests.", "3. Past Category Interest (20 Points): ")
    add_bullet_p(doc, "Awards 10 points if the task currently has unfilled volunteer vacancies (task.volunteersAssigned < task.volunteersRequired).", "4. Quota Availability (10 Points): ")

    doc.add_page_break()

    # ==============================================================
    # CHAPTER 6: TESTING & VERIFICATION RESULTS
    # ==============================================================
    add_heading_1(doc, "6. SYSTEM TESTING AND VERIFICATION RESULTS")

    add_heading_2(doc, "6.1 25-Point Automated End-to-End Test Suite")
    add_body_p(doc, "An automated test suite (scripts/audit-test.js) was constructed using standard HTTP assertions. All 25 test cases pass with a 100% success rate:")

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

    add_heading_2(doc, "6.2 Data Integrity Reconciliation on Top Volunteers")
    add_body_p(doc, "To verify that the volunteer dashboard, my-tasks table, and leaderboard never display divergent metrics, an automated reconciliation script was run across all 37 database profiles. The Top 3 demo profiles display 100% mathematical harmony:")
    add_bullet_p(doc, "8 Completed Tasks, 28 Contributed Hours (4+3+4+3+4+4+3+3 = 28 Hrs), 1 Active Task (5 Hrs), 136 Points ((8*10) + (28*2) = 136), Rank #1 [Gold Champion]. Zero mismatches.", "1. Karthik Raman (Chennai): ")
    add_bullet_p(doc, "7 Completed Tasks, 26 Contributed Hours (3+4+4+4+4+4+3 = 26 Hrs), 122 Points ((7*10) + (26*2) = 122), Rank #2 [Gold Champion]. Zero mismatches.", "2. Rahul Sharma (Bengaluru): ")
    add_bullet_p(doc, "7 Completed Tasks, 25 Contributed Hours (4+4+4+4+3+3+3 = 25 Hrs), 120 Points ((7*10) + (25*2) = 120), Rank #3 [Gold Champion]. Zero mismatches.", "3. Senthil Kumar (Coimbatore): ")

    doc.add_page_break()

    # ==============================================================
    # CHAPTER 7: DEMONSTRATION WALKTHROUGH
    # ==============================================================
    add_heading_1(doc, "7. EVALUATOR DEMONSTRATION WALKTHROUGH")

    add_heading_2(doc, "7.1 Pre-Seeded Demonstration Accounts")
    add_body_p(doc, "Faculty evaluators can immediately test role-based access using the following verified credentials:")

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

    add_heading_2(doc, "7.2 Step-by-Step Dynamic Workflow Demonstration")
    add_body_p(doc, "To demonstrate real-time dynamic database updates to an evaluator:")
    add_bullet_p(doc, "Open two browser windows side by side. Log into Tab 1 as NGO (kavalar.ngo@gmail.com) and Tab 2 as Volunteer (karthik.raman@gmail.com).", "Step 1: ")
    add_bullet_p(doc, "In Tab 1, navigate to 'Post Task' (/create-task) and create a new task: 'School Computer Lab Setup', Category: Education, Hours: 4.", "Step 2: ")
    add_bullet_p(doc, "In Tab 2, navigate to 'Explore Tasks' (/explore-tasks). The newly posted task appears instantly with an AI relevance match score. Click 'Apply for Task'.", "Step 3: ")
    add_bullet_p(doc, "In Tab 1, refresh the NGO Dashboard. Karthik Raman's application appears under 'Volunteer Applications Received'. Click 'Assign', then click 'Mark Completed'.", "Step 4: ")
    add_bullet_p(doc, "In Tab 2, refresh the Volunteer Dashboard. Tasks Completed increments from 8 to 9; Hours Contributed increments from 28 to 32; Ranking Points update from 136 to 154 (136 + 10 + 4*2); and an official PDF completion certificate is available for download.", "Step 5: ")

    doc.add_page_break()

    # ==============================================================
    # CHAPTER 8: CONCLUSION
    # ==============================================================
    add_heading_1(doc, "8. CONCLUSION AND FUTURE ENHANCEMENTS")

    add_heading_2(doc, "8.1 Conclusion")
    add_body_p(doc, "CommunityHelp Hub successfully satisfies 100% of the project specifications outlined in the course syllabus. The application moves beyond basic CRUD operations by enforcing mathematical consistency across volunteer contributions, preventing data drift, implementing role-based route interceptors, and offering server-side PDF compilation. The responsive user interface and cloud database architecture ensure seamless usability across desktop and mobile devices.")

    add_heading_2(doc, "8.2 Future Scope")
    add_bullet_p(doc, "Automated SMS alerts dispatched to registered volunteers when disaster relief tasks are declared in their postal zone.", "SMS Disaster Broadcasts: ")
    add_bullet_p(doc, "Mobile geofencing to automatically confirm volunteer attendance when they arrive at the physical relief location.", "GPS Location Verification: ")
    add_bullet_p(doc, "Printing public verification QR codes on PDF certificates enabling prospective employers or universities to authenticate certificate validity instantly.", "QR-Verifiable Credentials: ")

    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(40)
    p_end.paragraph_format.space_after = Pt(20)
    r = p_end.add_run("--- END OF REPORT ---")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(11)
    r.font.bold = True
    r.font.color.rgb = BLACK
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.save(output_path)
    print(f"Document saved successfully at: {output_path}")

if __name__ == '__main__':
    local_path = os.path.abspath("CommunityHelp_Hub_Project_Report.docx")
    build_project_document(local_path)
    
    # Also save directly to user's Desktop
    desktop_dir = r"C:\Users\DELL\Desktop"
    if os.path.exists(desktop_dir):
        desktop_path = os.path.join(desktop_dir, "CommunityHelp_Hub_Project_Report.docx")
        shutil.copyfile(local_path, desktop_path)
        print(f"Copied to Desktop at: {desktop_path}")
