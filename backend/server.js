// Initialize with error handling
try {
  require('dotenv').config();
} catch (error) {
  console.warn('dotenv config warning:', error.message);
}

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Routes - wrap in try-catch to catch import errors
let authRoutes, employeeRoutes, shiftRoutes, issueRoutes, analyticsRoutes;
try {
  authRoutes = require('./routes/authRoutes');
  employeeRoutes = require('./routes/employeeRoutes');
  shiftRoutes = require('./routes/shiftRoutes');
  issueRoutes = require('./routes/issueRoutes');
  analyticsRoutes = require('./routes/analyticsRoutes');
} catch (error) {
  console.error('Error loading routes:', error);
  throw error;
}

const app = express();

// Connect to database (for serverless, connection is cached)
let isConnected = false;
const connectWithRetry = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection error:', error);
      isConnected = false;
      throw error;
    }
  }
};

// Manual CORS middleware - ensures headers are always set
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// CORS middleware using cors package (backup)
const corsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database connection for serverless (non-blocking)
app.use(async (req, res, next) => {
  try {
    await connectWithRetry();
  } catch (error) {
    console.error('Database connection warning:', error.message);
    // Don't block the request - let routes handle DB errors
  }
  next();
});

// Routes
app.use('/api', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check (simple, no DB required)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  try {
    await connectWithRetry();
    res.json({ status: 'OK', message: 'Database connected' });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// 404 handler - ensure CORS headers are sent
app.use((req, res) => {
  // Set CORS headers manually for 404 responses
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// For Vercel serverless - wrap in try-catch to handle initialization errors
module.exports = app;

// For local development
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

