import express from "express";
import { getCompleteLook } from "../controllers/outfitController.js";

const router = express.Router();

router.get("/", getCompleteLook);

export default router;