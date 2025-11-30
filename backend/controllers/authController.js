const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

// employee login - needs employeeId
const loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email/Employee ID and password required' });
    }

    let foundUser = null;
    const input = email.trim();

    // try email first
    foundUser = await User.findOne({ email: input.toLowerCase() });

    // if no user found, try employee code
    if (!foundUser) {
      let emp = await Employee.findOne({ employeeCode: input });
      
      if (!emp) {
        emp = await Employee.findOne({ employeeCode: input.toUpperCase() });
      }
      
      // case-insensitive fallback
      if (!emp) {
        emp = await Employee.findOne({ 
          employeeCode: { $regex: new RegExp(`^${input}$`, 'i') } 
        });
      }

      if (emp) {
        foundUser = await User.findOne({ employeeId: emp._id });
      }
    }

    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // must be an employee
    if (!foundUser.employeeId) {
      return res.status(403).json({ message: 'Employee login only' });
    }

    const passwordMatch = await foundUser.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: foundUser._id, role: foundUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role,
        employeeId: foundUser.employeeId,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// admin login only
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const emailLower = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // must be admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// general login (backward compat)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email/Employee ID and password required' });
    }

    let foundUser = null;
    const input = email.trim();

    // try email first
    foundUser = await User.findOne({ email: input.toLowerCase() });

    // try employee code if not found
    if (!foundUser) {
      let emp = await Employee.findOne({ employeeCode: input });
      
      if (!emp) {
        emp = await Employee.findOne({ employeeCode: input.toUpperCase() });
      }
      
      if (!emp) {
        emp = await Employee.findOne({ 
          employeeCode: { $regex: new RegExp(`^${input}$`, 'i') } 
        });
      }

      if (emp) {
        foundUser = await User.findOne({ employeeId: emp._id });
      }
    }

    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await foundUser.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: foundUser._id, role: foundUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: foundUser._id,
        email: foundUser.email,
        role: foundUser.role,
        employeeId: foundUser.employeeId,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password incorrect' });
    }

    // update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

module.exports = { login, loginEmployee, loginAdmin, changePassword };
