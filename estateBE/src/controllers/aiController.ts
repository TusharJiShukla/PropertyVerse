import { Request, Response } from "express";
import Property from "../models/Property";
import { GoogleGenAI } from "@google/genai";
import { ApiResponse } from "../types/response.types";

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

export const getNeighborhoodInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) {
      sendResponse(res, 404, false, undefined, undefined, "Property not found");
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      sendResponse(res, 500, false, undefined, undefined, "Server configuration error: Gemini API key is missing.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Act as an expert real estate agent. Provide a short, 3-sentence neighborhood insight about the area around ${property.location}, ${property.city}. Focus on walkability, schools, safety, and lifestyle vibe. Make it sound appealing to a potential homebuyer.`;
    
    const aiResponse = await ai.models.generateContent({
      model: "gemini-flash-lite-latest", // Updated to the lite model as requested
      contents: prompt
    });

    sendResponse(
      res,
      200,
      true,
      { insight: aiResponse.text },
      "Neighborhood insights fetched successfully"
    );
  } catch (error) {
    console.error("AI Insights Error:", error);
    sendResponse(res, 500, false, undefined, undefined, "Failed to generate AI insights");
  }
};

export const generateMatchScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userRequirements, propertyDetails } = req.body;

    if (!userRequirements || !propertyDetails) {
      sendResponse(res, 400, false, undefined, undefined, "Missing userRequirements or propertyDetails");
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      sendResponse(res, 500, false, undefined, undefined, "Server configuration error: Gemini API key is missing.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
    Act as a Real Estate AI Matchmaker. 
    User is looking for: "${userRequirements}"
    
    Property Details:
    - Title: ${propertyDetails.title}
    - Type: ${propertyDetails.type}
    - Location: ${propertyDetails.location}, ${propertyDetails.city}
    - Price: ${propertyDetails.discountedPrice}
    - Area: ${propertyDetails.area} ${propertyDetails.areaUnit}
    - Bedrooms: ${propertyDetails.bedrooms}
    - Bathrooms: ${propertyDetails.bathrooms}
    
    Evaluate how well this property matches the user's needs.
    You MUST return ONLY a valid JSON object with exactly two keys:
    1. "score": a number from 0 to 100 representing the match percentage.
    2. "reason": a single sentence explaining why it's a good or bad fit.
    `;
    
    const aiResponse = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    let matchData;
    try {
      matchData = JSON.parse(aiResponse.text || "{}");
      if (typeof matchData.score !== 'number' || typeof matchData.reason !== 'string') {
        throw new Error("Invalid schema");
      }
    } catch (parseError) {
      console.warn("Failed to parse Gemini Match Score JSON:", parseError);
      // Graceful fallback if Gemini hallucinates formatting
      matchData = {
        score: 50,
        reason: "Could not fully analyze the match at this time, but this property has interesting features."
      };
    }

    sendResponse(
      res,
      200,
      true,
      matchData,
      "Match score generated successfully"
    );
  } catch (error) {
    console.error("AI Match Score Error:", error);
    sendResponse(res, 500, false, undefined, undefined, "Failed to generate match score");
  }
};
