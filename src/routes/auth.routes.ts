import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validations/auth.validation";

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a Viewer or Analyst user
 * /auth/login:
 *   post:
 *     summary: Authenticate a user and return a JWT
 */
export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  const authLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false
  });

  router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    asyncHandler(authController.register)
  );

  router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    asyncHandler(authController.login)
  );

  return router;
};

