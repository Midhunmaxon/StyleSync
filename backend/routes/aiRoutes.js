import express from "express";
import { getStylistRecommendations } from "../controllers/aiController.js";

const router = express.Router();

router.post("/stylist", getStylistRecommendations);

export default router;
