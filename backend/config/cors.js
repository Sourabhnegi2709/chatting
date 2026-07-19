import { env } from './env.js';

const LOCAL_DEV_REGEX = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):\d{4,5}$/;

/**
 * Single source of truth for "is this origin allowed to talk to us".
 * Used by both the Express CORS middleware and the Socket.IO CORS config,
 * so the two can never drift apart again.
 */
export const isOriginAllowed = (origin) => {
    if (!origin) return true; // curl, Postman, server-to-server, mobile webviews

    if (env.CLIENT_URLS.includes(origin)) return true;
    if (origin.endsWith('.vercel.app')) return true;
    if (env.NODE_ENV !== 'production' && LOCAL_DEV_REGEX.test(origin)) return true;

    return false;
};

export const corsOriginHandler = (origin, callback) => {
    if (isOriginAllowed(origin)) {
        callback(null, true);
    } else {
        console.error('❌ Blocked by CORS:', origin);
        callback(new Error(`CORS Error: ${origin} is not allowed`));
    }
};
