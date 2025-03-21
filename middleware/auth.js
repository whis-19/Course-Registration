const jwt = require('jsonwebtoken');
const User = require('../models/user');

const getTokenFromHeaders = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};

const getTokenFromCookies = (req) => {
    return req.cookies?.token || null;
};

const verifyToken = async (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    return await User.findById(decoded.id);
};

const protect = async (req, res, next) => {
    const token = getTokenFromHeaders(req) || getTokenFromCookies(req);

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        req.user = await verifyToken(token);
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, error: 'Not authorized as an admin' });
    }
};

module.exports = {
    protect,
    admin
};