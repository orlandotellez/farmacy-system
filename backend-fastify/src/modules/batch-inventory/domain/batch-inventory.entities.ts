export interface IBatchEntity {
  id: string
  batch_number: string
  medicine_id: string
  medicine_name?: string | null
  purchase_id?: string | null
  supplier_id?: string | null
  supplier_name?: string | null
  manufacture_date?: Date | null
  expiry_date: Date
  quantity: number
  unit_cost?: number | null
  notes?: string | null
  user_id: string
  store_id: string
  created_at: Date
  updated_at: Date
}

export interface CreateBatchData {
  batch_number: string
  medicine_id: string
  purchase_id?: string
  supplier_id?: string
  manufacture_date?: string
  expiry_date: string
  quantity: number
  unit_cost?: number
  notes?: string
}

export interface UpdateBatchData {
  batch_number?: string
  expiry_date?: string
  quantity?: number
  notes?: string
}
