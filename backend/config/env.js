import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_IN_ALL_ENVS = ['MONGO_URL', 'JWT_SECRET'];
const REQUIRED_IN_PRODUCTION = ['CLIENT_URLS', 'COOKIE_SECURE'];

const missing = REQUIRED_IN_ALL_ENVS.filter((key) => !process.env[key]);

if (process.env.NODE_ENV === 'production') {
    missing.push(...REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]));
}

if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(
        `\n❌ Missing required environment variable(s): ${missing.join(', ')}\n` +
        `Copy .env.example to .env and fill these in before starting the server.\n`
    );
    process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn(
        '⚠️  JWT_SECRET is shorter than 32 characters. Use a long, random string in production ' +
        '(e.g. `openssl rand -hex 32`).'
    );
}

export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 3000,
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    COOKIE_SECURE: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || undefined,
    // Comma-separated list, e.g. "https://app.example.com,https://admin.example.com"
    CLIENT_URLS: (process.env.CLIENT_URLS || 'http://localhost:5173,http://127.0.0.1:5173')
        .split(',')
        .map((url) => url.trim())
        .filter(Boolean),
    REDIS_URL: process.env.REDIS_URL || null, // set this to enable multi-instance Socket.IO scaling
};
