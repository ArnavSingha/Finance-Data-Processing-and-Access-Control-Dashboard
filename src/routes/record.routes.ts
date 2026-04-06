import { Router } from "express";
import { RecordController } from "../controllers/record.controller";
import { authenticate } from "../middlewares/authenticate";
import { authorize } from "../middlewares/authorize";
import { validate } from "../middlewares/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { UserRole } from "../utils/enums";
import {
  createRecordSchema,
  getRecordsSchema,
  recordIdSchema,
  updateRecordSchema
} from "../validations/record.validation";

/**
 * @swagger
 * /records:
 *   get:
 *     summary: Fetch financial records with filters and pagination
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Records fetched successfully
 *   post:
 *     summary: Create a financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateRecordRequest"
 *     responses:
 *       201:
 *         description: Record created successfully
 * /records/{id}:
 *   get:
 *     summary: Fetch a single financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record fetched successfully
 *   patch:
 *     summary: Update a financial record
 *     tags: [Records]
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
 *             $ref: "#/components/schemas/UpdateRecordRequest"
 *     responses:
 *       200:
 *         description: Record updated successfully
 *   delete:
 *     summary: Soft delete a financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 */
export const createRecordRoutes = (recordController: RecordController): Router => {
  const router = Router();

  router.use(authenticate);

  router.get(
    "/",
    authorize(UserRole.Viewer, UserRole.Analyst, UserRole.Admin),
    validate(getRecordsSchema),
    asyncHandler(recordController.listRecords)
  );
  router.get(
    "/:id",
    authorize(UserRole.Viewer, UserRole.Analyst, UserRole.Admin),
    validate(recordIdSchema),
    asyncHandler(recordController.getRecordById)
  );
  router.post(
    "/",
    authorize(UserRole.Admin),
    validate(createRecordSchema),
    asyncHandler(recordController.createRecord)
  );
  router.patch(
    "/:id",
    authorize(UserRole.Admin),
    validate(updateRecordSchema),
    asyncHandler(recordController.updateRecord)
  );
  router.delete(
    "/:id",
    authorize(UserRole.Admin),
    validate(recordIdSchema),
    asyncHandler(recordController.deleteRecord)
  );

  return router;
};
