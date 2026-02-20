const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notificationcontrollers');
const verifyToken = require('../middleware/auth');

// Get user notifications
router.get('/', verifyToken, getUserNotifications);

// Mark notification as read
router.patch('/:id/read', verifyToken, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', verifyToken, markAllAsRead);

// Delete notification
router.delete('/:id', verifyToken, deleteNotification);

module.exports = router;
