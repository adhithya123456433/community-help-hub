# CommunityHelp Hub - Volunteer & Social Service Platform

A full-stack web application designed to connect dedicated student volunteers with registered NGOs and grassroots community initiatives across India.

---

## Academic Information & Team Credits

- **Course:** Full Stack Web Development Lab (Course Code: 21AD502)
- **Degree:** Bachelor of Technology in Artificial Intelligence and Data Science (B.Tech AI & DS)
- **Year & Semester:** Third Year / Semester V
- **Academic Year:** 2026 – 2027
- **Institution:** Autonomous Institution, Affiliated to Anna University, Tamil Nadu
- **Project Repository:** [https://github.com/adhithya123456433/community-help-hub.git](https://github.com/adhithya123456433/community-help-hub.git)

### Team Members & Contributions

| Roll Number | Team Member Name | Project Role | Contribution (%) |
| :---: | :--- | :--- | :---: |
| **24BAD048** | **Jeevaprakash S** | Team Lead & Full Stack Architecture | **25%** |
| **24BAD004** | **K Adhithya** | Backend & REST API (Node.js / Express.js) | **25%** |
| **24BAD014** | **Aswin S** | Frontend & UI/UX (React.js) | **25%** |
| **24BAD052** | **Kalvi Kannan B** | Database & Data Modeling (MongoDB Atlas) | **25%** |

---

## Project Documentation & Submission Reports

The official university laboratory reports generated from the university template are located in the `docs/` directory:

- **Submission Report (PDF):** [`docs/24BAD048_TeamHelpHub_FullStackReport.pdf`](docs/24BAD048_TeamHelpHub_FullStackReport.pdf) (35 Pages, Times New Roman 12pt, 1.5 spacing, 1-inch margins, Consolas 10pt code snippets, all 8 screenshots embedded)
- **Submission Report (Word):** [`docs/24BAD048_TeamHelpHub_FullStackReport.docx`](docs/24BAD048_TeamHelpHub_FullStackReport.docx)
- **Template Version with Instructions (PDF):** [`docs/Full_Stack_Project_Report_Template.pdf`](docs/Full_Stack_Project_Report_Template.pdf)
- **Template Version with Instructions (Word):** [`docs/Full_Stack_Project_Report_Template.docx`](docs/Full_Stack_Project_Report_Template.docx)

---

## 1. Project Overview & Problem Statement

- **Problem Statement:** Grassroots NGOs and community welfare organizations across India frequently face volunteer shortages for localized, short-duration social initiatives (food distribution, remedial evening tutoring for underprivileged children, coastal microplastic clean-ups, disaster shelter readiness). Simultaneously, collegiate students eager to volunteer receive fragmented notices across informal WhatsApp groups with no structured discovery, no real-time headcount caps, and no recognized, verifiable digital certificate to prove their contributed hours for academic credit or resumes.
- **Platform Objective:** CommunityHelp Hub provides an end-to-end full-stack web application connecting volunteers and registered NGOs, managing the entire task lifecycle from authoring to atomic quota enforcement, intelligent task matching, verified hour tracking, and dynamic PDF certificate compilation.

---

## 2. Technology Stack

- **Frontend:** React 18 Single-Page Application (SPA), React Router DOM v6, React Context API, Semantic HTML5, CSS3 Flexbox & Grid, Chart.js Data Visualizations
- **Backend:** Node.js 20 LTS, Express.js 4.18 RESTful API Framework
- **Database:** MongoDB Atlas (Cloud Multi-AZ Replica Set Cluster), Mongoose 7 ODM
- **Authentication & Security:** JSON Web Tokens (JWT) with 7-day expiration, BCrypt.js password hashing (10 salt rounds), CORS configuration, and environment isolation
- **Document Generation:** PDFKit 0.13 (In-memory landscape vector compilation of official Certificates of Appreciation)
- **Hosting & Deployment:** Frontend on Vercel, Backend on Render, Database on MongoDB Atlas

---

## 3. Project Directory Structure

```text
community-help-hub/
├── config/
│   └── db.js                 # MongoDB Atlas connection logic using Mongoose
├── middleware/
│   └── authMiddleware.js     # JWT token verification and role guards
├── models/
│   ├── User.js               # User credentials and role definitions (Volunteer, NGO, Admin)
│   ├── Task.js               # Task specifications, category enum, quotas, and skill prerequisites
│   ├── Application.js        # Volunteer application and assignment tracking
│   ├── Category.js           # Six core social-service categories with visual badges
│   ├── Certificate.js        # Verifiable certificate metadata and cryptographic token records
│   └── AuditLog.js           # Administrative telemetry and action logs
├── routes/
│   ├── authRoutes.js         # User registration, login, and profile management
│   ├── taskRoutes.js         # CRUD operations, skill matching, location matching, AI recommendations
│   ├── applicationRoutes.js  # Apply with atomic capacity guard, review applicants, approve completion
│   ├── dashboardRoutes.js    # Volunteer statistics, NGO operations, impact stats, leaderboard
│   └── certificateRoutes.js  # In-memory streaming of dynamic PDF Certificates using PDFKit
├── public/                   # Client web assets, styles, and dashboard scripts
│   ├── css/styles.css        # Responsive styling and design system
│   ├── js/                   # Client-side API helpers and interactive logic
│   └── index.html            # Landing page
├── docs/                     # Official project reports (.docx and .pdf)
├── scripts/                  # Automated report generation and Word COM export scripts
├── .env                      # Environment variables (PORT, MONGO_URI, JWT_SECRET)
├── package.json              # Project dependencies and npm scripts
├── seed.js                   # Demo data generator across all 6 categories
└── server.js                 # Express server entry point
```

---

## 4. Key Modules & Features

### Module 1: Authentication & Role-Based Access
- Role-based registration for **Volunteers** and **NGO Coordinators** with skills, contact number, and home city.
- Secure login using `bcryptjs` password hashing (10 salt rounds) and stateless `jsonwebtoken` (JWT).
- Protected route middleware (`authMiddleware.js`) enforcing role access controls.

### Module 2: Task Authoring & Headcount Quota Management (CRUD)
- NGOs publish community service drives across the **six mandatory categories**:
  1. Education
  2. Food distribution
  3. Environment
  4. Elder support
  5. Disaster support
  6. Community service
- Structured input for date, estimated hours, location, target beneficiaries, urgency, and volunteer headcount quota.
- Atomic capacity guards preventing enrollment once `volunteersAssigned >= volunteersRequired`.

### Module 3: Multi-View Task Discovery & 100-Point AI Recommendation Engine
1. **All Opportunities:** Full directory with real-time category, city, and keyword filters.
2. **Skill-Based Match:** Matches volunteer competency tags (Clean-up, Logistics, Teaching, First Aid) to display prominent `[100% SKILL MATCH]` badges.
3. **Location-Based Match:** Highlights drives in the volunteer's registered metropolitan city (e.g., `[LOCAL MATCH: CHENNAI]`).
4. **Multi-Factor AI Recommendation Engine:** Formulates a deterministic 100-point compatibility score:
   $$\text{Score} = (\text{Skill Match} \times 40) + (\text{City Proximity} \times 30) + (\text{Past Category Engagement} \times 20) + (\text{Task Urgency} \times 10)$$

### Module 4: Impact Tracking, Leaderboard & PDF Certificates
- **Dynamic Service Hours:** Volunteer hours are calculated dynamically from verified application records, completely eliminating data drift.
- **Volunteer Recognition Leaderboard:** Real-time leaderboard ranking volunteers by verified hours and points, awarding `[GOLD CHAMPION]` and `[SILVER TIER]` badges.
- **Impact Analytics Dashboard:** Chart.js doughnut chart for task category distribution and bar chart for city allocations.
- **Dynamic PDF Certificates:** Server-side landscape Certificate of Appreciation dynamically compiled in memory via PDFKit and streamed directly to the browser with unique Certificate ID (e.g., `CHH-CERT-IND-CHN-1001`).

---

## 5. Getting Started & Running the Project

### Prerequisites
- Node.js (v18 or v20 LTS recommended)
- npm (v9 or higher)
- MongoDB running locally on `mongodb://127.0.0.1:27017/community-help-hub` or a MongoDB Atlas cloud URI

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adhithya123456433/community-help-hub.git
   cd community-help-hub
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/community-help-hub
   JWT_SECRET=super_secret_jwt_key_2026_ai_ds
   NODE_ENV=development
   ```

4. **Seed the Database with Demo Data:**
   ```bash
   npm run seed
   ```
   *(This populates demo volunteers, NGOs, community drives across all 6 categories, and test applications)*

5. **Start the Application Server:**
   ```bash
   npm start
   ```
   The application will start on **http://localhost:5000**.

---

## 6. Demo Test Credentials

| Role | Email Address | Password | Profile Details |
| :--- | :--- | :--- | :--- |
| **Volunteer (Test Lead)** | `karthik.raman@volunteer.in` | `password123` | Chennai, Skills: Clean-up, Logistics, First Aid |
| **Volunteer (Student)** | `rahul.volunteer@gmail.com` | `password123` | Bengaluru, Skills: Teaching, English, Math |
| **NGO Coordinator** | `kavalar@youthwelfare.org` | `password123` | Kavalar Youth Welfare Foundation (Chennai) |
| **NGO Coordinator** | `vidyaseva@ngo.org` | `password123` | Vidya Seva Foundation (Bengaluru) |
| **System Administrator** | `admin@communityhelphub.org` | `AdminSecure@2026` | Full platform oversight & telemetry access |

---

## 7. Faculty Verification Checklist

- [x] **Strict Template Conformity:** Every section and table follows the university template section-by-section.
- [x] **No Placeholder Text:** Zero unreplaced bracketed `[...]` placeholders remaining.
- [x] **Formatting Standards:** Paper size A4, 1-inch margins on all sides, Times New Roman 12pt (1.5 line spacing), 14pt bold headings.
- [x] **Monospace Code Snippets:** 5 key code excerpts formatted in Consolas 10pt with detailed captions and explanations.
- [x] **Numbered Figures & Tables:** All 8 figures and 6 tables numbered and explicitly referenced in the body text.
- [x] **Page Numbers:** Bottom centre, front matter in Roman numerals (`i, ii`), chapters in Arabic (`1, 2, 3...`).
- [x] **Page Count:** 35 pages (well within the university requirement of 30–50 pages).
- [x] **Application Screenshots:** 8 real application screenshots embedded.
- [x] **Deliverable PDF:** Formatted and named strictly as `24BAD048_TeamHelpHub_FullStackReport.pdf`.
- [x] **Public GitHub Repository:** Available at `https://github.com/adhithya123456433/community-help-hub.git` with comprehensive README setup instructions.
