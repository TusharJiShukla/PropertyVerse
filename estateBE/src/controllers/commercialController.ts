import { Request, Response } from "express";
import Commercial from "../models/Commercial";

const sendResponse = <T>(
  res: Response,
  status: number,
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
  meta?: any
) => {
  res.status(status).json({ success, message, data, error, meta });
};

// Get all commercial projects
export const getCommercialProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, completion, location } = req.query;

    const filter: any = {};
    if (completion) filter.completion = completion;
    if (location) filter.location = { $regex: new RegExp(location as string, "i") };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Commercial.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Commercial.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(res, 200, true, projects, "Projects fetched successfully", undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get commercial projects error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch projects");
  }
};

// Get single commercial project
export const getCommercialById = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Commercial.findById(req.params.id).lean();
    
    if (!project) {
      sendResponse(res, 404, false, undefined, "Project not found");
      return;
    }
    
    sendResponse(res, 200, true, project, "Project fetched successfully");
  } catch (error) {
    console.error("Get commercial project error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch project");
  }
};

// Create commercial project
export const createCommercialProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, image, location, type, completion } = req.body;

    if (!name || !image || !location || !type) {
      sendResponse(res, 400, false, undefined, "Missing required fields: name, image, location, type");
      return;
    }

    const project = await Commercial.create({
      name,
      image,
      location,
      type,
      completion: completion || "Ready to Move",
    });

    sendResponse(res, 201, true, project, "Project created successfully");
  } catch (error: any) {
    console.error("Create commercial project error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }
    
    sendResponse(res, 500, false, undefined, "Failed to create project");
  }
};

// Update commercial project
export const updateCommercialProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingProject = await Commercial.findById(req.params.id);
    
    if (!existingProject) {
      sendResponse(res, 404, false, undefined, "Project not found");
      return;
    }

    const project = await Commercial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    sendResponse(res, 200, true, project, "Project updated successfully");
  } catch (error: any) {
    console.error("Update commercial project error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }
    
    sendResponse(res, 500, false, undefined, "Failed to update project");
  }
};

// Delete commercial project
export const deleteCommercialProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Commercial.findByIdAndDelete(req.params.id);
    
    if (!project) {
      sendResponse(res, 404, false, undefined, "Project not found");
      return;
    }
    
    sendResponse(res, 200, true, undefined, "Project deleted successfully");
  } catch (error) {
    console.error("Delete commercial project error:", error);
    sendResponse(res, 500, false, undefined, "Failed to delete project");
  }
};