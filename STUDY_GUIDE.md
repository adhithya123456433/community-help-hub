# CommunityHelp Hub - Project Study Guide & Code Walkthrough

**Project Name:** CommunityHelp Hub (Volunteer & Social Service Platform)  
**Subject:** Full Stack Development (FSD) Mini Project  
**Architecture:** Model-View-Controller (MVC) RESTful Architecture  
**Tech Stack:** Node.js, Express.js, MongoDB, Mongoose, HTML5, CSS3, JavaScript (Fetch API), Chart.js, PDFKit  

---

## 1. High-Level Architecture & System Design

### 1.1 Problem Statement & Solution
- **Problem:** Grassroots NGOs constantly face volunteer shortages for localized, short-duration drives (food rescue, slum tutoring, lake cleanup). Concurrently, university students need verified community service hours for academic credits (such as AICTE/NSS points) but lack a structured, reliable portal to discover opportunities, track hours, and obtain tamper-verifiable certificates.
- **Solution:** CommunityHelp Hub is a role-based full-stack web platform that:
  - Separates roles into **Volunteers**, **NGOs**, and **Admins**.
  - Implements full **CRUD operations** for social service tasks across 6 mandatory categories.
  - Implements **algorithmic skill matching** and **location proximity** matching.
  - Features an **AI-inspired recommendation engine** scoring tasks out of 100 points.
  - Generates **tamper-verifiable PDF certificates** dynamically using **PDFKit** upon NGO completion approval.
  - Visualizes platform impact using dynamic **Chart.js** charts.

### 1.2 How the Full-Stack Flow Works
1. **Client Layer (Browser):** The user interacts with HTML pages in `public/`. Vanilla JavaScript files in `public/js/` trigger asynchronous `fetch()` requests to Express API routes.
2. **Server Layer (Node.js & Express):** Express handles incoming HTTP requests, passes them through authentication middleware (`authMiddleware.js`) to verify JWT tokens, and routes them to controller routes in `routes/`.
3. **Database Layer (MongoDB & Mongoose):** Mongoose models validate and query data from MongoDB running on `mongodb://127.0.0.1:27017/community_help_hub` and return JSON responses to the frontend.

---

## 2. MongoDB Database Schemas (Line-by-Line)

| Collection | Primary Purpose | Key Relationships |
| :--- | :--- | :--- |
| **users** | Stores authentication credentials and user role | Linked 1-to-1 with Volunteer or NGO profile |
| **volunteers** | Stores volunteer name, city, skills, hours, points | Foreign key: `userId` |
| **ngos** | Stores organization name, registration ID, phone, city | Foreign key: `userId` |
| **tasks** | Stores task details, category, required skills, status | Foreign key: `createdBy` (ref: NGO) |
| **applications** | Tracks volunteer task applications and status lifecycle | Foreign keys: `taskId`, `volunteerId` |
| **certificates** | Stores generated certificate records and unique IDs | Foreign keys: `volunteerId`, `taskId`, `ngoId` |

### 2.1 User Model (`models/User.js`)
Handles credentials and password encryption using `bcryptjs`:
```javascript
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['volunteer', 'ngo', 'admin'], default: 'volunteer' },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook: Hashes password before saving to MongoDB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper method: Compares user entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```
> **Viva Tip:** "We never store plain-text passwords. We use `bcryptjs` with a salt round of 10. The `pre('save')` hook runs automatically before any user document is written to MongoDB. The `comparePassword` method allows secure verification during login."

### 2.2 Task Model (`models/Task.js`)
Strictly enforces the 6 required categories and status tracking:
```javascript
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Education',
      'Food distribution',
      'Environment',
      'Elder support',
      'Disaster support',
      'Community service'
    ]
  },
  requiredSkills: { type: [String], default: [] },
  location: { type: String, required: true },
  city: { type: String, required: true },
  dateTime: { type: Date, required: true },
  hours: { type: Number, required: true, default: 3 },
  volunteersRequired: { type: Number, required: true, min: 1 },
  volunteersAssigned: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true }
});
```

