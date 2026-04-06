import { Request, Response } from "express";
import { sendSuccess } from "../utils/apiResponse";

export const notFound = (req: Request, res: Response): Response => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errors: [],
    timestamp: new Date().toISOString()
  });
};

