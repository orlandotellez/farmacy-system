import type { IMedicineEntity, CreateMedicineData, UpdateMedicineData } from "./medicines.entities"

export interface IMedicineRepository {
  findAll(params?: {
    search?: string
    category_id?: string
    supplier_id?: string
    active?: boolean
    requires_prescription?: boolean
    is_controlled?: boolean
    lowStock?: boolean
    outOfStock?: boolean
    page?: number
    limit?: number
    storeId?: string
  }): Promise<{ medicines: IMedicineEntity[]; total: number; page: number; limit: number }>
  findById(id: string, storeId?: string): Promise<IMedicineEntity | null>
  findByBarcode(barcode: string, storeId?: string): Promise<IMedicineEntity | null>
  create(data: CreateMedicineData, storeId?: string): Promise<IMedicineEntity>
  update(id: string, data: UpdateMedicineData, storeId?: string): Promise<IMedicineEntity>
  softDelete(id: string, storeId?: string): Promise<void>
  updateStock(id: string, quantity: number, storeId?: string): Promise<IMedicineEntity>
}
