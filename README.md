# CommunityHelp Hub - Volunteer & Social Service Platform

A full-stack web application designed to connect dedicated volunteers with registered NGOs and grassroots community initiatives across India.

---

## 1. Project Overview & Problem Statement
- **Problem Statement:** Grassroots NGOs and community organizations often face volunteer shortages for localized, short-duration social initiatives (food drives, remedial tutoring, lake clean-ups, disaster aid packaging). Simultaneously, student volunteers lack a structured, reliable portal to discover verified opportunities, track their contribution hours, and obtain tamper-verifiable certificates.
- **Platform Objective:** CommunityHelp Hub provides a role-based, transparent platform connecting volunteers and registered NGOs, managing the entire task lifecycle from creation to assignment, completion, impact tracking, and automated certificate generation.

---

## 2. Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (Fetch API, DOM Manipulation)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT), bcryptjs password encryption
- **Visualization:** Chart.js (Category and Geographic distribution)
- **Document Generation:** PDFKit (Tamper-verifiable Certificate of Appreciation)

---

## 3. Project Directory Structure
```text
community-help-hub/
├── config/
│   └── db.js                 # MongoDB connection logic using Mongoose
├── middleware/
│   └── authMiddleware.js     # JWT token verification and role guards
├── models/
│   ├── User.js               # User credentials and role definitions
│   ├── Volunteer.js          # Volunteer profile, skills, hours, and ranking points
│   ├── NGO.js                # Organization details, registration ID, contact info
│   ├── Task.js               # Task specifications, category, skills, and status
│   ├── Application.js        # Volunteer application and assignment tracking
│   └── Certificate.js        # Certificate metadata and verification records
├── routes/
│   ├── authRoutes.js         # Volunteer & NGO registration, user login, me endpoint
│   ├── taskRoutes.js         # CRUD operations, skill matching, location matching, AI recs
│   ├── applicationRoutes.js  # Apply, assign, reject, and complete task workflow
│   ├── dashboardRoutes.js    # Volunteer stats, NGO operations, impact stats, leaderboard
│   └── certificateRoutes.js  # Dynamic PDF certificate generation using PDFKit
├── public/
│   ├── css/
│   │   └── styles.css        # Responsive styling and design system
│   ├── js/
│   │   ├── api.js            # API request helper and navigation state sync
│   │   ├── auth.js           # Login and tabbed registration handlers
│   │   ├── tasks.js          # Task exploration, filters, and application logic
│   │   └── dashboard.js      # Volunteer & NGO dashboard logic and Chart.js integration
│   ├── index.html            # Public homepage and category overview
│   ├── login.html            # User login page
│   ├── register.html         # Volunteer and NGO registration tabs
│   ├── explore-tasks.html    # Task directory with matching tabs and filters
│   ├── task-details.html     # Detailed task specifications and 1-click apply
│   ├── create-task.html      # NGO task publishing form
│   ├── volunteer-dashboard.html # Volunteer activity, hours, and certificate downloads
│   ├── ngo-dashboard.html    # NGO tasks, application review, and volunteer assignment
│   ├── my-tasks.html         # Volunteer assigned task tracking
│   └── impact.html           # Public impact analytics and volunteer leaderboard
├── .env                      # Environment variables (PORT, MONGO_URI, JWT_SECRET)
├── package.json              # Project dependencies and npm scripts
├── seed.js                   # Seed script populating demo data across all 6 categories
└── server.js                 # Express server entry point
```

---

## 4. Key Modules & Features

### Module 1: Authentication & Role-Based Access
- Volunteer Registration with name, contact, city, and skills.
- NGO Registration with organization name, registration number, and contact details.
- Secure login using `bcryptjs` password hashing and `jsonwebtoken` (JWT).

### Module 2: Task Management (CRUD)
- NGOs can **Create**, **Read**, **Update**, and **Delete** tasks.
- Mandatory categories strictly supported:
  1. Education
  2. Food distribution
  3. Environment
  4. Elder support
  5. Disaster support
  6. Community service

### Module 3: Task Assignment & Lifecycle
- Volunteers apply for open opportunities.
- NGOs review applicants and change status: `Applied` -> `Assigned` -> `Completed`.
- Completing a task automatically logs hours, awards ranking points, and issues a certificate.

### Module 4: Advanced Features
1. **Skill-Based Volunteer Matching:** Compares volunteer skills against task requirements and displays a percentage match score (`[100% SKILL MATCH]`).
2. **Location-Based Matching:** Identifies and filters tasks in the volunteer's registered metropolitan area.
3. **Volunteer Ranking & Leaderboard:** Ranks volunteers by verified service hours and ranking points (Bronze, Silver, Gold recognition tiers).
4. **Impact Dashboard:** Interactive visualizations using Chart.js showing task allocation across categories and geographic distribution.
5. **Certificate Generation:** Downloadable, verified PDF Certificate of Appreciation generated using PDFKit with volunteer details and unique certificate ID.
6. **AI Task Recommendation:** Profile-aware recommendation algorithm evaluating volunteer skills, city proximity, and previous task history.

---

## 5. Getting Started & Running the Project

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### Installation
```bash
# Navigate to project folder
cd community-help-hub

# Install dependencies
npm install
```

### Seed Demo Data
```bash
# Populates sample NGOs, volunteers, tasks across all 6 categories, and test records
npm run seed
```

### Start the Server
```bash
npm start
```
Open your browser and navigate to:
**http://localhost:5000**

---

## 6. Demo Test Credentials
- **Volunteer Account:**
  - Email: `rahul.volunteer@gmail.com`
  - Password: `password123`
- **NGO Account:**
  - Email: `vidyaseva@ngo.org`
  - Password: `password123`
