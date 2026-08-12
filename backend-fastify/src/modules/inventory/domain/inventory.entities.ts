import type { InventoryMovementType } from "./inventory.types"

export interface IInventoryMovementEntity {
  id: string
  medicine_id: string
  medicine_name?: string | null
  movement_type: InventoryMovementType
  quantity: number
  note?: string | null
  user_id: string
  user_name?: string | null
  batch_id?: string | null
  store_id: string
  created_at: Date
}

export interface CreateMovementData {
  medicine_id: string
  movement_type: InventoryMovementType
  quantity: number
  note?: string
  batch_id?: string
}
