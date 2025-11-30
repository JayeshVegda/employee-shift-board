require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const connectDB = require('../config/database');

const fixUserPasswords = async () => {
  try {
    await connectDB();

    console.log('\n=== Fixing User Passwords ===\n');

    // Get all users with employeeId
    const users = await User.find({ employeeId: { $ne: null } }).populate('employeeId');

    for (const user of users) {
      if (user.employeeId) {
        const employeeCode = user.employeeId.employeeCode;
        console.log(`Updating password for ${user.email} to employee code: ${employeeCode}`);
        
        // Set password and mark as modified to trigger hashing
        user.password = employeeCode;
        user.markModified('password');
        await user.save();
        
        console.log(`✅ Updated password for ${user.email}`);
      }
    }

    // Also create user accounts for employees without users
    const employees = await Employee.find();
    for (const employee of employees) {
      const existingUser = await User.findOne({ employeeId: employee._id });
      if (!existingUser) {
        const defaultEmail = `${employee.employeeCode.toLowerCase()}@company.local`;
        
        // Check if email already exists
        const emailExists = await User.findOne({ email: defaultEmail });
        if (!emailExists) {
          const newUser = new User({
            email: defaultEmail,
            password: employee.employeeCode,
            role: 'user',
            employeeId: employee._id,
          });
          await newUser.save();
          console.log(`✅ Created user account for ${employee.name} (${employee.employeeCode}): ${defaultEmail}`);
        } else {
          console.log(`⚠️  Email ${defaultEmail} already exists, linking to employee ${employee.employeeCode}`);
          emailExists.employeeId = employee._id;
          emailExists.password = employee.employeeCode;
          emailExists.markModified('password');
          await emailExists.save();
        }
      }
    }

    console.log('\n✅ Password fix completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixUserPasswords();




