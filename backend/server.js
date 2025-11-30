// Initialize with error handling - don't crash on missing dotenv
try {
  require('dotenv').config();
} catch (error) {
  // dotenv is optional in production (Vercel uses env vars)
  console.warn('dotenv config warning:', error.message);
}

const express = require('express');
const cors = require('cors');

// Import routes and middleware with error handling
let connectDB, errorHandler, authRoutes, employeeRoutes, shiftRoutes, issueRoutes, analyticsRoutes;

try {
  connectDB = require('./config/database');
  errorHandler = require('./middleware/errorHandler');
  authRoutes = require('./routes/authRoutes');
  employeeRoutes = require('./routes/employeeRoutes');
  shiftRoutes = require('./routes/shiftRoutes');
  issueRoutes = require('./routes/issueRoutes');
  analyticsRoutes = require('./routes/analyticsRoutes');
} catch (error) {
  console.error('Error loading modules:', error);
  // Don't throw - let the app start and show error in health check
}

const app = express();

// Connect to database (for serverless, connection is cached)
let isConnected = false;
const connectWithRetry = async () => {
  if (!connectDB) {
    console.warn('Database module not loaded');
    return;
  }
  
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection error:', error.message);
      isConnected = false;
      // Don't throw - let routes handle it
    }
  }
};

// CORS - MUST be first middleware, before everything else
// Using cors() with default options handles preflight automatically
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure database connection for serverless (non-blocking, skip for OPTIONS)
app.use(async (req, res, next) => {
  // Skip database connection for OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  try {
    await connectWithRetry();
  } catch (error) {
    console.error('Database connection warning:', error.message);
    // Don't block the request - let routes handle DB errors
  }
  next();
});

// Root level OPTIONS handler (catch-all for any path)
app.options('*', cors());

// Root API endpoint - returns API information (no dependencies)
app.get('/api', (req, res) => {
  try {
    res.json({
      name: 'Employee Shift Board API',
      version: '1.0.0',
      status: 'running',
      modulesLoaded: {
        routes: !!(authRoutes && employeeRoutes && shiftRoutes),
        database: !!connectDB,
        errorHandler: !!errorHandler
      },
      endpoints: {
        auth: '/api/login',
        employees: '/api/employees',
        shifts: '/api/shifts',
        issues: '/api/issues',
        analytics: '/api/analytics',
        health: '/api/health'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate API info', message: error.message });
  }
});

// Routes - only mount if loaded successfully
if (authRoutes) app.use('/api', authRoutes);
if (employeeRoutes) app.use('/api/employees', employeeRoutes);
if (shiftRoutes) app.use('/api/shifts', shiftRoutes);
if (issueRoutes) app.use('/api/issues', issueRoutes);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);

// Catch requests to root-level paths (like /login instead of /api/login)
// This helps debug when frontend API_URL is missing /api
app.all(/^\/(login|employees|shifts|issues|analytics|health)/, (req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    message: `Use /api${req.path} instead of ${req.path}`,
    correctPath: `/api${req.path}`
  });
});

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

// 404 handler - CORS headers already set by cors() middleware
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    hint: req.path.startsWith('/api') ? 'Check the route path' : 'Routes should start with /api'
  });
});

// Error handler middleware (must be last)
if (errorHandler) {
  app.use(errorHandler);
} else {
  // Fallback error handler if module failed to load
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  });
}

// CRITICAL: Export the app for Vercel serverless
// According to latest Vercel docs, direct export is most robust
module.exports = app;

// For local development only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  if (connectDB) {
    connectDB();
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

