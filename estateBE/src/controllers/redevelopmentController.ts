import { Request, Response } from "express";
import Redevelopment from "../models/Redevelopment";

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const sendResponse = <T>(
  res: Response,
  status: number,
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
  meta?: any
) => {
  const response: ApiResponse<T> = { success, message, data, error, meta };
  res.status(status).json(response);
};

// Get all redevelopment projects
export const getRedevelopmentProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter: any = {};
    if (status) filter.status = status;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [projects, total] = await Promise.all([
      Redevelopment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Redevelopment.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    sendResponse(res, 200, true, projects, "Projects fetched successfully", undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get redevelopment projects error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch projects");
  }
};

// Get single redevelopment project
export const getRedevelopmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Redevelopment.findById(req.params.id).lean();
    
    if (!project) {
      sendResponse(res, 404, false, undefined, "Project not found");
      return;
    }
    
    sendResponse(res, 200, true, project, "Project fetched successfully");
  } catch (error) {
    console.error("Get redevelopment project error:", error);
    sendResponse(res, 500, false, undefined, "Failed to fetch project");
  }
};

// Create redevelopment project
export const createRedevelopmentProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, beforeImage, afterImage, timeline, amenities, status, units } = req.body;

    if (!name || !beforeImage || !afterImage || !timeline || !units) {
      sendResponse(res, 400, false, undefined, "Missing required fields: name, beforeImage, afterImage, timeline, units");
      return;
    }

    const project = await Redevelopment.create({
      name,
      beforeImage,
      afterImage,
      timeline,
      amenities: amenities || [],
      status: status || "Ongoing",
      units,
    });

    sendResponse(res, 201, true, project, "Project created successfully");
  } catch (error: any) {
    console.error("Create redevelopment project error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }
    
    sendResponse(res, 500, false, undefined, "Failed to create project");
  }
};

// Update redevelopment project
export const updateRedevelopmentProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingProject = await Redevelopment.findById(req.params.id);
    
    if (!existingProject) {
      sendResponse(res, 404, false, undefined, "Project not found");
      return;
    }

    const project = await Redevelopment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();

    sendResponse(res, 200, true, project, "Project updated successfully");
  } catch (error: any) {
    console.error("Update redevelopment project error:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      sendResponse(res, 400, false, undefined, messages.join(", "));
      return;
    }
    
    sendResponse(res, 500, false, undefined, "Failed to update project");
  }
};

// Delete redevelopment project
export const deleteRedevelopmentProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Redevelopment.findByIdAndDelete(req.params.id);
    
    if (!project) {
      sendResponse(res, 404, false, undefined, "Project not found");
      return;
    }
    
    sendResponse(res, 200, true, undefined, "Project deleted successfully");
  } catch (error) {
    console.error("Delete redevelopment project error:", error);
    sendResponse(res, 500, false, undefined, "Failed to delete project");
  }
};