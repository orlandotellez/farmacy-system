import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError"
import type { ISupplierRepository } from "../domain/suppliers.interface"
import type { CreateSupplierData, ISupplierEntity, UpdateSupplierData } from "../domain/suppliers.entities"
import type { ISupplierListResponse, ISupplierResponse } from "../domain/suppliers.types"

type RichSupplier = ISupplierEntity
function mapSupplierToResponse(supplier: RichSupplier): ISupplierResponse {
  return {
    id: supplier.id,
    name: supplier.name,
    company: supplier.company || undefined,
    ruc: supplier.ruc || undefined,
    contact_name: supplier.contact_name || undefined,
    email: supplier.email || undefined,
    phone: supplier.phone || undefined,
    address: supplier.address || undefined,
    notes: supplier.notes || undefined,
    is_active: supplier.is_active,
    medicine_count: supplier.medicine_count,
    created_at: supplier.created_at.toISOString(),
    updated_at: supplier.updated_at.toISOString(),
  }
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "23505"
}

export const createSupplierService = (repository: ISupplierRepository) => ({
  list: async (params?: { search?: string; is_active?: boolean; page?: number; limit?: number; storeId?: string }): Promise<ISupplierListResponse> => {
    const result = await repository.findAll(params)
    return {
      data: result.suppliers.map((supplier) => mapSupplierToResponse(supplier as RichSupplier)),
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
    return mapSupplierToResponse(supplier as RichSupplier)
  },
  create: async (data: CreateSupplierData, storeId?: string): Promise<ISupplierResponse> => {
    if (!data.name?.trim()) throw new BadRequestError("Name is required")
    if (data.ruc) {
      const existing = await repository.findByRuc(data.ruc, storeId)
      if (existing) throw new ConflictError("A supplier with this RUC already exists")
    }
    try {
      return mapSupplierToResponse(await repository.create(data, storeId) as RichSupplier)
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
      return mapSupplierToResponse(await repository.update(id, data, storeId) as RichSupplier)
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
