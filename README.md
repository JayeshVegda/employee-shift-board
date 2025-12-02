# 🏢 Employee Shift Board

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-latest-green.svg)

**A comprehensive full-stack application for managing employee shifts, tracking working hours, handling issues, and providing detailed analytics with role-based access control.**

[Features](#-features) • [Installation](#️-installation--setup) • [API Documentation](#-api-documentation) • [Demo](#-demo-credentials)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#️-installation--setup)
- [Project Structure](#️-project-structure)
- [API Documentation](#-api-documentation)
- [Business Rules](#-business-rules)
- [Usage Guide](#-usage-guide)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [Demo Credentials](#-demo-credentials)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

Employee Shift Board is a modern, full-stack web application designed to streamline workforce management. It provides administrators with powerful tools to manage employees, schedule shifts, track working hours, handle employee issues, and analyze workforce data through comprehensive analytics dashboards. Employees can view their schedules, track their working hours, and submit issues for resolution.

### Key Highlights

- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control
- 📊 **Advanced Analytics** - Real-time dashboards with charts and insights
- 🎫 **Issue Management** - Complete ticketing system for employee concerns
- ⏰ **Shift Management** - Intelligent shift scheduling with conflict detection
- 👥 **Employee Management** - Full CRUD operations for employee data
- 📱 **Responsive Design** - Modern UI built with React and TailwindCSS
- 🚀 **Production Ready** - Optimized for deployment on Vercel

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control (RBAC)** - Admin and Employee roles with different permissions
- **Protected Routes** - Frontend and backend route protection
- **Session Management** - Automatic token refresh and expiration handling

### 👥 Employee Management (Admin Only)
- Create, read, update, and delete employees
- Employee code assignment
- Department management
- Employee profile management

### ⏰ Shift Management
- **Create Shifts** - Schedule shifts with date, start time, and end time
- **View Shifts** - Filter by employee, date, or department
- **Update Shifts** - Modify existing shift details (Admin only)
- **Delete Shifts** - Remove shifts with proper authorization
- **Working Hours Summary** - Track total hours worked per employee
- **Business Rule Validation**:
  - No overlapping shifts for the same employee on the same date
  - Minimum shift duration of 4 hours
  - Automatic conflict detection

### 🎫 Issue Management System
- **Create Issues** - Employees can submit issues with title, description, priority, and status
- **Track Issues** - Real-time issue tracking with status updates
- **Priority Levels** - Low, Medium, High, and Urgent priorities
- **Status Workflow** - Open → In Progress → Resolved → Closed
- **Admin Response** - Admins can respond to issues and add notes
- **Unread Notifications** - Real-time unread issue count for admins
- **Filtering & Search** - Filter by status, priority, and search by title/description
- **Pagination** - Efficient handling of large issue lists

### 📊 Analytics & Reporting (Admin Only)
- **Dashboard Overview** - Key performance indicators (KPIs)
  - Total Employees
  - Open Issues Count
  - Total Shifts
  - Total Hours Worked
  - Average Hours per Employee
- **Visual Analytics**:
  - Daily working hours trends (Line Chart)
  - Weekly working hours trends (Bar Chart)
  - Department-wise distribution (Pie Chart)
  - Employee-wise hours breakdown
- **Advanced Filtering**:
  - Date range filtering
  - Department filtering
  - Employee filtering
  - Sortable data tables
- **Real-time Updates** - Auto-refresh for unread issues

### 🎨 User Interface
- **Modern Design** - Clean, intuitive interface built with TailwindCSS
- **Responsive Layout** - Works seamlessly on desktop, tablet, and mobile
- **Component-Based Architecture** - Reusable React components
- **Form Validation** - Client-side and server-side validation
- **Error Handling** - User-friendly error messages
- **Loading States** - Smooth loading indicators
- **Modal Dialogs** - Interactive modals for forms and confirmations

### 🔧 Developer Features
- **RESTful API** - Well-structured API endpoints
- **Error Handling** - Comprehensive error handling middleware
- **Database Seeding** - Scripts for populating initial data
- **Postman Collection** - Ready-to-use API testing collection
- **Environment Configuration** - Flexible environment variable support
- **Serverless Ready** - Optimized for Vercel deployment

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **CORS**: cors middleware
- **Serverless**: serverless-http (for Vercel)

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.20.1
- **HTTP Client**: Axios 1.6.2
- **Styling**: TailwindCSS 3.3.6
- **Charts**: Recharts 2.10.3
- **Tables**: TanStack React Table 8.10.7
- **Build Tool**: Create React App

### Development Tools
- **Package Manager**: npm
- **Development Server**: nodemon (backend), react-scripts (frontend)
- **API Testing**: Postman Collection included

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/JayeshVegda/employee-shift-board.git
cd employee-shift-board
```

### 2. Backend Setup

#### Step 1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

#### Step 4: Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/employee-shift-board

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee-shift-board?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-a-long-random-string

# Optional: Issue Management Configuration
ISSUE_TITLE_MAX_LENGTH=200
ISSUE_DESCRIPTION_MAX_LENGTH=2000
ISSUE_ADMIN_NOTES_MAX_LENGTH=1000
ISSUE_ADMIN_RESPONSE_MAX_LENGTH=1000
ISSUE_PAGE_SIZE=25
ISSUE_MAX_PAGE_SIZE=100
ISSUE_POLLING_INTERVAL=30000
```

**⚠️ Important**: 
- Replace `your-super-secret-jwt-key-change-this-in-production-use-a-long-random-string` with a strong, random secret key
- Never commit the `.env` file to version control
- Use different secrets for development and production

#### Step 5: Seed the Database

Seed the database with initial users:

```bash
npm run seed
```

This creates:
- **Admin User**:
  - Email: `hire-me@anshumat.org`
  - Password: `HireMe@2025!`
- **Normal User**:
  - Email: `user@example.com`
  - Password: `password123`

**Optional**: Seed sample shifts:

```bash
npm run seed-shifts
```

Or seed both users and shifts:

```bash
npm run seed-all
```

#### Step 6: Start the Backend Server

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The backend server will run on `http://localhost:5000`

**Verify Installation**:
- Visit `http://localhost:5000/api/health` - Should return `{"status":"OK"}`
- Visit `http://localhost:5000/api` - Should return API information

### 3. Frontend Setup

#### Step 1: Navigate to Frontend Directory

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Environment Configuration

Create a `.env` file in the `frontend` directory:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

#### Step 4: Configure Environment Variables

Edit the `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

**For Production**: Update this to your production API URL.

#### Step 5: Start the Frontend Development Server

```bash
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

### 4. Verify Installation

1. **Backend**: Check `http://localhost:5000/api/health`
2. **Frontend**: Check `http://localhost:3000`
3. **Login**: Use the admin credentials to log in

---

## 🏗️ Project Structure

```
employee-shift-board/
│
├── backend/                          # Backend API Server
│   ├── config/
│   │   └── database.js              # MongoDB connection configuration
│   ├── constants/
│   │   └── issueConstants.js        # Issue management constants
│   ├── controllers/                 # Request handlers
│   │   ├── analyticsController.js   # Analytics and dashboard logic
│   │   ├── authController.js        # Authentication logic
│   │   ├── employeeController.js    # Employee CRUD operations
│   │   ├── issueController.js       # Issue management logic
│   │   └── shiftController.js       # Shift management logic
│   ├── middleware/                  # Express middleware
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── errorHandler.js          # Global error handler
│   │   └── roleMiddleware.js        # Role-based access control
│   ├── models/                      # Mongoose models
│   │   ├── Employee.js              # Employee schema
│   │   ├── Issue.js                 # Issue schema
│   │   ├── Shift.js                 # Shift schema
│   │   └── User.js                  # User schema
│   ├── routes/                      # API routes
│   │   ├── analyticsRoutes.js       # Analytics endpoints
│   │   ├── authRoutes.js            # Authentication endpoints
│   │   ├── employeeRoutes.js        # Employee endpoints
│   │   ├── issueRoutes.js           # Issue endpoints
│   │   └── shiftRoutes.js           # Shift endpoints
│   ├── scripts/                     # Utility scripts
│   │   ├── checkUsers.js            # User verification script
│   │   ├── fixAdminPassword.js      # Password reset script
│   │   └── fixUserPasswords.js      # Bulk password reset
│   ├── seeders/                     # Database seeders
│   │   ├── seedShifts.js            # Sample shifts seeder
│   │   └── seedUsers.js             # Initial users seeder
│   ├── services/                    # Business logic services
│   │   └── shiftService.js          # Shift validation logic
│   ├── server.js                    # Express app entry point
│   ├── vercel.json                  # Vercel deployment config
│   └── package.json                 # Backend dependencies
│
├── frontend/                         # React Frontend Application
│   ├── public/
│   │   └── index.html               # HTML template
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── AdminLayout.js       # Admin layout wrapper
│   │   │   ├── AdvancedShiftForm.js # Advanced shift creation form
│   │   │   ├── Button.js            # Button component
│   │   │   ├── EditShiftModal.js    # Shift editing modal
│   │   │   ├── EmployeeForm.js      # Employee form component
│   │   │   ├── EmployeeTable.js    # Employee table component
│   │   │   ├── Input.js             # Input component
│   │   │   ├── IssueCard.js         # Issue card component
│   │   │   ├── IssueEditModal.js    # Issue editing modal
│   │   │   ├── IssueForm.js         # Issue creation form
│   │   │   ├── IssueTable.js        # Issue table component
│   │   │   ├── Modal.js             # Modal component
│   │   │   ├── Pagination.js        # Pagination component
│   │   │   ├── ProtectedRoute.js   # Route protection
│   │   │   ├── ShiftForm.js         # Shift form component
│   │   │   ├── ShiftTable.js        # Shift table component
│   │   │   └── WorkingHoursSummary.js # Hours summary component
│   │   ├── pages/                   # Page components
│   │   │   ├── AdminDashboard.js    # Admin analytics dashboard
│   │   │   ├── AdminLogin.js        # Admin login page
│   │   │   ├── Dashboard.js         # Employee dashboard
│   │   │   ├── EmployeeLogin.js     # Employee login page
│   │   │   ├── EmployeeManagement.js # Employee CRUD page
│   │   │   ├── IssueDetail.js       # Issue detail page
│   │   │   ├── Issues.js            # Issues list page
│   │   │   ├── Login.js             # General login page
│   │   │   └── Settings.js          # Settings page
│   │   ├── services/                # API service layer
│   │   │   ├── api.js               # Axios instance with interceptors
│   │   │   └── authService.js       # API service functions
│   │   ├── utils/                   # Utility functions
│   │   │   └── issueHelpers.js      # Issue helper functions
│   │   ├── App.js                   # Main App component
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # Global styles
│   ├── tailwind.config.js           # TailwindCSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── vercel.json                  # Vercel deployment config
│   └── package.json                 # Frontend dependencies
│
├── Employee_Shift_Board.postman_collection.json  # Postman API collection
├── vercel.json                       # Root Vercel config
└── README.md                         # This file
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

All API endpoints require authentication except `/login` and `/health`.

### Authentication

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

### Endpoints

#### 🔐 Authentication

##### `POST /api/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "hire-me@anshumat.org",
  "password": "HireMe@2025!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "hire-me@anshumat.org",
    "role": "admin",
    "employeeId": "employee_id"
  }
}
```

**Error Responses:**
- `400`: Invalid request body
- `401`: Invalid credentials

---

#### 👥 Employees (Admin Only)

##### `GET /api/employees`

Get all employees.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "_id": "employee_id",
    "name": "John Doe",
    "employeeCode": "EMP001",
    "department": "Operations",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

##### `POST /api/employees`

Create a new employee.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "employeeCode": "EMP002",
  "department": "Sales"
}
```

**Response (201 Created):**
```json
{
  "_id": "employee_id",
  "name": "Jane Smith",
  "employeeCode": "EMP002",
  "department": "Sales",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

##### `PUT /api/employees/:id`

Update an employee.

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "department": "Marketing"
}
```

##### `DELETE /api/employees/:id`

Delete an employee.

**Response (200 OK):**
```json
{
  "message": "Employee deleted successfully"
}
```

---

#### ⏰ Shifts

##### `POST /api/shifts`

Create a new shift (Admin only).

**Request Body:**
```json
{
  "employeeId": "employee_id",
  "date": "2025-01-15",
  "startTime": "09:00",
  "endTime": "17:00"
}
```

**Response (201 Created):**
```json
{
  "_id": "shift_id",
  "employeeId": {
    "_id": "employee_id",
    "name": "John Doe",
    "employeeCode": "EMP001",
    "department": "Operations"
  },
  "date": "2025-01-15T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "17:00",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400`: Validation failed (overlapping shifts, duration < 4 hours, etc.)
- `401`: Unauthorized
- `403`: Forbidden (not admin)

##### `GET /api/shifts`

Get shifts with optional filters.

**Query Parameters:**
- `employee` (optional): Employee ID to filter by
- `date` (optional): Date to filter by (YYYY-MM-DD format)

**Note:** Normal users can only see their own shifts. Admins can see all shifts.

**Response (200 OK):**
```json
[
  {
    "_id": "shift_id",
    "employeeId": {
      "_id": "employee_id",
      "name": "John Doe",
      "employeeCode": "EMP001",
      "department": "Operations"
    },
    "date": "2025-01-15T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "17:00"
  }
]
```

##### `PUT /api/shifts/:id`

Update a shift (Admin only).

**Request Body:**
```json
{
  "date": "2025-01-16",
  "startTime": "10:00",
  "endTime": "18:00"
}
```

##### `GET /api/shifts/working-hours`

Get working hours summary for the authenticated user.

**Response (200 OK):**
```json
{
  "totalHours": 160.5,
  "totalShifts": 20,
  "averageHoursPerShift": 8.03
}
```

##### `DELETE /api/shifts/:id`

Delete a shift.

**Note:** Normal users can only delete their own shifts. Admins can delete any shift.

**Response (200 OK):**
```json
{
  "message": "Shift deleted successfully"
}
```

---

#### 🎫 Issues

##### `POST /api/issues`

Create a new issue.

**Request Body:**
```json
{
  "title": "Network connectivity issue",
  "description": "Unable to connect to the server",
  "priority": 2,
  "status": 0
}
```

**Priority Values:**
- `0`: Low
- `1`: Medium
- `2`: High
- `3`: Urgent

**Status Values:**
- `0`: Open
- `1`: In Progress
- `2`: Resolved
- `3`: Closed

**Response (201 Created):**
```json
{
  "_id": "issue_id",
  "title": "Network connectivity issue",
  "description": "Unable to connect to the server",
  "priority": 2,
  "status": 0,
  "createdBy": "user_id",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

##### `GET /api/issues`

Get all issues with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 25, max: 100)
- `status` (optional): Filter by status (0-3)
- `priority` (optional): Filter by priority (0-3)
- `search` (optional): Search in title and description
- `showSolved` (optional): Include resolved/closed issues (true/false)

**Response (200 OK):**
```json
{
  "issues": [
    {
      "_id": "issue_id",
      "title": "Network connectivity issue",
      "description": "Unable to connect to the server",
      "priority": 2,
      "status": 0,
      "createdBy": {
        "_id": "user_id",
        "email": "user@example.com"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "totalCount": 50,
    "totalPages": 2,
    "currentPage": 1,
    "pageSize": 25,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

##### `GET /api/issues/:id`

Get a specific issue by ID.

##### `PUT /api/issues/:id`

Update an issue (Admin only).

**Request Body:**
```json
{
  "status": 1,
  "adminNotes": "Investigating the issue",
  "adminResponse": "Working on a fix"
}
```

##### `PATCH /api/issues/:id/read`

Mark an issue as read (Admin only).

##### `GET /api/issues/unread-count`

Get count of unread issues (Admin only).

**Response (200 OK):**
```json
{
  "count": 5
}
```

##### `DELETE /api/issues/:id`

Delete an issue (Admin only).

---

#### 📊 Analytics (Admin Only)

##### `GET /api/analytics/dashboard`

Get comprehensive dashboard analytics.

**Query Parameters:**
- `startDate` (optional): Start date for filtering (YYYY-MM-DD)
- `endDate` (optional): End date for filtering (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "summary": {
    "totalEmployees": 25,
    "totalShifts": 150,
    "totalHours": 1200.5,
    "avgHoursPerEmployee": 48.02,
    "avgHoursPerShift": 8.0
  },
  "daily": [
    {
      "date": "2025-01-01",
      "hours": 45.5
    }
  ],
  "weekly": [
    {
      "week": "2025-W01",
      "hours": 320.5
    }
  ],
  "byDepartment": [
    {
      "department": "Operations",
      "hours": 500.5,
      "count": 60
    }
  ],
  "byEmployee": [
    {
      "employee": {
        "_id": "employee_id",
        "name": "John Doe",
        "employeeCode": "EMP001"
      },
      "hours": 160.5,
      "count": 20
    }
  ],
  "issues": {
    "open": 5,
    "inProgress": 3,
    "resolved": 10,
    "closed": 2
  }
}
```

---

#### 🏥 Health Check

##### `GET /api/health`

Check API server health.

**Response (200 OK):**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

##### `GET /api/health/db`

Check database connection health.

**Response (200 OK):**
```json
{
  "status": "CONNECTED",
  "connection": {
    "state": 1,
    "stateText": "connected",
    "host": "localhost",
    "name": "employee-shift-board",
    "port": 27017
  },
  "test": {
    "ping": "OK",
    "collections": 4
  }
}
```

---

## 🔒 Business Rules

### 1. Shift Validation Rules

#### No Overlapping Shifts
- An employee cannot have two shifts that overlap on the same date
- The system automatically validates this when creating or updating a shift
- Error message: "Shift overlaps with an existing shift"

#### Minimum Shift Duration
- Each shift must be at least 4 hours long
- Duration is calculated from start time to end time
- Error message: "Shift duration must be at least 4 hours"

### 2. Role-Based Access Control

#### Admin Users
- ✅ Can create, read, update, and delete employees
- ✅ Can create, read, update, and delete any shift
- ✅ Can view all shifts from all employees
- ✅ Can access analytics dashboard
- ✅ Can manage all issues (create, update, delete, respond)
- ✅ Can view unread issue count

#### Normal Users (Employees)
- ❌ Cannot manage employees
- ❌ Cannot create shifts (admin only)
- ✅ Can view only their own shifts
- ✅ Can delete only their own shifts
- ✅ Can create issues
- ✅ Can view their own issues
- ❌ Cannot access analytics dashboard
- ❌ Cannot manage other users' issues

### 3. Issue Management Rules

#### Issue Status Workflow
```
Open → In Progress → Resolved → Closed
```

#### Priority Levels
- **Low** (0): Non-urgent issues
- **Medium** (1): Normal priority
- **High** (2): Important issues
- **Urgent** (3): Critical issues requiring immediate attention

#### Issue Permissions
- Employees can create issues and view their own issues
- Only admins can update issue status, add admin notes, and respond
- Only admins can delete issues
- Unread count is only visible to admins

---

## 📖 Usage Guide

### For Administrators

1. **Login**: Use admin credentials to access the admin dashboard
2. **Manage Employees**: Navigate to "Employee Management" to add, edit, or remove employees
3. **Create Shifts**: Use the shift form to schedule shifts for employees
4. **View Analytics**: Check the dashboard for workforce insights and trends
5. **Handle Issues**: Review and respond to employee issues from the Issues page
6. **Monitor Activity**: Track working hours, shift distribution, and department statistics

### For Employees

1. **Login**: Use your employee credentials
2. **View Shifts**: See your scheduled shifts on the dashboard
3. **Track Hours**: Check your working hours summary
4. **Submit Issues**: Create issues for any concerns or problems
5. **View Issues**: Track the status of your submitted issues

---

## 🧪 Testing

### Using Postman

A Postman collection is included in the project root (`Employee_Shift_Board.postman_collection.json`).

**Steps to use:**

1. **Import Collection**:
   - Open Postman
   - Click "Import"
   - Select `Employee_Shift_Board.postman_collection.json`

2. **Set Environment Variables**:
   - Create a new environment in Postman
   - Add variable `base_url` with value `http://localhost:5000/api`

3. **Test Authentication**:
   - Run the "Login" request
   - The token will be automatically saved to the environment

4. **Test Other Endpoints**:
   - All other requests will automatically use the saved token
   - Test each endpoint individually

### Manual Testing

1. **Backend API**:
   ```bash
   # Test health endpoint
   curl http://localhost:5000/api/health
   
   # Test login
   curl -X POST http://localhost:5000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"hire-me@anshumat.org","password":"HireMe@2025!"}'
   ```

2. **Frontend**:
   - Start the development server
   - Navigate through all pages
   - Test all CRUD operations
   - Verify authentication and authorization

---

## 🚀 Deployment

### Deploying to Vercel

The project is configured for easy deployment on Vercel.

#### Backend Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   vercel
   ```

3. **Set Environment Variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from your `.env` file:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`
     - `PORT` (optional, Vercel handles this)

#### Frontend Deployment

1. **Deploy Frontend**:
   ```bash
   cd frontend
   vercel
   ```

2. **Set Environment Variables**:
   - Add `REACT_APP_API_URL` with your backend API URL

#### Root Deployment (Monorepo)

Alternatively, deploy the entire project:

```bash
vercel
```

Configure `vercel.json` for proper routing.

### Environment Variables for Production

**Backend:**
```env
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
```

**Frontend:**
```env
REACT_APP_API_URL=<your-production-api-url>
```

### Database Setup

For production, use MongoDB Atlas:

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist your IP address (or use `0.0.0.0/0` for Vercel)
3. Get your connection string
4. Update `MONGODB_URI` in Vercel environment variables

---

## 🔐 Security

### Security Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **Role-Based Access Control** - Middleware-based authorization
- ✅ **Input Validation** - Joi schema validation
- ✅ **CORS Configuration** - Configurable cross-origin resource sharing
- ✅ **Environment Variables** - Sensitive data stored securely
- ✅ **Error Handling** - No sensitive information leaked in errors

### Security Best Practices

1. **JWT Secret**: Use a strong, random secret key (minimum 32 characters)
2. **Password Policy**: Enforce strong passwords in production
3. **HTTPS**: Always use HTTPS in production
4. **CORS**: Configure CORS to allow only trusted domains
5. **Rate Limiting**: Consider adding rate limiting for production
6. **Input Sanitization**: All inputs are validated and sanitized
7. **SQL Injection**: Not applicable (MongoDB), but NoSQL injection is prevented
8. **XSS Protection**: React automatically escapes user input

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS for production
- [ ] Set up MongoDB authentication
- [ ] Enable MongoDB IP whitelisting
- [ ] Regular security updates
- [ ] Monitor for suspicious activity

---

## 👤 Demo Credentials

### Admin User
- **Email**: `hire-me@anshumat.org`
- **Password**: `HireMe@2025!`
- **Role**: Admin
- **Access**: Full access to all features

### Normal User
- **Email**: `user@example.com`
- **Password**: `password123`
- **Role**: Employee
- **Access**: View own shifts, create issues

**⚠️ Warning**: These are demo credentials. Change them in production!

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly
- Ensure all tests pass

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Jayesh Vegda**

- GitHub: [@JayeshVegda](https://github.com/JayeshVegda)
- Project Repository: [employee-shift-board](https://github.com/JayeshVegda/employee-shift-board)

---

## 🙏 Acknowledgments

- Built with ❤️ using Node.js, Express, MongoDB, React, and TailwindCSS
- Thanks to all the open-source contributors whose packages made this project possible
- Special thanks to the React and Express.js communities

---

## 📞 Support

For support, please open an issue in the [GitHub repository](https://github.com/JayeshVegda/employee-shift-board/issues).

---

<div align="center">

**Made with ❤️ by Jayesh Vegda**

⭐ Star this repo if you find it helpful!

</div>
