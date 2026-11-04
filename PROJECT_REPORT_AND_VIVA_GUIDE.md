# COMMUNITYHELP HUB - COMPREHENSIVE PROJECT REPORT & VIVA DEFENSE GUIDE
**Full Stack Development Mini Project (MERN Stack)**
**Academic Year: 2026**

---

## TABLE OF CONTENTS
1. Problem Statement & Requirements Specification (10 Marks)
2. System Architecture & Component Design (20 Marks)
3. Backend REST API Specification & Automated Verification (20 Marks)
4. MongoDB Atlas Cloud Database Design & Data Dictionary (15 Marks)
5. Full Stack Integration & Security (20 Marks)
6. Deployment & Configuration Manual (5 Marks)
7. Viva Defense & Technical Questions Cheat Sheet (10 Marks)

---

## 1. PROBLEM STATEMENT & REQUIREMENTS SPECIFICATION (10 MARKS)

### 1.1 Executive Summary
Civic volunteering and grassroots non-governmental organizations (NGOs) across India operate in a fragmented ecosystem. Grassroots NGOs lack automated platforms to mobilize skilled volunteers, while enthusiastic citizens lack visibility into localized social drives that match their competencies. Furthermore, social contributions often go unverified, lacking tangible digital proof of participation.

**CommunityHelp Hub** resolves these challenges through a unified MERN stack platform that:
- Connects verified NGOs with registered community volunteers across **28 major Indian cities**.
- Structures all community initiatives under **6 mandatory social-impact categories** aligned with United Nations Sustainable Development Goals (SDGs):
  1. Education
  2. Food distribution
  3. Environment
  4. Elder support
  5. Disaster support
  6. Community service
- Implements automated algorithmic matching based on volunteer competencies, geographic locality, and a **100-point heuristic AI recommendation score**.
- Automates verification and instant cryptographic **PDF certificate generation** using PDFKit streaming.
- Provides national platform governance and real-time Chart.js analytics for systemic oversight.

### 1.2 User Persona & Role-Based Access Control (RBAC) Matrix
The platform enforces three distinct user roles:

| Role | Access Permissions | Primary Capabilities |
| :--- | :--- | :--- |
| **Volunteer** | Public tasks, Personal Dashboard, My Tasks, Application submission | Apply for drives with custom notes, manage registered skills, track status, download earned PDF certificates, view ranking leaderboard |
| **NGO Partner** | NGO Dashboard, Task Creation, Task CRUD, Applicant Review | Publish new community tasks, edit existing drives, review applicants with registered skills, assign volunteers, mark tasks completed |
| **System Admin** | Global Governance Portal, User Directory, Diagnostics | Oversight of all users and tasks across India, moderate tasks, delete bad actors, inspect database health metrics |

### 1.3 Functional Requirements
1. **Multi-Role Authentication**: Secure registration and login using JWT tokens and bcrypt password hashing.
2. **Task Exploration & Filtering**: Multi-field debounced search (by title, category, city, organization) with 28-city filter and 6 category selectors.
3. **Algorithmic Matching**:
   - *Skills Match*: Intersects volunteer competencies with task requirements.
   - *Local City Match*: Filters tasks within the volunteer's registered home city.
   - *AI Heuristic Recommendation*: Scores opportunities from 0 to 100 based on skill overlap (40 pts), city alignment (30 pts), urgency/volunteers required (20 pts), and category relevance (10 pts).
4. **Task Application Workflow**: In-page modal for entering application motivation notes; prevention of duplicate applications.
5. **Dynamic PDF Certification**: Generates verified, branded PDF certificates upon task completion by an NGO.
6. **Data Visualization**: Real-time Chart.js analytics displaying category allocation (Doughnut) and city engagement (Bar chart).

---

## 2. REACT FRONTEND ARCHITECTURE (20 MARKS)

