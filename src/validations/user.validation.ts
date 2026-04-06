import { z } from "zod";
import { UserRole, UserStatus } from "../utils/enums";
import { objectIdSchema, paginationQuerySchema } from "./common.validation";

export const getUsersSchema = z.object({
  query: paginationQuerySchema.extend({
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional()
  })
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: z.object({
    status: z.nativeEnum(UserStatus)
  })
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: z.object({
    role: z.nativeEnum(UserRole)
  })
});

