const express = require('express');
const router = express.Router();
const { login, loginEmployee, loginAdmin, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/employee', loginEmployee);
router.post('/admin', loginAdmin);
router.post('/', login); // backward compat
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;

