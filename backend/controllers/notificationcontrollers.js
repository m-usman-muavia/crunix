const Notification = require('../models/notification');
const User = require('../models/user');

const isAdminRequest = (req) => {
    const configured = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

    if (!configured.length) {
        return true;
    }

    const email = (req.user.email || '').toLowerCase();
    return configured.includes(email);
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        await Notification.updateMany(
            { userId, read: false },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Helper function to create notification (used by other controllers)
exports.createNotification = async (userId, type, message, amount = 0, metadata = {}) => {
    try {
        const notification = new Notification({
            userId,
            type,
            message,
            amount,
            metadata
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user.id;

        const notification = await Notification.findOneAndDelete(
            { _id: id, userId }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.broadcastNotificationToAllUsers = async (req, res) => {
    try {
        if (!isAdminRequest(req)) {
            return res.status(403).json({ message: 'Only admin can send broadcast notifications' });
        }

        const message = (req.body.message || '').toString().trim();
        const amount = Number(req.body.amount || 0);
        const metadata = req.body.metadata && typeof req.body.metadata === 'object' ? req.body.metadata : {};

        if (!message) {
            return res.status(400).json({ message: 'Notification message is required' });
        }

        const users = await User.find({}, { _id: 1 }).lean();
        if (!users.length) {
            return res.status(404).json({ message: 'No users found to notify' });
        }

        const docs = users.map((user) => ({
            userId: user._id,
            type: 'admin_broadcast',
            message,
            amount,
            metadata: {
                ...metadata,
                broadcastBy: req.user.userId || req.user.id,
                source: 'admin_panel'
            }
        }));

        await Notification.insertMany(docs, { ordered: false });

        res.status(201).json({
            message: 'Broadcast notification sent to all users',
            recipients: users.length
        });
    } catch (error) {
        console.error('Error sending broadcast notification:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
