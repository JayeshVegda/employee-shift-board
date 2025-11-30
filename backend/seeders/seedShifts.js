require('dotenv').config();
const mongoose = require('mongoose');
const Shift = require('../models/Shift');
const Employee = require('../models/Employee');
const connectDB = require('../config/database');

const seedShifts = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting shift seeding...\n');

    // Get all employees (excluding admin)
    const employees = await Employee.find({ employeeCode: { $ne: 'ADMIN001' } });
    
    if (employees.length === 0) {
      console.log('❌ No employees found. Please run seedUsers.js first.');
      process.exit(1);
    }

    console.log(`📋 Found ${employees.length} employees\n`);

    // Clear existing shifts first
    const deletedCount = await Shift.deleteMany({});
    console.log(`🗑️  Deleted ${deletedCount.deletedCount} existing shifts\n`);

    const shiftsCreated = [];
    const today = new Date();
    
    // Generate shifts for the last 90 days (3 months)
    const daysToGenerate = 90;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToGenerate);

    // Department-specific shift patterns with realistic variations
    const getShiftTiming = (department, dayOfWeek) => {
      // Base shift timings by department
      const baseShifts = {
        'Operations': { start: '09:00', end: '18:00' },
        'IT Support': { start: '09:30', end: '18:30' },
        'Finance': { start: '09:00', end: '18:00' },
        'Human Resources': { start: '09:00', end: '18:00' },
        'Marketing': { start: '10:00', end: '19:00' },
      };

      const base = baseShifts[department] || baseShifts['Operations'];
      
      // Add realistic variations
      const variations = [
        // Normal variations (±15 minutes)
        { startOffset: 0, endOffset: 0 },
        { startOffset: -15, endOffset: -15 }, // Early both
        { startOffset: 15, endOffset: 15 },   // Late both
        { startOffset: -30, endOffset: 0 },   // Early start, normal end
        { startOffset: 0, endOffset: 30 },    // Normal start, late end (overtime)
        { startOffset: 20, endOffset: 0 },    // Late start, normal end
        { startOffset: 0, endOffset: -30 },   // Normal start, early end
        { startOffset: -20, endOffset: 20 },  // Early start, late end
        { startOffset: 45, endOffset: 45 },   // Very late (traffic)
        { startOffset: -45, endOffset: -30 },  // Very early
      ];

      const variation = variations[Math.floor(Math.random() * variations.length)];
      
      // Parse base time
      const [startH, startM] = base.start.split(':').map(Number);
      const [endH, endM] = base.end.split(':').map(Number);
      
      // Apply variations
      let startMinutes = startH * 60 + startM + variation.startOffset;
      let endMinutes = endH * 60 + endM + variation.endOffset;
      
      // Ensure minimum 8 hours and maximum 10 hours
      const duration = (endMinutes - startMinutes) / 60;
      if (duration < 8) {
        endMinutes = startMinutes + (8 * 60);
      } else if (duration > 10) {
        endMinutes = startMinutes + (10 * 60);
      }
      
      // Handle day rollover (if end time goes past midnight, adjust)
      if (endMinutes >= 24 * 60) {
        endMinutes = 24 * 60 - 1; // Max 23:59
      }
      
      // Format times
      const startHours = Math.floor(startMinutes / 60);
      const startMins = Math.floor(startMinutes % 60);
      const endHours = Math.floor(endMinutes / 60);
      const endMins = Math.floor(endMinutes % 60);
      
      return {
        start: `${String(startHours).padStart(2, '0')}:${String(startMins).padStart(2, '0')}`,
        end: `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`,
      };
    };

    // Generate shifts for each day
    for (let dayOffset = 0; dayOffset < daysToGenerate; dayOffset++) {
      const shiftDate = new Date(startDate);
      shiftDate.setDate(startDate.getDate() + dayOffset);
      shiftDate.setHours(0, 0, 0, 0);

      const dayOfWeek = shiftDate.getDay();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      // For each employee, decide if they work today
      // 85% attendance rate (some employees take leave, sick days, etc.)
      for (const employee of employees) {
        // Skip 15% of days randomly (sick leave, personal leave, etc.)
        if (Math.random() < 0.15) {
          continue;
        }

        // Check if shift already exists for this employee on this date
        const existingShift = await Shift.findOne({
          employeeId: employee._id,
          date: {
            $gte: new Date(shiftDate.setHours(0, 0, 0, 0)),
            $lt: new Date(shiftDate.setHours(23, 59, 59, 999)),
          },
        });

        if (existingShift) {
          continue; // Skip if shift already exists
        }

        // Get realistic shift timing based on department
        const shiftTiming = getShiftTiming(employee.department, dayOfWeek);
        
        // Create shift
        const shift = await Shift.create({
          employeeId: employee._id,
          date: new Date(shiftDate),
          startTime: shiftTiming.start,
          endTime: shiftTiming.end,
        });

        shiftsCreated.push({
          employee: employee.name,
          employeeCode: employee.employeeCode,
          department: employee.department,
          date: shiftDate.toISOString().split('T')[0],
          time: `${shiftTiming.start}-${shiftTiming.end}`,
        });
      }
    }

    // Summary statistics
    const employeesWithShifts = new Set(shiftsCreated.map(s => s.employeeCode));
    const departmentsCovered = new Set(shiftsCreated.map(s => s.department));
    const datesCovered = new Set(shiftsCreated.map(s => s.date));

    console.log(`✅ Created ${shiftsCreated.length} shifts`);
    console.log(`\n📊 Statistics:`);
    console.log(`   Employees with shifts: ${employeesWithShifts.size} / ${employees.length}`);
    console.log(`   Departments covered: ${Array.from(departmentsCovered).join(', ')}`);
    console.log(`   Date range: ${Math.min(...Array.from(datesCovered))} to ${Math.max(...Array.from(datesCovered))}`);
    console.log(`   Total days covered: ${datesCovered.size} days`);
    
    // Show sample shifts by department
    console.log(`\n📋 Sample shifts by department:`);
    const deptGroups = {};
    shiftsCreated.forEach(shift => {
      if (!deptGroups[shift.department]) {
        deptGroups[shift.department] = [];
      }
      if (deptGroups[shift.department].length < 3) {
        deptGroups[shift.department].push(shift);
      }
    });
    
    Object.keys(deptGroups).forEach(dept => {
      console.log(`\n   ${dept}:`);
      deptGroups[dept].forEach(shift => {
        console.log(`     ${shift.employee} (${shift.employeeCode}) - ${shift.date} - ${shift.time}`);
      });
    });

    console.log('\n✅ Shift seeding completed successfully!');
    console.log('\n💡 Tips:');
    console.log('   - Each employee has ~85% attendance (realistic leave/sick days)');
    console.log('   - Shifts have natural variations (±15-45 min)');
    console.log('   - Only one shift per employee per day');
    console.log('   - Weekends are excluded');
    console.log('   - Data spans 3 months for better coverage\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Shift seeding error:', error);
    process.exit(1);
  }
};

seedShifts();
