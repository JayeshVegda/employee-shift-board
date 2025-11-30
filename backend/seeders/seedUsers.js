require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const connectDB = require('../config/database');

// Realistic Indian employee data
const indianEmployees = [
  { name: 'Rajesh Kumar', employeeCode: 'EMP001', department: 'Operations' },
  { name: 'Priya Sharma', employeeCode: 'EMP002', department: 'Human Resources' },
  { name: 'Amit Patel', employeeCode: 'EMP003', department: 'IT Support' },
  { name: 'Sneha Reddy', employeeCode: 'EMP004', department: 'Finance' },
  { name: 'Vikram Singh', employeeCode: 'EMP005', department: 'Operations' },
  { name: 'Anjali Desai', employeeCode: 'EMP006', department: 'Marketing' },
  { name: 'Rahul Mehta', employeeCode: 'EMP007', department: 'IT Support' },
  { name: 'Kavita Nair', employeeCode: 'EMP008', department: 'Human Resources' },
  { name: 'Suresh Iyer', employeeCode: 'EMP009', department: 'Finance' },
  { name: 'Divya Joshi', employeeCode: 'EMP010', department: 'Operations' },
  { name: 'Mohit Agarwal', employeeCode: 'EMP011', department: 'IT Support' },
  { name: 'Pooja Menon', employeeCode: 'EMP012', department: 'Marketing' },
  { name: 'Arjun Malhotra', employeeCode: 'EMP013', department: 'Operations' },
  { name: 'Meera Krishnan', employeeCode: 'EMP014', department: 'Human Resources' },
  { name: 'Nikhil Verma', employeeCode: 'EMP015', department: 'Finance' },
  { name: 'Shreya Banerjee', employeeCode: 'EMP016', department: 'IT Support' },
  { name: 'Karan Kapoor', employeeCode: 'EMP017', department: 'Operations' },
  { name: 'Riya Chaturvedi', employeeCode: 'EMP018', department: 'Marketing' },
  { name: 'Aditya Rao', employeeCode: 'EMP019', department: 'IT Support' },
  { name: 'Neha Gupta', employeeCode: 'EMP020', department: 'Human Resources' },
  { name: 'Siddharth Jain', employeeCode: 'EMP021', department: 'Finance' },
  { name: 'Tanvi Shah', employeeCode: 'EMP022', department: 'Operations' },
  { name: 'Rohan Bhatt', employeeCode: 'EMP023', department: 'IT Support' },
  { name: 'Isha Trivedi', employeeCode: 'EMP024', department: 'Marketing' },
  { name: 'Varun Dutta', employeeCode: 'EMP025', department: 'Operations' },
  { name: 'Ananya Pillai', employeeCode: 'EMP026', department: 'Human Resources' },
  { name: 'Harsh Varma', employeeCode: 'EMP027', department: 'Finance' },
  { name: 'Sanjana Ramesh', employeeCode: 'EMP028', department: 'IT Support' },
  { name: 'Yash Tiwari', employeeCode: 'EMP029', department: 'Operations' },
  { name: 'Aishwarya Nambiar', employeeCode: 'EMP030', department: 'Marketing' },
];

const seedUsers = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seeding...\n');

    // ============================================
    // CREATE ADMIN USER (Hard-coded demo login)
    // ============================================
    let adminEmployee = await Employee.findOne({ employeeCode: 'ADMIN001' });
    if (!adminEmployee) {
      adminEmployee = await Employee.create({
        name: 'Admin User',
        employeeCode: 'ADMIN001',
        department: 'Administration',
      });
      console.log('✅ Admin employee created: ADMIN001');
    }

    // Delete existing admin user if exists to ensure fresh creation
    await User.deleteOne({ email: 'hire-me@anshumat.org' });
    
    const adminUser = await User.create({
      email: 'hire-me@anshumat.org',
      password: 'HireMe@2025!',
      role: 'admin',
      employeeId: adminEmployee._id,
    });
    console.log('✅ Admin user created: hire-me@anshumat.org');
    console.log('   Password: HireMe@2025!');
    console.log('   Role: admin\n');

    // ============================================
    // CREATE INDIAN EMPLOYEES AND USERS
    // ============================================
    let createdCount = 0;
    let updatedCount = 0;

    for (const empData of indianEmployees) {
      try {
        // Check if employee exists
        let employee = await Employee.findOne({ employeeCode: empData.employeeCode });
        
        if (!employee) {
          // Create new employee
          employee = await Employee.create({
            name: empData.name,
            employeeCode: empData.employeeCode,
            department: empData.department,
          });
          createdCount++;
          console.log(`✅ Created employee: ${empData.name} (${empData.employeeCode})`);
        } else {
          // Update existing employee
          employee.name = empData.name;
          employee.department = empData.department;
          await employee.save();
          updatedCount++;
          console.log(`🔄 Updated employee: ${empData.name} (${empData.employeeCode})`);
        }

        // Create or update user account
        const userEmail = `${empData.employeeCode.toLowerCase()}@company.local`;
        let user = await User.findOne({ email: userEmail });

        if (!user) {
          // Create new user
          user = await User.create({
            email: userEmail,
            password: empData.employeeCode, // Password is same as employee code
            role: 'user',
            employeeId: employee._id,
          });
          console.log(`   ✅ Created user account: ${userEmail}`);
          console.log(`      Login with: ${userEmail} or ${empData.employeeCode}`);
          console.log(`      Password: ${empData.employeeCode}\n`);
        } else {
          // Update existing user
          user.password = empData.employeeCode;
          user.markModified('password'); // Force password re-hashing
          user.role = 'user';
          user.employeeId = employee._id;
          await user.save();
          console.log(`   🔄 Updated user account: ${userEmail}\n`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${empData.employeeCode}:`, error.message);
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Admin user: hire-me@anshumat.org`);
    console.log(`✅ Employees created: ${createdCount}`);
    console.log(`🔄 Employees updated: ${updatedCount}`);
    console.log(`✅ Total employees: ${indianEmployees.length}`);
    
    const totalUsers = await User.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    console.log(`\n📈 Database Statistics:`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Total Employees: ${totalEmployees}`);
    console.log('='.repeat(50));
    console.log('\n✅ Seeding completed successfully!');
    console.log('\n🔐 Demo Login Credentials:');
    console.log('   Email: hire-me@anshumat.org');
    console.log('   Password: HireMe@2025!');
    console.log('   Role: Admin\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedUsers();
