import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'node:http';

import connectDB from './config/db.js';
import { corsOriginHandler } from './config/cors.js';
import { env } from './config/env.js'; // validates env vars as a side effect — keep this import early
import connectToSocket from './controllers/socket.controller.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import { sanitizeBody } from './middlewares/sanitize.middleware.js';
import meetingRoute from './routes/meeting.route.js';
import messageRoute from './routes/message.route.js';
import userRoute from './routes/user.route.js';

const app = express();
const server = createServer(app);

/* ===========================
   Security & Core Middleware
=========================== */

app.set('trust proxy', 1); // required for secure cookies / correct IPs behind a proxy (Render, Vercel, nginx, etc.)

app.use(helmet());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(compression());

app.use(
    cors({
        origin: corsOriginHandler,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(sanitizeBody);
app.use('/api', apiLimiter);

/* ===========================
   Routes
=========================== */

app.use('/api/users', userRoute);
app.use('/api/messages', messageRoute);
app.use('/api/calls', meetingRoute);

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 Chatting Backend is Running',
        environment: env.NODE_ENV,
    });
});

// Lightweight health check for uptime monitors / orchestrators (k8s, Render, etc.)
app.get('/healthz', (req, res) => {
    res.status(200).json({ success: true, uptime: process.uptime() });
});

app.use(notFound);
app.use(errorHandler);

/* ===========================
   Startup & Graceful Shutdown
=========================== */

let ioInstance = null;

const startServer = async () => {
    try {
        await connectDB();
        ioInstance = await connectToSocket(server);

        server.listen(env.PORT, () => {
            console.log('=================================');
            console.log(`🚀 Server running on port ${env.PORT}`);
            console.log(`🌐 Environment : ${env.NODE_ENV}`);
            console.log(`🔌 Socket.IO   : ready${env.REDIS_URL ? ' (Redis-backed, multi-instance)' : ' (single-instance)'}`);
            console.log('=================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server');
        console.error(error);
        process.exit(1);
    }
};

const shutdown = async (signal) => {
    console.log(`\n👋 Received ${signal}. Shutting down gracefully...`);

    try {
        ioInstance?.close();
        await new Promise((resolve) => server.close(resolve));
        const mongoose = (await import('mongoose')).default;
        await mongoose.connection.close(false);
        console.log('✅ Server and DB connections closed. Bye!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});

startServer();

export default app;
