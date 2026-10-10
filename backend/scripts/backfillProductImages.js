import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Product from "../models/Product.js";

const categoryImages = {
    "T-Shirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    "Shirts": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
    "Jeans": "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
    "Trousers": "https://images.unsplash.com/photo-1506629905607-d9b1e5d2a7c8?auto=format&fit=crop&w=900&q=85",
    "Dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    "Jackets": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    "Shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    "Accessories": "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=900&q=85"
};

await connectDB();

const products = await Product.find();
let changed = 0;

for (const product of products) {
    if (!product.images?.length) {
        product.images = [categoryImages[product.category] || categoryImages["T-Shirts"]];
        await product.save();
        changed++;
    }
}

console.log(`Checked ${products.length} products. Added fallback images to ${changed}.`);
await mongoose.disconnect();
