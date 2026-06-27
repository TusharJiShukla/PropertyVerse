import { Request, Response } from "express";
import Broker from "../models/Broker";

const sendResponse = (res: Response, status: number, success: boolean, data?: any, message?: string, error?: string, meta?: any) => {
  res.status(status).json({ success, message, data, error, meta });
};

export const createBroker = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      alternatePhone,
      location,
      cities,
      licenseNumber,
      experience,
      commission,
      socialMedia,
      profileImage,
      bio,
    } = req.body;

    if (!name || !email || !phone || !location || !cities || cities.length === 0) {
      sendResponse(res, 400, false, undefined, "Missing required fields: name, email, phone, location, cities");
      return;
    }

    const existingBroker = await Broker.findOne({ email });
    if (existingBroker) {
      sendResponse(res, 409, false, undefined, "Broker with this email already exists");
      return;
    }

    const broker = await Broker.create({
      name,
      email,
      phone,
      alternatePhone,
      location,
      cities,
      licenseNumber,
      experience: experience || 0,
      commission: commission || 2,
      socialMedia,
      profileImage,
      bio,
      verified: false,
      kycStatus: "pending",
      status: "active",
      totalDeals: 0,
    });

    sendResponse(res, 201, true, broker, "Broker created successfully");
  } catch (error: any) {
    console.error("Create broker error:", error);
    
    if (error.code === 11000) {
      sendResponse(res, 409, false, undefined, "Broker with this license number already exists");
      return;
    }
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }
    
    sendResponse(res, 500, false, undefined, "Failed to create broker");
  }
};

export const getBrokers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      status,
      verified,
      minExperience,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter: any = {};
    if (city) filter.cities = city;
    if (status) filter.status = status;
    if (verified === "true") filter.verified = true;
    if (verified === "false") filter.verified = false;
    if (minExperience) filter.experience = { $gte: Number(minExperience) };
    
    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search as string, "i") } },
        { location: { $regex: new RegExp(search as string, "i") } },
        { bio: { $regex: new RegExp(search as string, "i") } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const [brokers, total] = await Promise.all([
      Broker.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("properties", "title location type")
        .lean(),
      Broker.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(res, 200, true, brokers, "Brokers fetched successfully", undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get brokers error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch brokers");
  }
};

export const getBrokerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const broker = await Broker.findById(req.params.id)
      .populate("properties", "title location type discountedPrice image")
      .lean();
    
    if (!broker) {
      sendResponse(res, 404, false, undefined, "Broker not found");
      return;
    }
    
    sendResponse(res, 200, true, broker, "Broker fetched successfully");
  } catch (error) {
    console.error("Get broker error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch broker");
  }
};

export const updateBroker = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingBroker = await Broker.findById(req.params.id);
    
    if (!existingBroker) {
      sendResponse(res, 404, false, undefined, "Broker not found");
      return;
    }

    if (req.body.email && req.body.email !== existingBroker.email) {
      const emailExists = await Broker.findOne({ email: req.body.email });
      if (emailExists) {
        sendResponse(res, 409, false, undefined, "Email already in use by another broker");
        return;
      }
    }

    const broker = await Broker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    sendResponse(res, 200, true, broker, "Broker updated successfully");
  } catch (error: any) {
    console.error("Update broker error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }
    
    sendResponse(res, 500, false, undefined, "Failed to update broker");
  }
};

export const deleteBroker = async (req: Request, res: Response): Promise<void> => {
  try {
    const broker = await Broker.findByIdAndDelete(req.params.id);
    
    if (!broker) {
      sendResponse(res, 404, false, undefined, "Broker not found");
      return;
    }
    
    sendResponse(res, 200, true, undefined, "Broker deleted successfully");
  } catch (error) {
    console.error("Delete broker error:", error);
    sendResponse(res, 500, false, undefined, "Failed to delete broker");
  }
};

export const verifyBroker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { kycStatus, verified, notes } = req.body;
    
    const broker = await Broker.findByIdAndUpdate(
      req.params.id,
      {
        kycStatus,
        verified: verified || kycStatus === "verified",
        verifiedAt: kycStatus === "verified" ? new Date() : undefined,
        notes,
      },
      { new: true }
    );
    
    if (!broker) {
      sendResponse(res, 404, false, undefined, "Broker not found");
      return;
    }
    
    sendResponse(res, 200, true, broker, `Broker ${kycStatus} successfully`);
  } catch (error) {
    console.error("Verify broker error:", error);
    sendResponse(res, 500, false, undefined, "Failed to verify broker");
  }
};

export const addBrokerProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.body;
    
    const broker = await Broker.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { properties: propertyId } },
      { new: true }
    ).populate("properties", "title location");
    
    if (!broker) {
      sendResponse(res, 404, false, undefined, "Broker not found");
      return;
    }
    
    sendResponse(res, 200, true, broker, "Property added to broker successfully");
  } catch (error) {
    console.error("Add property error:", error);
    sendResponse(res, 500, false, undefined, "Failed to add property to broker");
  }
};

export const getBrokerStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, verified, byStatus] = await Promise.all([
      Broker.countDocuments(),
      Broker.countDocuments({ verified: true }),
      Broker.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    sendResponse(res, 200, true, {
      total,
      verified,
      unverified: total - verified,
      byStatus: Object.fromEntries(byStatus.map((item: any) => [item._id, item.count])),
    }, "Stats fetched successfully");
  } catch (error) {
    console.error("Get stats error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch stats");
  }
};