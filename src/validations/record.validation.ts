import { z } from "zod";
import { RecordType } from "../utils/enums";
import { objectIdSchema, paginationQuerySchema } from "./common.validation";

const recordBodySchema = z.object({
  amount: z.number().positive(),
  type: z.nativeEnum(RecordType),
  category: z.string().trim().min(1),
  date: z.string().datetime(),
  notes: z.string().trim().max(500).optional()
});

export const createRecordSchema = z.object({
  body: recordBodySchema
});

export const getRecordsSchema = z.object({
  query: paginationQuerySchema.extend({
    type: z.nativeEnum(RecordType).optional(),
    category: z.string().trim().min(1).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional()
  })
});

export const recordIdSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

export const updateRecordSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: recordBodySchema.partial().refine(
    (value) => Object.keys(value).length > 0,
    "At least one field must be provided"
  )
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>["body"];
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>["body"];

