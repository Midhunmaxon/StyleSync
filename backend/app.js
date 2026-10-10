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

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    process.env.FRONTEND_URL
].filter(Boolean);

const isLocalFrontend = (origin) => {
    if (!origin) return true;
    try {
        const url = new URL(origin);
        return (url.hostname === "localhost" || url.hostname === "127.0.0.1") && url.protocol === "http:";
    } catch {
        return false;
    }
};

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || isLocalFrontend(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/outfits", outfitRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/cart", cartRoutes);



app.get("/", (_req, res) => {
    res.json({ message: "StyleSync API is running" });
});

export default app;
