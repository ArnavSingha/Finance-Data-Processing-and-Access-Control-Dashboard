import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/apiError";
import { UserRole, UserStatus } from "../utils/enums";
import { signAccessToken } from "../utils/token";
import { env } from "../config/env";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
};

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(payload: RegisterPayload) {
    const existingUser = await this.userRepository.findByEmail(payload.email);

    if (existingUser) {
      throw new ApiError(409, "Email is already registered", [
        { field: "email", message: "Email is already registered" }
      ]);
    }

    const role = payload.role ?? UserRole.Viewer;

    if (role === UserRole.Admin) {
      throw new ApiError(403, "Admin cannot be created via public registration");
    }

    const password = await bcrypt.hash(payload.password, 10);
    const user = await this.userRepository.create({
      name: payload.name,
      email: payload.email,
      password,
      role,
      status: UserStatus.Active
    });

    return {
      user: user.toJSON()
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (user.status !== UserStatus.Active) {
      throw new ApiError(403, "User account is inactive");
    }

    const token = signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role as UserRole
    });

    return {
      token,
      user: user.toJSON()
    };
  }

  async seedAdmin() {
    const adminExists = await this.userRepository.existsAdmin();

    if (adminExists) {
      return { created: false };
    }

    const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);

    await this.userRepository.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: UserRole.Admin,
      status: UserStatus.Active
    });

    return { created: true };
  }
}
