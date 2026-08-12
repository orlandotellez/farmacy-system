import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError"
import { IPrescriptionRepository } from "../domain/prescriptions.interface"
import { CreatePrescriptionData, UpdatePrescriptionData } from "../domain/prescriptions.entities"
import { IAuthorizedItem, IPrescriptionListResponse, IPrescriptionResponse } from "../domain/prescriptions.types"
import { mapPrescription, resolveMedicineNames, validateClient } from "./common/prescriptions.mappers"

export const createPrescriptionService = (repository: IPrescriptionRepository) => ({
  list: async (params?: Parameters<IPrescriptionRepository["findAll"]>[0]): Promise<IPrescriptionListResponse> => {
    const result = await repository.findAll(params)
    return {
      data: result.prescriptions.map(mapPrescription),
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / result.limit)) },
    }
  },

  getById: async (id: string, storeId: string): Promise<IPrescriptionResponse> => {
    const prescription = await repository.findById(id, storeId)
    if (!prescription) throw new NotFoundError("Prescription not found")
    return mapPrescription(prescription)
  },

  create: async (data: CreatePrescriptionData, storeId: string): Promise<IPrescriptionResponse> => {
    const existing = await repository.findByNumber(data.number, storeId)
    if (existing) throw new ConflictError("A prescription with this number already exists")
    await validateClient(data.client_id, storeId)
    const medicineNames = await resolveMedicineNames(data.items.map((i) => i.medicine_id), storeId)
    const prescription = await repository.create(data, storeId, medicineNames)
    return mapPrescription(prescription)
  },

  update: async (id: string, data: UpdatePrescriptionData, storeId: string): Promise<IPrescriptionResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Prescription not found")
    if (existing.status !== "pendiente") throw new BadRequestError("Only pending prescriptions can be edited")

    if (data.number && data.number !== existing.number) {
      const duplicate = await repository.findByNumber(data.number, storeId)
      if (duplicate && duplicate.id !== id) throw new ConflictError("A prescription with this number already exists")
    }

    await validateClient(data.client_id, storeId)

    let medicineNames: Map<string, string> | undefined
    if (data.items?.length) {
      medicineNames = await resolveMedicineNames(data.items.map((i) => i.medicine_id), storeId)
    }

    const prescription = await repository.update(id, data, storeId, medicineNames)
    return mapPrescription(prescription)
  },

  validate: async (id: string, storeId: string, userId: string, data: { authorized_items?: IAuthorizedItem[] }): Promise<IPrescriptionResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Prescription not found")
    if (existing.status !== "pendiente") throw new BadRequestError("Only pending prescriptions can be validated")

    const prescriptionItemIds = new Set(existing.items.map((i) => i.medicine_id))

    const authorized = data.authorized_items?.length
      ? data.authorized_items
      : existing.items.map((i) => ({ medicine_id: i.medicine_id, quantity: i.quantity }))

    const unknownItem = authorized.find((i) => !prescriptionItemIds.has(i.medicine_id))
    if (unknownItem) throw new BadRequestError(`Medicine ${unknownItem.medicine_id} is not in this prescription`)

    const prescription = await repository.validate(id, storeId, userId, authorized)
    return mapPrescription(prescription)
  },

  delete: async (id: string, storeId: string): Promise<void> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Prescription not found")
    await repository.softDelete(id, storeId)
  },
})
