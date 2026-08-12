import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import type { IBatchInventoryRepository } from "../domain/batch-inventory.interface"
import type { CreateBatchData, UpdateBatchData } from "../domain/batch-inventory.entities"
import type { IBatchListResponse, IBatchResponse } from "../domain/batch-inventory.types"
import { assertFutureDate, assertValidDate, mapBatchToResponse } from "./common/batch-inventory.mappers"

export const createBatchInventoryService = (repository: IBatchInventoryRepository) => ({
  create: async (data: CreateBatchData, userId: string, storeId: string): Promise<IBatchResponse> => {
    assertFutureDate(data.expiry_date)
    assertValidDate(data.manufacture_date, "Manufacture date")
    if (data.manufacture_date && new Date(data.manufacture_date) > new Date(data.expiry_date)) {
      throw new BadRequestError("Manufacture date cannot be after expiry date")
    }
    return mapBatchToResponse(await repository.create(data, userId, storeId))
  },

  getById: async (id: string, storeId: string): Promise<IBatchResponse> => {
    const batch = await repository.findById(id, storeId)
    if (!batch) throw new NotFoundError("Batch not found")
    return mapBatchToResponse(batch)
  },

  list: async (params?: Parameters<IBatchInventoryRepository["findAll"]>[0]): Promise<IBatchListResponse> => {
    const result = await repository.findAll(params)
    return {
      data: result.batches.map(mapBatchToResponse),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      },
    }
  },

  update: async (id: string, data: UpdateBatchData, userId: string, storeId: string): Promise<IBatchResponse> => {
    if (data.expiry_date) {
      assertFutureDate(data.expiry_date)
      assertValidDate(data.expiry_date, "Expiry date")
    }
    return mapBatchToResponse(await repository.update(id, data, userId, storeId))
  },
})
