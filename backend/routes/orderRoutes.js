import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();

// Customer - create order
router.post(
    "/",
    authMiddleware,
    createOrder
);

// Customer - view own orders
router.get(
    "/my",
    authMiddleware,
    getMyOrders
);

// Admin - view all customer orders
router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,
    getAllOrders
);

// Admin - update/cancel order
router.patch(
    "/admin/:id/status",
    authMiddleware,
    adminMiddleware,
    updateOrderStatus
);

// Customer - view single order
router.get(
    "/:id",
    authMiddleware,
    getOrderById
);

export default router;