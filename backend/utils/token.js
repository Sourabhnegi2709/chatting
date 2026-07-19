import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (userId) =>
    jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

export const AUTH_COOKIE_NAME = 'token';

export const cookieOptions = {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SECURE ? 'None' : 'Lax', // 'None' required for cross-site cookies over HTTPS in prod
    domain: env.COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, keep in sync with JWT_EXPIRES_IN
};

export const setAuthCookie = (res, token) => {
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
};

export const clearAuthCookie = (res) => {
    res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
};
