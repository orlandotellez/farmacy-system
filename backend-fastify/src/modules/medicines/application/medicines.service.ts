import { ConflictError, NotFoundError } from "@/core/errors/AppError"
import type { IMedicineRepository } from "../domain/medicines.interface"
import type { CreateMedicineData, UpdateMedicineData } from "../domain/medicines.entities"
import type { IMedicineListResponse, IMedicineResponse } from "../domain/medicines.types"
import { mapMedicineToResponse, isUniqueViolation } from "./common/medicines.mappers"

export const createMedicineService = (repository: IMedicineRepository) => ({
  list: async (params?: Parameters<IMedicineRepository["findAll"]>[0]): Promise<IMedicineListResponse> => {
    const result = await repository.findAll(params)
    return {
      data: result.medicines.map((medicine) => mapMedicineToResponse(medicine)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      },
    }
  },

  getById: async (id: string, storeId?: string): Promise<IMedicineResponse> => {
    const medicine = await repository.findById(id, storeId)
    if (!medicine || medicine.deleted_at) throw new NotFoundError("Medicine not found")
    return mapMedicineToResponse(medicine)
  },

  getByBarcode: async (barcode: string, storeId?: string): Promise<IMedicineResponse | null> => {
    const medicine = await repository.findByBarcode(barcode, storeId)
    return medicine && !medicine.deleted_at ? mapMedicineToResponse(medicine) : null
  },

  create: async (data: CreateMedicineData, storeId?: string): Promise<IMedicineResponse> => {
    if (data.barcode && await repository.findByBarcode(data.barcode, storeId)) {
      throw new ConflictError("A medicine with this barcode already exists")
    }
    try {
      const medicine = await repository.create(data, storeId)
      return mapMedicineToResponse(medicine)
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("A medicine with this barcode already exists")
      throw err
    }
  },

  update: async (id: string, data: UpdateMedicineData, storeId?: string): Promise<IMedicineResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing || existing.deleted_at) throw new NotFoundError("Medicine not found")
    if (data.barcode && data.barcode !== existing.barcode) {
      const duplicate = await repository.findByBarcode(data.barcode, storeId)
      if (duplicate && duplicate.id !== id) throw new ConflictError("A medicine with this barcode already exists")
    }
    try {
      const medicine = await repository.update(id, data, storeId)
      return mapMedicineToResponse(medicine)
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("A medicine with this barcode already exists")
      throw err
    }
  },

  delete: async (id: string, storeId?: string): Promise<void> => {
    const existing = await repository.findById(id, storeId)
    if (!existing || existing.deleted_at) throw new NotFoundError("Medicine not found")
    await repository.softDelete(id, storeId)
  },
})
