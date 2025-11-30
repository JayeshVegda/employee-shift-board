const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
  },
  employeeCode: {
    type: String,
    required: [true, 'Employee code is required'],
    unique: true,
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Employee', employeeSchema);

