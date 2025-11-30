const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  getUnreadCount,
  markAsRead,
  deleteIssue,
} = require('../controllers/issueController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, createIssue);
router.get('/', authMiddleware, getIssues);
router.get('/unread-count', authMiddleware, roleMiddleware('admin'), getUnreadCount);
router.get('/:id', authMiddleware, getIssueById);
router.put('/:id', authMiddleware, roleMiddleware('admin'), updateIssue);
router.patch('/:id/read', authMiddleware, roleMiddleware('admin'), markAsRead);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteIssue);

module.exports = router;

