import bcrypt from "bcrypt";
import { AuthService } from "../src/services/auth.service";
import { ApiError } from "../src/utils/apiError";
import { UserRole, UserStatus } from "../src/utils/enums";

describe("AuthService", () => {
  const createRepository = () => ({
    findByEmail: jest.fn(),
    create: jest.fn(),
    existsAdmin: jest.fn()
  });

  it("registers a viewer user by default", async () => {
    const repository = createRepository();
    repository.findByEmail.mockResolvedValue(null);
    repository.create.mockImplementation(async (payload) => ({
      _id: { toString: () => "user-1" },
      ...payload,
      toJSON: () => ({
        id: "user-1",
        name: payload.name,
        email: payload.email,
        role: payload.role,
        status: payload.status
      })
    }));

    const service = new AuthService(repository as never);
    const result = await service.register({
      name: "Viewer User",
      email: "viewer@example.com",
      password: "Password123!"
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: UserRole.Viewer,
        status: UserStatus.Active
      })
    );
    expect(result.user.role).toBe(UserRole.Viewer);
  });

  it("rejects admin registration through the public flow", async () => {
    const repository = createRepository();
    repository.findByEmail.mockResolvedValue(null);

    const service = new AuthService(repository as never);

    await expect(
      service.register({
        name: "Admin User",
        email: "admin2@example.com",
        password: "Password123!",
        role: UserRole.Admin
      })
    ).rejects.toMatchObject({
      statusCode: 403,
      message: "Admin cannot be created via public registration"
    });
  });

  it("rejects login when the password is invalid", async () => {
    const repository = createRepository();
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    repository.findByEmail.mockResolvedValue({
      _id: { toString: () => "user-1" },
      email: "viewer@example.com",
      password: hashedPassword,
      role: UserRole.Viewer,
      status: UserStatus.Active,
      toJSON: jest.fn()
    });

    const service = new AuthService(repository as never);

    await expect(service.login("viewer@example.com", "WrongPassword123!")).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid email or password"
    });
  });

  it("rejects login for inactive users", async () => {
    const repository = createRepository();
    const hashedPassword = await bcrypt.hash("Password123!", 10);

    repository.findByEmail.mockResolvedValue({
      _id: { toString: () => "user-1" },
      email: "viewer@example.com",
      password: hashedPassword,
      role: UserRole.Viewer,
      status: UserStatus.Inactive,
      toJSON: jest.fn()
    });

    const service = new AuthService(repository as never);

    await expect(service.login("viewer@example.com", "Password123!")).rejects.toMatchObject({
      statusCode: 403,
      message: "User account is inactive"
    });
  });
});
