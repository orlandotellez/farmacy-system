import { z } from "zod"

const dateString = z.string().optional()
const item = z.object({ medicine_id: z.string().uuid(), quantity: z.number().int().positive() })

export const CreatePrescriptionDtoSchema = z.object({
  number: z.string().trim().min(1),
  doctor_name: z.string().trim().optional(),
  medical_center: z.string().trim().optional(),
  issue_date: dateString,
  expiry_date: dateString,
  image: z.string().optional(),
  notes: z.string().trim().optional(),
  client_id: z.string().uuid().nullable().optional(),
  items: z.array(item).min(1),
})

export const UpdatePrescriptionDtoSchema = CreatePrescriptionDtoSchema.partial()

export const ValidatePrescriptionDtoSchema = z.object({
  authorized_items: z.array(item).optional(),
})

export const PrescriptionQuerySchema = z.object({
  search: z.string().optional(),
  status: z.union([z.enum(["pendiente", "validada", "expirada", "anulada"]), z.literal("")]).optional(),
  client_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export type CreatePrescriptionDto = z.infer<typeof CreatePrescriptionDtoSchema>
export type UpdatePrescriptionDto = z.infer<typeof UpdatePrescriptionDtoSchema>
export type ValidatePrescriptionDto = z.infer<typeof ValidatePrescriptionDtoSchema>
export type PrescriptionQueryDto = z.infer<typeof PrescriptionQuerySchema>
