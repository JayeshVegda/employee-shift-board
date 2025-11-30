require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDBStatus } = require('./config/database');
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
  allowedOrigins = ['https://employee-shift-board-ashy.vercel.app'];
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// root route
app.get('/', (req, res) => {
  res.json({
    message: 'Employee Shift Board API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      login: '/api/login',
      employees: '/api/employees',
      shifts: '/api/shifts',
      issues: '/api/issues',
      analytics: '/api/analytics'
    }
  });
});

// enhanced health check
app.get('/api/health', async (req, res) => {
  const dbStatus = getDBStatus();
  const mongoose = require('mongoose');
  
  let dbStats = null;
  if (dbStatus.connected) {
    try {
      const db = mongoose.connection.db;
      const adminDb = db.admin();
      const serverStatus = await adminDb.serverStatus();
      
      dbStats = {
        database: dbStatus.name,
        host: dbStatus.host,
        collections: await db.listCollections().toArray().then(cols => cols.length),
        uptime: serverStatus.uptime || 0,
        version: serverStatus.version || 'unknown'
      };
    } catch (err) {
      dbStats = { error: 'Could not fetch DB stats' };
    }
  }

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      connected: dbStatus.connected,
      state: dbStatus.state,
      ...dbStats
    },
    server: {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    },
    endpoints: {
      health: '/api/health',
      login: '/api/login',
      employees: '/api/employees',
      shifts: '/api/shifts',
      issues: '/api/issues',
      analytics: '/api/analytics'
    }
  });
});

// api routes
app.use('/api/login', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/analytics', analyticsRoutes);

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

