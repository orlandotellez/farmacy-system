import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError"
import type { ISupplierRepository } from "../domain/suppliers.interface"
import type { CreateSupplierData, UpdateSupplierData } from "../domain/suppliers.entities"
import type { ISupplierListResponse, ISupplierResponse } from "../domain/suppliers.types"
import { mapSupplierToResponse, isUniqueViolation } from "./common/suppliers.mappers"

export const createSupplierService = (repository: ISupplierRepository) => ({
  list: async (params?: { search?: string; is_active?: boolean; page?: number; limit?: number; storeId?: string }): Promise<ISupplierListResponse> => {
    const result = await repository.findAll(params)
    return {
      data: result.suppliers.map((supplier) => mapSupplierToResponse(supplier)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      },
    }
  },
  getById: async (id: string, storeId?: string): Promise<ISupplierResponse> => {
    const supplier = await repository.findById(id, storeId)
    if (!supplier) throw new NotFoundError("Supplier not found")
    return mapSupplierToResponse(supplier)
  },
  create: async (data: CreateSupplierData, storeId?: string): Promise<ISupplierResponse> => {
    if (!data.name?.trim()) throw new BadRequestError("Name is required")
    if (data.ruc) {
      const existing = await repository.findByRuc(data.ruc, storeId)
      if (existing) throw new ConflictError("A supplier with this RUC already exists")
    }
    try {
      return mapSupplierToResponse(await repository.create(data, storeId))
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("A supplier with this RUC already exists")
      throw err
    }
  },
  update: async (id: string, data: UpdateSupplierData, storeId?: string): Promise<ISupplierResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Supplier not found")
    if (data.ruc && data.ruc !== existing.ruc) {
      const duplicate = await repository.findByRuc(data.ruc, storeId)
      if (duplicate) throw new ConflictError("A supplier with this RUC already exists")
    }
    try {
      return mapSupplierToResponse(await repository.update(id, data, storeId))
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("A supplier with this RUC already exists")
      throw err
    }
  },
  delete: async (id: string, storeId?: string): Promise<void> => {
    if (!await repository.findById(id, storeId)) throw new NotFoundError("Supplier not found")
    await repository.softDelete(id, storeId)
  },
})
