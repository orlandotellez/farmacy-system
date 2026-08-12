import type {
  CreatePrescriptionData,
  IPrescriptionItemEntity,
  IPrescriptionWithItemsEntity,
  UpdatePrescriptionData,
} from "./prescriptions.entities"
import type { IAuthorizedItem } from "./prescriptions.types"

export interface IPrescriptionRepository {
  findAll(params?: {
    search?: string
    status?: string
    client_id?: string
    page?: number
    limit?: number
    storeId?: string
  }): Promise<{ prescriptions: IPrescriptionWithItemsEntity[]; total: number; page: number; limit: number }>
  findById(id: string, storeId?: string): Promise<IPrescriptionWithItemsEntity | null>
  findByNumber(number: string, storeId?: string): Promise<IPrescriptionWithItemsEntity | null>
  create(data: CreatePrescriptionData, storeId: string, medicineNames: Map<string, string>): Promise<IPrescriptionWithItemsEntity>
  update(id: string, data: UpdatePrescriptionData, storeId: string, medicineNames?: Map<string, string>): Promise<IPrescriptionWithItemsEntity>
  replaceItems(prescriptionId: string, items: CreatePrescriptionData["items"], medicineNames: Map<string, string>): Promise<IPrescriptionItemEntity[]>
  validate(id: string, storeId: string, userId: string, authorized: IAuthorizedItem[]): Promise<IPrescriptionWithItemsEntity>
  softDelete(id: string, storeId: string): Promise<void>
}
