// Initialize with error handling - don't crash on missing dotenv
try {
  require('dotenv').config();
} catch (error) {
  // dotenv is optional in production (Vercel uses env vars)
  console.warn('dotenv config warning:', error.message);
}

const express = require('express');
const cors = require('cors');

// Import core modules with error handling
let connectDB, errorHandler;
try {
  connectDB = require('./config/database');
  errorHandler = require('./middleware/errorHandler');
} catch (error) {
  console.error('Error loading core modules:', error);
  throw error; // Core modules must load
}

// Import routes with error handling - routes can fail individually
let authRoutes, employeeRoutes, shiftRoutes, issueRoutes, analyticsRoutes;
const routeErrors = {};

try {
  authRoutes = require('./routes/authRoutes');
} catch (error) {
  console.error('Error loading authRoutes:', error.message);
  routeErrors.auth = error.message;
}

try {
  employeeRoutes = require('./routes/employeeRoutes');
} catch (error) {
  console.error('Error loading employeeRoutes:', error.message);
  routeErrors.employees = error.message;
}

try {
  shiftRoutes = require('./routes/shiftRoutes');
} catch (error) {
  console.error('Error loading shiftRoutes:', error.message);
  routeErrors.shifts = error.message;
}

try {
  issueRoutes = require('./routes/issueRoutes');
} catch (error) {
  console.error('Error loading issueRoutes:', error.message);
  routeErrors.issues = error.message;
}

try {
  analyticsRoutes = require('./routes/analyticsRoutes');
} catch (error) {
  console.error('Error loading analyticsRoutes:', error.message);
  routeErrors.analytics = error.message;
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

// Health check (simple, no DB required) - define BEFORE routes to ensure it works
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root API endpoint - returns API information (no dependencies)
app.get('/api', (req, res) => {
  try {
    res.json({
      name: 'Employee Shift Board API',
      version: '1.0.0',
      status: 'running',
      routesMounted: {
        auth: !!authRoutes,
        employees: !!employeeRoutes,
        shifts: !!shiftRoutes,
        issues: !!issueRoutes,
        analytics: !!analyticsRoutes
      },
      routeErrors: Object.keys(routeErrors).length > 0 ? routeErrors : undefined,
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

// Routes - mount only successfully loaded routes
console.log('Mounting routes...');
if (authRoutes) {
  app.use('/api', authRoutes);
  console.log('✓ authRoutes mounted');
} else {
  console.error('✗ authRoutes failed to mount');
}

if (employeeRoutes) {
  app.use('/api/employees', employeeRoutes);
  console.log('✓ employeeRoutes mounted');
} else {
  console.error('✗ employeeRoutes failed to mount');
}

if (shiftRoutes) {
  app.use('/api/shifts', shiftRoutes);
  console.log('✓ shiftRoutes mounted');
} else {
  console.error('✗ shiftRoutes failed to mount');
}

if (issueRoutes) {
  app.use('/api/issues', issueRoutes);
  console.log('✓ issueRoutes mounted');
} else {
  console.error('✗ issueRoutes failed to mount');
}

if (analyticsRoutes) {
  app.use('/api/analytics', analyticsRoutes);
  console.log('✓ analyticsRoutes mounted');
} else {
  console.error('✗ analyticsRoutes failed to mount');
}

console.log('Route mounting complete');

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
  // Fallback error handler
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
      error: 'Internal server error',
      message: err.message
    });
  });
}

// CRITICAL: Export the app for Vercel serverless
// According to latest Vercel docs, direct export is most robust
// Wrap in try-catch to ensure we always export something
try {
  module.exports = app;
} catch (error) {
  console.error('Fatal error exporting app:', error);
  // Export a minimal error handler as fallback
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  };
}

// For local development only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

