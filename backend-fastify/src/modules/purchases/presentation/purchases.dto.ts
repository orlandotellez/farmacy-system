import { z } from "zod"

const item = z.object({
  medicine_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_cost: z.number().min(0),
})

export const CreatePurchaseDtoSchema = z.object({
  supplier_id: z.string().uuid().optional(),
  expected_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(item).min(1),
})

export const UpdatePurchaseDtoSchema = CreatePurchaseDtoSchema.partial()

export const ReceiveBatchDtoSchema = z.object({
  batch_number: z.string().trim().min(1),
  medicine_id: z.string().uuid(),
  manufacture_date: z.string().optional(),
  expiry_date: z.string(),
  quantity: z.number().int().positive(),
  unit_cost: z.number().min(0).optional(),
})

export const ReceivePurchaseDtoSchema = z.object({
  batches: z.array(ReceiveBatchDtoSchema).min(1),
})

export const PurchaseQuerySchema = z.object({
  search: z.string().optional(),
  status: z
    .union([z.enum(["borrador", "pendiente", "aprobada", "recibida", "anulada"]), z.literal("")])
    .optional(),
  supplier_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})
