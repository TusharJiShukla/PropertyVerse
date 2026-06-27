import express from "express";
import {
  createBroker,
  getBrokers,
  getBrokerById,
  updateBroker,
  deleteBroker,
  verifyBroker,
  addBrokerProperty,
  getBrokerStats,
} from "../controllers/brokerController";

const router = express.Router();

router.post("/brokers", createBroker);
router.get("/brokers", getBrokers);
router.get("/brokers/stats", getBrokerStats);
router.get("/brokers/:id", getBrokerById);
router.put("/brokers/:id", updateBroker);
router.delete("/brokers/:id", deleteBroker);
router.patch("/brokers/:id/verify", verifyBroker);
router.post("/brokers/:id/properties", addBrokerProperty);

export default router;