### 2.3 Application Model (`models/Application.js`)
Tracks volunteer assignment lifecycle with a compound unique index to prevent duplicate applications:
```javascript
const applicationSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer', required: true },
  status: {
    type: String,
    enum: ['Applied', 'Assigned', 'Completed', 'Rejected'],
    default: 'Applied'
  },
  notes: { type: String, default: '' },
  appliedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Prevents duplicate applications by the same volunteer for the same task
applicationSchema.index({ taskId: 1, volunteerId: 1 }, { unique: true });
```

---

## 3. Authentication & Security (JWT)

### 3.1 How Login & Token Verification Work
1. User submits email and password to `POST /api/auth/login`.
2. Backend verifies credentials using `user.comparePassword()`.
3. If valid, the server signs a JSON Web Token using `jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' })`.
4. Client receives the token and stores it in `localStorage.setItem('token', token)`.
5. On every subsequent request, the frontend fetch wrapper (`public/js/api.js`) attaches the header: `Authorization: Bearer <token>`.

### 3.2 Protecting Routes (`middleware/authMiddleware.js`)
```javascript
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      req.user = { userId: user._id, email: user.email, role: user.role };

      if (user.role === 'volunteer') {
        const vol = await Volunteer.findOne({ userId: user._id });
        if (vol) req.user.volunteerId = vol._id;
      } else if (user.role === 'ngo') {
        const ngo = await NGO.findOne({ userId: user._id });
        if (ngo) req.user.ngoId = ngo._id;
      }
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }
};
```

---

## 4. The 6 Advanced Features (How the Code Works)

### Feature 1: Skill-Based Volunteer Matching
- **Endpoint:** `GET /api/tasks/matching/skills` (in `routes/taskRoutes.js`)
- **How the Algorithm Works:**
  1. Finds the volunteer's registered skills array (e.g. `['Teaching', 'English', 'First Aid']`).
  2. Fetches all active community tasks from MongoDB.
  3. For each task, counts how many required skills match the volunteer's skills (common skills intersection).
  4. Calculates percentage match: `(commonSkills / taskSkills.length) * 100`.
  5. Sorts tasks descending by match score, displaying a dynamic badge: `[100% SKILL MATCH]`.

```javascript
let commonSkills = 0;
taskSkills.forEach((skill) => {
  if (volunteerSkills.includes(skill)) commonSkills++;
});

let matchScore = 0;
if (taskSkills.length > 0) {
  matchScore = Math.round((commonSkills / taskSkills.length) * 100);
} else {
  matchScore = 50;
}
```

### Feature 2: Location-Based Matching
- **Endpoint:** `GET /api/tasks/matching/location`
- **How it Works:** Queries tasks matching the volunteer's city using a case-insensitive regular expression: `city: new RegExp(`^${volunteer.city}$`, 'i')`. Tasks in the volunteer's home metropolitan area are prioritized at the top.

### Feature 3: AI Task Recommendation Engine
- **Endpoint:** `GET /api/tasks/recommendations/ai`
- **How the Algorithm Works:** Uses a 4-factor multi-criteria scoring algorithm calculating a composite score out of 100 points:
  1. **Skill Match Weight (Up to 40 Points):** `(matchedSkills / totalSkills) * 40`
  2. **Location Proximity (Up to 30 Points):** 30 points if task is in the volunteer's city.
  3. **Historical Category Interest (Up to 20 Points):** 20 points if volunteer previously completed tasks in that category.
  4. **Urgent Need & Open Capacity (10 Points):** 10 points if the task has open volunteer spots.

### Feature 4: Volunteer Ranking & Leaderboard
- **Endpoint:** `GET /api/dashboard/rankings`
- **Scoring Math:**
  - Each completed task awards **10 base points**.
  - Each hour of verified service awards **2 points per hour**.
  - `rankingPoints = completedTasksCount * 10 + totalHours * 2`.
  - **Recognition Tiers:**
    - 0 to 39 Points: **Bronze Tier**
    - 40 to 79 Points: **Silver Tier**
    - 80+ Points: **Gold Champion**

