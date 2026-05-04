import * as authService from '../services/authService.js';
import { success, error } from '../utils/response.js';

/**
 * Controller untuk Otentikasi
 */
export const login = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return error(res, 'Username and password are required', 400);
    }

    try {
        const result = await authService.login(username, password);
        return success(res, result, 'Login successful');
    } catch (err) {
        return error(res, err.message, 401);
    }
};

// Helper untuk inisialisasi admin pertama kali
export const register = async (req, res, next) => {
    const { username, password, fullName } = req.body;
    try {
        const userId = await authService.registerAdmin(username, password, fullName);
        return success(res, { id: userId }, 'Admin registered successfully');
    } catch (err) {
        next(err);
    }
};
