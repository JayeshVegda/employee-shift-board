const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      message: 'Validation error',
      errors: messages,
    });
  }

  // duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0],
    });
  }

  // jwt errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // default
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
};

module.exports = errorHandler;

