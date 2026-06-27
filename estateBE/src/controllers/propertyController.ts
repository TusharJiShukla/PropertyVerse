import { Request, Response } from "express";
import Property from "../models/Property";
import { ApiResponse } from "../types/response.types";
import { getCoordinatesFromCity } from "../utility/geocode";

const sendResponse = <T>(
  res: Response,
  status: number,
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
  meta?: any,
) => {
  const response: ApiResponse<T> = { success, message, data, error, meta };
  res.status(status).json(response);
};

export const getProperties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      city,
      type,
      minPrice,
      maxPrice,
      bedrooms,
      availability,
      featured,
      search,
    } = req.query;

    const filter: any = {};

    if (city) filter.city = { $regex: new RegExp(city as string, "i") };
    if (type) filter.type = type;
    if (availability) filter.availability = availability;
    if (featured === "true") filter.featured = true;
    if (bedrooms) filter.bedrooms = Number(bedrooms);

    if (minPrice || maxPrice) {
      filter.discountedPrice = {};
      if (minPrice) filter.discountedPrice.$gte = Number(minPrice);
      if (maxPrice) filter.discountedPrice.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search as string, "i") } },
        { description: { $regex: new RegExp(search as string, "i") } },
        { location: { $regex: new RegExp(search as string, "i") } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const [properties, total] = await Promise.all([
      Property.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Property.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(
      res,
      200,
      true,
      properties,
      "Properties fetched successfully",
      undefined,
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    );
  } catch (error) {
    console.error("Get properties error:", error);
    sendResponse(
      res,
      500,
      false,
      undefined,
      undefined,
      "Failed to fetch properties",
    );
  }
};

export const getPropertyById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const property = await Property.findById(req.params.id).lean();

    if (!property) {
      sendResponse(res, 404, false, undefined, undefined, "Property not found");
      return;
    }

    sendResponse(res, 200, true, property, "Property fetched successfully");
  } catch (error) {
    console.error("Get property by ID error:", error);
    sendResponse(
      res,
      500,
      false,
      undefined,
      undefined,
      "Failed to fetch property",
    );
  }
};

export const createProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const requiredFields = [
      "title",
      "location",
      "city",
      "originalPrice",
      "discountedPrice",
      "area",
      "type",
      "bedrooms",
      "image",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      sendResponse(
        res,
        400,
        false,
        undefined,
        `Missing required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    if (req.body.discountedPrice > req.body.originalPrice) {
      sendResponse(
        res,
        400,
        false,
        undefined,
        "Discounted price cannot exceed original price",
      );
      return;
    }

    // Auto-fetch coordinates if they weren't provided manually
    if (!req.body.coordinates) {
      const searchString = req.body.city || req.body.location;
      const coords = await getCoordinatesFromCity(searchString);
      if (coords) {
        // Add tiny random offset to prevent direct overlaps for same city queries
        req.body.coordinates = {
          lat: coords.lat + (Math.random() - 0.5) * 0.01,
          lng: coords.lng + (Math.random() - 0.5) * 0.01,
        };
      }
    }

    const property = await Property.create(req.body);
    sendResponse(res, 201, true, property, "Property created successfully");
  } catch (error: any) {
    console.error("Create property error:", error);

    if (error.code === 11000) {
      sendResponse(
        res,
        409,
        false,
        undefined,
        "Property with this data already exists",
      );
      return;
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }

    sendResponse(res, 500, false, undefined, "Failed to create property");
  }
};

export const updateProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const existingProperty = await Property.findById(req.params.id);
    if (!existingProperty) {
      sendResponse(res, 404, false, undefined, undefined, "Property not found");
      return;
    }

    // Debug logs
    console.log("=== UPDATE PROPERTY ===");
    console.log(
      "Existing Original Price:",
      existingProperty.originalPrice,
      "Type:",
      typeof existingProperty.originalPrice,
    );
    console.log(
      "Existing Discounted Price:",
      existingProperty.discountedPrice,
      "Type:",
      typeof existingProperty.discountedPrice,
    );
    console.log("Request body:", req.body);

    // Ensure numeric values
    const discountedPrice = Number(req.body.discountedPrice);
    const originalPrice =
      Number(req.body.originalPrice) || existingProperty.originalPrice;

    console.log(
      "Computed Original:",
      originalPrice,
      "Computed Discounted:",
      discountedPrice,
    );
    console.log("Is discounted > original?", discountedPrice > originalPrice);

    // Validation with proper number comparison
    if (req.body.discountedPrice !== undefined) {
      const discountValue = Number(req.body.discountedPrice);
      const originalValue = req.body.originalPrice
        ? Number(req.body.originalPrice)
        : existingProperty.originalPrice;

      if (discountValue > originalValue) {
        sendResponse(
          res,
          400,
          false,
          undefined,
          `Discounted price (${discountValue}) cannot exceed original price (${originalValue})`,
        );
        return;
      }
    }

    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();

    sendResponse(res, 200, true, property, "Property updated successfully");
  } catch (error: any) {
    console.error("Update property error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }

    sendResponse(res, 500, false, undefined, "Failed to update property");
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      sendResponse(res, 404, false, undefined, undefined, "Property not found");
      return;
    }

    sendResponse(res, 200, true, undefined, "Property deleted successfully");
  } catch (error) {
    console.error("Delete property error:", error);
    sendResponse(res, 500, false, undefined, "Failed to delete property");
  }
};

export const getUniqueCities = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cities = await Property.distinct('city');
    // Filter out null, undefined, and empty strings
    const validCities = cities.filter(city => city && city.trim() !== '');
    sendResponse(res, 200, true, validCities.sort(), 'Cities fetched successfully');
  } catch (error) {
    console.error('Get cities error:', error);
    sendResponse(res, 500, false, undefined, 'Failed to fetch cities');
  }
};

export const getPropertyStats = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const [total, byType, byAvailability, priceStats] = await Promise.all([
      Property.countDocuments(),
      Property.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      Property.aggregate([
        { $group: { _id: "$availability", count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        {
          $group: {
            _id: null,
            avgPrice: { $avg: "$discountedPrice" },
            minPrice: { $min: "$discountedPrice" },
            maxPrice: { $max: "$discountedPrice" },
          },
        },
      ]),
    ]);

    sendResponse(
      res,
      200,
      true,
      {
        total,
        byType: Object.fromEntries(
          byType.map((item: any) => [item._id, item.count]),
        ),
        byAvailability: Object.fromEntries(
          byAvailability.map((item: any) => [item._id, item.count]),
        ),
        priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 },
      },
      "Stats fetched successfully",
    );
  } catch (error) {
    console.error("Get stats error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch stats");
  }
};
