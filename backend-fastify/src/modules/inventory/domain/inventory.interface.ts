import type { CreateMovementData, IInventoryMovementEntity } from "./inventory.entities"
import type { IProductStockResponse } from "./inventory.types"

export interface IInventoryRepository {
  create(data: CreateMovementData, userId: string, storeId: string): Promise<IInventoryMovementEntity>
  findByProductId(medicineId: string, params?: { limit?: number; storeId?: string }): Promise<IInventoryMovementEntity[]>
  findAll(params?: {
    search?: string
    medicine_id?: string
    movement_type?: string
    from?: string
    to?: string
    page?: number
    limit?: number
    storeId?: string
  }): Promise<{ movements: IInventoryMovementEntity[]; total: number; page: number; limit: number }>
  findLowStock(storeId: string): Promise<IProductStockResponse[]>
}
