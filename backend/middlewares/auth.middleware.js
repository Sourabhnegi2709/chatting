import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AUTH_COOKIE_NAME, verifyToken } from '../utils/token.js';

/**
 * Protects a route: requires a valid JWT (from cookie or Authorization header)
 * AND a user that still exists in the database. Attaches the full user
 * document (minus password) to req.user.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;

    const token = req.cookies?.[AUTH_COOKIE_NAME] || bearerToken;

    if (!token) {
        throw new ApiError(401, 'Not authenticated');
    }

    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        throw new ApiError(401, 'Session expired or invalid. Please log in again.');
    }

    const user = await User.findById(payload.userId);
    if (!user) {
        throw new ApiError(401, 'Account no longer exists');
    }

    req.user = user;
    next();
});
