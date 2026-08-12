export type PaymentMethod = "efectivo" | "tarjeta_debito" | "tarjeta_credito" | "transferencia" | "pago_movil" | "mixto"
export type SaleStatus = "completada" | "anulada"
export type GroupBy = "day" | "week" | "month"

export interface ISaleItemResponse {
  id: string
  medicine_id: string
  medicine_name: string
  quantity: number
  unit_price: number
  line_total: number
  batch_id?: string | null
}

export interface ISaleResponse {
  id: string
  subtotal: number
  total: number
  payment_method: PaymentMethod
  amount_received?: number | null
  change_given?: number | null
  status: SaleStatus
  cancellation_reason?: string | null
  cancelled_at?: string | null
  cancelled_by?: string | null
  user_id: string
  user_name?: string | null
  client_id?: string | null
  client_name?: string | null
  prescription_id?: string | null
  created_at: string
  updated_at: string
  items: ISaleItemResponse[]
}

export interface ISaleListResponse {
  data: ISaleResponse[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface ISaleReport {
  total_sales: number
  total_revenue: number
  total_profit: number
  average_ticket: number
  by_payment_method: Record<string, number>
  top_products: { medicine_id: string; medicine_name: string; quantity: number; revenue: number }[]
}

export interface IRevenueTrendItem {
  period: string
  revenue: number
  count: number
}
