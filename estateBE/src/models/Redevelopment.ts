import mongoose from "mongoose";

export interface IRedevelopment extends mongoose.Document {
  name: string;
  beforeImage: string;
  afterImage: string;
  timeline: string;
  amenities: string[];
  status: "Ongoing" | "Completed" | "Upcoming";
  units: number;
  createdAt: Date;
  updatedAt: Date;
}

const redevelopmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    beforeImage: {
      type: String,
      required: [true, "Before image is required"],
      match: [/^https?:\/\/.+|^data:image\/.+/, "Please provide a valid image URL or base64"],
    },
    afterImage: {
      type: String,
      required: [true, "After image is required"],
      match: [/^https?:\/\/.+|^data:image\/.+/, "Please provide a valid image URL or base64"],
    },
    timeline: {
      type: String,
      required: [true, "Timeline is required"],
    },
    amenities: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ["Ongoing", "Completed", "Upcoming"],
      default: "Ongoing",
    },
    units: {
      type: Number,
      required: [true, "Number of units is required"],
      min: [0, "Units cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
redevelopmentSchema.index({ status: 1 });
redevelopmentSchema.index({ createdAt: -1 });

const Redevelopment = mongoose.model<IRedevelopment>("Redevelopment", redevelopmentSchema);
export default Redevelopment;