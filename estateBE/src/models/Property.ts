import mongoose from "mongoose";

// Price unit: All prices are in INR (Rupees)
// Example: 1.5 Cr = 15,000,000, 50 Lakhs = 5,000,000
export interface IProperty extends mongoose.Document {
  title: string;
  location: string;
  city: string; // NEW: Separate city field for better filtering
  originalPrice: number; // in INR
  discountedPrice: number; // in INR
  area: number; // in sq.ft
  areaUnit: "sqft" | "sqm" | "acre"; // NEW: Area unit
  type: "flat" | "office" | "industrial" | "plot";
  bedrooms: number;
  bathrooms: number; // NEW: Bathrooms count
  availability: "available" | "sold" | "pending";
  image: string;
  images?: string[]; // NEW: Multiple images support
  featured?: boolean; // NEW: Featured properties
  description?: string; // NEW: Detailed description
  yearBuilt?: number; // NEW: Construction year
  coordinates?: {
    lat: number;
    lng: number;
  };
}

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      index: true, // For faster filtering
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      required: [true, "Discounted price is required"],
      min: [0, "Price cannot be negative"],
      // Remove the validator from schema level for update operations
      // We'll handle validation in controller instead
    },
    area: {
      type: Number,
      required: [true, "Area is required"],
      min: [0, "Area cannot be negative"],
    },
    areaUnit: {
      type: String,
      enum: ["sqft", "sqm", "acre"],
      default: "sqft",
    },
    type: {
      type: String,
      enum: {
        values: ["flat", "office", "industrial", "plot"],
        message: "{VALUE} is not a valid property type",
      },
      required: [true, "Property type is required"],
      index: true,
    },
    bedrooms: {
      type: Number,
      required: [true, "Bedrooms count is required"],
      min: [0, "Bedrooms cannot be negative"],
    },
    bathrooms: {
      type: Number,
      default: 1,
      min: [0, "Bathrooms cannot be negative"],
    },
    availability: {
      type: String,
      enum: {
        values: ["available", "sold", "pending"],
        message: "{VALUE} is not a valid availability status",
      },
      default: "available",
      index: true,
    },
    image: {
      type: String,
      required: [true, "Main image is required"],
      validate: {
        validator: function (v: string) {
          // URL validation OR base64 image validation
          const isValidUrl = /^https?:\/\/.+/.test(v);
          const isValidBase64 =
            /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(v);
          return isValidUrl || isValidBase64;
        },
        message: "Please provide a valid image URL or base64 image",
      },
    },
    images: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return v.every((url) => /^https?:\/\/.+/.test(url));
        },
        message: "All image URLs must be valid",
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    yearBuilt: {
      type: Number,
      min: [1800, "Year must be after 1800"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    coordinates: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      }
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual field for discount percentage
propertySchema.virtual("discountPercentage").get(function (this: any) {
  if (this.originalPrice === 0) return 0;
  return Math.round(
    ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100,
  );
});

// Indexes for better query performance
propertySchema.index({ city: 1, type: 1, availability: 1 });
propertySchema.index({ discountedPrice: 1 });
propertySchema.index({ createdAt: -1 });

const Property = mongoose.model<IProperty>("Property", propertySchema);
export default Property;
