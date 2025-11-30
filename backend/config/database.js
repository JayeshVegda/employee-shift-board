const mongoose = require('mongoose');

let dbConnection = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    dbConnection = conn.connection;
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    
    // handle connection events
    conn.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    conn.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    return conn.connection;
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
};

const getDBStatus = () => {
  const connection = mongoose.connection;
  
  if (!connection) {
    return { 
      connected: false, 
      state: 'disconnected',
      error: 'No connection object'
    };
  }
  
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    connected: connection.readyState === 1,
    state: states[connection.readyState] || 'unknown',
    host: connection.host || 'unknown',
    name: connection.name || 'unknown',
    port: connection.port || 'unknown',
    readyState: connection.readyState
  };
};

module.exports = { connectDB, getDBStatus };

