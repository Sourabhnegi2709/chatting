import rateLimit from 'express-rate-limit';

// Generous limit for normal API traffic.
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down.' },
});

// Tight limit specifically on login/register to blunt brute-force / credential-stuffing.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Try again in a few minutes.' },
});
