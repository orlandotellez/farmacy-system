export type PurchaseStatus = "borrador" | "pendiente" | "aprobada" | "recibida" | "anulada"

export interface IPurchaseItemResponse {
  id: string
  medicine_id: string
  medicine_name: string
  quantity: number
  unit_cost: number
  line_total: number
  received: number
}

export interface IPurchaseResponse {
  id: string
  number: string
  status: PurchaseStatus
  supplier_id?: string | null
  supplier_name?: string | null
  expected_date?: string | null
  notes?: string | null
  total: number
  approved_by?: string | null
  approved_at?: string | null
  received_by?: string | null
  received_at?: string | null
  user_id: string
  user_name?: string | null
  created_at: string
  updated_at: string
  items: IPurchaseItemResponse[]
}

export interface IPurchaseListResponse {
  data: IPurchaseResponse[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface IReceiveBatch {
  batch_number: string
  medicine_id: string
  manufacture_date?: string
  expiry_date: string
  quantity: number
  unit_cost?: number
}
