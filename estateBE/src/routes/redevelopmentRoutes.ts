import express from "express";
import {
  getRedevelopmentProjects,
  getRedevelopmentById,
  createRedevelopmentProject,
  updateRedevelopmentProject,
  deleteRedevelopmentProject,
} from "../controllers/redevelopmentController";

const router = express.Router();

router.get("/redevelopment", getRedevelopmentProjects);
router.get("/redevelopment/:id", getRedevelopmentById);
router.post("/redevelopment", createRedevelopmentProject);
router.put("/redevelopment/:id", updateRedevelopmentProject);
router.delete("/redevelopment/:id", deleteRedevelopmentProject);

export default router;