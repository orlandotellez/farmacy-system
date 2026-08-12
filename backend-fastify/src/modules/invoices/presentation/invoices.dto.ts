import { z } from "zod"

const validDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")

export const InvoiceQuerySchema = z.object({
  search: z.string().optional(),
  invoice_type: z.enum(["ticket", "simplificada", "fiscal"]).optional(),
  from: validDate.optional(),
  to: validDate.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export const CreateInvoiceDtoSchema = z.object({
  sale_id: z.string().uuid(),
  invoice_type: z.enum(["simplificada", "fiscal"]),
  client_name: z.string().trim().min(1).max(160).optional(),
  client_document: z.string().trim().max(40).optional(),
  client_address: z.string().trim().max(240).optional(),
  client_phone: z.string().trim().max(40).optional(),
  client_email: z.string().email().optional(),
})

export const CancelInvoiceDtoSchema = z.object({
  reason: z.string().trim().min(3).max(300),
})