### Feature 5: Automated PDF Certificate Generation (PDFKit)
- **Endpoint:** `GET /api/certificates/download/:id` (in `routes/certificateRoutes.js`)
- **How it Works:**
  1. Finds certificate in MongoDB and populates volunteer name, task details, hours, and NGO name.
  2. Initializes a landscape A4 PDF document: `new PDFDocument({ layout: 'landscape', size: 'A4' })`.
  3. Sets response headers: `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="Certificate-...pdf"`.
  4. Pipes the document stream directly to response: `doc.pipe(res)`.
  5. Draws vector borders, headers, student details, hours, issue date, and unique certificate ID.
  6. Calls `doc.end()` to finalize and stream the file.

### Feature 6: Impact Dashboard with Chart.js
- **File:** `public/impact.html` and `public/js/dashboard.js`
- Uses MongoDB aggregation pipelines (`Task.aggregate([ { $group: { _id: '$category', count: { $sum: 1 } } } ])`) to group tasks by category and city.
- Renders an interactive Chart.js doughnut chart and bar chart with distinct category colors.

---

## 5. Task CRUD & Application Lifecycle

| Operation | HTTP Method | Endpoint | Authorized Role |
| :--- | :--- | :--- | :--- |
| Create Task | `POST` | `/api/tasks` | NGO Only |
| Read All Tasks (Filters & Search) | `GET` | `/api/tasks` | Public |
| Read Single Task | `GET` | `/api/tasks/:id` | Public |
| Update Task | `PUT` | `/api/tasks/:id` | NGO Owner Only |
| Delete Task | `DELETE` | `/api/tasks/:id` | NGO Owner Only |
| Apply for Task | `POST` | `/api/applications/apply` | Volunteer Only |
| Update Application Status (Assign / Complete) | `PUT` | `/api/applications/:id/status` | NGO Owner Only |

---

## 6. 15 Viva Questions & Model Answers

### Q1: What is the primary architecture of your project?
**Answer:** "Sir/Ma'am, it follows a 3-tier RESTful Client-Server architecture. The presentation layer consists of responsive HTML5, CSS3, and JavaScript calling REST API endpoints via asynchronous Fetch. The application layer is built on Node.js with Express.js handling routing and middleware. The database layer uses MongoDB with Mongoose for schema modeling."

### Q2: Why did you use MongoDB instead of a relational database like MySQL?
**Answer:** "MongoDB is a document-oriented NoSQL database that stores data in JSON-like BSON documents. Social service tasks have dynamic, semi-structured attributes such as arrays of required skills and variable location requirements. MongoDB handles arrays naturally without requiring complex many-to-many junction tables."

### Q3: How is authentication handled securely?
**Answer:** "We use JSON Web Tokens (JWT) and Bcrypt. Passwords are hashed using salted hashing before saving to MongoDB. When a user logs in, the server generates a signed JWT containing their user ID and role, which is stored in localStorage and sent in the Authorization header of subsequent requests."

### Q4: How do you prevent unauthorized users from creating tasks?
**Answer:** "In `middleware/authMiddleware.js`, we have the `requireNGO` middleware. When a request hits `POST /api/tasks`, Express first verifies the JWT token. If `req.user.role !== 'ngo'`, the request is immediately rejected with HTTP 403 Forbidden."

### Q5: What are the 6 mandatory task categories in your platform?
**Answer:** "The 6 categories are Education, Food distribution, Environment, Elder support, Disaster support, and Community service. These are strictly enforced using Mongoose schema validation in `models/Task.js`."

### Q6: How does the skill-based matching algorithm work?
**Answer:** "In `routes/taskRoutes.js`, the `/matching/skills` route compares the volunteer's registered skills array with the task's required skills array. It computes the intersection count of common skills and calculates a percentage match score: `(commonSkills / taskSkills.length) * 100`."

### Q7: How does your AI task recommendation engine score opportunities?
**Answer:** "In `GET /api/tasks/recommendations/ai`, we implement a multi-criteria heuristic scoring algorithm out of 100 points: up to 40 points for skill overlap, 30 points for city proximity, 20 points for historical interest in that category, and 10 points for available capacity."

### Q8: How does the certificate generation feature work?
**Answer:** "When an NGO marks a volunteer's assignment as 'Completed', a Certificate record with a unique ID is created. When the volunteer clicks 'Download PDF', our Express endpoint uses `pdfkit` to dynamically draw a vector Certificate of Appreciation in memory and streams it directly to the browser with `Content-Type: application/pdf`."

