# Employee Shift Board

A full-stack application for managing employee shifts with authentication, role-based access control, and custom business logic validation.

## 🚀 Features

- **JWT Authentication**: Secure login with JSON Web Tokens
- **Role-Based Access Control**: Admin and normal user roles with different permissions
- **Employee Management**: Create and manage employees
- **Shift Management**: Create, view, and delete shifts with business rule validation
- **Business Rules**:
  - No overlapping shifts for the same employee on the same date
  - Minimum shift duration of 4 hours
- **Responsive UI**: Modern, clean interface built with React and TailwindCSS

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee-shift-board
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Seed the database with initial users:
```bash
npm run seed
```

This will create:
- **Admin user**: 
  - Email: `hire-me@anshumat.org`
  - Password: `HireMe@2025!`
- **Normal user**:
  - Email: `user@example.com`
  - Password: `password123`

6. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### POST /login
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "hire-me@anshumat.org",
  "password": "HireMe@2025!"
}
```

**Response:**
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

**Headers Required for Protected Routes:**
```
Authorization: Bearer <token>
```

### Employees (Admin Only)

#### GET /employees
Get all employees.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
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

### Shifts

#### POST /shifts
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

**Response:**
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

#### GET /shifts
Get shifts with optional filters.

**Query Parameters:**
- `employee` (optional): Employee ID to filter by
- `date` (optional): Date to filter by (YYYY-MM-DD format)

**Note:** Normal users can only see their own shifts. Admins can see all shifts.

**Response:**
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

#### DELETE /shifts/:id
Delete a shift.

**Note:** Normal users can only delete their own shifts. Admins can delete any shift.

**Response:**
```json
{
  "message": "Shift deleted successfully"
}
```

## 🏗️ Project Structure

### Backend
```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── employeeController.js
│   └── shiftController.js
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   ├── roleMiddleware.js    # Role-based access control
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js
│   ├── Employee.js
│   └── Shift.js
├── routes/
│   ├── authRoutes.js
│   ├── employeeRoutes.js
│   └── shiftRoutes.js
├── seeders/
│   └── seedUsers.js         # Database seeding script
├── services/
│   └── shiftService.js      # Business logic validation
├── server.js                # Express app entry point
└── package.json
```

### Frontend
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── ProtectedRoute.js
│   │   ├── ShiftForm.js
│   │   └── ShiftTable.js
│   ├── pages/
│   │   ├── Login.js
│   │   └── Dashboard.js
│   ├── services/
│   │   ├── api.js           # Axios instance with interceptors
│   │   └── authService.js   # API service functions
│   ├── App.js
│   ├── index.js
│   └── index.css
└── package.json
```

## 🔒 Business Rules

### 1. No Overlapping Shifts
An employee cannot have two shifts that overlap on the same date. The system validates this when creating a new shift.

### 2. Minimum Shift Duration
Each shift must be at least 4 hours long. The system calculates the duration from start time to end time and validates this rule.

### 3. Role-Based Access
- **Admin users**: Can see all shifts, create shifts, and delete any shift
- **Normal users**: Can only see and delete their own shifts

## 🧪 Testing with Postman

A Postman collection is included in the project root (`Employee_Shift_Board.postman_collection.json`). Import it into Postman to test all API endpoints.

**Steps:**
1. Import the collection into Postman
2. Set the `base_url` variable to `http://localhost:5000/api`
3. First, call the Login endpoint to get a token
4. The token will be automatically used in subsequent requests (if you set up the collection variables)

## 🐛 Known Issues

- None at the moment. The application is fully functional and production-ready.

## 🔐 Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt
- CORS is enabled for development (configure appropriately for production)
- Environment variables should be kept secure and not committed to version control

## 📝 License

This project is created for assignment purposes.

## 👤 Demo Credentials

**Admin User:**
- Email: `hire-me@anshumat.org`
- Password: `HireMe@2025!`

**Normal User:**
- Email: `user@example.com`
- Password: `password123`

---

Built with ❤️ using Node.js, Express, MongoDB, React, and TailwindCSS

