require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const connectDB = require('../config/database');

const checkUsers = async () => {
  try {
    await connectDB();

    console.log('\n=== Checking Users and Employees ===\n');

    // Get all employees
    const employees = await Employee.find();
    console.log(`Total Employees: ${employees.length}`);
    employees.forEach(emp => {
      console.log(`  - ${emp.name} (${emp.employeeCode}) - ${emp.department}`);
    });

    console.log('\n');

    // Get all users
    const users = await User.find().populate('employeeId');
    console.log(`Total Users: ${users.length}`);
    users.forEach(user => {
      const empInfo = user.employeeId 
        ? `${user.employeeId.name} (${user.employeeId.employeeCode})`
        : 'No employee linked';
      console.log(`  - ${user.email} (${user.role}) - Employee: ${empInfo}`);
    });

    console.log('\n=== Login Test Scenarios ===\n');

    // Test login scenarios
    const testCases = [
      { input: 'user@example.com', type: 'email' },
      { input: 'EMP001', type: 'employee code' },
      { input: 'emp001', type: 'employee code (lowercase)' },
    ];

    for (const testCase of testCases) {
      console.log(`Testing login with ${testCase.type}: ${testCase.input}`);
      
      // Try email
      let user = await User.findOne({ email: testCase.input.toLowerCase() });
      
      // Try employee code
      if (!user) {
        let employee = await Employee.findOne({ employeeCode: testCase.input });
        if (!employee) {
          employee = await Employee.findOne({ employeeCode: testCase.input.toUpperCase() });
        }
        if (!employee) {
          employee = await Employee.findOne({ 
            employeeCode: { $regex: new RegExp(`^${testCase.input}$`, 'i') } 
          });
        }
        if (employee) {
          user = await User.findOne({ employeeId: employee._id });
        }
      }

      if (user) {
        console.log(`  ✅ User found: ${user.email}`);
        console.log(`     Employee ID: ${user.employeeId}`);
      } else {
        console.log(`  ❌ User not found`);
      }
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();







