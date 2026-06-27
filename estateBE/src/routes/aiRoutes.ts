import express from "express";
import { getNeighborhoodInsights, generateMatchScore } from "../controllers/aiController";

const router = express.Router();

router.get("/neighborhood-insights/:propertyId", getNeighborhoodInsights);
router.post("/match-score", generateMatchScore);

export default router;
