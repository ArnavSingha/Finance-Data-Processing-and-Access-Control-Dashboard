import { UserRepository } from "../repositories/user.repository";
import { ApiError } from "../utils/apiError";
import { normalizePagination } from "../utils/pagination";
import { UserRole, UserStatus } from "../utils/enums";

type ListUsersOptions = {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
};

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async listUsers(options: ListUsersOptions) {
    const pagination = normalizePagination(options.page, options.limit);
    const { items, total } = await this.userRepository.list({
      role: options.role,
      status: options.status,
      skip: pagination.skip,
      limit: pagination.limit
    });

    return {
      items: items.map((item) => item.toJSON()),
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit) || 1
      }
    };
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.userRepository.updateStatus(id, status);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user.toJSON();
  }

  async updateRole(id: string, role: UserRole) {
    const user = await this.userRepository.updateRole(id, role);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user.toJSON();
  }
}

