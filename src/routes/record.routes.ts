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
 *   post:
 *     summary: Create a financial record
 * /records/{id}:
 *   get:
 *     summary: Fetch a single financial record
 *   patch:
 *     summary: Update a financial record
 *   delete:
 *     summary: Soft delete a financial record
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

