import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import outfitRoutes from "./routes/outfitRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://style-sync-lilac.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

// Configure CORS before registering API routes
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header and approved origins
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Allow local development origins
            try {
                const url = new URL(origin);

                if (
                    url.protocol === "http:" &&
                    (url.hostname === "localhost" ||
                        url.hostname === "127.0.0.1")
                ) {
                    return callback(null, true);
                }
            } catch {
                // Invalid origin
            }

            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Middleware
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/cart", cartRoutes);

// API health check
app.get("/", (_req, res) => {
    res.json({ message: "StyleSync API is running" });
});

export default app;