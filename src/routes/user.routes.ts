import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { UserRole } from "../utils/enums";
import {
  getUsersSchema,
  updateUserRoleSchema,
  updateUserStatusSchema
} from "../validations/user.validation";

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List users with optional filters
 * /users/{id}/status:
 *   patch:
 *     summary: Update a user status
 * /users/{id}/role:
 *   patch:
 *     summary: Update a user role
 */
export const createUserRoutes = (userController: UserController): Router => {
  const router = Router();

  router.use(authenticate, authorize(UserRole.Admin));

  router.get("/", validate(getUsersSchema), asyncHandler(userController.listUsers));
  router.patch(
    "/:id/status",
    validate(updateUserStatusSchema),
    asyncHandler(userController.updateStatus)
  );
  router.patch(
    "/:id/role",
    validate(updateUserRoleSchema),
    asyncHandler(userController.updateRole)
  );

  return router;
};

