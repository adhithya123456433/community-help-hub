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

def add_header(slide, title_text, category_text="COMMUNITYHELP HUB - FULL-STACK ACADEMIC PROJECT"):
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.73), Inches(0.35))
    tf_c = cat_box.text_frame
    tf_c.word_wrap = True
    p_c = tf_c.paragraphs[0]
    p_c.text = category_text.upper()
    p_c.font.name = "Arial"
    p_c.font.size = Pt(9.5)
    p_c.font.bold = True
    p_c.font.color.rgb = COLOR_MUTED

    t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.73), Inches(0.65))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.name = "Arial"
    p_t.font.size = Pt(20)
    p_t.font.bold = True
    p_t.font.color.rgb = COLOR_BLACK

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
        p0.font.size = Pt(12)
        p0.font.bold = True
        p0.font.color.rgb = COLOR_BLACK
        p0.space_after = Pt(4)

    if body_p:
        p = tf.add_paragraph()
        p.text = body_p
        p.font.name = "Arial"
        p.font.size = Pt(10)
        p.font.color.rgb = COLOR_DARK
        p.space_after = Pt(4)

    if body_bullets:
        for item in body_bullets:
            p = tf.add_paragraph()
            p.font.name = "Arial"
            p.font.size = Pt(9.5)
            p.font.color.rgb = COLOR_DARK
            p.space_after = Pt(2.5)
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

    for col_idx, header in enumerate(headers):
        cell = table.cell(0, col_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(230, 230, 230)
        p = cell.text_frame.paragraphs[0]
        p.text = header
        p.font.name = "Arial"
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = COLOR_BLACK
        p.alignment = PP_ALIGN.CENTER

    for row_idx, row_values in enumerate(data):
        bg = RGBColor(255, 255, 255) if row_idx % 2 == 0 else RGBColor(245, 245, 245)
        for col_idx, value in enumerate(row_values):
            cell = table.cell(row_idx + 1, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg
            p = cell.text_frame.paragraphs[0]
            p.text = str(value)
            p.font.name = "Arial"
            p.font.size = Pt(9)
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

    frame = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(0.6), Inches(12.133), Inches(6.3))
    frame.fill.solid()
    frame.fill.fore_color.rgb = COLOR_WHITE
    frame.line.color.rgb = COLOR_BLACK
    frame.line.width = Pt(2)

    tbox = s1.shapes.add_textbox(Inches(1.0), Inches(0.9), Inches(11.333), Inches(0.8))
    p = tbox.text_frame.paragraphs[0]
    p.text = "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\nACADEMIC PROJECT PRESENTATION | 2026 - 2027"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_MUTED
    p.alignment = PP_ALIGN.CENTER

    tbox2 = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.333), Inches(1.5))
    p2 = tbox2.text_frame.paragraphs[0]
    p2.text = "CommunityHelp Hub"
    p2.font.name = "Arial"
    p2.font.size = Pt(36)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_BLACK
    p2.alignment = PP_ALIGN.CENTER

    p2_sub = tbox2.text_frame.add_paragraph()
    p2_sub.text = "A Full-Stack Volunteer & Social Service Platform with Real-Time Database Synchronization"
    p2_sub.font.name = "Arial"
    p2_sub.font.size = Pt(15)
    p2_sub.font.color.rgb = COLOR_DARK
    p2_sub.alignment = PP_ALIGN.CENTER

    line = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(3.0), Inches(3.5), Inches(7.333), Inches(0.02))
    line.fill.solid()
    line.fill.fore_color.rgb = COLOR_BLACK
    line.line.color.rgb = COLOR_BLACK

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
    # SLIDE 2: PROBLEM STATEMENT & PURPOSE
    # ==============================================================
    s2 = create_blank_slide(prs)
    add_header(s2, "1. Problem Statement & Project Purpose")

    q_box = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(11.73), Inches(1.1))
    q_box.fill.solid()
    q_box.fill.fore_color.rgb = COLOR_LIGHT_BG
    q_box.line.color.rgb = COLOR_BLACK
    q_box.line.width = Pt(1.5)
    tf_q = q_box.text_frame
    tf_q.margin_left = Inches(0.3)
    tf_q.margin_top = Inches(0.18)
    p_q0 = tf_q.paragraphs[0]
    p_q0.text = "PROBLEM & PURPOSE (AS SPECIFIED IN COURSE SYLLABUS):"
    p_q0.font.bold = True
    p_q0.font.size = Pt(10)
    p_q0.font.color.rgb = COLOR_BLACK
    p_q1 = tf_q.add_paragraph()
    p_q1.text = "Problem: \"Many people want to volunteer, while NGOs and communities need volunteers for different activities.\"\nPurpose: \"Connect volunteers with NGOs and community-service tasks.\""
    p_q1.font.size = Pt(11)
    p_q1.font.color.rgb = COLOR_BLACK

    add_card(
        s2, Inches(0.8), Inches(2.9), Inches(3.7), Inches(4.1),
        "1. Discovery Barrier",
        [
            ("Fragmented Channels:", "Volunteering drives are scattered across informal WhatsApp groups and flyers."),
            ("No Category Search:", "Citizens cannot search for local drives by specific sectors like Education or Environment."),
            ("Verification Void:", "Volunteers cannot determine whether an NGO is legally registered and vetted.")
        ]
    )

    add_card(
        s2, Inches(4.8), Inches(2.9), Inches(3.7), Inches(4.1),
        "2. Coordination Deficit",
        [
            ("Manual Spreadsheets:", "NGOs manually track volunteer sign-ups, leading to lost contacts and unconfirmed attendance."),
            ("No Quota Control:", "Organizations lack tooling to set volunteer headcounts and track filled vacancies."),
            ("Uncredited Service:", "Volunteers receive no formal proof of service hours for college credits or resumes.")
        ]
    )

    add_card(
        s2, Inches(8.8), Inches(2.9), Inches(3.7), Inches(4.1),
        "3. Data Integrity Drift",
        [
            ("Divergent Counters:", "Summary counters on volunteer profiles often fail to match actual task records."),
            ("Arbitrary Scoring:", "Points systems are often hardcoded rather than governed by transparent mathematical formulas."),
            ("Accountability Void:", "Lack of automated certificate generation leaves accomplishments unverified.")
        ]
    )

    # ==============================================================
    # SLIDE 3: REQUIREMENTS COMPLIANCE MATRIX
    # ==============================================================
    s3 = create_blank_slide(prs)
    add_header(s3, "2. Syllabus Requirements Compliance Matrix")

    table_data = [
        ("Mandatory", "Volunteer Registration", "POST /api/auth/register-volunteer", "Phone regex, unique email, skills array", "TC-01 to TC-05"),
        ("Mandatory", "NGO Registration", "POST /api/auth/register-ngo", "Unique legal registration number check", "TC-06, TC-07"),
        ("Mandatory", "User Login", "POST /api/auth/login", "BCrypt hash compare + JWT bearer token", "TC-08, TC-09"),
        ("Mandatory", "Task Creation", "POST /api/tasks", "Capacity, hours, 6 category enums, skills", "TC-10, TC-11, TC-12"),
        ("Mandatory", "Task Assignment", "PUT /api/applications/:id/status", "Application status: 'Assigned', Task: 'In Progress'", "TC-16"),
        ("Mandatory", "Task Status", "PUT /api/tasks/:id", "Open -> In Progress -> Completed lifecycle", "TC-13, TC-17"),
        ("Mandatory", "Dashboards", "GET /api/dashboard/*", "Volunteer, NGO, Admin, Impact Portals", "TC-23, TC-24"),
        ("Mandatory", "MongoDB Storage", "Mongoose ODM Layer", "6 collections, relational references, indexes", "All Test Cases"),
        ("Mandatory", "CRUD Operations", "RESTful Verb Suite", "Create, Read, Update, Delete on tasks/apps", "TC-10, TC-13, TC-25"),
        ("Additional", "6 Task Categories", "models/Task.js schema", "Education, Food, Env, Elder, Disaster, Service", "TC-11"),
        ("Advanced", "Skill-Based Matching", "GET /api/tasks/matching/skills", "Jaccard intersection on required skills", "TC-20"),
        ("Advanced", "Location Matching", "GET /api/tasks/matching/location", "City-level proximity matching and badging", "TC-21"),
        ("Advanced", "Volunteer Ranking", "GET /api/dashboard/rankings", "Points: (Completed * 10) + (Hours * 2)", "TC-24"),
        ("Advanced", "Impact Dashboard", "GET /api/dashboard/impact", "MongoDB $group telemetry aggregations", "TC-23"),
        ("Advanced", "Certificate Gen", "GET /api/certificates/download/:id", "Server-side PDFKit landscape PDF stream", "TC-18, TC-19"),
        ("Advanced", "AI Recommendation", "GET /api/tasks/recommendations/ai", "100-point composite scoring heuristic", "TC-22")
    ]

    add_table_custom(
        s3, Inches(0.8), Inches(1.6), Inches(11.73), Inches(5.4),
        ["Tier", "Requirement Name", "API Endpoint in Code", "Implementation Mechanism", "Audit Test"],
        table_data,
        [1.1, 2.2, 3.2, 3.8, 1.4]
    )

    # ==============================================================
    # SLIDE 4: SYSTEM ARCHITECTURE & TECH STACK
    # ==============================================================
    s4 = create_blank_slide(prs)
    add_header(s4, "3. System Architecture & Technology Stack")

    add_card(
        s4, Inches(0.8), Inches(1.6), Inches(3.7), Inches(5.4),
        "Client Tier (React 18 SPA)",
        [
            ("Framework:", "React.js 18.2 with Single Page Application routing via React Router DOM v6."),
            ("Build Tooling:", "Vite for fast Hot Module Replacement and production bundling."),
            ("UI Design:", "Clean CSS Grid & Flexbox layout without bulky UI frameworks."),
            ("State Management:", "AuthContext provider persisting JWT token and active session in localStorage."),
            ("HTTP Client:", "api/client.js handling authorization headers and toast notifications.")
        ]
    )

    add_card(
        s4, Inches(4.8), Inches(1.6), Inches(3.7), Inches(5.4),
        "Server Tier (Express REST API)",
        [
            ("Runtime:", "Node.js (v20+) with Express.js routing architecture."),
            ("Security Middleware:", "protect, requireVolunteer, requireNGO, requireAdmin in middleware/authMiddleware.js."),
            ("Password Hashing:", "BCrypt with 10 salt rounds executed in User.pre('save') hook."),
            ("Document Engine:", "PDFKit server-side streaming binary compiler for completion certificates."),
            ("Data Sanitization:", "Indian 10-digit phone cleaner (sanitizePhone) and RFC-compliant email regex.")
        ]
    )

    add_card(
        s4, Inches(8.8), Inches(1.6), Inches(3.7), Inches(5.4),
        "Data Tier (MongoDB Atlas)",
        [
            ("Cloud Database:", "MongoDB Atlas multi-region cloud cluster with zero localized file storage."),
            ("Object Modeling:", "Mongoose 8.x schemas enforcing field types, enums, and required flags."),
            ("Relational References:", "ObjectId cross-referencing between users, volunteers, ngos, tasks, and apps."),
            ("Compound Indexing:", "Unique index on (taskId, volunteerId) in applications to block duplicate submissions."),
            ("Live Aggregations:", "$group, $sort, $sum pipelines driving the Public Impact Dashboard.")
        ]
    )

    # ==============================================================
    # SLIDE 5: DATABASE DESIGN (6 COLLECTIONS)
    # ==============================================================
    s5 = create_blank_slide(prs)
    add_header(s5, "4. Database Design: The Six Core Collections")

    schema_data = [
        ("users", "email (unique), password (BCrypt hash), role ('volunteer' | 'ngo' | 'admin'), createdAt", "User.js", "Authentication root for all platform roles"),
        ("volunteers", "userId (ref User), fullName, phone (/^[6-9]\\d{9}$/), city, skills [], completedTasksCount, totalHours, rankingPoints, badgeTier", "Volunteer.js", "Volunteer profile, service records, and points"),
        ("ngos", "userId (ref User), orgName, registrationNumber (unique, uppercase), contactPerson, phone, city, address, isVerified", "NGO.js", "Verified non-profit legal entity profile"),
        ("tasks", "title, description, category (6 enums), requiredSkills [], location, city, dateTime, hours, volunteersRequired, volunteersAssigned, status, createdBy (ref NGO)", "Task.js", "Community service opportunities across 6 sectors"),
        ("applications", "taskId (ref Task), volunteerId (ref Volunteer), status ('Applied' | 'Assigned' | 'Completed' | 'Rejected'), notes, appliedAt, completedAt. Index: {taskId, volunteerId}", "Application.js", "Join table tracking volunteer application lifecycle"),
        ("certificates", "certificateId (unique, formatted), volunteerId (ref Volunteer), taskId (ref Task), ngoId (ref NGO), hoursCompleted, issueDate", "Certificate.js", "Permanent verified completion credential logs")
    ]

    add_table_custom(
        s5, Inches(0.8), Inches(1.6), Inches(11.73), Inches(4.2),
        ["Collection", "Schema Fields & Constraints (from Code)", "Model File", "Functional Role"],
        schema_data,
        [1.3, 5.7, 1.4, 3.3]
    )

    add_card(
        s5, Inches(0.8), Inches(6.0), Inches(11.73), Inches(1.0),
        "Database Consistency & Integrity Constraints",
        body_p="Compound unique indexes in Application.js ensure no volunteer can apply twice to the same task. Mongoose populate() handles relational joins between tasks and NGOs. Zero localized mocks are used; every mutation directly hits MongoDB Atlas."
    )

    # ==============================================================
    # SLIDE 6: TASK LIFECYCLE & STATE MACHINE
    # ==============================================================
    s6 = create_blank_slide(prs)
    add_header(s6, "5. Task Lifecycle & State Machine Workflow")

    w4 = Inches(2.7)
    gap4 = Inches(0.3)
    start_x4 = Inches(0.8)

    add_card(
        s6, start_x4, Inches(1.6), w4, Inches(5.4),
        "Stage 1: Open",
        [
            ("Code File:", "routes/taskRoutes.js (POST /tasks)"),
            ("Action:", "NGO publishes task with category, required skills, city, date, hours, and quota."),
            ("Task Status:", "'Open'"),
            ("Visibility:", "Visible in Explore Tasks, recommended by AI engine, and open for applications."),
            ("Quota Check:", "Accepts applications while volunteersAssigned < volunteersRequired.")
        ]
    )

    add_card(
        s6, start_x4 + (w4 + gap4), Inches(1.6), w4, Inches(5.4),
        "Stage 2: Applied",
        [
            ("Code File:", "routes/applicationRoutes.js (POST /apply)"),
            ("Action:", "Volunteer clicks 'Apply for Task' and submits an optional motivation note."),
            ("App Status:", "'Applied'"),
            ("Duplicate Guard:", "Compound index {taskId: 1, volunteerId: 1} rejects second attempts with HTTP 400."),
            ("UI State:", "Appears on volunteer's My Tasks table and NGO's applicant review desk.")
        ]
    )

    add_card(
        s6, start_x4 + (w4 + gap4) * 2, Inches(1.6), w4, Inches(5.4),
        "Stage 3: Assigned",
        [
            ("Code File:", "routes/applicationRoutes.js (PUT /:id/status)"),
            ("Action:", "NGO reviews applicant qualifications and clicks 'Assign'."),
            ("App Status:", "'Assigned'"),
            ("Task Transition:", "Task status automatically switches to 'In Progress'."),
            ("Counter Update:", "task.volunteersAssigned increments by 1 in MongoDB.")
        ]
    )

    add_card(
        s6, start_x4 + (w4 + gap4) * 3, Inches(1.6), w4, Inches(5.4),
        "Stage 4: Completed",
        [
            ("Code File:", "routes/applicationRoutes.js (PUT /:id/status)"),
            ("Action:", "Following on-ground service, NGO clicks 'Mark Completed'."),
            ("App Status:", "'Completed'"),
            ("Hours & Points:", "volunteer.totalHours += taskHours; points += (10 + taskHours * 2)."),
            ("Certification:", "Server automatically generates Certificate record with unique ID.")
        ]
    )

    # ==============================================================
    # SLIDE 7: THE SIX MANDATORY TASK CATEGORIES
    # ==============================================================
    s7 = create_blank_slide(prs)
    add_header(s7, "6. The Six Mandatory Task Categories (models/Task.js)")

    card_w = Inches(3.7)
    card_h = Inches(2.55)

    add_card(
        s7, Inches(0.8), Inches(1.6), card_w, card_h,
        "1. Education",
        [
            ("Schema Enum:", "'Education'"),
            ("Scope:", "Conduct learning sessions to strengthen literacy and numeracy for underprivileged youth."),
            ("Seed Drive:", "Spoken English & Basic Math Tutoring for Children (Bengaluru, 3 Hrs)."),
            ("Required Skills:", "Teaching, English, Communication, Mathematics.")
        ]
    )

    add_card(
        s7, Inches(4.8), Inches(1.6), card_w, card_h,
        "2. Food Distribution",
        [
            ("Schema Enum:", "'Food distribution'"),
            ("Scope:", "Package surplus banquet meals and assemble dry ration kits for destitute families."),
            ("Seed Drive:", "Weekend Surplus Food Packaging & Slum Distribution (Delhi, 4 Hrs)."),
            ("Required Skills:", "Packaging, Logistics, Cooking, Clean-up.")
        ]
    )

    add_card(
        s7, Inches(8.8), Inches(1.6), card_w, card_h,
        "3. Environment",
        [
            ("Schema Enum:", "'Environment'"),
            ("Scope:", "Coastal microplastic cleanups, riverbank desilting, and Miyawaki tree planting."),
            ("Seed Drive:", "Coastal Cleanup & Marine Microplastic Removal Drive (Chennai, 4 Hrs)."),
            ("Required Skills:", "Clean-up, Logistics, Planting, First Aid.")
        ]
    )

    add_card(
        s7, Inches(0.8), Inches(4.45), card_w, card_h,
        "4. Elder Support",
        [
            ("Schema Enum:", "'Elder support'"),
            ("Scope:", "Provide companionship, smartphone/UPI assistance, and health checkup escorts."),
            ("Seed Drive:", "Senior Citizen Digital Literacy & Smartphone Assistance Camp (Delhi, 3 Hrs)."),
            ("Required Skills:", "Technology, Patience, Communication, First Aid.")
        ]
    )

    add_card(
        s7, Inches(4.8), Inches(4.45), card_w, card_h,
        "5. Disaster Support",
        [
            ("Schema Enum:", "'Disaster support'"),
            ("Scope:", "Emergency dry ration packaging and flood embankment reinforcement."),
            ("Seed Drive:", "Emergency Flood Relief Kit Assembly & Logistic Packing (Chennai, 5 Hrs)."),
            ("Required Skills:", "Packaging, Logistics, First Aid, Driving.")
        ]
    )

    add_card(
        s7, Inches(8.8), Inches(4.45), card_w, card_h,
        "6. Community Service",
        [
            ("Schema Enum:", "'Community service'"),
            ("Scope:", "Public civic initiatives, hospital patient navigation, and blind student audio recording."),
            ("Seed Drive:", "Public Library Book Cataloging & Blind Student Audio Recording (Bengaluru, 4 Hrs)."),
            ("Required Skills:", "Communication, Technology, English, Patience.")
        ]
    )

    # ==============================================================
    # SLIDE 8: MATHEMATICAL POINTS MODEL & DATA SYNC
    # ==============================================================
    s8 = create_blank_slide(prs)
    add_header(s8, "7. Mathematical Points Formulation & Parity Sync Engine")

    add_card(
        s8, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Ranking Points Formulation (routes/applicationRoutes.js:206)",
        [
            ("Per-Task Formula in Code:", "volunteer.rankingPoints += (10 + taskHours * 2)"),
            ("Lifetime Points Formula:", "Total Points = (Completed Tasks * 10) + (Total Hours * 2)"),
            ("10 Base Points:", "Incentivizes volunteers to participate in varied social service drives."),
            ("2 Hourly Points:", "Linearly rewards volunteers for multi-hour emergency relief operations."),
            ("Deterministic Nature:", "Eliminates arbitrary point guessing; every point is auditable against past tasks."),
            ("Leaderboard Ordering:", "Sorted in routes/dashboardRoutes.js by rankingPoints DESC, totalHours DESC.")
        ],
        body_p="Academic Justification: Both task breadth and depth of service time are mathematically rewarded."
    )

    add_card(
        s8, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Dynamic Parity Synchronization (routes/dashboardRoutes.js:27-41)",
        [
            ("The Problem:", "Static counters in volunteer documents can diverge from the actual application table."),
            ("Dynamic Calculation:", "On every dashboard request, server executes:"),
            ("Query:", "Application.find({ volunteerId, status: 'Completed' }).populate('taskId')"),
            ("Hours Summation:", "dynamicHours = sum( app.taskId.hours )"),
            ("Points Derivation:", "displayPoints = (displayCount * 10) + (displayHours * 2)"),
            ("Auto-Correction:", "If stored values differ, volunteer.save() synchronizes MongoDB immediately."),
            ("Outcome:", "Guarantees that stat cards, table rows, and leaderboard points always match 100%.")
        ]
    )

    # ==============================================================
    # SLIDE 9: ADVANCED FEATURE: SKILL & LOCATION MATCHING
    # ==============================================================
    s9 = create_blank_slide(prs)
    add_header(s9, "8. Advanced Feature: Skill & Location Matching Engines")

    add_card(
        s9, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "1. Skill-Based Volunteer Matching (routes/taskRoutes.js:170-230)",
        [
            ("API Endpoint:", "GET /api/tasks/matching/skills"),
            ("Algorithm in Code:", "Calculates intersection between volunteer.skills and task.requiredSkills."),
            ("Mathematical Formula:", "matchScore = Math.round((commonSkills / taskSkills.length) * 100)"),
            ("Sorting Mechanism:", "Returns tasks ordered descending by matchScore."),
            ("UI Representation:", "Tasks matching volunteer skills display an active '[SKILL MATCH]' badge."),
            ("Dynamic Skill Editor:", "Volunteers can add or modify competencies anytime via PUT /auth/volunteer/skills.")
        ],
        body_p="Enables NGOs to recruit volunteers possessing specialized competencies like First Aid or Teaching."
    )

    add_card(
        s9, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "2. Location-Based Proximity Matching (routes/taskRoutes.js:235-285)",
        [
            ("API Endpoint:", "GET /api/tasks/matching/location"),
            ("Algorithm in Code:", "Case-insensitive query matching city: new RegExp(`^${volunteer.city}$`, 'i')."),
            ("Result Splitting:", "Splits tasks into localTasks (isLocalMatch: true) and otherTasks (isLocalMatch: false)."),
            ("UI Representation:", "Highlights neighborhood drives with a distinct '[LOCAL MATCH]' badge."),
            ("Geographic Scope:", "Covers 28 major cities across Tamil Nadu and Pan-India metropolitan hubs."),
            ("Operational Impact:", "Reduces volunteer travel time and increases on-ground attendance rates.")
        ],
        body_p="Eliminates geographic mismatch by presenting nearby neighborhood drives first."
    )

    # ==============================================================
    # SLIDE 10: ADVANCED FEATURE: 100-POINT AI RECOMMENDATION
    # ==============================================================
    s10 = create_blank_slide(prs)
    add_header(s10, "9. Advanced Feature: 100-Point AI Recommendation Engine")

    add_card(
        s10, Inches(0.8), Inches(1.6), Inches(11.73), Inches(1.2),
        "Multi-Factor Composite Recommendation Formula (Code: routes/taskRoutes.js:318-355)",
        body_p="Recommendation Score (0 - 100 Pts) = Skill Match (40 Pts) + City Proximity (30 Pts) + Past Category Interest (20 Pts) + Quota Availability (10 Pts)"
    )

    add_card(
        s10, start_x4, Inches(3.0), w4, Inches(4.0),
        "1. Skill Match (40 Pts)",
        [
            ("Maximum:", "40 Points"),
            ("Formula in Code:", "Math.round((matched / required) * 40)"),
            ("Logic:", "Evaluates intersection of volunteer skills with task required skills."),
            ("Reason Log:", "\"Matches X of your skills\" appended to response reasons.")
        ]
    )

    add_card(
        s10, start_x4 + (w4 + gap4), Inches(3.0), w4, Inches(4.0),
        "2. City Proximity (30 Pts)",
        [
            ("Maximum:", "30 Points"),
            ("Condition in Code:", "task.city.toLowerCase() === volunteerCity"),
            ("Logic:", "Awards 30 points if task is located in the volunteer's registered city."),
            ("Reason Log:", "\"Located in your city (CityName)\" appended to reasons.")
        ]
    )

    add_card(
        s10, start_x4 + (w4 + gap4) * 2, Inches(3.0), w4, Inches(4.0),
        "3. Category Interest (20 Pts)",
        [
            ("Maximum:", "20 Points"),
            ("Condition in Code:", "preferredCategories[task.category]"),
            ("Logic:", "Inspects past completed tasks; awards 20 points if category matches prior service."),
            ("Reason Log:", "\"Aligns with your interest in Category\" appended to reasons.")
        ]
    )

    add_card(
        s10, start_x4 + (w4 + gap4) * 3, Inches(3.0), w4, Inches(4.0),
        "4. Quota Urgency (10 Pts)",
        [
            ("Maximum:", "10 Points"),
            ("Condition in Code:", "task.volunteersAssigned < task.volunteersRequired"),
            ("Logic:", "Awards 10 points if the drive still has open volunteer vacancies."),
            ("Sorting in Code:", "scoredTasks.sort((a,b) => b.recommendationScore - a.recommendationScore).")
        ]
    )

    # ==============================================================
    # SLIDE 11: ADVANCED FEATURE: AUTOMATED PDF CERTIFICATION
    # ==============================================================
    s11 = create_blank_slide(prs)
    add_header(s11, "10. Advanced Feature: Automated PDF Certificate Generator")

    add_card(
        s11, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Server-Side PDF Streaming (routes/certificateRoutes.js)",
        [
            ("Trigger Condition:", "Automatically instantiated in applicationRoutes.js when status changes to 'Completed'."),
            ("Unique Certificate ID:", "Generated using format: CHH-CERT-IND-[CITY]-[NUMERIC_ID]."),
            ("PDF Compiler:", "PDFKit vector rendering engine executing on the Node.js server."),
            ("Binary Streaming:", "Compiles in memory and pipes directly to HTTP response stream (doc.pipe(res))."),
            ("HTTP Response Headers:", "Content-Type: application/pdf; Content-Disposition: attachment; filename=\"Certificate-ID.pdf\"."),
            ("Zero Disk Bloat:", "Eliminates static file storage by generating cryptographically tracked PDFs on demand.")
        ]
    )

    add_card(
        s11, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Official Certificate Document Attributes",
        [
            ("Ornate Border Frame:", "Double-layered landscape frame formatted for physical printing."),
            ("Volunteer Recipient:", "Volunteer's full verified name printed in 28pt bold serif typography."),
            ("Legal Authority:", "Organizing NGO's registered legal entity name and headquarters city."),
            ("Verified Contribution:", "Exact community task title and total completed service hours credited."),
            ("Date & Unique ID:", "Date of issue and permanent cryptographic tracking ID printed in footer."),
            ("Credential Utility:", "Provides official verification suitable for academic credits, resumes, and corporate CSR.")
        ]
    )

    # ==============================================================
    # SLIDE 12: ADVANCED FEATURE: IMPACT DASHBOARD & TELEMETRY
    # ==============================================================
    s12 = create_blank_slide(prs)
    add_header(s12, "11. Advanced Feature: Impact Dashboard & Telemetry Aggregations")

    add_card(
        s12, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Live MongoDB Aggregation Pipelines (routes/dashboardRoutes.js:159-222)",
        [
            ("Public Endpoint:", "GET /api/dashboard/impact (Accessible to all visitors without login)."),
            ("Core Telemetry Aggregations:", "Total Registered Volunteers, Total NGOs, Total Tasks, Completed Tasks."),
            ("Hours Served Aggregation:", "Volunteer.aggregate([ { $group: { _id: null, totalHours: { $sum: '$totalHours' } } } ])."),
            ("Category Breakdown Pipeline:", "Task.aggregate([ { $group: { _id: '$category', count: { $sum: 1 } } } ])."),
            ("City Participation Pipeline:", "Task.aggregate([ { $group: { _id: '$city', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 } ]).")
        ],
        body_p="Provides transparent social service impact statistics derived directly from database records."
    )

    add_card(
        s12, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Top 10 Volunteer Leaderboard & Recognition Tiers",
        [
            ("Leaderboard Endpoint:", "GET /api/dashboard/rankings (routes/dashboardRoutes.js:226-244)."),
            ("Sorting Logic in Code:", "Volunteer.find().sort({ rankingPoints: -1, totalHours: -1 }).limit(10)."),
            ("Gold Champion Tier:", "points >= 80 (Awarded to top multi-task contributors with 17+ hours)."),
            ("Silver Tier:", "points >= 40 (Awarded to active volunteers with 10 to 15 hours)."),
            ("Bronze Tier:", "points < 40 (Entry-level active community volunteers)."),
            ("Gamification Outcome:", "Spurs healthy community service engagement while maintaining 100% mathematical fairness.")
        ]
    )

    # ==============================================================
    # SLIDE 13: ROLE-SPECIFIC USER PORTALS
    # ==============================================================
    s13 = create_blank_slide(prs)
    add_header(s13, "12. Role-Specific User Portals & UI Navigation")

    add_card(
        s13, Inches(0.8), Inches(1.6), card_w, card_h,
        "1. Volunteer Portal (/volunteer-dashboard)",
        [
            ("Summary Cards:", "Tasks Completed, Active Assignments, Contributed Hours, Leaderboard Rank."),
            ("Skills Management:", "Interactive modal to add or edit competencies via PUT /auth/volunteer/skills."),
            ("Active Commitments:", "Table tracking applied and assigned community drives."),
            ("Earned Certificates:", "Official certificate cards with one-click PDF download buttons.")
        ]
    )

    add_card(
        s13, Inches(4.8), Inches(1.6), card_w, card_h,
        "2. NGO Portal (/ngo-dashboard)",
        [
            ("Organizational Metrics:", "Total Tasks Created, Active Drives, Completed Drives, Volunteers Assigned."),
            ("Applicant Review Desk:", "Review applicant notes, view skills, and assign or reject with one click."),
            ("Task Management:", "Inline status switcher (Open / In Progress / Completed / Cancelled).")
        ]
    )

    add_card(
        s13, Inches(8.8), Inches(1.6), card_w, card_h,
        "3. Impact Portal (/impact)",
        [
            ("Open Telemetry:", "Public community metrics: volunteers, registered NGOs, total tasks, and total service hours."),
            ("Category Breakdown:", "Visual distribution across all 6 community service categories."),
            ("Top 10 Leaderboard:", "Real-time ranking ordered by verified ranking points.")
        ]
    )

    add_card(
        s13, Inches(0.8), Inches(4.45), Inches(11.73), Inches(2.55),
        "4. Administrator Governance Portal (/admin-dashboard)",
        [
            ("NGO Accreditation Desk:", "Inspect NGO registration certificates and toggle isVerified status to prevent fraudulent entities."),
            ("Global User Directory:", "Search and inspect all volunteer, NGO, and administrative user records in MongoDB."),
            ("Task Moderation Desk:", "Audit and remove inappropriate or duplicate community drive postings across all categories.")
        ],
        body_p="Enforces platform security, non-profit accreditation, and content moderation across the entire network."
    )

    # ==============================================================
    # SLIDE 14: QUALITY ASSURANCE & 25-POINT TEST SUITE
    # ==============================================================
    s14 = create_blank_slide(prs)
    add_header(s14, "13. Quality Assurance & Automated Test Suite (scripts/audit-test.js)")

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
        "Final Automated Audit Result: 25 Passed / 0 Failed (100% Pass Rate)",
        body_p="All 25 automated assertions in scripts/audit-test.js pass with zero failures. Zero mathematical drift was verified across all 37 database profiles."
    )

    # ==============================================================
    # SLIDE 15: TOP VOLUNTEER DATA RECONCILIATION
    # ==============================================================
    s15 = create_blank_slide(prs)
    add_header(s15, "14. Data Integrity Reconciliation: Top Volunteer Profiles")

    vol_audit_data = [
        ("1. Karthik Raman", "Chennai", "8 Tasks", "28 Hrs (4+3+4+3+4+4+3+3 = 28)", "1 Task (5 Hrs)", "136 Pts ((8*10) + (28*2))", "#1 [GOLD]", "PERFECT MATCH"),
        ("2. Rahul Sharma", "Bengaluru", "7 Tasks", "26 Hrs (3+4+4+4+4+4+3 = 26)", "0 Tasks", "122 Pts ((7*10) + (26*2))", "#2 [GOLD]", "PERFECT MATCH"),
        ("3. Senthil Kumar", "Coimbatore", "7 Tasks", "25 Hrs (4+4+4+4+3+3+3 = 25)", "0 Tasks", "120 Pts ((7*10) + (25*2))", "#3 [GOLD]", "PERFECT MATCH"),
        ("4. Aravind Swaminathan", "Trichy", "6 Tasks", "21 Hrs (6 Completed)", "0 Tasks", "102 Pts ((6*10) + (21*2))", "#4 [GOLD]", "PERFECT MATCH"),
        ("5. Meera Joshi", "Pune", "5 Tasks", "19 Hrs (5 Completed)", "0 Tasks", "88 Pts ((5*10) + (19*2))", "#5 [GOLD]", "PERFECT MATCH")
    ]

    add_table_custom(
        s15, Inches(0.8), Inches(1.6), Inches(11.73), Inches(3.2),
        ["Volunteer Name", "City", "Completed", "Verified Hours Sum", "Active Task", "Ranking Points", "Rank / Tier", "Audit Result"],
        vol_audit_data,
        [1.8, 1.1, 1.0, 2.5, 1.2, 1.8, 1.1, 1.2]
    )

    add_card(
        s15, Inches(0.8), Inches(5.0), Inches(11.73), Inches(2.0),
        "Karthik Raman's 8 Completed Tasks Sum to Exactly 28 Hours",
        [
            ("1. Coastal Cleanup (4 Hrs)", "2. Remedial Evening Coaching (3 Hrs)", "3. Surplus Food Packaging (4 Hrs)", "4. Senior Smartphone Camp (3 Hrs)"),
            ("5. Monsoon Sandbag Relief (4 Hrs)", "6. Public Library Audio Recording (4 Hrs)", "7. Dry Food Ration Packing (3 Hrs)", "8. Geriatric Companionship (3 Hrs)"),
            ("Active Task:", "Emergency Flood Relief Kit Assembly (5 Hrs, Status: [ASSIGNED])."),
            ("Verification:", "8 Tasks * 10 = 80 Base Pts + 28 Hours * 2 = 56 Hourly Pts -> Total = 136 Points (Rank #1 Gold Champion). Zero drift.")
        ]
    )

    # ==============================================================
    # SLIDE 16: DEMONSTRATION WALKTHROUGH & EVALUATION
    # ==============================================================
    s16 = create_blank_slide(prs)
    add_header(s16, "15. Demonstration Walkthrough & Evaluator Credentials")

    creds_data = [
        ("System Administrator", "admin@communityhelphub.in", "password123", "Full administrative oversight, NGO verification desk"),
        ("Verified NGO Partner", "kavalar.ngo@gmail.com", "password123", "Create tasks, review applicants, assign volunteers, mark completion"),
        ("Volunteer (Rank #1)", "karthik.raman@gmail.com", "password123", "8 completed tasks (28 hrs, 136 pts), active task, PDF certificate download"),
        ("Volunteer (Rank #2)", "rahul.volunteer@gmail.com", "password123", "7 completed tasks (26 hrs, 122 pts), education focus"),
        ("Volunteer (Rank #3)", "senthil.kumar@gmail.com", "password123", "7 completed tasks (25 hrs, 120 pts), environment focus")
    ]

    add_table_custom(
        s16, Inches(0.8), Inches(1.6), Inches(11.73), Inches(2.8),
        ["Role Title", "Login Email Address", "Password", "Evaluation Scope"],
        creds_data,
        [2.0, 2.5, 1.3, 5.9]
    )

    add_card(
        s16, Inches(0.8), Inches(4.6), Inches(11.73), Inches(2.4),
        "Step-by-Step Live Dynamic Update Demonstration",
        [
            ("Step 1: NGO Posts Task", "Log into Tab 1 as NGO (kavalar.ngo@gmail.com). Post a new task: 'School Library Setup', Category: Education, Hours: 4."),
            ("Step 2: Volunteer Applies", "In Tab 2 as Volunteer (karthik.raman@gmail.com), view Explore Tasks. The new task appears immediately. Click 'Apply'."),
            ("Step 3: NGO Assigns & Completes", "In Tab 1, refresh NGO dashboard. Karthik Raman appears in applicants. Click 'Assign', then click 'Mark Completed'."),
            ("Step 4: Immediate UI & DB Update", "In Tab 2, refresh Volunteer dashboard: Tasks Completed = 9, Hours = 32, Points = 154, and a new PDF certificate is issued.")
        ]
    )

    # ==============================================================
    # SLIDE 17: CONCLUSION & FUTURE ENHANCEMENTS
    # ==============================================================
    s17 = create_blank_slide(prs)
    add_header(s17, "16. Conclusion & Future Technical Scope")

    add_card(
        s17, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Project Achievements & Technical Summary",
        [
            ("100% Syllabus Compliance:", "Fulfills all mandatory requirements, 6 task categories, and advanced features."),
            ("Real-Time Cloud Persistence:", "Zero localized mocks; every action directly mutates the MongoDB Atlas cluster."),
            ("Zero Mathematical Drift:", "Hours and Points are dynamically calculated from verified application records."),
            ("Production-Ready Deployment:", "Fully responsive single page application deployed with automated routing."),
            ("Security Best Practices:", "JWT bearer tokens, BCrypt password hashing, and route interceptors.")
        ]
    )

    add_card(
        s17, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.4),
        "Future Technical Enhancements",
        [
            ("SMS & WhatsApp Broadcasts:", "Automated multi-channel dispatch to alert volunteers during regional flood/cyclone disasters."),
            ("Mobile Geofencing Attendance:", "GPS check-in verifying that the volunteer is physically present at the NGO drive location."),
            ("QR-Verifiable Credentials:", "Public verification QR codes printed on PDF certificates for instant employer/university authentication."),
            ("Corporate CSR Portals:", "Enabling enterprises to sponsor community drives and track aggregated corporate volunteer hours.")
        ]
    )

    # ==============================================================
    # SLIDE 18: THANK YOU & Q&A
    # ==============================================================
    s18 = create_blank_slide(prs)

    frame_end = s18.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(0.6), Inches(12.133), Inches(6.3))
    frame_end.fill.solid()
    frame_end.fill.fore_color.rgb = COLOR_WHITE
    frame_end.line.color.rgb = COLOR_BLACK
    frame_end.line.width = Pt(2)

    tbox_e = s18.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(2.0))
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

    card_foot = s18.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.0), Inches(4.5), Inches(7.333), Inches(1.5))
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
    print(f"Master presentation saved successfully at: {output_path}")

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
            desktop_revised = os.path.join(desktop_dir, "CommunityHelp_Hub_Presentation_Master.pptx")
            shutil.copyfile(local_path, desktop_revised)
            print(f"File was open in PowerPoint. Saved updated version to Desktop as: {desktop_revised}")
