import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import type { IMedicineRepository } from "@/modules/medicines/domain/medicines.interface"
import type { CreateMovementData } from "../domain/inventory.entities"
import type { IInventoryRepository } from "../domain/inventory.interface"
import type { IInventoryMovementListResponse, IInventoryMovementResponse, IProductStockResponse } from "../domain/inventory.types"
import { assertValidFilterDate, mapMovementToResponse } from "./common/inventory.mappers"

export const createInventoryService = (
  movementRepository: IInventoryRepository,
  medicineRepository: IMedicineRepository,
) => ({
  create: async (data: CreateMovementData, userId: string, storeId: string): Promise<IInventoryMovementResponse> => {
    const medicine = await medicineRepository.findById(data.medicine_id, storeId)
    if (!medicine || medicine.deleted_at) throw new NotFoundError("Medicine not found")

    if (data.movement_type !== "ajuste" && data.quantity <= 0) {
      throw new BadRequestError("Quantity must be positive")
    }

    if (data.movement_type === "ajuste" && data.quantity === 0) {
      throw new BadRequestError("Adjustment quantity cannot be zero")
    }

    const movement = await movementRepository.create(data, userId, storeId)
    return mapMovementToResponse({ ...movement, medicine_name: medicine.commercial_name })
  },

  getByProduct: async (medicineId: string, storeId: string): Promise<IInventoryMovementListResponse> => {
    const medicine = await medicineRepository.findById(medicineId, storeId)
    if (!medicine) throw new NotFoundError("Medicine not found")
    const movements = await movementRepository.findByProductId(medicineId, { storeId })
    return {
      data: movements.map(mapMovementToResponse),
      meta: { page: 1, limit: movements.length || 1, total: movements.length, totalPages: 1 },
    }
  },

  list: async (params?: Parameters<IInventoryRepository["findAll"]>[0]): Promise<IInventoryMovementListResponse> => {
    assertValidFilterDate(params?.from, "From date")
    assertValidFilterDate(params?.to, "To date")
    const result = await movementRepository.findAll(params)
    return {
      data: result.movements.map(mapMovementToResponse),
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / result.limit)) },
    }
  },

  getLowStockProducts: async (storeId: string): Promise<IProductStockResponse[]> => {
    return movementRepository.findLowStock(storeId)
  },
})
