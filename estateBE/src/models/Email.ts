import mongoose from "mongoose";

export interface IEmail extends mongoose.Document {
  fullName: string;
  email: string;
  phone: string;
  businessName?: string;
  businessDesc?: string;
  inquiryType: "general" | "property" | "partnership" | "support" | "feedback";
  service?: "website" | "marketing" | "consulting" | "other";
  propertyId?: mongoose.Types.ObjectId;
  projectDesc: string;
  budget?: {
    min: number;
    max: number;
  };
  websiteType?: "business" | "ecommerce" | "portfolio" | "blog" | "other";
  existingWebsite?: string;
  existingDesc?: string;
  status: "pending" | "read" | "replied" | "resolved" | "spam";
  repliedAt?: Date;
  repliedBy?: string;
  notes?: string;
  userAgent?: string;
  ipAddress?: string;
}

const emailSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },
    businessName: {
      type: String,
      trim: true,
    },
    businessDesc: {
      type: String,
      maxlength: 500,
    },
    inquiryType: {
      type: String,
      enum: ["general", "property", "partnership", "support", "feedback"],
      default: "general",
    },
    service: {
      type: String,
      enum: ["website", "marketing", "consulting", "other"],
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    projectDesc: {
      type: String,
      required: [true, "Project description is required"],
      maxlength: 2000,
    },
    budget: {
      min: Number,
      max: Number,
    },
    websiteType: {
      type: String,
      enum: ["business", "ecommerce", "portfolio", "blog", "other"],
    },
    existingWebsite: {
      type: String,
      match: [/^https?:\/\/.+/, "Please enter a valid URL"],
    },
    existingDesc: String,
    status: {
      type: String,
      enum: ["pending", "read", "replied", "resolved", "spam"],
      default: "pending",
    },
    repliedAt: Date,
    repliedBy: String,
    notes: String,
    userAgent: String,
    ipAddress: String,
  },
  {
    timestamps: true,
  }
);

emailSchema.index({ email: 1, status: 1 });
emailSchema.index({ createdAt: -1 });
emailSchema.index({ inquiryType: 1 });

export const Email = mongoose.model<IEmail>("Email", emailSchema);