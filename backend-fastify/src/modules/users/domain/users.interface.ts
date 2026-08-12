import type { CreateUserData, UpdateUserData, IUserEntity } from "./users.entities"

export interface IUserRepository {
  findAll(params?: { page?: number; limit?: number; search?: string; role?: string; storeId?: string }): Promise<{ users: IUserEntity[]; total: number; page: number; limit: number }>
  findById(id: string, storeId: string): Promise<IUserEntity | null>
  findByEmail(email: string, storeId: string): Promise<IUserEntity | null>
  create(data: CreateUserData): Promise<IUserEntity>
  update(id: string, data: UpdateUserData, storeId: string): Promise<IUserEntity>
  softDelete(id: string, storeId: string): Promise<void>
  updatePassword(id: string, hashedPassword: string): Promise<void>
}
