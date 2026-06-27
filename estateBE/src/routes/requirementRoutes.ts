import express from "express";
import {
  createRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  getRequirementStats,
} from "../controllers/requirementController";

const router = express.Router();

router.post("/property-requirements", createRequirement);
router.get("/property-requirements", getRequirements);
router.get("/property-requirements/stats", getRequirementStats);
router.get("/property-requirements/:id", getRequirementById);
router.put("/property-requirements/:id", updateRequirement);
router.delete("/property-requirements/:id", deleteRequirement);

export default router;