import { NextFunction, Request, Response } from "express";
import { ZodTypeAny, z } from "zod";
import { ApiError } from "../utils/apiError";

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      next(
        new ApiError(
          400,
          "Validation failed",
          result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        )
      );
      return;
    }

    const parsed = result.data as {
      body?: Request["body"];
      query?: Request["query"];
      params?: Request["params"];
    };

    if (parsed.body) {
      req.body = parsed.body;
    }

    if (parsed.query) {
      Object.keys(req.query).forEach((key) => {
        delete req.query[key];
      });
      Object.assign(req.query, parsed.query as Request["query"]);
    }

    if (parsed.params) {
      req.params = parsed.params;
    }

    next();
  };
};
