import { z } from "zod"

const booleanQuery = z.preprocess(
  (value) => value === "true" ? true : value === "false" ? false : value,
  z.boolean().optional(),
)

export const CreateBatchDtoSchema = z.object({
  batch_number: z.string().trim().min(1),
  medicine_id: z.string().uuid(),
  purchase_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  manufacture_date: z.string().optional(),
  expiry_date: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_cost: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export const UpdateBatchDtoSchema = z.object({
  batch_number: z.string().trim().min(1).optional(),
  expiry_date: z.string().min(1).optional(),
  quantity: z.number().int().nonnegative().optional(),
  notes: z.string().optional(),
})

export const BatchQuerySchema = z.object({
  search: z.string().optional(),
  medicine_id: z.string().uuid().optional(),
  supplier_id: z.string().uuid().optional(),
  expiring_soon: booleanQuery,
  expired: booleanQuery,
  expiration_alert_days: z.coerce.number().int().nonnegative().max(3650).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})
