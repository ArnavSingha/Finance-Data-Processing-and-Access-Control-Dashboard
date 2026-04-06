import { UserService } from "../src/services/user.service";
import { ApiError } from "../src/utils/apiError";
import { UserRole, UserStatus } from "../src/utils/enums";

describe("UserService", () => {
  const createRepository = () => ({
    list: jest.fn(),
    updateStatus: jest.fn(),
    updateRole: jest.fn()
  });

  it("lists users with pagination metadata", async () => {
    const repository = createRepository();
    repository.list.mockResolvedValue({
      items: [
        {
          toJSON: () => ({
            id: "user-1",
            email: "viewer@example.com",
            role: UserRole.Viewer,
            status: UserStatus.Active
          })
        }
      ],
      total: 1
    });

    const service = new UserService(repository as never);
    const result = await service.listUsers({ page: 1, limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });

  it("throws not found when updating a missing user", async () => {
    const repository = createRepository();
    repository.updateStatus.mockResolvedValue(null);

    const service = new UserService(repository as never);

    await expect(service.updateStatus("missing-id", UserStatus.Inactive)).rejects.toMatchObject({
      statusCode: 404,
      message: "User not found"
    });
  });
});
