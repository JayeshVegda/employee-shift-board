const express = require('express');
const router = express.Router();
const { createShift, getShifts, deleteShift, getWorkingHours, updateShift } = require('../controllers/shiftController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware('admin'), createShift);
router.get('/', authMiddleware, getShifts);
router.get('/working-hours', authMiddleware, getWorkingHours);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateShift);
router.delete('/:id', authMiddleware, deleteShift);

module.exports = router;

