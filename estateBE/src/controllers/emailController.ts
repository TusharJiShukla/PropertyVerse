import { Request, Response } from "express";
import { Email } from "../models/Email";
import sendMail from "../utility/sendMail";
import Property from "../models/Property";

const getClientIp = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.socket.remoteAddress || 
         'unknown';
};

export const sendEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      phone,
      businessName,
      businessDesc,
      inquiryType = "general",
      service,
      propertyId,
      projectDesc,
      budget,
      websiteType,
      existingWebsite,
      existingDesc,
    } = req.body;

    if (!fullName || !email || !phone || !projectDesc) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: fullName, email, phone, projectDesc",
      });
      return;
    }

    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property) {
        res.status(404).json({
          success: false,
          message: "Property not found",
        });
        return;
      }
    }

    const savedEmail = await Email.create({
      fullName,
      email,
      phone,
      businessName,
      businessDesc,
      inquiryType,
      service,
      propertyId,
      projectDesc,
      budget,
      websiteType,
      existingWebsite,
      existingDesc,
      userAgent: req.headers['user-agent'],
      ipAddress: getClientIp(req),
      status: "pending",
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #d6a243; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #d6a243; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Client Inquiry</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name:</span> ${fullName}
            </div>
            <div class="field">
              <span class="label">Email:</span> ${email}
            </div>
            <div class="field">
              <span class="label">Phone:</span> ${phone}
            </div>
            ${businessName ? `<div class="field"><span class="label">Business:</span> ${businessName}</div>` : ''}
            <div class="field">
              <span class="label">Inquiry Type:</span> ${inquiryType}
            </div>
            ${service ? `<div class="field"><span class="label">Service:</span> ${service}</div>` : ''}
            <div class="field">
              <span class="label">Project Description:</span>
              <p>${projectDesc}</p>
            </div>
            ${budget ? `<div class="field"><span class="label">Budget Range:</span> ₹${budget.min} - ₹${budget.max}</div>` : ''}
            <hr />
            <div class="field">
              <span class="label">Inquiry ID:</span> ${savedEmail._id}
            </div>
            <div class="field">
              <span class="label">Received:</span> ${new Date().toLocaleString()}
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification. Please respond within 24 hours.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendMail({
      to: process.env.ADMIN_EMAIL || "admin@example.com",
      subject: `New Inquiry: ${inquiryType} from ${fullName}`,
      html: emailHtml,
    });

    const autoReplyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 500px; margin: 0 auto; padding: 20px; }
          .logo { text-align: center; color: #d6a243; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h2>Thank you for contacting us!</h2>
          </div>
          <div class="content">
            <p>Dear ${fullName},</p>
            <p>We have received your inquiry and our team will get back to you within 24 hours.</p>
            <p>Your inquiry ID: <strong>${savedEmail._id}</strong></p>
            <p>For any urgent matters, please call us at +91-XXXXXXXXXX.</p>
            <br />
            <p>Best regards,<br />Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendMail({
      to: email,
      subject: "We've received your inquiry - Reference ID: " + savedEmail._id,
      html: autoReplyHtml,
    });

    res.status(200).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: {
        inquiryId: savedEmail._id,
        status: savedEmail.status,
      },
    });
  } catch (error) {
    console.error("Email submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit inquiry. Please try again later.",
    });
  }
};

export const getInquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, inquiryType, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (inquiryType) filter.inquiryType = inquiryType;
    
    const inquiries = await Email.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('propertyId', 'title location');
    
    const total = await Email.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: inquiries,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries",
    });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;
    const inquiry = await Email.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        notes,
        repliedAt: status === "replied" ? new Date() : undefined,
      },
      { new: true }
    );
    
    if (!inquiry) {
      res.status(404).json({ success: false, message: "Inquiry not found" });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: "Inquiry status updated",
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update inquiry",
    });
  }
};