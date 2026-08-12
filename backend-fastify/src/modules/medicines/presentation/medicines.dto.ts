import { z } from "zod"

const unitTypes = ["unidad", "paquete", "caja", "frasco", "tubo", "sobre", "blister", "ampolleta", "gotero", "aerosol", "crema", "jarabe", "tableta", "capsula", "botella", "bolsa"] as const

export const CreateMedicineDtoSchema = z.object({
  barcode: z.string().optional(),
  internal_code: z.string().optional(),
  commercial_name: z.string().trim().min(1, "Commercial name is required"),
  generic_name: z.string().optional(),
  active_ingredient: z.string().optional(),
  concentration: z.string().optional(),
  presentation: z.string().optional(),
  pharmaceutical_form: z.string().optional(),
  laboratory: z.string().optional(),
  category_id: z.string().uuid().optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  unit_type: z.enum(unitTypes).optional().nullable(),
  unit_quantity: z.number().int().positive().optional(),
  purchase_price: z.number().min(0).optional(),
  sale_price: z.number().positive("Sale price must be positive"),
  stock: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
  requires_prescription: z.boolean().optional(),
  is_controlled: z.boolean().optional(),
  image: z.string().optional(),
  active: z.boolean().optional(),
})

export const UpdateMedicineDtoSchema = CreateMedicineDtoSchema.partial()

export const MedicineQuerySchema = z.object({
  search: z.string().optional(),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  active: z.coerce.boolean().optional(),
  requires_prescription: z.coerce.boolean().optional(),
  is_controlled: z.coerce.boolean().optional(),
  low_stock: z.coerce.boolean().optional(),
  out_of_stock: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export type CreateMedicineDto = z.infer<typeof CreateMedicineDtoSchema>
export type UpdateMedicineDto = z.infer<typeof UpdateMedicineDtoSchema>
export type MedicineQueryDto = z.infer<typeof MedicineQuerySchema>
