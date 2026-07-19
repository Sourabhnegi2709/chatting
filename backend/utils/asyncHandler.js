/**
 * Wraps an async controller so any thrown/rejected error is forwarded to
 * Express's error-handling middleware instead of needing try/catch in
 * every single controller function.
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
