export interface IMedicineRelation {
  id: string
  name: string
}

export interface IMedicineResponse {
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
  category?: IMedicineRelation | null
  supplier?: IMedicineRelation | null
  created_at: string
  updated_at: string
}

export interface IMedicineListResponse {
  data: IMedicineResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
