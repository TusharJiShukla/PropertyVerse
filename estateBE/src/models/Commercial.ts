import mongoose from "mongoose";

export interface ICommercial extends mongoose.Document {
  name: string;
  image: string;
  location: string;
  type: string;
  completion: "Ready to Move" | "Under Construction" | "Pre-Launch";
  createdAt: Date;
  updatedAt: Date;
}

const commercialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Project image is required"],
      match: [/^https?:\/\/.+|^data:image\/.+/, "Please provide a valid image URL or base64"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Property type is required"],
      trim: true,
    },
    completion: {
      type: String,
      enum: ["Ready to Move", "Under Construction", "Pre-Launch"],
      default: "Ready to Move",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
commercialSchema.index({ completion: 1 });
commercialSchema.index({ location: 1 });
commercialSchema.index({ createdAt: -1 });

const Commercial = mongoose.model<ICommercial>("Commercial", commercialSchema);
export default Commercial;