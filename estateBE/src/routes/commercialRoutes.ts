import express from "express";
import {
  getCommercialProjects,
  getCommercialById,
  createCommercialProject,
  updateCommercialProject,
  deleteCommercialProject,
} from "../controllers/commercialController";

const router = express.Router();

router.get("/commercial", getCommercialProjects);
router.get("/commercial/:id", getCommercialById);
router.post("/commercial", createCommercialProject);
router.put("/commercial/:id", updateCommercialProject);
router.delete("/commercial/:id", deleteCommercialProject);

export default router;