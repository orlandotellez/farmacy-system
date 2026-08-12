import { ConflictError, NotFoundError } from "@/core/errors/AppError"
import type { IUserRepository } from "../domain/users.interface"
import type { CreateUserData, UpdateUserData } from "../domain/users.entities"
import type { IUserListResponse, IUserResponse } from "../domain/users.types"
import { mapUserToResponse } from "./common/users.mappers"

export const createUserService = (repository: IUserRepository) => ({
  list: async (params?: { search?: string; role?: string; page?: number; limit?: number; storeId?: string }): Promise<IUserListResponse> => {
    const result = await repository.findAll(params)
    return { data: result.users.map(mapUserToResponse), meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / result.limit)) } }
  },
  getById: async (id: string, storeId: string): Promise<IUserResponse> => {
    const user = await repository.findById(id, storeId)
    if (!user) throw new NotFoundError("User not found")
    return mapUserToResponse(user)
  },
  create: async (data: CreateUserData, storeId: string): Promise<IUserResponse> => {
    const existing = await repository.findByEmail(data.email, storeId)
    if (existing) throw new ConflictError("A user with this email already exists")
    const user = await repository.create({ ...data, store_id: storeId })
    return mapUserToResponse(user)
  },
  update: async (id: string, data: UpdateUserData, storeId: string): Promise<IUserResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("User not found")
    if (data.email && data.email !== existing.email && await repository.findByEmail(data.email, storeId)) throw new ConflictError("A user with this email already exists")
    return mapUserToResponse(await repository.update(id, data, storeId))
  },
  delete: async (id: string, storeId: string): Promise<void> => {
    if (!await repository.findById(id, storeId)) throw new NotFoundError("User not found")
    await repository.softDelete(id, storeId)
  },
})
