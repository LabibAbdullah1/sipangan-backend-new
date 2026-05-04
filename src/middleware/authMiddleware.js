import jwt from 'jsonwebtoken';
import { error } from '../utils/response.js';

/**
 * Middleware untuk memproteksi route Admin
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return error(res, 'Unauthorized: No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return error(res, 'Unauthorized: Invalid or expired token', 401);
    }
};

export default authMiddleware;
