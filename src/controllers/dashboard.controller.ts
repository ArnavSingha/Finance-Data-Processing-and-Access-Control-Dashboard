import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../utils/apiResponse";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  getSummary = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getSummary(req.query);
    return sendSuccess(res, 200, "Dashboard summary fetched successfully", result);
  };

  getCategoryBreakdown = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getCategoryBreakdown(req.query);
    return sendSuccess(res, 200, "Category breakdown fetched successfully", result);
  };

  getTrends = async (req: Request, res: Response) => {
    const result = await this.dashboardService.getTrends(req.query);
    return sendSuccess(res, 200, "Dashboard trends fetched successfully", result);
  };
}

