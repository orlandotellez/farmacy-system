import { z } from "zod"

export const CreateMovementDtoSchema = z.object({
  medicine_id: z.string().uuid(),
  movement_type: z.enum(["entrada", "salida", "ajuste", "venta", "merma", "devolucion"]),
  quantity: z.number().int(),
  note: z.string().optional(),
  batch_id: z.string().uuid().optional(),
})

export const MovementQuerySchema = z.object({
  search: z.string().optional(),
  medicine_id: z.string().uuid().optional(),
  movement_type: z.enum(["entrada", "salida", "ajuste", "venta", "merma", "devolucion"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})
