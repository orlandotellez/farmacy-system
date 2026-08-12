import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import { SupplierRepository } from "@/modules/suppliers/infrastructure/suppliers.drizzle.repository"
import { IPurchaseRepository } from "../domain/purchases.interface"
import { CreatePurchaseData, IReceiveBatchData, UpdatePurchaseData } from "../domain/purchases.entities"
import { IPurchaseListResponse, IPurchaseResponse } from "../domain/purchases.types"
import { mapPurchase, RECEIVE_ERROR_MESSAGES, resolveMedicineNames } from "./common/purchases.mappers"

export const createPurchaseService = (repository: IPurchaseRepository) => ({
  list: async (params?: Parameters<IPurchaseRepository["findAll"]>[0]): Promise<IPurchaseListResponse> => {
    const result = await repository.findAll(params)
    return {
      data: result.purchases.map(mapPurchase),
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / result.limit)) },
    }
  },

  getById: async (id: string, storeId: string): Promise<IPurchaseResponse> => {
    const purchase = await repository.findById(id, storeId)
    if (!purchase) throw new NotFoundError("Purchase not found")
    return mapPurchase(purchase)
  },

  create: async (data: CreatePurchaseData, storeId: string, userId: string): Promise<IPurchaseResponse> => {
    if (data.supplier_id) {
      const supplier = await SupplierRepository.findById(data.supplier_id, storeId)
      if (!supplier) throw new NotFoundError("Supplier not found")
    }
    const medicineNames = await resolveMedicineNames(data.items.map((i) => i.medicine_id), storeId)
    const purchase = await repository.create(data, storeId, userId, medicineNames)
    return mapPurchase(purchase)
  },

  update: async (id: string, data: UpdatePurchaseData, storeId: string): Promise<IPurchaseResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Purchase not found")
    if (!["borrador", "pendiente"].includes(existing.status)) throw new BadRequestError("Only draft or pending purchases can be edited")

    if (data.supplier_id) {
      const supplier = await SupplierRepository.findById(data.supplier_id, storeId)
      if (!supplier) throw new NotFoundError("Supplier not found")
    }

    let medicineNames: Map<string, string> | undefined
    if (data.items?.length) {
      medicineNames = await resolveMedicineNames(data.items.map((i) => i.medicine_id), storeId)
    }

    const purchase = await repository.update(id, data, storeId, medicineNames)
    return mapPurchase(purchase)
  },

  approve: async (id: string, storeId: string, userId: string): Promise<IPurchaseResponse> => {
    const purchase = await repository.approve(id, storeId, userId)
    return mapPurchase(purchase)
  },

  receive: async (id: string, storeId: string, userId: string, batches: IReceiveBatchData[]): Promise<IPurchaseResponse> => {
    try {
      const purchase = await repository.receive(id, storeId, userId, batches)
      return mapPurchase(purchase)
    } catch (error) {
      const message = error instanceof Error ? RECEIVE_ERROR_MESSAGES[error.message] : undefined
      if (!message) throw error
      if (message === "Purchase not found") throw new NotFoundError(message)
      throw new BadRequestError(message)
    }
  },

  cancel: async (id: string, storeId: string): Promise<void> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Purchase not found")
    if (existing.status === "recibida") throw new BadRequestError("Received purchases cannot be cancelled")
    if (existing.status === "anulada") throw new BadRequestError("Purchase is already cancelled")
    await repository.cancel(id, storeId)
  },
})
