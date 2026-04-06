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
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [Viewer, Analyst, Admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users fetched successfully
 * /users/{id}/status:
 *   patch:
 *     summary: Update a user status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateUserStatusRequest"
 *     responses:
 *       200:
 *         description: User status updated successfully
 * /users/{id}/role:
 *   patch:
 *     summary: Update a user role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateUserRoleRequest"
 *     responses:
 *       200:
 *         description: User role updated successfully
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
