const Employee = require('../models/Employee');
const User = require('../models/User');

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-__v').sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    console.error('Get employees error:', err);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { name, employeeCode, department } = req.body;

    if (!name || !employeeCode || !department) {
      return res.status(400).json({ message: 'Name, code, and department required' });
    }

    // trim whitespace
    const trimmedName = name.trim();
    const trimmedCode = employeeCode.trim();
    const trimmedDept = department.trim();

    if (!trimmedName || !trimmedCode || !trimmedDept) {
      return res.status(400).json({ message: 'Fields cannot be empty' });
    }

    // check if code exists
    const existing = await Employee.findOne({ employeeCode: trimmedCode });
    if (existing) {
      return res.status(400).json({ message: 'Employee code already exists' });
    }

    const employee = new Employee({
      name: trimmedName,
      employeeCode: trimmedCode,
      department: trimmedDept,
    });

    await employee.save();

    // auto-create user account
    try {
      const defaultEmail = `${trimmedCode.toLowerCase()}@company.local`;
      
      let user = await User.findOne({ email: defaultEmail });
      
      if (!user) {
        user = new User({
          email: defaultEmail,
          password: trimmedCode, // will be hashed automatically
          role: 'user',
          employeeId: employee._id,
        });
        await user.save();
      } else {
        // update existing user
        user.employeeId = employee._id;
        user.password = trimmedCode;
        await user.save();
      }
    } catch (userErr) {
      console.error('Error creating user account:', userErr);
      // don't fail employee creation if user creation fails
    }

    res.status(201).json(employee);
  } catch (err) {
    console.error('Create employee error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Employee code already exists' });
    }
    res.status(500).json({ message: 'Failed to create employee', error: err.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, employeeCode, department } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // check if code is being changed
    if (employeeCode && employeeCode.trim() !== employee.employeeCode) {
      const trimmedCode = employeeCode.trim();
      const existing = await Employee.findOne({ employeeCode: trimmedCode });
      if (existing) {
        return res.status(400).json({ message: 'Employee code already exists' });
      }
      employee.employeeCode = trimmedCode;
    }

    if (name && name.trim()) {
      employee.name = name.trim();
    }
    if (department && department.trim()) {
      employee.department = department.trim();
    }

    await employee.save();
    res.json(employee);
  } catch (err) {
    console.error('Update employee error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Employee code already exists' });
    }
    res.status(500).json({ message: 'Failed to update employee', error: err.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // check if employee has shifts
    const Shift = require('../models/Shift');
    const shiftsCount = await Shift.countDocuments({ employeeId: id });
    if (shiftsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete employee with ${shiftsCount} shift(s). Delete shifts first.` 
      });
    }

    await Employee.findByIdAndDelete(id);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};

module.exports = { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee 
};