### Q9: How is the volunteer ranking leaderboard computed?
**Answer:** "Volunteers earn 10 points per completed task plus 2 points for every verified hour of service. The `/api/dashboard/rankings` endpoint queries volunteers sorted descending by `rankingPoints` and classifies them into Bronze, Silver, and Gold tiers."

### Q10: How do you prevent duplicate applications by the same volunteer?
**Answer:** "In `models/Application.js`, we defined a compound unique index: `applicationSchema.index({ taskId: 1, volunteerId: 1 }, { unique: true })`. If a volunteer attempts to apply twice, MongoDB enforces uniqueness and rejects the duplicate record."

### Q11: How is data visualized on the Impact Dashboard?
**Answer:** "We use `Chart.js` on the frontend. The backend runs a MongoDB aggregation pipeline using `$group` to aggregate task counts by category and city. The frontend feeds this aggregated data into a Chart.js doughnut chart and bar chart."

### Q12: What happens when an NGO marks an assignment as 'Completed'?
**Answer:** "Three actions occur automatically: 1) The volunteer's `completedTasksCount` and `totalHours` are incremented, 2) Their `rankingPoints` are updated, and 3) An official `Certificate` document with a unique ID is created in MongoDB."

### Q13: Why did you not use a frontend framework like React or Angular?
**Answer:** "Using pure HTML5, CSS3, and vanilla JavaScript demonstrates core proficiency in asynchronous DOM manipulation, fetch requests, and state synchronization without the overhead of build tools or external compilation dependencies."

### Q14: How are passwords compared during login if they are hashed?
**Answer:** "Bcrypt uses a one-way mathematical hashing algorithm. We cannot decrypt a hash. Instead, `bcrypt.compare()` takes the plain-text password entered at login, applies the same salt, hashes it, and checks if the resulting hash matches the hash stored in MongoDB."

### Q15: What npm packages are used and why?
**Answer:** "`express` for HTTP routing, `mongoose` for MongoDB modeling, `bcryptjs` for password hashing, `jsonwebtoken` for token authorization, `dotenv` for environment variables, `cors` for cross-origin requests, and `pdfkit` for server-side PDF generation."

---

## 6. Pre-Configured Test Accounts (65 Total Users)

All accounts share the password: `password123`

### 6.1 Tamil Nadu Volunteers
- **Karthik Raman (Chennai - Gold Tier, Rank 1):** `karthik.raman@gmail.com`
- **Senthil Kumar (Coimbatore - Gold Tier, Rank 3):** `senthil.kumar@gmail.com`
- **Aravind Swaminathan (Tiruchirappalli - Gold Tier, Rank 4):** `aravind.swaminathan@gmail.com`
- **Murugan Selvam (Madurai - Silver Tier):** `murugan.selvam@gmail.com`
- **Priya Sundaram (Chennai - Silver Tier):** `priya.sundaram@gmail.com`
- **Deepa Natarajan (Coimbatore - Silver Tier):** `deepa.natarajan@gmail.com`
- **Muthu Krishnan (Tirunelveli - Silver Tier):** `muthu.krishnan@gmail.com`
- **Dinesh Chandran (Salem - Bronze Tier):** `dinesh.chandran@gmail.com`
- **Vigneshwar Raj (Vellore - Bronze Tier):** `vigneshwar.raj@gmail.com`

### 6.2 Pan-India Volunteers
- **Rahul Sharma (Bengaluru - Gold Tier, Rank 2):** `rahul.volunteer@gmail.com`
- **Meera Joshi (Pune - Gold Tier, Rank 5):** `meera.joshi@gmail.com`
- **Vikram Singh (Delhi NCR - Gold Tier, Rank 6):** `vikram.singh@gmail.com`
- **Ananya Sen (Kolkata - Silver Tier):** `ananya.sen@gmail.com`
- **Amit Deshmukh (Mumbai - Silver Tier):** `amit.deshmukh@gmail.com`
- **Sneha Rao (Bengaluru - Silver Tier):** `sneha.rao@gmail.com`
- **Priya Patel (Ahmedabad - Silver Tier):** `priya.patel@gmail.com`
- **Sneha Reddy (Hyderabad - Silver Tier):** `sneha.reddy@gmail.com`
- **Abhishek Kumar (Patna - Silver Tier):** `abhishek.kumar@gmail.com`

