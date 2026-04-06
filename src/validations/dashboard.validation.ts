import { z } from "zod";
import { RecordType } from "../utils/enums";

const dashboardQuerySchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  type: z.nativeEnum(RecordType).optional()
});

export const summarySchema = z.object({
  query: dashboardQuerySchema.omit({ type: true })
});

export const categoryBreakdownSchema = z.object({
  query: dashboardQuerySchema
});

export const trendsSchema = z.object({
  query: dashboardQuerySchema
});

