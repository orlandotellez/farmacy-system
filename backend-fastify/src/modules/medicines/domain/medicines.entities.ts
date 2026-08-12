export interface IMedicineEntity {
  id: string
  barcode?: string
  internal_code?: string
  commercial_name: string
  generic_name?: string
  active_ingredient?: string
  concentration?: string
  presentation?: string
  pharmaceutical_form?: string
  laboratory?: string
  category_id?: string
  supplier_id?: string
  unit_type?: string
  unit_quantity?: number
  purchase_price: number
  sale_price: number
  stock: number
  low_stock_threshold: number
  requires_prescription: boolean
  is_controlled: boolean
  image?: string
  active: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export type CreateMedicineData = {
  barcode?: string
  internal_code?: string
  commercial_name: string
  generic_name?: string
  active_ingredient?: string
  concentration?: string
  presentation?: string
  pharmaceutical_form?: string
  laboratory?: string
  category_id?: string
  supplier_id?: string
  unit_type?: string
  unit_quantity?: number
  purchase_price?: number
  sale_price: number
  stock?: number
  low_stock_threshold?: number
  requires_prescription?: boolean
  is_controlled?: boolean
  image?: string
  active?: boolean
}

export type UpdateMedicineData = Partial<CreateMedicineData> & {
  category_id?: string | null
  supplier_id?: string | null
  unit_type?: string | null
}
