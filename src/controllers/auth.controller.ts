import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/apiResponse";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    return sendSuccess(res, 201, "User registered successfully", result);
  };

  login = async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body.email, req.body.password);
    return sendSuccess(res, 200, "Login successful", result);
  };
}

