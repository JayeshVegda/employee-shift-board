const mongoose = require('mongoose');

let dbConnection = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    dbConnection = conn.connection;
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    return conn.connection;
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
};

const getDBStatus = () => {
  if (!dbConnection) {
    return { connected: false, state: 'disconnected' };
  }
  return {
    connected: dbConnection.readyState === 1,
    state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbConnection.readyState] || 'unknown',
    host: dbConnection.host,
    name: dbConnection.name,
  };
};

module.exports = { connectDB, getDBStatus };

