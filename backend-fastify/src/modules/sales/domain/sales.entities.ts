import type { PaymentMethod, SaleStatus } from "./sales.types"

export interface ISaleItemEntity {
  id: string
  sale_id: string
  medicine_id: string
  medicine_name: string
  quantity: number
  unit_price: number
  line_total: number
  batch_id?: string | null
  created_at: Date
  updated_at: Date
}

export interface ISaleEntity {
  id: string
  subtotal: number
  total: number
  payment_method: PaymentMethod
  amount_received?: number | null
  change_given?: number | null
  status: SaleStatus
  cancellation_reason?: string | null
  cancelled_at?: Date | null
  cancelled_by?: string | null
  user_id: string
  user_name?: string | null
  client_id?: string | null
  client_name?: string | null
  prescription_id?: string | null
  created_at: Date
  updated_at: Date
  items: ISaleItemEntity[]
}

export interface CreateSaleItemData {
  medicine_id: string
  quantity: number
  unit_price?: number
  batch_id?: string
}

export interface CreateSaleData {
  items: CreateSaleItemData[]
  payment_method: PaymentMethod
  amount_received?: number
  client_id?: string
  prescription_id?: string
  user_id: string
  user_name?: string
}
