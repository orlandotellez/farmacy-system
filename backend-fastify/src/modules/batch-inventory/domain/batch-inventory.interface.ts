import type { CreateBatchData, IBatchEntity, UpdateBatchData } from "./batch-inventory.entities"

export interface IBatchInventoryRepository {
  create(data: CreateBatchData, userId: string, storeId: string): Promise<IBatchEntity>
  findById(id: string, storeId: string): Promise<IBatchEntity | null>
  findAll(params?: {
    search?: string
    medicine_id?: string
    supplier_id?: string
    expiring_soon?: boolean
    expired?: boolean
    expiration_alert_days?: number
    page?: number
    limit?: number
    storeId?: string
  }): Promise<{ batches: IBatchEntity[]; total: number; page: number; limit: number }>
  update(id: string, data: UpdateBatchData, userId: string, storeId: string): Promise<IBatchEntity>
}
