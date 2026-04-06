import { disconnectDatabase, connectDatabase } from "../config/db";
import { logger } from "../config/logger";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";

const seed = async () => {
  await connectDatabase();

  const authService = new AuthService(new UserRepository());
  const result = await authService.seedAdmin();

  logger.info(result.created ? "Admin user created" : "Admin user already exists");
  await disconnectDatabase();
};

void seed().catch(async (error: unknown) => {
  logger.error("Failed to seed admin user", error);
  await disconnectDatabase();
  process.exit(1);
});
