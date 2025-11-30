require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const issueRoutes = require('./routes/issueRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// connect db first
connectDB();

// CORS setup - allow frontend origins
let allowedOrigins = ['http://localhost:3000'];
if (process.env.FRONTEND_URL) {
  allowedOrigins = process.env.FRONTEND_URL.split(',');
} else if (process.env.NODE_ENV === 'production') {
  // TODO: update this with actual domain when deploying
  allowedOrigins = ['https://your-frontend-domain.vercel.app'];
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api routes
app.use('/api/login', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/analytics', analyticsRoutes);

// basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// error handling goes last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// don't start server in vercel serverless mode
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

