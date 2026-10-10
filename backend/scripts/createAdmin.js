import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || "StyleSync Admin";

if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.");
    process.exit(1);
}

await connectDB();

const hashedPassword = await bcrypt.hash(password, 10);

await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "admin"
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
);

console.log(`Admin account ready: ${email}`);
await mongoose.disconnect();
