import { FilterQuery } from "mongoose";
import { UserModel } from "../models/user.model";
import { UserRole, UserStatus } from "../utils/enums";

type UserFilters = {
  role?: UserRole;
  status?: UserStatus;
};

type UserListOptions = UserFilters & {
  skip: number;
  limit: number;
};

export class UserRepository {
  async create(payload: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
  }) {
    return UserModel.create({
      ...payload,
      email: payload.email.toLowerCase()
    });
  }

  async findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string) {
    return UserModel.findById(id);
  }

  async list({ role, status, skip, limit }: UserListOptions) {
    const filter: FilterQuery<typeof UserModel> = {};

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    const [items, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(filter)
    ]);

    return { items, total };
  }

  async updateStatus(id: string, status: UserStatus) {
    return UserModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  async updateRole(id: string, role: UserRole) {
    return UserModel.findByIdAndUpdate(id, { role }, { new: true });
  }

  async existsAdmin() {
    const admin = await UserModel.exists({ role: UserRole.Admin });
    return Boolean(admin);
  }
}

