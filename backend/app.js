import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";

import connectDB from "./config/db.js";
import connectToSocket from "./controllers/socket.controller.js";
import userRoute from "./routes/user.route.js";

dotenv.config();

const app = express();
const server = createServer(app);

connectToSocket(server);

const port = process.env.PORT || 3000;

// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
];

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    return /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):517\d+$/.test(origin);
};

// CORS middleware
app.use(
    cors({
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true
    })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoute);

// Health route
app.get("/", (req, res) => {
    res.send("Server is running");
});

// Start server
const startServer = async () => {
    try {
        const dbConnected = await connectDB();
        if (!dbConnected) {
            console.warn('\n⚠️  WARNING: Database connection failed!');
            console.warn('   Users created will be LOST on server restart.');
            console.warn('   This is NOT a production-ready setup.\n');
        }
    } catch (err) {
        console.error("❌ Database connection warning:", err.message);
    }

    server.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`🔗 Socket.IO listening on http://localhost:${port}`);
    });
};

startServer().catch((err) => {
    console.error("❌ Server startup error:", err);
    process.exit(1);
});
