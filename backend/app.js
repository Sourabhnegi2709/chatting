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

// Socket.IO
connectToSocket(server);

const PORT = process.env.PORT || 3000;

/* ===========================
   CORS Configuration
=========================== */

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://chatting-azure-five.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin (Postman, mobile apps, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost, production, and all Vercel preview deployments
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);

      return callback(new Error(`CORS Error: ${origin} is not allowed`));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* ===========================
   Middlewares
=========================== */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===========================
   Routes
=========================== */

app.use("/api/users", userRoute);

/* ===========================
   Health Check
=========================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Chatting Backend is Running",
  });
});

/* ===========================
   Database + Server Start
=========================== */

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log("=================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment : ${process.env.NODE_ENV || "development"}`);
      console.log("=================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
    process.exit(1);
  }
};

startServer();