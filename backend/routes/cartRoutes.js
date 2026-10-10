import express from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cartController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);

router.post("/add", authMiddleware, addToCart);

router.put("/update", authMiddleware, updateCartItem);

router.delete("/remove/:productId", authMiddleware, removeFromCart);

router.delete("/clear", authMiddleware, clearCart);

export default router;