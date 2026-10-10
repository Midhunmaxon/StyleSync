import express from "express";
import registerUser from "../controllers/authController.js";
import loginUser from "../controllers/loginController.js";
import getCurrentUser from "../controllers/getCurrentUser.js";
import logoutUser from "../controllers/logoutController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
