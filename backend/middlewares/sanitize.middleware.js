const stripDangerousKeys = (value) => {
    if (Array.isArray(value)) {
        return value.map(stripDangerousKeys);
    }
    if (value && typeof value === 'object') {
        const clean = {};
        for (const [key, val] of Object.entries(value)) {
            if (key.startsWith('$') || key.includes('.')) continue; // drop operator-injection attempts
            clean[key] = stripDangerousKeys(val);
        }
        return clean;
    }
    return value;
};

/**
 * Prevents NoSQL operator injection (e.g. { "email": { "$ne": null } })
 * by stripping any object keys starting with "$" or containing "." from
 * the request body before it ever reaches a Mongoose query.
 */
export const sanitizeBody = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = stripDangerousKeys(req.body);
    }
    next();
};
