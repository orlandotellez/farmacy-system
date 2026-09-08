import type { IClientEntity, CreateClientData, UpdateClientData } from "./clients.entities"

export interface IClientSaleRow {
  id: string
  total: number
  created_at: string
  payment_method: string
}

export interface IClientPrescriptionRow {
  id: string
  number: string
  status: string
}

export interface IFrequentProductRow {
  medicine_id: string
  medicine_name: string
  quantity: number
}

export interface IClientRepository {
  findAll(params?: { search?: string; is_frequent?: boolean; page?: number; limit?: number; storeId?: string }): Promise<{ clients: IClientEntity[]; total: number; page: number; limit: number }>
  findById(id: string, storeId?: string): Promise<IClientEntity | null>
  create(data: CreateClientData, storeId: string): Promise<IClientEntity>
  update(id: string, data: UpdateClientData, storeId: string): Promise<IClientEntity>
  softDelete(id: string, storeId: string): Promise<void>
  findSalesByClient(id: string, storeId: string): Promise<IClientSaleRow[]>
  findPrescriptionsByClient(id: string, storeId: string): Promise<IClientPrescriptionRow[]>
  findFrequentProductsByClient(id: string, storeId: string): Promise<IFrequentProductRow[]>
}