### 2.1 Technology Stack
- **Framework**: React 18.3.1 (Single Page Application)
- **Build Tool**: Vite 5.2.11 (Fast HMR, optimized production bundling)
- **Routing**: React Router v6 (Declarative client-side routing with protected route guards)
- **Data Visualization**: Chart.js 4.4.2 paired with `react-chartjs-2` 5.2.0
- **Styling**: Pure CSS Custom Properties (CSS variables) adhering strictly to institutional civic UI standards without third-party CSS framework bloat.

### 2.2 Component Hierarchy & Directory Organization
```
client/src/
├── api/
│   └── client.js             # Centralized fetch wrapper with JWT bearer attachment
├── context/
│   ├── AuthContext.jsx       # Global session provider (login, logout, syncUser)
│   └── ToastContext.jsx      # Non-blocking notification toast provider
├── components/
│   ├── Navbar.jsx            # Dynamic navigation header with role badges
│   ├── Footer.jsx            # Civic platform footer
│   ├── ProtectedRoute.jsx    # Role-based route guard
│   ├── TaskCard.jsx          # Standardized task card with match scores & apply button
│   ├── ConfirmModal.jsx      # Reusable confirmation dialog (primary / danger)
│   └── PromptModal.jsx       # In-page modal for application notes
└── pages/
    ├── Home.jsx              # Landing page with impact counters & category cards
    ├── ExploreTasks.jsx      # 4 matching modes, 28-city filter, debounced search
    ├── TaskDetails.jsx       # Deep-link inspection & application submission
    ├── CreateTask.jsx        # NGO task publication with validation
    ├── VolunteerDashboard.jsx# Profile, registered skills, tier badges, certificates
    ├── NgoDashboard.jsx      # Metrics, incoming applications review, task CRUD
    ├── MyTasks.jsx           # Volunteer commitment history table
    ├── ImpactDashboard.jsx   # Interactive Chart.js analytics & leaderboard
    ├── AdminDashboard.jsx    # Superuser user directory, task oversight & diagnostics
    ├── Login.jsx             # Authentication page with demo credential box
    └── Register.jsx          # Multi-tab volunteer and NGO registration
```

### 2.3 State Management & Performance Optimizations
- **Global Auth State**: `AuthContext` stores user identity, token, and role. Automatically synchronizes with `localStorage` for session persistence across page reloads.
- **Debounced Search**: Text search queries on the Explore page use a 250ms debounce threshold to minimize redundant re-renders and API calls.
- **Backward-Compatible Routing**: Includes route aliases (`/explore-tasks.html`, `/task-details.html?id=...`) to ensure zero broken links during legacy transitions.

---

## 3. BACKEND REST API SPECIFICATION (20 MARKS)

