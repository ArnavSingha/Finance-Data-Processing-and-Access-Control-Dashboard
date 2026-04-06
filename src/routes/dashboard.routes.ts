import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { UserRole } from "../utils/enums";
import {
  categoryBreakdownSchema,
  summarySchema,
  trendsSchema
} from "../validations/dashboard.validation";

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get total income, total expenses, and net balance
 * /dashboard/category-breakdown:
 *   get:
 *     summary: Get grouped totals by type and category
 * /dashboard/trends:
 *   get:
 *     summary: Get monthly record totals for dashboard trends
 */
export const createDashboardRoutes = (dashboardController: DashboardController): Router => {
  const router = Router();

  router.use(authenticate, authorize(UserRole.Analyst, UserRole.Admin));

  router.get(
    "/summary",
    validate(summarySchema),
    asyncHandler(dashboardController.getSummary)
  );
  router.get(
    "/category-breakdown",
    validate(categoryBreakdownSchema),
    asyncHandler(dashboardController.getCategoryBreakdown)
  );
  router.get(
    "/trends",
    validate(trendsSchema),
    asyncHandler(dashboardController.getTrends)
  );

  return router;
};

