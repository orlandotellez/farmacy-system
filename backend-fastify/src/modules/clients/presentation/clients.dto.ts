import { z } from "zod"

export const CreateClientDtoSchema = z.object({
  full_name: z.string().trim().min(1),
  document_type: z.enum(["cedula", "ruc", "pasaporte", "otro"]).optional(),
  document_number: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().trim().optional(),
  birth_date: z.string().datetime().optional().or(z.string().date().optional()),
  sex: z.string().trim().optional(),
  allergies: z.string().trim().optional(),
  chronic_diseases: z.string().trim().optional(),
  observations: z.string().trim().optional(),
  is_frequent: z.boolean().optional(),
})

export const UpdateClientDtoSchema = CreateClientDtoSchema.partial()

export const ClientQuerySchema = z.object({
  search: z.string().optional(),
  is_frequent: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export type CreateClientDto = z.infer<typeof CreateClientDtoSchema>
export type UpdateClientDto = z.infer<typeof UpdateClientDtoSchema>
export type ClientQueryDto = z.infer<typeof ClientQuerySchema>
