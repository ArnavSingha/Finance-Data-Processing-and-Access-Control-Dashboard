import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { ApiError } from "../utils/apiError";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors ?? [],
      timestamp: new Date().toISOString()
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      })),
      timestamp: new Date().toISOString()
    });
  }

  logger.error("Unhandled application error", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    errors: [],
    timestamp: new Date().toISOString()
  });
};

