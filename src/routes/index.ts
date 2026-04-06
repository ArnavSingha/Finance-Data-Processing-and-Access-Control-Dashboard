import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { DashboardController } from "../controllers/dashboard.controller";
import { RecordController } from "../controllers/record.controller";
import { UserController } from "../controllers/user.controller";
import { createAuthRoutes } from "./auth.routes";
import { createDashboardRoutes } from "./dashboard.routes";
import { createRecordRoutes } from "./record.routes";
import { createUserRoutes } from "./user.routes";

type RouteDependencies = {
  authController: AuthController;
  userController: UserController;
  recordController: RecordController;
  dashboardController: DashboardController;
};

export const createRoutes = ({
  authController,
  userController,
  recordController,
  dashboardController
}: RouteDependencies): Router => {
  const router = Router();

  router.use("/auth", createAuthRoutes(authController));
  router.use("/users", createUserRoutes(userController));
  router.use("/records", createRecordRoutes(recordController));
  router.use("/dashboard", createDashboardRoutes(dashboardController));

  return router;
};

