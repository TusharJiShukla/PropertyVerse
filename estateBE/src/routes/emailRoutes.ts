import express from "express";
import { sendEmail, getInquiries, updateInquiryStatus } from "../controllers/emailController";

const router = express.Router();

router.post("/send-email", sendEmail);
router.get("/inquiries", getInquiries);
router.patch("/inquiries/:id", updateInquiryStatus);

export default router;