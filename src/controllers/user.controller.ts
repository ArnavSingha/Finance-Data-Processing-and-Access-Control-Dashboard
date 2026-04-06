import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/apiResponse";

export class UserController {
  constructor(private readonly userService: UserService) {}

  listUsers = async (req: Request, res: Response) => {
    const result = await this.userService.listUsers(req.query);
    return sendSuccess(res, 200, "Users fetched successfully", result.items, result.meta);
  };

  updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.userService.updateStatus(id, req.body.status);
    return sendSuccess(res, 200, "User status updated successfully", result);
  };

  updateRole = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await this.userService.updateRole(id, req.body.role);
    return sendSuccess(res, 200, "User role updated successfully", result);
  };
}
