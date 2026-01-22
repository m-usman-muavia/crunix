const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production_12345';
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { verifyToken };
