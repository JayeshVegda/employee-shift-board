require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const fixAdminPassword = async () => {
  try {
    await connectDB();

    console.log('\n=== Fixing Admin Password ===\n');

    const adminUser = await User.findOne({ email: 'hire-me@anshumat.org' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.email}`);
    console.log(`Current role: ${adminUser.role}`);
    console.log(`Has employeeId: ${adminUser.employeeId ? 'Yes' : 'No'}`);
    
    // Set the password and mark it as modified to force re-hashing
    adminUser.password = 'HireMe@2025!';
    adminUser.markModified('password');
    adminUser.role = 'admin';
    
    await adminUser.save();
    
    console.log('✅ Admin password updated successfully!');
    console.log('   Email: hire-me@anshumat.org');
    console.log('   Password: HireMe@2025!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
    process.exit(1);
  }
};

fixAdminPassword();







