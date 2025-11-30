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
  const dbStatus = getDBStatus();
  res.json({
    message: 'Employee Shift Board API',
    version: '1.0.0',
    status: dbStatus.connected ? 'online' : 'offline',
    mongodb: {
      connected: dbStatus.connected,
      state: dbStatus.state
    },
    endpoints: {
      health: '/api/health',
      login: '/api/login',
      employees: '/api/employees',
      shifts: '/api/shifts',
      issues: '/api/issues',
      analytics: '/api/analytics'
    },
    documentation: 'Visit /api/health for detailed system status'
  });
});

// enhanced health check
app.get('/api/health', async (req, res) => {
  const dbStatus = getDBStatus();
  const mongoose = require('mongoose');
  
  let dbStats = null;
  let collectionsInfo = [];
  
  if (dbStatus.connected) {
    try {
      const db = mongoose.connection.db;
      
      // get collections
      const collections = await db.listCollections().toArray();
      collectionsInfo = collections.map(col => ({
        name: col.name,
        type: col.type || 'collection'
      }));
      
      // get collection counts
      const collectionCounts = {};
      for (const col of collections) {
        try {
          collectionCounts[col.name] = await db.collection(col.name).countDocuments();
        } catch (err) {
          collectionCounts[col.name] = 'error';
        }
      }
      
      dbStats = {
        database: dbStatus.name,
        host: dbStatus.host,
        port: dbStatus.port,
        collections: collections.length,
        collectionsList: collectionsInfo,
        documentCounts: collectionCounts
      };
    } catch (err) {
      dbStats = { 
        error: 'Could not fetch DB stats',
        errorMessage: err.message 
      };
    }
  }

  res.json({
    status: dbStatus.connected ? 'OK' : 'ERROR',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: {
      connected: dbStatus.connected,
      state: dbStatus.state,
      readyState: dbStatus.readyState,
      host: dbStatus.host,
      database: dbStatus.name,
      ...dbStats
    },
    server: {
      uptime: Math.round(process.uptime()) + ' seconds',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
      },
      nodeVersion: process.version,
      platform: process.platform
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

