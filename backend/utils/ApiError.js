/**
 * Thrown deliberately from controllers/services for expected failure cases
 * (bad input, not found, unauthorized, conflict). Caught by the global
 * error middleware and turned into a consistent JSON response.
 */
export class ApiError extends Error {
    constructor(statusCode, message = 'Something went wrong', errors = []) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true; // distinguishes expected errors from bugs/crashes
        Error.captureStackTrace(this, this.constructor);
    }
}
