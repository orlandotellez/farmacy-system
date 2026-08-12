import { z } from "zod"

const roles = ["admin", "farmaceutico", "cajero", "bodeguero"] as const

export const CreateUserDtoSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(roles).optional(),
  phone: z.string().trim().optional(),
})

export const UpdateUserDtoSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(roles).optional(),
  phone: z.string().trim().optional().nullable(),
})

export const UserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(roles).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>
export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>
