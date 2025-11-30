const Employee = require('../models/Employee');

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-__v').sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { name, employeeCode, department } = req.body;

    // Validate required fields
    if (!name || !employeeCode || !department) {
      return res.status(400).json({ message: 'Name, employee code, and department are required' });
    }

    // Check if employee code already exists
    const existingEmployee = await Employee.findOne({ employeeCode });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee code already exists' });
    }

    const employee = await Employee.create({ name, employeeCode, department });
    res.status(201).json(employee);
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error creating employee' });
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

    // Check if employee code is being changed and if it already exists
    if (employeeCode && employeeCode !== employee.employeeCode) {
      const existingEmployee = await Employee.findOne({ employeeCode });
      if (existingEmployee) {
        return res.status(400).json({ message: 'Employee code already exists' });
      }
    }

    // Update fields
    if (name) employee.name = name;
    if (employeeCode) employee.employeeCode = employeeCode;
    if (department) employee.department = department;

    await employee.save();
    res.json(employee);
  } catch (error) {
    console.error('Update employee error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error updating employee' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await Employee.findByIdAndDelete(id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error deleting employee' });
  }
};

module.exports = { getEmployees, createEmployee, updateEmployee, deleteEmployee };

