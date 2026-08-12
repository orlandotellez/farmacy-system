import { z } from "zod"

const paymentMethods = ["efectivo", "tarjeta_debito", "tarjeta_credito", "transferencia", "pago_movil", "mixto"] as const
const validDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")

export const CreateSaleItemDtoSchema = z.object({
  medicine_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive().optional(),
  batch_id: z.string().uuid().optional(),
})

export const CreateSaleDtoSchema = z.object({
  items: z.array(CreateSaleItemDtoSchema).min(1),
  payment_method: z.enum(paymentMethods),
  amount_received: z.number().nonnegative().optional(),
  client_id: z.string().uuid().optional(),
  prescription_id: z.string().uuid().optional(),
}).superRefine((data, ctx) => {
  if (data.payment_method === "efectivo" && data.amount_received === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["amount_received"], message: "Cash received is required" })
  }
})

export const CancelSaleDtoSchema = z.object({
  reason: z.string().trim().min(3).max(300),
})

export const SaleQuerySchema = z.object({
  from: validDate.optional(),
  to: validDate.optional(),
  payment_method: z.enum(paymentMethods).optional(),
  user_id: z.string().uuid().optional(),
  status: z.enum(["completada", "anulada"]).optional(),
  search: z.string().optional(),
  min_amount: z.coerce.number().nonnegative().optional(),
  min_items: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export const ReportQuerySchema = z.object({
  from: validDate.optional(),
  to: validDate.optional(),
})

export const RevenueTrendQuerySchema = z.object({
  start_date: validDate,
  end_date: validDate,
  group_by: z.enum(["day", "week", "month"]),
})
