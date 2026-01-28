const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationcontrollers');
const verifyToken = require('../middleware/auth');

// Get user notifications
router.get('/', verifyToken, getUserNotifications);

// Mark notification as read
router.patch('/:id/read', verifyToken, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', verifyToken, markAllAsRead);

module.exports = router;
