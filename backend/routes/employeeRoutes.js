const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('admin'), getEmployees);
router.post('/', authMiddleware, roleMiddleware('admin'), createEmployee);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateEmployee);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteEmployee);

module.exports = router;

