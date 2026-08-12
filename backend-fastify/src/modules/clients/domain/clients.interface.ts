import type { IClientEntity, CreateClientData, UpdateClientData } from "./clients.entities"

export interface IClientRepository {
  findAll(params?: { search?: string; is_frequent?: boolean; page?: number; limit?: number; storeId?: string }): Promise<{ clients: IClientEntity[]; total: number; page: number; limit: number }>
  findById(id: string, storeId?: string): Promise<IClientEntity | null>
  create(data: CreateClientData, storeId: string): Promise<IClientEntity>
  update(id: string, data: UpdateClientData, storeId: string): Promise<IClientEntity>
  softDelete(id: string, storeId: string): Promise<void>
}
