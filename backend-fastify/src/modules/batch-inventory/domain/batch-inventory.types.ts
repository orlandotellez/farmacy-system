export interface IBatchResponse {
  id: string
  batch_number: string
  medicine_id: string
  medicine_name?: string | null
  purchase_id?: string | null
  supplier_id?: string | null
  supplier_name?: string | null
  manufacture_date?: string | null
  expiry_date: string
  quantity: number
  unit_cost?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface IBatchListResponse {
  data: IBatchResponse[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
