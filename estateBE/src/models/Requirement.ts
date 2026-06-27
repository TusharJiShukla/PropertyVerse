import mongoose from "mongoose";

export interface IRequirement extends mongoose.Document {
  title: string;
  details: string;
  location: string;
  type: "residential" | "commercial";
  budget: {
    min: number;
    max: number;
  };
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  urgency: "low" | "medium" | "high" | "urgent";
  status: "open" | "negotiating" | "closed" | "expired";
  preferredPossession: "immediate" | "within-3-months" | "within-6-months" | "flexible";
  bedrooms?: number;
  area?: number;
}

const requirementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    details: {
      type: String,
      required: [true, "Details are required"],
      maxlength: 2000,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    type: {
      type: String,
      enum: ["residential", "commercial"],
      required: true,
    },
    budget: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    contactName: {
      type: String,
      required: [true, "Contact name is required"],
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "negotiating", "closed", "expired"],
      default: "open",
    },
    preferredPossession: {
      type: String,
      enum: ["immediate", "within-3-months", "within-6-months", "flexible"],
      default: "flexible",
    },
    bedrooms: {
      type: Number,
      min: 0,
    },
    area: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

requirementSchema.index({ status: 1, urgency: 1 });
requirementSchema.index({ location: 1, type: 1 });
requirementSchema.index({ createdAt: -1 });

const Requirement = mongoose.model<IRequirement>("Requirement", requirementSchema);
export default Requirement;