### 3.1 Technology Stack
- **Runtime**: Node.js v24 LTS
- **Framework**: Express.js 4.19.2
- **Authentication**: JSON Web Tokens (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **PDF Engine**: PDFKit 0.15.0 (Binary stream generation)

### 3.2 RESTful API Endpoints Summary

| Method | Endpoint | Access | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register-volunteer` | Public | Register a new volunteer with skills | 201, 400, 500 |
| `POST` | `/api/auth/register-ngo` | Public | Register an NGO with govt reg number | 201, 400, 500 |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT | 200, 400, 401 |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated user profile | 200, 401, 404 |
| `PUT` | `/api/auth/volunteer/skills` | Volunteer | Update volunteer skills dynamically | 200, 403, 404 |
| `GET` | `/api/tasks` | Public | List all tasks with city/category filters | 200, 500 |
| `GET` | `/api/tasks/:id` | Public | Fetch detailed specifications for single task | 200, 404 |
| `POST` | `/api/tasks` | NGO Only | Create and publish a new community task | 201, 400, 403 |
| `PUT` | `/api/tasks/:id` | NGO/Admin | Update task details or lifecycle status | 200, 403, 404 |
| `DELETE` | `/api/tasks/:id` | NGO/Admin | Permanently remove task & cascade cleanup | 200, 403, 404 |
| `GET` | `/api/tasks/matching/skills` | Volunteer | Return tasks matched against volunteer skills | 200, 403 |
| `GET` | `/api/tasks/matching/location` | Volunteer | Return tasks matching volunteer home city | 200, 403 |
| `GET` | `/api/tasks/matching/recommended`| Volunteer | Return tasks scored by 100-pt AI algorithm | 200, 403 |
| `POST` | `/api/applications/:taskId` | Volunteer | Apply for task with motivational note | 201, 400, 403 |
| `GET` | `/api/applications/my-tasks` | Volunteer | Retrieve volunteer's applied assignments | 200, 403 |
| `GET` | `/api/applications/ngo/all` | NGO Only | Retrieve all applicants for NGO's tasks | 200, 403 |
| `PUT` | `/api/applications/:id/status`| NGO Only | Assign, reject, or mark task completed | 200, 400, 403 |
| `GET` | `/api/dashboard/volunteer` | Volunteer | Fetch volunteer metrics & certificates | 200, 403 |
| `GET` | `/api/dashboard/ngo` | NGO Only | Fetch NGO published tasks & stats | 200, 403 |
| `GET` | `/api/dashboard/impact` | Public | Category doughnut & city bar analytics | 200, 500 |
| `GET` | `/api/dashboard/rankings` | Public | Volunteer leaderboard ranking table | 200, 500 |
| `GET` | `/api/certificates/download/:id` | Public | Stream verified binary PDF certificate | 200, 404 |
| `GET` | `/api/admin/overview` | Admin | Superuser diagnostics & platform stats | 200, 403 |
| `GET` | `/api/admin/users` | Admin | List all registered accounts | 200, 403 |
| `DELETE`| `/api/admin/users/:id` | Admin | Delete user account & associated records | 200, 403 |

### 3.3 Automated End-to-End Test Suite Verification
The backend includes an automated test harness ([scripts/audit-test.js](file:///C:/Users/DELL/Desktop/community-help-hub/scripts/audit-test.js)) verifying **25 critical test cases**:
- Registration validation (email format, 10-digit phone, duplicate rejection)
- Authentication and role boundary enforcement (403 forbidden for unauthorized actions)
- CRUD operations and duplicate task application prevention
- Status lifecycles, ranking points recalculation, and PDF streaming verification
- Algorithmic scoring accuracy (Skills, Location, and AI recommendation scoring)

**Result**: `25 PASSED / 0 FAILED (25 TOTAL TESTS)`

---

## 4. MONGODB ATLAS CLUSTER CONNECTIVITY (15 MARKS)

### 4.1 Cloud Infrastructure
- **Hosting Provider**: MongoDB Atlas Cloud
- **Cluster**: `Cluster0` (`cluster0.bzsczod.mongodb.net`)
- **Database Name**: `community_help_hub`
- **Object Data Modeling (ODM)**: Mongoose 8.3.4

### 4.2 Entity-Relationship (ER) Schema Data Dictionary

#### 1. `users` Collection
Stores authentication credentials and roles:
- `_id`: ObjectId (Primary Key)
- `email`: String (Unique, Indexed, Lowercase)
- `password`: String (Bcrypt salted hash, min 6 chars)
- `role`: String (Enum: `['volunteer', 'ngo', 'admin']`)
- `createdAt`, `updatedAt`: Timestamps

#### 2. `volunteers` Collection
Stores contributor profile and competencies:
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Foreign Key -> `users._id`, Indexed)
- `fullName`: String (Required, Trimmed)
- `phone`: String (Indexed, 10-digit validated)
- `city`: String (Indexed)
- `skills`: Array of Strings (Indexed for fast skill-matching)
- `totalHours`: Number (Default: 0)
- `completedTasksCount`: Number (Default: 0)
- `rankingPoints`: Number (Default: 0, Computed: Tasks * 10 + Hours * 2)

#### 3. `ngos` Collection
Stores partner grassroots organizations:
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Foreign Key -> `users._id`, Indexed)
- `orgName`: String (Required)
- `registrationNumber`: String (Unique, Indexed, e.g. `NGO-TN-2026-007`)
- `contactPerson`: String
- `phone`: String
- `city`: String (Indexed)
- `address`: String

#### 4. `tasks` Collection
Stores community social-service opportunities:
- `_id`: ObjectId (Primary Key)
- `title`: String (Required)
- `category`: String (Enum: 6 mandatory categories, Indexed)
- `description`: String
- `city`: String (Enum: 28 major Indian cities, Indexed)
- `location`: String (Specific venue address)
- `dateTime`: Date
- `hours`: Number (Default: 3)
- `volunteersRequired`: Number (Min: 1)
- `volunteersAssigned`: Number (Default: 0)
- `requiredSkills`: Array of Strings
- `status`: String (Enum: `['Open', 'In Progress', 'Completed', 'Cancelled']`)
- `createdBy`: ObjectId (Foreign Key -> `ngos._id`, Indexed)

#### 5. `applications` Collection
Links volunteers to specific tasks:
- `_id`: ObjectId (Primary Key)
- `taskId`: ObjectId (Foreign Key -> `tasks._id`, Indexed)
- `volunteerId`: ObjectId (Foreign Key -> `volunteers._id`, Indexed)
- `status`: String (Enum: `['Applied', 'Assigned', 'Completed', 'Rejected']`)
- `notes`: String (Volunteer application motivation message)
- `appliedAt`: Date (Default: `Date.now`)
- *Compound Unique Index*: `{ taskId: 1, volunteerId: 1 }` prevents double applications.

#### 6. `certificates` Collection
Stores verified completion credentials:
- `_id`: ObjectId (Primary Key)
- `certificateId`: String (Unique, format: `CHH-YYYYMMDD-XXXX`)
- `volunteerId`: ObjectId (Foreign Key -> `volunteers._id`)
- `taskId`: ObjectId (Foreign Key -> `tasks._id`)
- `ngoId`: ObjectId (Foreign Key -> `ngos._id`)
- `hoursCompleted`: Number
- `issueDate`: Date (Default: `Date.now`)

---

## 5. FULL STACK INTEGRATION & SECURITY (20 MARKS)

### 5.1 End-to-End Data Pipeline
1. **Request Origin**: User submits an action in the React client.
2. **Client Validation**: React validates format before network dispatch.
3. **Transport**: Secured fetch call carries JSON payload with `Authorization: Bearer <JWT>`.
4. **Middleware Interception**: Express `protect` middleware verifies JWT signature and extracts user ID and role.
5. **Business Logic & Mongoose Validation**: Controller enforces business rules and schema constraints.
6. **Cloud Database Persistence**: MongoDB Atlas executes the write with atomic durability.
7. **Response & Client State Update**: React receives HTTP response, displays a non-blocking toast, and updates the UI state without full-page reloads.

### 5.2 Security Implementations
- **Bcrypt Password Hashing**: Passwords undergo 10 rounds of salt-hashing; plain-text passwords never touch database disks.
- **JWT Authorization**: Cryptographically signed tokens with 7-day expiration.
- **CORS Configuration**: Restricts and controls cross-origin resource requests.
- **NoSQL Injection Defense**: Strict Mongoose schema typing prevents operator injection vulnerabilities.
- **Single-Port Production Serving**: Node.js serves both API endpoints and the compiled React production bundle from `client/dist`, eliminating CORS overhead in production.

---

## 6. DEPLOYMENT & OPERATION MANUAL (5 MARKS)

### 6.1 Installation
Clone or locate the project folder:
```cmd
cd /d C:\Users\DELL\Desktop\community-help-hub
```

Install root backend dependencies:
```cmd
npm install
```

Install React frontend dependencies:
```cmd
npm run client:install
```

### 6.2 Running the Application (Standard Single-Port Production)
```cmd
npm start
```
Open in browser: `http://localhost:5000`

### 6.3 Rebuilding the Frontend
```cmd
npm run build
```

### 6.4 Inspecting Database Collections in Terminal
```cmd
npm run db:view              # Overview table of all collections
npm run db:view users        # Inspect registered user records
npm run db:view ngos         # Inspect registered partner NGOs
npm run db:view tasks        # Inspect community drives
```

### 6.5 Running Automated System Audits
```cmd
npm run audit
```

---

## 7. VIVA DEFENSE & TECHNICAL QUESTIONS CHEAT SHEET (10 MARKS)

### Q1: Why did you choose React over Vanilla HTML/CSS/JavaScript?
**Answer**:
"Vanilla JavaScript requires manual DOM manipulation (`document.getElementById`), leading to spaghetti code and poor state management in complex applications. React uses a Virtual DOM and component-based architecture, re-rendering only the changed elements. Furthermore, React Context allows centralized authentication state management across all pages, and React Router provides seamless Single Page Application (SPA) transitions without full page reloads."

### Q2: Why did you choose MongoDB over a relational database like MySQL?
**Answer**:
"Community initiatives have flexible attributes; for example, different tasks require dynamic skill lists, varying volunteer counts, and custom notes. MongoDB's BSON document model allows flexible schema evolution, native JSON serialization matching our Node.js runtime, and high read/write throughput on cloud clusters like MongoDB Atlas."

### Q3: How is authentication implemented in this project?
**Answer**:
"We use JSON Web Tokens (JWT). When a user logs in with valid credentials, the server creates a token signed with a secret key containing `{ userId, role }`. The client stores this in `localStorage` and transmits it in the `Authorization: Bearer <token>` header for subsequent requests. The server verifies this token using middleware before executing protected operations."

### Q4: How are passwords secured?
**Answer**:
"Passwords are never stored in plain text. Before saving a user record, a pre-save Mongoose hook uses `bcryptjs` with 10 salt rounds to generate a cryptographic hash. During login, `user.comparePassword()` hashes the candidate password and checks against the stored hash."

### Q5: How does your AI Task Recommendation algorithm work?
**Answer**:
"Our recommendation engine runs an algorithmic 100-point heuristic evaluation across four criteria:
1. **Skill Overlap (40 pts)**: Intersects the volunteer's registered competencies with task requirements.
2. **City Alignment (30 pts)**: Awards points if the task is in the volunteer's registered home city.
3. **Drive Urgency (20 pts)**: Evaluates remaining volunteers required vs. capacity.
4. **Category Priority (10 pts)**: Balances distribution across high-need civic sectors."

### Q6: How do you prevent duplicate task applications?
**Answer**:
"At the database level, we created a compound unique index on the `applications` collection: `{ taskId: 1, volunteerId: 1 }`. If a volunteer attempts to apply twice, MongoDB throws error code 11000 (duplicate key), which our controller catches and returns as a friendly `400 Bad Request`."

### Q7: How does PDF certificate generation work?
**Answer**:
"We use `PDFKit` on the server. When an NGO marks an assigned volunteer's task as 'Completed', the system records a certificate document with a unique ID. When the volunteer clicks 'Download PDF', an Express endpoint dynamically renders the certificate with the volunteer's name, hours, NGO name, and date, streaming the binary PDF stream directly to the browser with headers `Content-Type: application/pdf`."

### Q8: What is Vite and why did you use it instead of Create React App?
**Answer**:
"Create React App uses Webpack, which bundles the entire application before serving, resulting in slow build times. Vite leverages native ES modules in modern browsers and uses esbuild (written in Go) for pre-bundling, making development startup and production builds significantly faster (our build finishes in ~3 seconds)."

### Q9: How is the React app served in production?
**Answer**:
"In `server.js`, Express checks if `client/dist` exists. If present, it serves static files via `express.static(clientDistPath)`. Any non-API route request (`*`) falls back to `client/dist/index.html`. This enables our entire MERN stack to run self-contained on a single port (5000)."

### Q10: How do you handle Cross-Origin Resource Sharing (CORS)?
**Answer**:
"In development mode where React runs on port 5173 and Express on port 5000, Vite proxies `/api` requests to port 5000, and Express utilizes the `cors()` middleware. In production, because Express serves the compiled React build from the same origin, CORS overhead is eliminated entirely."

---

*Compiled for Department of Computer Science & Engineering / Information Technology Examination.*
