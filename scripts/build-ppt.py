import os
import shutil
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Strict Color Palette: Pure Black, Dark Charcoal, Light Border, Subtle Card BG
COLOR_BLACK = RGBColor(0, 0, 0)
COLOR_DARK = RGBColor(30, 30, 30)
COLOR_MUTED = RGBColor(80, 80, 80)
COLOR_LIGHT_BG = RGBColor(248, 248, 248)
COLOR_BORDER = RGBColor(210, 210, 210)
COLOR_WHITE = RGBColor(255, 255, 255)

def create_blank_slide(prs):
    blank_layout = prs.slide_layouts[6]
    return prs.slides.add_slide(blank_layout)

def add_header(slide, title_text, category_text="COMMUNITYHELP HUB - ACADEMIC PROJECT PRESENTATION"):
    # Category Tracker
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
    tf_c = cat_box.text_frame
    tf_c.word_wrap = True
    p_c = tf_c.paragraphs[0]
    p_c.text = category_text.upper()
    p_c.font.name = "Arial"
    p_c.font.size = Pt(9.5)
    p_c.font.bold = True
    p_c.font.color.rgb = COLOR_MUTED

    # Title
    t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.65))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.name = "Arial"
    p_t.font.size = Pt(20)
    p_t.font.bold = True
    p_t.font.color.rgb = COLOR_BLACK

    # Divider Line
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.4), Inches(11.73), Inches(0.02))
    line.fill.solid()
    line.fill.fore_color.rgb = COLOR_BLACK
    line.line.color.rgb = COLOR_BLACK

def add_card(slide, left, top, width, height, title, body_bullets=None, body_p=None, bg_color=COLOR_LIGHT_BG):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.color.rgb = COLOR_BORDER
    shape.line.width = Pt(1)

    tf = shape.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = Inches(0.2)
    tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.18)
    tf.margin_bottom = Inches(0.18)

    if title:
        p0 = tf.paragraphs[0]
        p0.text = title
        p0.font.name = "Arial"
        p0.font.size = Pt(13)
        p0.font.bold = True
        p0.font.color.rgb = COLOR_BLACK
        p0.space_after = Pt(6)

    if body_p:
        p = tf.add_paragraph()
        p.text = body_p
        p.font.name = "Arial"
        p.font.size = Pt(10.5)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(4)

    if body_bullets:
        for item in body_bullets:
            p = tf.add_paragraph()
            p.font.name = "Arial"
            p.font.size = Pt(10)
            p.font.color.rgb = COLOR_DARK
            p.space_after = Pt(3)
            if isinstance(item, tuple):
                r_b = p.add_run()
                r_b.text = item[0] + " "
                r_b.font.bold = True
                r_b.font.color.rgb = COLOR_BLACK
                r_t = p.add_run()
                r_t.text = item[1]
                r_t.font.color.rgb = COLOR_DARK
            else:
                r = p.add_run()
                r.text = "- " + item
                r.font.color.rgb = COLOR_DARK

