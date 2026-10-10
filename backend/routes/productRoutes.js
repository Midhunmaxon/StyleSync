import express from "express";
import {
    createProduct,
    getProducts,
    getProduct,
    filterProducts,
    updateProduct,
    deleteProduct,
    searchProducts,
    getTrendingProducts,
    getFeaturedProducts
} from "../controllers/productController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/trending", getTrendingProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/filter", filterProducts);
router.get("/:id", getProduct);

router.post("/", authMiddleware, adminMiddleware, createProduct);
router.put("/:id", authMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProduct);

export default router;
