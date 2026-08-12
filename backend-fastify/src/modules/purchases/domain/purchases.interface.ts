import type {
  CreatePurchaseData,
  IPurchaseEntity,
  IReceiveBatchData,
  UpdatePurchaseData,
} from "./purchases.entities"

export interface IPurchaseRepository {
  findAll(params?: {
    search?: string
    status?: string
    supplier_id?: string
    page?: number
    limit?: number
    storeId?: string
  }): Promise<{ purchases: IPurchaseEntity[]; total: number; page: number; limit: number }>
  findById(id: string, storeId?: string): Promise<IPurchaseEntity | null>
  create(data: CreatePurchaseData, storeId: string, userId: string, medicineNames: Map<string, string>): Promise<IPurchaseEntity>
  update(id: string, data: UpdatePurchaseData, storeId: string, medicineNames?: Map<string, string>): Promise<IPurchaseEntity>
  approve(id: string, storeId: string, userId: string): Promise<IPurchaseEntity>
  receive(id: string, storeId: string, userId: string, batches: IReceiveBatchData[]): Promise<IPurchaseEntity>
  cancel(id: string, storeId: string): Promise<void>
}
