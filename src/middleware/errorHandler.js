import { error } from '../utils/response.js';

/**
 * Centralized Error Handling Middleware (ESM)
 */
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    return error(res, message, statusCode);
};

export default errorHandler;
