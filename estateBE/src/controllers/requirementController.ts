import { Request, Response } from "express";
import Requirement from "../models/Requirement";

const sendResponse = (res: Response, status: number, success: boolean, data?: any, message?: string, error?: string, meta?: any) => {
  res.status(status).json({ success, message, data, error, meta });
};

export const createRequirement = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      details,
      location,
      type,
      budget,
      contactName,
      contactEmail,
      contactPhone,
      urgency,
      preferredPossession,
      bedrooms,
      area,
    } = req.body;

    if (!title || !details || !location || !type || !budget || !contactName || !contactEmail || !contactPhone) {
      sendResponse(res, 400, false, undefined, "Missing required fields");
      return;
    }

    if (budget.min > budget.max) {
      sendResponse(res, 400, false, undefined, "Minimum budget cannot exceed maximum budget");
      return;
    }

    const requirement = await Requirement.create({
      title,
      details,
      location,
      type,
      budget,
      contactName,
      contactEmail,
      contactPhone,
      urgency: urgency || "medium",
      preferredPossession: preferredPossession || "flexible",
      bedrooms,
      area,
      status: "open",
    });

    sendResponse(res, 201, true, requirement, "Requirement created successfully");
  } catch (error: any) {
    console.error("Create requirement error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }
    
    sendResponse(res, 500, false, undefined, "Failed to create requirement");
  }
};

export const getRequirements = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      urgency,
      type,
      location,
      minBudget,
      maxBudget,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (type) filter.type = type;
    if (location) filter.location = { $regex: new RegExp(location as string, "i") };
    
    if (minBudget || maxBudget) {
      filter["budget.max"] = {};
      if (minBudget) filter["budget.max"].$gte = Number(minBudget);
      if (maxBudget) filter["budget.max"].$lte = Number(maxBudget);
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const [requirements, total] = await Promise.all([
      Requirement.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Requirement.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(res, 200, true, requirements, "Requirements fetched successfully", undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get requirements error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch requirements");
  }
};

export const getRequirementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const requirement = await Requirement.findById(req.params.id).lean();
    
    if (!requirement) {
      sendResponse(res, 404, false, undefined, "Requirement not found");
      return;
    }
    
    sendResponse(res, 200, true, requirement, "Requirement fetched successfully");
  } catch (error) {
    console.error("Get requirement error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch requirement");
  }
};

export const updateRequirement = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingRequirement = await Requirement.findById(req.params.id);
    
    if (!existingRequirement) {
      sendResponse(res, 404, false, undefined, "Requirement not found");
      return;
    }

    if (req.body.budget && req.body.budget.min > req.body.budget.max) {
      sendResponse(res, 400, false, undefined, "Minimum budget cannot exceed maximum budget");
      return;
    }

    const requirement = await Requirement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    sendResponse(res, 200, true, requirement, "Requirement updated successfully");
  } catch (error: any) {
    console.error("Update requirement error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }
    
    sendResponse(res, 500, false, undefined, "Failed to update requirement");
  }
};

export const deleteRequirement = async (req: Request, res: Response): Promise<void> => {
  try {
    const requirement = await Requirement.findByIdAndDelete(req.params.id);
    
    if (!requirement) {
      sendResponse(res, 404, false, undefined, "Requirement not found");
      return;
    }
    
    sendResponse(res, 200, true, undefined, "Requirement deleted successfully");
  } catch (error) {
    console.error("Delete requirement error:", error);
    sendResponse(res, 500, false, undefined, "Failed to delete requirement");
  }
};

export const getRequirementStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, byStatus, byUrgency, byType] = await Promise.all([
      Requirement.countDocuments(),
      Requirement.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Requirement.aggregate([{ $group: { _id: "$urgency", count: { $sum: 1 } } }]),
      Requirement.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
    ]);

    sendResponse(res, 200, true, {
      total,
      byStatus: Object.fromEntries(byStatus.map((item: any) => [item._id, item.count])),
      byUrgency: Object.fromEntries(byUrgency.map((item: any) => [item._id, item.count])),
      byType: Object.fromEntries(byType.map((item: any) => [item._id, item.count])),
    }, "Stats fetched successfully");
  } catch (error) {
    console.error("Get stats error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch stats");
  }
};