### 6.3 Verified NGOs
- **Chennai:** `chennaiseva@ngo.org` (Kavalar Youth Welfare Foundation)
- **Coimbatore:** `kovaigreen@ngo.org` (Kovai Green Earth Trust)
- **Madurai:** `pandian@ngo.org` (Pandian Social Service Sangam)
- **Tiruchirappalli:** `kaveritrust@ngo.org` (Kaveri Pasumai Samiti)
- **Salem:** `salemcare@ngo.org` (Shevaroys Hills Environment Mission)
- **Delhi NCR:** `annaseva@ngo.org` (Rashtra Seva Trust)
- **Mumbai:** `sahyadri@ngo.org` (Sahyadri Nisarga Mitra)
- **Bengaluru:** `vidyaseva@ngo.org` (Vidya Seva Foundation)
- **Kolkata:** `bangla@ngo.org` (Bangla Shanti Mission)
- **Hyderabad:** `sneha@ngo.org` (Sneha Karunalaya Trust)

### 6.4 System Administrator
- **Admin Account:** `admin@communityhelphub.in`

---

## 7. Input Validations, Security & Quality Audit Checklist

The platform has been audited and validated against 25 automated end-to-end test cases (`npm run audit`):

### 7.1 Input Validations Implemented
1. **Email Format Validation:**
   - Evaluated using regular expression: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
   - Normalization: Automatically converts emails to lowercase and trims whitespace.
2. **Phone Number Validation:**
   - Validates 10-digit Indian mobile numbers (`/^[6-9]\d{9}$/`).
   - Automatically sanitizes formatting characters (spaces, hyphens, parentheses, and leading `+91`).
3. **Password Security:**
   - Enforces a minimum length of 6 characters.
   - Hashed using `bcryptjs` with 10 salt rounds before storage in MongoDB.
4. **Mandatory Fields & Non-Empty Strings:**
   - Prevents blank whitespace strings across names, addresses, titles, and descriptions.
5. **Duplicate Prevention:**
   - Unique email index on `users`.
   - Unique compound index on `applications` (`{ taskId: 1, volunteerId: 1 }`).
   - Unique registration number check for NGOs.
6. **Task Integrity:**
   - Enforces the strict 6 mandatory task categories: Education, Food distribution, Environment, Elder support, Disaster support, Community service.
   - Enforces positive volunteer requirements (`min: 1`) and estimated hours (`min: 1`).
7. **Role-Based Security:**
   - Restricted endpoints protected by JWT and role middleware (`requireVolunteer`, `requireNGO`, `requireAdmin`).
   - Resource ownership verification for task edits, status updates, and deletions.

---

## 8. System Administrator Access & Governance Architecture

### 8.1 Why "Access Denied" previously occurred:
An administrator (`role: 'admin'`) is a platform superuser, not a regular volunteer or single NGO organization. When the admin account logged in, the application previously redirected to `/volunteer-dashboard.html`, which is protected by the `requireVolunteer` middleware. Because the admin has `role: 'admin'` and no volunteer profile, the backend correctly enforced security and returned `403 Forbidden: Access denied: Volunteers only`.

### 8.2 Architectural Solution & Governance Features:
1. **Dedicated Superuser Portal:** Created [`public/admin-dashboard.html`](file:///C:/Users/DELL/Desktop/community-help-hub/public/admin-dashboard.html).
2. **Dedicated Admin REST API:** Created [`routes/adminRoutes.js`](file:///C:/Users/DELL/Desktop/community-help-hub/routes/adminRoutes.js) protected by `protect` and `requireAdmin`.
3. **Automatic Role-Based Redirection:** On successful login, users with `role: 'admin'` are routed to `/admin-dashboard.html`.
4. **Administrative Governance Capabilities:**
   - **Platform Overview:** Real-time metrics on users, volunteers, NGOs, tasks, hours, system uptime, and MongoDB connectivity.
   - **User Accounts Directory:** Live search, inspect roles, and delete user accounts with cascading clean-up.
   - **Partner NGOs Oversight:** Verify registration numbers, contact details, and locations.
   - **Community Tasks Control:** Superuser moderation to update status or delete any published task across India.