def add_table_custom(slide, left, top, width, height, headers, data, col_widths=None):
    rows = len(data) + 1
    cols = len(headers)
    table_shape = slide.shapes.add_table(rows, cols, left, top, width, height)
    table = table_shape.table

    if col_widths:
        for idx, w in enumerate(col_widths):
            table.columns[idx].width = Inches(w)

    # Header Row
    for col_idx, header in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(230, 230, 230)
        p = cell.text_frame.paragraphs[0]
        p.text = header
        p.font.name = "Arial"
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.alignment = PP_ALIGN.CENTER

    # Data Rows
    for row_idx, row_values in enumerate(data):
        bg = RGBColor(255, 255, 255) if row_idx % 2 == 0 else RGBColor(245, 245, 245)
        for col_idx, value in enumerate(row_values):
            cell = table.cell(row_idx + 1, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.text = str(value)
            p.font.name = "Arial"
            p.font.size = Pt(9.5)
            p.font.color.rgb = COLOR_DARK
            if col_idx in [0, len(row_values) - 1]:
                p.alignment = PP_ALIGN.CENTER
            else:
                p.alignment = PP_ALIGN.LEFT

def build_presentation(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # ==============================================================
    # SLIDE 1: TITLE SLIDE
    # ==============================================================
    s1 = create_blank_slide(prs)

    # Decorative border frame
    frame = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(0.6), Inches(12.133), Inches(6.3))
    frame.fill.solid()
    frame.fill.fore_color.rgb = COLOR_WHITE
    frame.line.color.rgb = COLOR_BLACK
    frame.line.width = Pt(2)

    # Institutional Header
    tbox = s1.shapes.add_textbox(Inches(1.0), Inches(0.9), Inches(11.333), Inches(0.8))
    p = tbox.text_frame.paragraphs[0]
    p.text = "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\nACADEMIC PROJECT PRESENTATION | 2026 - 2027"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_MUTED
    p.alignment = PP_ALIGN.CENTER

    # Main Project Title
    tbox2 = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(1.5))
    p2 = tbox2.text_frame.paragraphs[0]
    p2.text = "CommunityHelp Hub"
    p2.font.name = "Arial"
    p2.font.size = Pt(36)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_BLACK
    p2.alignment = PP_ALIGN.CENTER

    p2_sub = tbox2.text_frame.add_paragraph()
    p2_sub.text = "A Full-Stack Volunteer & Social Service Platform with Real-Time Data Synchronization"
    p2_sub.font.name = "Arial"
    p2_sub.font.size = Pt(15)
    p2_sub.font.color.rgb = COLOR_DARK
    p2_sub.alignment = PP_ALIGN.CENTER

    # Horizontal Rule
    line = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(3.0), Inches(3.5), Inches(7.333), Inches(0.02))
    line.fill.solid()
    line.fill.fore_color.rgb = COLOR_BLACK
    line.line.color.rgb = COLOR_BLACK

    # Presenter Information Card
    card_l = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(3.9), Inches(4.8), Inches(2.5))
    card_l.fill.solid()
    card_l.fill.fore_color.rgb = COLOR_LIGHT_BG
    card_l.line.color.rgb = COLOR_BORDER
    tf_l = card_l.text_frame
    tf_l.margin_left = Inches(0.3)
    tf_l.margin_top = Inches(0.25)
    p_l0 = tf_l.paragraphs[0]
    p_l0.text = "CANDIDATE DETAILS"
    p_l0.font.bold = True
    p_l0.font.size = Pt(11)
    p_l0.font.color.rgb = COLOR_BLACK
    p_l1 = tf_l.add_paragraph()
    p_l1.text = "Student Name: [ Your Name ]\nRegister No: [ Your Roll Number ]\nDegree: B.E. / B.Tech Computer Science\nCollege: [ Your College Name ]"
    p_l1.font.size = Pt(10)
    p_l1.font.color.rgb = COLOR_DARK

    card_r = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.0), Inches(3.9), Inches(4.8), Inches(2.5))
    card_r.fill.solid()
    card_r.fill.fore_color.rgb = COLOR_LIGHT_BG
    card_r.line.color.rgb = COLOR_BORDER
    tf_r = card_r.text_frame
    tf_r.margin_left = Inches(0.3)
    tf_r.margin_top = Inches(0.25)
    p_r0 = tf_r.paragraphs[0]
    p_r0.text = "PROJECT SUPERVISOR"
    p_r0.font.bold = True
    p_r0.font.size = Pt(11)
    p_r0.font.color.rgb = COLOR_BLACK
    p_r1 = tf_r.add_paragraph()
    p_r1.text = "Faculty Guide: [ Supervisor Name ]\nDesignation: Assistant Professor / Professor\nDepartment: Computer Science and Engineering\nAcademic Year: 2026 - 2027"
    p_r1.font.size = Pt(10)
    p_r1.font.color.rgb = COLOR_DARK

    # ==============================================================
    # SLIDE 2: PROBLEM STATEMENT & MOTIVATION
    # ==============================================================
    s2 = create_blank_slide(prs)
    add_header(s2, "1. Problem Statement & Motivation")

    # Syllabus Quote Box
    q_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(11.73), Inches(1.0))
    q_box.fill.solid()
    q_box.fill.fore_color.rgb = COLOR_LIGHT_BG
    q_box.line.color.rgb = COLOR_BLACK
    q_box.line.width = Pt(1.5)
    tf_q = q_box.text_frame
    tf_q.margin_left = Inches(0.3)
    tf_q.margin_top = Inches(0.18)
    p_q0 = tf_q.paragraphs[0]
    p_q0.text = "CORE PROBLEM AS SPECIFIED IN SYLLABUS:"
    p_q0.font.bold = True
    p_q0.font.size = Pt(10.5)
    p_q0.font.color.rgb = COLOR_BLACK
    p_q1 = tf_q.add_paragraph()
    p_q1.text = "\"Many people want to volunteer, while NGOs and communities need volunteers for different activities.\""
    p_q1.font.size = Pt(13)
    p_q1.font.bold = True
    p_q1.font.color.rgb = COLOR_BLACK

    # 3 Challenge Columns
    add_card(
        s2, Inches(0.8), Inches(2.8), Inches(3.7), Inches(4.2),
        "1. Discovery Barrier",
        [
            ("Fragmented Channels:", "Volunteering drives are scattered across informal WhatsApp groups and flyers."),
            ("No Unified Discovery:", "Citizens cannot easily search for community drives by category or skill."),
            ("Zero Transparency:", "Volunteers have no way to verify whether an initiative is authentic or legally registered.")
        ]
    )

    add_card(
        s2, Inches(4.8), Inches(2.8), Inches(3.7), Inches(4.2),
        "2. Coordination Deficit",
        [
            ("Manual Record Keeping:", "NGOs track volunteers using manual paper logs and messy spreadsheets."),
            ("Application Chaos:", "No automated way to approve, assign, or reject applicants based on quota limits."),
            ("No Verifiable Hours:", "Volunteers do not receive authenticated, tamper-proof proof of service hours.")
        ]
    )

    add_card(
        s2, Inches(8.8), Inches(2.8), Inches(3.7), Inches(4.2),
        "3. Data Integrity Drift",
        [
            ("Stat vs Record Drift:", "Existing portals often display hours that do not match the actual completed task logs."),
            ("Arbitrary Point Systems:", "Points are assigned randomly rather than using transparent mathematical formulas."),
            ("Lack of Reciprocity:", "Top contributors lack credible credentials for academic or career progression.")
        ]
    )

    # ==============================================================
    # SLIDE 3: PLATFORM PURPOSE & CORE OBJECTIVES
    # ==============================================================
    s3 = create_blank_slide(prs)
    add_header(s3, "2. Platform Purpose & Core Objectives")

    add_card(
        s3, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Platform Purpose & Solution",
        [
            ("Centralized Coordination Hub:", "Bridge the gap between motivated volunteers and vetted Non-Governmental Organizations."),
            ("End-to-End Workflow:", "Digitize the complete lifecycle: registration, task discovery, application, assignment, verification, and certification."),
            ("Cloud-Native Architecture:", "Deliver a high-performance web platform built on the modern MERN stack (MongoDB, Express, React, Node.js)."),
            ("Dynamic Database Sync:", "Every user action immediately persists to MongoDB Atlas and updates the React UI in real time.")
        ],
        body_p="CommunityHelp Hub provides an open, trusted community marketplace that formalizes social work contributions."
    )

    add_card(
        s3, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Core Project Objectives",
        [
            ("Role-Based Security:", "Enforce strict JWT authentication and role segregation across Volunteers, NGOs, and System Admins."),
            ("6 Social Service Sectors:", "Provide structured task categorization covering Education, Food, Environment, Elder, Disaster, and Community drives."),
            ("Mathematical Integrity:", "Implement deterministic formulas where Ranking Points = (Tasks * 10) + (Hours * 2) with zero data drift."),
            ("Automated PDF Certification:", "Dynamically generate official, styled PDF completion certificates with unique cryptographic tracking IDs."),
            ("AI-Driven Decision Support:", "Implement multi-factor scoring (Skills, Location, Urgency) to recommend tailored tasks to volunteers.")
        ]
    )

    # ==============================================================
    # SLIDE 4: SYLLABUS REQUIREMENTS COMPLIANCE
    # ==============================================================
    s4 = create_blank_slide(prs)
    add_header(s4, "3. Syllabus Requirements Compliance Matrix")

    table_data = [
        ("Mandatory", "Volunteer Registration", "POST /api/auth/register/volunteer", "Form validation, phone/email checks", "VERIFIED"),
        ("Mandatory", "NGO Registration", "POST /api/auth/register/ngo", "Legal registration number verification", "VERIFIED"),
        ("Mandatory", "User Login", "POST /api/auth/login", "JWT bearer token + BCrypt hash (10 rounds)", "VERIFIED"),
        ("Mandatory", "Task Creation", "POST /api/tasks", "Capacity, hours, required skills validation", "VERIFIED"),
        ("Mandatory", "Task Assignment", "PUT /api/applications/:id/status", "Application status update to 'Assigned'", "VERIFIED"),
        ("Mandatory", "Task Status", "PUT /api/tasks/:id", "Open -> In Progress -> Completed lifecycle", "VERIFIED"),
        ("Mandatory", "Dashboards", "GET /api/dashboard/*", "Volunteer, NGO, Admin, Impact Portals", "VERIFIED"),
        ("Mandatory", "MongoDB CRUD", "Mongoose ODM Layer", "6 collections, relational references, cascading", "VERIFIED"),
        ("Additional", "6 Task Categories", "models/Task.js schema", "Education, Food, Env, Elder, Disaster, Service", "VERIFIED"),
        ("Advanced", "Skill-Based Matching", "GET /api/tasks/matching/skills", "Jaccard intersection on volunteer skill arrays", "VERIFIED"),
        ("Advanced", "Location Matching", "GET /api/tasks/matching/location", "City-level proximity filtering and badging", "VERIFIED"),
        ("Advanced", "Volunteer Ranking", "GET /api/dashboard/rankings", "Points formula: (Tasks * 10) + (Hours * 2)", "VERIFIED"),
        ("Advanced", "Impact Dashboard", "GET /api/dashboard/impact", "Public telemetry, category and city charts", "VERIFIED"),
        ("Advanced", "Certificate Gen", "GET /api/certificates/download/:id", "Server-side PDFKit landscape PDF stream", "VERIFIED"),
        ("Advanced", "AI Recommendation", "GET /api/tasks/recommendations", "100-point composite weighted scoring engine", "VERIFIED")
    ]

    add_table_custom(
        s4, Inches(0.8), Inches(1.6), Inches(11.73), Inches(5.4),
        ["Rubric Tier", "Requirement Name", "API Endpoint / Code File", "Implementation Mechanism", "Audit Status"],
        table_data,
        [1.3, 2.2, 3.1, 3.8, 1.3]
    )

    # ==============================================================
    # SLIDE 5: SYSTEM ARCHITECTURE & TECH STACK
    # ==============================================================
    s5 = create_blank_slide(prs)
    add_header(s5, "4. System Architecture & Technology Stack")

    add_card(
        s5, Inches(0.8), Inches(1.6), Inches(3.7), Inches(5.4),
        "Presentation Tier (Client)",
        [
            ("Framework:", "React.js 18.2 with Single Page Application (SPA) routing via React Router DOM v6."),
            ("Build Tooling:", "Vite for fast Hot Module Replacement and production bundling."),
            ("UI Architecture:", "CSS Grid & Flexbox with responsive breakpoints for desktop, tablet, and mobile."),
            ("State & Security:", "Context API for auth persistence, Axios/Fetch HTTP client with JWT interceptors.")
        ]
    )

    add_card(
        s5, Inches(4.8), Inches(1.6), Inches(3.7), Inches(5.4),
        "Application Tier (Server)",
        [
            ("Runtime:", "Node.js (v20+) with Express.js RESTful routing architecture."),
            ("Security Middleware:", "Role-Based Access Control (RBAC) via protect, requireVolunteer, requireNGO."),
            ("Document Engine:", "PDFKit streaming library for vector-rendered PDF certificates."),
            ("Data Validation:", "Schema-level sanitization, phone number formatting, and duplicate checks.")
        ]
    )

    add_card(
        s5, Inches(8.8), Inches(1.6), Inches(3.7), Inches(5.4),
        "Data Tier (Cloud DB)",
        [
            ("Cloud Database:", "MongoDB Atlas multi-region cloud cluster with zero localized file storage."),
            ("Object Modeling:", "Mongoose 8.x schemas with relational ObjectId cross-referencing."),
            ("Aggregation Pipelines:", "Live real-time aggregation for telemetry ($group, $sort, $sum)."),
            ("Compound Indexing:", "Enforced unique constraint on (taskId, volunteerId) to block duplicates.")
        ]
    )

    # ==============================================================
    # SLIDE 6: DATABASE DESIGN & ENTITY RELATIONSHIPS
    # ==============================================================
    s6 = create_blank_slide(prs)
    add_header(s6, "5. Database Design & Entity Relationships")

    schema_data = [
        ("users", "userId (PK), email (unique), password (hash), role ('volunteer' | 'ngo' | 'admin')", "Root authentication record for all roles"),
        ("volunteers", "volunteerId (PK), userId (FK), fullName, phone, city, skills [], completedCount, totalHours, points", "Volunteer profile, skill badges, and service stats"),
        ("ngos", "ngoId (PK), userId (FK), orgName, registrationNumber (unique), contactPerson, phone, city, isVerified", "Registered non-profit organization entity"),
        ("tasks", "taskId (PK), createdBy (FK NGO), title, description, category, requiredSkills [], city, dateTime, hours, quota, status", "Community service opportunities across 6 sectors"),
        ("applications", "appId (PK), taskId (FK), volunteerId (FK), status ('Applied' | 'Assigned' | 'Completed' | 'Rejected'), notes, dates", "Join entity tracking volunteer application lifecycle"),
        ("certificates", "certId (PK), certificateId (unique), volunteerId (FK), taskId (FK), ngoId (FK), hoursCompleted, issueDate", "Official verified completion credential logs")
    ]

    add_table_custom(
        s6, Inches(0.8), Inches(1.6), Inches(11.73), Inches(4.2),
        ["Collection Name", "Key Fields & Schema Attributes", "Functional Role in Platform"],
        schema_data,
        [1.8, 6.2, 3.7]
    )

    add_card(
        s6, Inches(0.8), Inches(6.0), Inches(11.73), Inches(1.0),
        "Relational Integrity & Foreign Key Safeguards",
        body_p="Relational consistency is maintained via Mongoose populate() routines. Compound indexes prevent a volunteer from applying to the same task multiple times, and cascading checks ensure orphaned records cannot exist."
    )

    # ==============================================================
    # SLIDE 7: TASK LIFECYCLE & STATE WORKFLOW
    # ==============================================================
    s7 = create_blank_slide(prs)
    add_header(s7, "6. Task Lifecycle & State Machine Workflow")

    # 4 Workflow Cards
    w = Inches(2.7)
    gap = Inches(0.3)
    start_x = Inches(0.8)

    add_card(
        s7, start_x, Inches(1.6), w, Inches(5.4),
        "Stage 1: Open",
        [
            ("Action:", "NGO publishes task specifying category, required skills, city, date, and hours."),
            ("State:", "Task status = 'Open'."),
            ("Visibility:", "Publicly visible under Explore Tasks and recommended by the AI matching engine."),
            ("Quota:", "Accepts applications until volunteer quota is met.")
        ]
    )

    add_card(
        s7, start_x + (w + gap), Inches(1.6), w, Inches(5.4),
        "Stage 2: Applied",
        [
            ("Action:", "Volunteer reviews details and clicks 'Apply for Task' with an optional note."),
            ("State:", "Application status = 'Applied'."),
            ("Validation:", "Compound index check ensures volunteer has not previously applied."),
            ("Visibility:", "Appears on NGO's review desk and volunteer's active commitments table.")
        ]
    )

    add_card(
        s7, start_x + (w + gap) * 2, Inches(1.6), w, Inches(5.4),
        "Stage 3: Assigned",
        [
            ("Action:", "NGO reviews applicant qualifications and clicks 'Assign'."),
            ("State:", "Application status = 'Assigned'; Task switches to 'In Progress'."),
            ("Counters:", "volunteersAssigned increments by 1 automatically."),
            ("Volunteer Portal:", "Volunteer receives confirmation badge on their dashboard.")
        ]
    )

    add_card(
        s7, start_x + (w + gap) * 3, Inches(1.6), w, Inches(5.4),
        "Stage 4: Completed",
        [
            ("Action:", "Following service, NGO clicks 'Mark Completed'."),
            ("State:", "Application status = 'Completed'."),
            ("Metrics:", "Volunteer hours increase by taskHours; Points increase by (10 + taskHours * 2)."),
            ("Credential:", "Server automatically generates official PDF certificate with unique ID.")
        ]
    )

    # ==============================================================
    # SLIDE 8: THE SIX MANDATORY TASK CATEGORIES
    # ==============================================================
    s8 = create_blank_slide(prs)
    add_header(s8, "7. The Six Mandatory Task Categories")

    card_w = Inches(3.7)
    card_h = Inches(2.55)

    add_card(
        s8, Inches(0.8), Inches(1.6), card_w, card_h,
        "1. Education",
        [
            ("Objective:", "Strengthen foundational literacy and numeracy."),
            ("Examples:", "Evening remedial arithmetic tutoring for coastal children, spoken English mentorship."),
            ("Skills:", "Teaching, English, Communication, Mathematics.")
        ]
    )

    add_card(
        s8, Inches(4.8), Inches(1.6), card_w, card_h,
        "2. Food Distribution",
        [
            ("Objective:", "Eliminate hunger among pavement dwellers and migrant workers."),
            ("Examples:", "Surplus cooked food packaging, dry ration kit packing for destitute widows."),
            ("Skills:", "Cooking, Packaging, Logistics, Clean-up.")
        ]
    )

    add_card(
        s8, Inches(8.8), Inches(1.6), card_w, card_h,
        "3. Environment",
        [
            ("Objective:", "Coastal and riverbank conservation drives."),
            ("Examples:", "Beach microplastic removal, Miyawaki afforestation, riverbank desilting."),
            ("Skills:", "Clean-up, Planting, Gardening, First Aid.")
        ]
    )

    add_card(
        s8, Inches(0.8), Inches(4.45), card_w, card_h,
        "4. Elder Support",
        [
            ("Objective:", "Dignity, healthcare, and digital empowerment for seniors."),
            ("Examples:", "Old age home companionship circles, smartphone & UPI payment training."),
            ("Skills:", "Patience, Communication, Technology, First Aid.")
        ]
    )

    add_card(
        s8, Inches(4.8), Inches(4.45), card_w, card_h,
        "5. Disaster Support",
        [
            ("Objective:", "Rapid community assistance during weather emergencies."),
            ("Examples:", "Monsoon sandbag barrier deployment, flood relief dry ration assembly."),
            ("Skills:", "Logistics, First Aid, Heavy Lifting, Driving.")
        ]
    )

    add_card(
        s8, Inches(8.8), Inches(4.45), card_w, card_h,
        "6. Community Service",
        [
            ("Objective:", "Public civic support and accessibility initiatives."),
            ("Examples:", "Library audiobook recording for blind students, hospital patient navigation."),
            ("Skills:", "Communication, Technology, Patience, English.")
        ]
    )

    # ==============================================================
    # SLIDE 9: MATHEMATICAL POINTS MODEL & DATA SYNC
    # ==============================================================
    s9 = create_blank_slide(prs)
    add_header(s9, "8. Mathematical Points Model & Consistency Engine")

    add_card(
        s9, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Ranking Points Mathematical Formulation",
        [
            ("Per-Task Formula:", "Points = 10 + (Task Hours * 2)"),
            ("Lifetime Points Formula:", "Total Points = (Completed Tasks * 10) + (Total Hours * 2)"),
            ("10 Base Points:", "Incentivizes volunteers to try varied community activities."),
            ("2 Hourly Points:", "Proportionally rewards volunteers for multi-hour emergency operations."),
            ("Implementation:", "Enforced in routes/applicationRoutes.js upon task completion verification.")
        ],
        body_p="Academic Justification: Every point is mathematically deterministic and verifiable."
    )

    add_card(
        s9, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Dynamic Parity Synchronization (Zero Drift)",
        [
            ("The Problem:", "Static counters in volunteer documents can diverge from the actual application table."),
            ("The Solution:", "In routes/dashboardRoutes.js, the server computes hours directly from completed applications:"),
            ("Dynamic Query:", "SUM( app.taskId.hours ) WHERE app.status = 'Completed'"),
            ("Auto-Correction:", "If volunteer.totalHours != dynamicHours, the document is updated automatically."),
            ("Outcome:", "Guarantees that stat cards, table rows, and leaderboard points always match 100%.")
        ]
    )

    # ==============================================================
    # SLIDE 10: ADVANCED FEATURE: SKILL & LOCATION MATCHING
    # ==============================================================
    s10 = create_blank_slide(prs)
    add_header(s10, "9. Advanced Feature: Skill & Location Matching Engine")

    add_card(
        s10, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "1. Skill-Based Volunteer Matching",
        [
            ("Endpoint:", "GET /api/tasks/matching/skills"),
            ("Algorithm:", "Set intersection between volunteer's registered skills and task's requiredSkills."),
            ("Mathematical Basis:", "Evaluates Jaccard similarity coefficient to prioritize relevant drives."),
            ("UI Representation:", "Tasks matching volunteer skills display an active '[SKILL MATCH]' badge."),
            ("Profile Customization:", "Volunteers can dynamically add or edit skills anytime from their dashboard.")
        ],
        body_p="Enables NGOs to recruit volunteers possessing specialized competencies like First Aid or Teaching."
    )

    add_card(
        s10, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "2. Location-Based Proximity Matching",
        [
            ("Endpoint:", "GET /api/tasks/matching/location"),
            ("Algorithm:", "String normalization and case-insensitive comparison of registered cities."),
            ("Geographic Scope:", "Covers Tamil Nadu cities (Chennai, Coimbatore, Madurai) and Pan-India metros."),
            ("UI Representation:", "Highlights neighborhood drives with a distinct '[LOCAL MATCH]' badge."),
            ("Impact:", "Reduces volunteer travel time and increases on-ground attendance rates.")
        ],
        body_p="Eliminates geographic mismatch by presenting nearby neighborhood drives first."
    )

    # ==============================================================
    # SLIDE 11: ADVANCED FEATURE: AI TASK RECOMMENDATION
    # ==============================================================
    s11 = create_blank_slide(prs)
    add_header(s11, "10. Advanced Feature: 100-Point AI Recommendation Engine")

    add_card(
        s11, Inches(0.8), Inches(1.6), Inches(11.73), Inches(1.2),
        "Multi-Factor Composite Recommendation Formula (Code: routes/taskRoutes.js)",
        body_p="Recommendation Score (0 - 100 Pts) = Skill Match (40 Pts) + City Proximity (30 Pts) + Category Interest (20 Pts) + Quota Availability (10 Pts)"
    )

    card_w4 = Inches(2.7)
    gap4 = Inches(0.3)
    start_x4 = Inches(0.8)

    add_card(
        s11, start_x4, Inches(3.0), card_w4, Inches(4.0),
        "1. Skill Match (40 Pts)",
        [
            ("Maximum:", "40 Points"),
            ("Formula:", "(Matched / Required) * 40"),
            ("Operation:", "Evaluates intersection of volunteer skills with task required skills."),
            ("Example:", "Matching 2 of 2 required skills gives the full 40 points.")
        ]
    )

    add_card(
        s11, start_x4 + (card_w4 + gap4), Inches(3.0), card_w4, Inches(4.0),
        "2. City Proximity (30 Pts)",
        [
            ("Maximum:", "30 Points"),
            ("Condition:", "task.city == volunteer.city"),
            ("Operation:", "Case-insensitive comparison of registered city in MongoDB."),
            ("Example:", "Chennai volunteer viewing a Chennai task receives 30 points.")
        ]
    )

    add_card(
        s11, start_x4 + (card_w4 + gap4) * 2, Inches(3.0), card_w4, Inches(4.0),
        "3. Past Interest (20 Pts)",
        [
            ("Maximum:", "20 Points"),
            ("Condition:", "preferredCategories[category]"),
            ("Operation:", "Inspects previous completed applications of this volunteer."),
            ("Example:", "Prior environment volunteer viewing environment task earns 20 pts.")
        ]
    )

    add_card(
        s11, start_x4 + (card_w4 + gap4) * 3, Inches(3.0), card_w4, Inches(4.0),
        "4. Quota Urgency (10 Pts)",
        [
            ("Maximum:", "10 Points"),
            ("Condition:", "assigned < required"),
            ("Operation:", "Prioritizes active drives that still have open volunteer vacancies."),
            ("Outcome:", "Guarantees unfilled drives are filled first.")
        ]
    )

    # ==============================================================
    # SLIDE 12: ADVANCED FEATURE: AUTOMATED PDF CERTIFICATION
    # ==============================================================
    s12 = create_blank_slide(prs)
    add_header(s12, "11. Advanced Feature: Automated PDF Certificate Generator")

    add_card(
        s12, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Server-Side PDF Compilation Engine",
        [
            ("Technology:", "PDFKit binary streaming engine implemented in routes/certificateRoutes.js."),
            ("Trigger:", "Automatically created when an NGO updates application status to 'Completed'."),
            ("Binary Streaming:", "Compiles vector PDF in memory and streams directly via HTTP Content-Disposition."),
            ("Zero Storage Bloat:", "Eliminates server disk storage by generating authenticated PDFs on demand."),
            ("Instant Access:", "Volunteers click 'Download Certificate' to retrieve their official PDF.")
        ]
    )

    add_card(
        s12, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Official Certificate Document Specifications",
        [
            ("Ornate Border Frame:", "Double-layered landscape border formatted for physical printing."),
            ("Recipient Name:", "Volunteer full name printed in 28pt bold serif typography."),
            ("Legal Authority:", "Organizing NGO's registered legal name and city."),
            ("Verified Service:", "Exact community task title and total verified hours contributed."),
            ("Cryptographic ID:", "Formatted as CHH-CERT-IND-[CITY]-[NUMERIC_ID] for validation.")
        ],
        body_p="Provides credible, verifiable credentials suitable for college credits, resumes, and corporate CSR."
    )

    # ==============================================================
    # SLIDE 13: ROLE-SPECIFIC DASHBOARDS
    # ==============================================================
    s13 = create_blank_slide(prs)
    add_header(s13, "12. Role-Specific Dashboards & Telemetry")

    add_card(
        s13, Inches(0.8), Inches(1.6), card_w, card_h,
        "1. Volunteer Dashboard",
        [
            ("Summary Cards:", "Tasks Completed, Active Assignments, Contributed Hours, Leaderboard Rank."),
            ("Skills Management:", "Interactive modal to update registered volunteer competencies."),
            ("Commitments Table:", "Live table of active and assigned social service drives."),
            ("Certificates List:", "Earned certificates with instant PDF download buttons.")
        ]
    )

    add_card(
        s13, Inches(4.8), Inches(1.6), card_w, card_h,
        "2. NGO Dashboard",
        [
            ("Metrics Overview:", "Total Tasks Created, Active Drives, Completed Drives, Volunteers Assigned."),
            ("Applicant Review Desk:", "Review applicant notes, view skills, and assign or reject with one click."),
            ("Task Management:", "Inline status switcher (Open / In Progress / Completed / Cancelled).")
        ]
    )

    add_card(
        s13, Inches(8.8), Inches(1.6), card_w, card_h,
        "3. Impact Dashboard (Public)",
        [
            ("Public Telemetry:", "Cumulative volunteers, registered NGOs, total tasks, and total service hours."),
            ("Category Breakdown:", "Visual distribution across all 6 community service categories."),
            ("Top 10 Leaderboard:", "Real-time ranking ordered by verified ranking points.")
        ]
    )

    add_card(
        s13, Inches(0.8), Inches(4.45), Inches(11.73), Inches(2.55),
        "4. Administrator Portal (System Governance)",
        [
            ("NGO Verification Desk:", "Admins inspect registration certificates and toggle isVerified status to prevent fraud."),
            ("Global User Directory:", "Search and inspect all volunteer, NGO, and administrative user records in MongoDB."),
            ("Task Moderation Desk:", "Audit and remove inappropriate or duplicate community drive postings across all categories.")
        ],
        body_p="Enforces governance, platform security, and non-profit accreditation across the entire volunteer network."
    )

    # ==============================================================
    # SLIDE 14: QUALITY ASSURANCE & 25-POINT TEST SUITE
    # ==============================================================
    s14 = create_blank_slide(prs)
    add_header(s14, "13. Quality Assurance & Automated Test Suite")

    test_summary = [
        ("TC-01 to TC-05", "User & Volunteer Registration Validation", "Malformed email, short password, duplicate email checks", "ALL PASS (5/5)"),
        ("TC-06 to TC-07", "NGO Registration & Unique Constraint Checks", "Duplicate government registration number rejection", "ALL PASS (2/2)"),
        ("TC-08 to TC-09", "Authentication & JWT Token Generation", "Correct credentials issue token; wrong passwords rejected", "ALL PASS (2/2)"),
        ("TC-10 to TC-13", "Task Creation, RBAC & Owner Update Guard", "Volunteers cannot post tasks; NGOs modify own tasks", "ALL PASS (4/4)"),
        ("TC-14 to TC-17", "Application Lifecycle & Completion Workflow", "Duplicate application guard, assignment, hours credit", "ALL PASS (4/4)"),
        ("TC-18 to TC-19", "Certificate Generation & PDF Binary Download", "Database certificate log and HTTP PDFKit stream", "ALL PASS (2/2)"),
        ("TC-20 to TC-22", "Skill Matching, Location Matching & AI Engine", "100-point heuristic scoring and local matching flags", "ALL PASS (3/3)"),
        ("TC-23 to TC-25", "Impact Analytics, Leaderboard & Task Deletion", "MongoDB $group analytics, rankings sort, CRUD delete", "ALL PASS (3/3)")
    ]

    add_table_custom(
        s14, Inches(0.8), Inches(1.6), Inches(11.73), Inches(4.0),
        ["Test Suite ID", "Evaluation Domain", "Test Input / Assertion Conditions", "Audit Status"],
        test_summary,
        [1.8, 3.2, 5.0, 1.7]
    )

    add_card(
        s14, Inches(0.8), Inches(5.8), Inches(11.73), Inches(1.2),
        "Final Test Result: 25 Passed / 0 Failed (100% Pass Rate)",
        body_p="All 25 automated assertions in scripts/audit-test.js pass with zero failures. Zero mathematical drift was verified across all 37 database profiles."
    )

    # ==============================================================
    # SLIDE 15: DEMONSTRATION WALKTHROUGH & EVALUATION
    # ==============================================================
    s15 = create_blank_slide(prs)
    add_header(s15, "14. Demonstration Walkthrough & Evaluation Credentials")

    creds_data = [
        ("System Administrator", "admin@communityhelphub.in", "password123", "Full administrative oversight, NGO verification desk"),
        ("Verified NGO Partner", "kavalar.ngo@gmail.com", "password123", "Create tasks, review applicants, assign volunteers, mark completion"),
        ("Volunteer (Rank #1)", "karthik.raman@gmail.com", "password123", "8 completed tasks (28 hrs, 136 pts), active task, PDF certificate download"),
        ("Volunteer (Rank #2)", "rahul.volunteer@gmail.com", "password123", "7 completed tasks (26 hrs, 122 pts), education focus"),
        ("Volunteer (Rank #3)", "senthil.kumar@gmail.com", "password123", "7 completed tasks (25 hrs, 120 pts), environment focus")
    ]

    add_table_custom(
        s15, Inches(0.8), Inches(1.6), Inches(11.73), Inches(2.8),
        ["Role Title", "Login Email Address", "Password", "Evaluation Scope"],
        creds_data,
        [2.0, 2.5, 1.3, 5.9]
    )

    add_card(
        s15, Inches(0.8), Inches(4.6), Inches(11.73), Inches(2.4),
        "Step-by-Step Live Dynamic Update Demonstration",
        [
            ("Step 1: NGO Posts Task", "Log into Tab 1 as NGO (kavalar.ngo@gmail.com). Post a new task: 'School Library Setup', Category: Education, Hours: 4."),
            ("Step 2: Volunteer Applies", "In Tab 2 as Volunteer (karthik.raman@gmail.com), view Explore Tasks. The new task appears immediately. Click 'Apply'."),
            ("Step 3: NGO Assigns & Completes", "In Tab 1, refresh NGO dashboard. Karthik Raman appears in applicants. Click 'Assign', then click 'Mark Completed'."),
            ("Step 4: Immediate UI & DB Update", "In Tab 2, refresh Volunteer dashboard: Tasks Completed = 9, Hours = 32, Points = 154, and a new PDF certificate is issued.")
        ]
    )

    # ==============================================================
    # SLIDE 16: CONCLUSION & FUTURE SCOPE
    # ==============================================================
    s16 = create_blank_slide(prs)
    add_header(s16, "15. Conclusion & Future Enhancements")

    add_card(
        s16, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Project Achievements & Impact",
        [
            ("100% Syllabus Compliance:", "Fulfills all mandatory requirements, 6 task categories, and advanced features."),
            ("Real-Time Cloud Persistence:", "Zero localized mocks; every action directly mutates the MongoDB Atlas cluster."),
            ("Zero Mathematical Drift:", "Hours and Points are dynamically calculated from verified application records."),
            ("Production-Ready Deployment:", "Fully responsive single page application deployed with automated routing."),
            ("Security Best Practices:", "JWT bearer tokens, BCrypt password hashing, and route interceptors.")
        ]
    )

    add_card(
        s16, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Future Technical Enhancements",
        [
            ("SMS & WhatsApp Broadcasts:", "Automated multi-channel dispatch to alert volunteers during regional flood/cyclone disasters."),
            ("Mobile Geofencing Attendance:", "GPS check-in verifying that the volunteer is physically present at the NGO drive location."),
            ("QR-Verifiable Credentials:", "Public verification QR codes printed on PDF certificates for instant employer/university authentication."),
            ("Corporate CSR Portals:", "Enabling enterprises to sponsor community drives and track aggregated corporate volunteer hours.")
        ]
    )

    # ==============================================================
    # SLIDE 17: THANK YOU & Q&A
    # ==============================================================
    s17 = create_blank_slide(prs)

    frame_end = s17.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(0.6), Inches(12.133), Inches(6.3))
    frame_end.fill.solid()
    frame_end.fill.fore_color.rgb = COLOR_WHITE
    frame_end.line.color.rgb = COLOR_BLACK
    frame_end.line.width = Pt(2)

    tbox_e = s17.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(2.0))
    p_e = tbox_e.text_frame.paragraphs[0]
    p_e.text = "Thank You!"
    p_e.font.name = "Arial"
    p_e.font.size = Pt(44)
    p_e.font.bold = True
    p_e.font.color.rgb = COLOR_BLACK
    p_e.alignment = PP_ALIGN.CENTER

    p_e_sub = tbox_e.text_frame.add_paragraph()
    p_e_sub.text = "CommunityHelp Hub – Volunteer & Social Service Platform"
    p_e_sub.font.name = "Arial"
    p_e_sub.font.size = Pt(16)
    p_e_sub.font.color.rgb = COLOR_DARK
    p_e_sub.alignment = PP_ALIGN.CENTER

    p_qa = tbox_e.text_frame.add_paragraph()
    p_qa.text = "\nQuestions & Technical Discussion"
    p_qa.font.name = "Arial"
    p_qa.font.size = Pt(14)
    p_qa.font.bold = True
    p_qa.font.color.rgb = COLOR_MUTED
    p_qa.alignment = PP_ALIGN.CENTER

    card_foot = s17.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.0), Inches(4.5), Inches(7.333), Inches(1.5))
    card_foot.fill.solid()
    card_foot.fill.fore_color.rgb = COLOR_LIGHT_BG
    card_foot.line.color.rgb = COLOR_BORDER
    tf_f = card_foot.text_frame
    tf_f.margin_top = Inches(0.2)
    p_f = tf_f.paragraphs[0]
    p_f.text = "Candidate: [ Your Name ] | Register No: [ Your Roll Number ]"
    p_f.font.bold = True
    p_f.font.size = Pt(11)
    p_f.font.color.rgb = COLOR_BLACK
    p_f.alignment = PP_ALIGN.CENTER
    p_f2 = tf_f.add_paragraph()
    p_f2.text = "Department of Computer Science and Engineering | Academic Year 2026 - 2027"
    p_f2.font.size = Pt(10)
    p_f2.font.color.rgb = COLOR_MUTED
    p_f2.alignment = PP_ALIGN.CENTER

    prs.save(output_path)
    print(f"Presentation saved successfully at: {output_path}")

if __name__ == '__main__':
    local_path = os.path.abspath("CommunityHelp_Hub_Presentation.pptx")
    build_presentation(local_path)

    desktop_dir = r"C:\Users\DELL\Desktop"
    if os.path.exists(desktop_dir):
        desktop_path = os.path.join(desktop_dir, "CommunityHelp_Hub_Presentation.pptx")
        try:
            shutil.copyfile(local_path, desktop_path)
            print(f"Copied to Desktop at: {desktop_path}")
        except PermissionError:
            desktop_revised = os.path.join(desktop_dir, "CommunityHelp_Hub_Presentation_Revised.pptx")
            shutil.copyfile(local_path, desktop_revised)
            print(f"File is open in PowerPoint. Saved updated version to Desktop as: {desktop_revised}")
