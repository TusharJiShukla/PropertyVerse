import mongoose from "mongoose";

export interface IBroker extends mongoose.Document {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  location: string;
  cities: string[];
  licenseNumber?: string;
  experience: number;
  totalDeals: number;
  commission: number;
  verified: boolean;
  verifiedAt?: Date;
  kycStatus: "pending" | "verified" | "rejected";
  kycDocument?: string;
  status: "active" | "inactive" | "suspended";
  properties: mongoose.Types.ObjectId[];
  socialMedia?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
  profileImage?: string;
  bio?: string;
}

const brokerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // ✅ Only this is enough for unique index
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },
    alternatePhone: {
      type: String,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    cities: [{
      type: String,
      required: true,
    }],
    licenseNumber: {
      type: String,
      unique: true, // ✅ Only this is enough
      sparse: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
      max: 50,
    },
    totalDeals: {
      type: Number,
      default: 0,
      min: 0,
    },
    commission: {
      type: Number,
      default: 2,
      min: 0,
      max: 10,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    kycDocument: String,
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    properties: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    }],
    socialMedia: {
      linkedin: String,
      instagram: String,
      facebook: String,
    },
    profileImage: String,
    bio: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Only these indexes (text indexes don't conflict with unique)
// Remove the email and licenseNumber from here since they're already defined in schema
brokerSchema.index({ name: "text", location: "text", cities: "text" });
brokerSchema.index({ status: 1, verified: 1 });
brokerSchema.index({ createdAt: -1 }); // For sorting

const Broker = mongoose.model<IBroker>("Broker", brokerSchema);
export default Broker;