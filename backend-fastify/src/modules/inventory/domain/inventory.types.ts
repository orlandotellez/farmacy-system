export type InventoryMovementType = "entrada" | "salida" | "ajuste" | "venta" | "merma" | "devolucion"

export interface IInventoryMovementResponse {
  id: string
  medicine_id: string
  medicine_name?: string | null
  movement_type: InventoryMovementType
  quantity: number
  note?: string | null
  user_id: string
  user_name?: string | null
  batch_id?: string | null
  created_at: string
}

export interface IInventoryMovementListResponse {
  data: IInventoryMovementResponse[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface IProductStockResponse {
  medicine_id: string
  medicine_name: string
  stock: number
  low_stock_threshold: number
  is_low_stock: boolean
}
