import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { AuthController } from "./controllers/auth.controller";
import { DashboardController } from "./controllers/dashboard.controller";
import { RecordController } from "./controllers/record.controller";
import { UserController } from "./controllers/user.controller";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import { FinancialRecordRepository } from "./repositories/financialRecord.repository";
import { UserRepository } from "./repositories/user.repository";
import { createRoutes } from "./routes";
import { AuthService } from "./services/auth.service";
import { DashboardService } from "./services/dashboard.service";
import { RecordService } from "./services/record.service";
import { UserService } from "./services/user.service";

const userRepository = new UserRepository();
const financialRecordRepository = new FinancialRecordRepository();

const authService = new AuthService(userRepository);
const userService = new UserService(userRepository);
const recordService = new RecordService(financialRecordRepository);
const dashboardService = new DashboardService(financialRecordRepository);

const authController = new AuthController(authService);
const userController = new UserController(userService);
const recordController = new RecordController(recordService);
const dashboardController = new DashboardController(dashboardService);

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Finance Dashboard Backend API",
    data: {
      status: "ok",
      docs: "/api-docs",
      health: "/health",
      apiBase: "/api/v1"
    }
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    data: {
      status: "ok"
    }
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(
  "/api/v1",
  createRoutes({
    authController,
    userController,
    recordController,
    dashboardController
  })
);

app.use(notFound);
app.use(errorHandler);

export { authService };
