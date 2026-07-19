import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFound = (req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Must be registered LAST, after all routes.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    let statusCode = err instanceof ApiError ? err.statusCode : 500;
    let message = err.message || 'Internal Server Error';
    let errors = err instanceof ApiError ? err.errors : [];

    // Common Mongoose error shapes, translated into clean client-facing messages.
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errors = Object.values(err.errors).map((e) => e.message);
        message = 'Validation failed';
    }
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0];
        message = field ? `${field} already in use` : 'Duplicate value';
    }
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid identifier';
    }

    if (statusCode >= 500) {
        console.error('❌ Unhandled error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors,
        // Only leak stack traces outside production
        ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};
