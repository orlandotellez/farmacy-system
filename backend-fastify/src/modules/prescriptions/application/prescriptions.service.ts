import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError"
import { IPrescriptionRepository } from "../domain/prescriptions.interface"
import {
  CreatePrescriptionData,
  IPrescriptionItemEntity,
  IPrescriptionWithItemsEntity,
  UpdatePrescriptionData,
} from "../domain/prescriptions.entities"
import { IAuthorizedItem, IPrescriptionListResponse, IPrescriptionResponse } from "../domain/prescriptions.types"
import { MedicineRepository } from "@/modules/medicines/infrastructure/medicines.drizzle.repository"
import { ClientRepository } from "@/modules/clients/infrastructure/clients.drizzle.repository"

async function resolveMedicineNames(medicineIds: string[], storeId: string): Promise<Map<string, string>> {
  const names = new Map<string, string>()
  for (const medicineId of new Set(medicineIds)) {
    const medicine = await MedicineRepository.findById(medicineId, storeId)
    if (!medicine) throw new BadRequestError("One or more medicines were not found")
    names.set(medicineId, medicine.commercial_name)
  }
  return names
}

async function validateClient(clientId: string | null | undefined, storeId: string): Promise<void> {
  if (!clientId) return
  const client = await ClientRepository.findById(clientId, storeId)
  if (!client) throw new NotFoundError("Client not found")
}

function iso(value?: Date | string | null): string | null {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

function mapItem(item: IPrescriptionItemEntity) {
  return {
    id: item.id,
    medicine_id: item.medicine_id,
    medicine_name: item.medicine_name,
    quantity: item.quantity,
    authorized_quantity: item.authorized_quantity,
    authorized_by: item.authorized_by ?? null,
  }
}

function map(prescription: IPrescriptionWithItemsEntity): IPrescriptionResponse {
  return {
    id: prescription.id,
    number: prescription.number,
    doctor_name: prescription.doctor_name ?? null,
    medical_center: prescription.medical_center ?? null,
    issue_date: iso(prescription.issue_date),
    expiry_date: iso(prescription.expiry_date),
    image: prescription.image ?? null,
    notes: prescription.notes ?? null,
    status: prescription.status,
    validated_by: prescription.validated_by ?? null,
    validated_at: iso(prescription.validated_at),
    client_id: prescription.client_id ?? null,
    client_name: prescription.client_name ?? "Cliente no registrado",
    items: prescription.items.map(mapItem),
    created_at: prescription.created_at.toISOString(),
    updated_at: prescription.updated_at.toISOString(),
  }
}

export const createPrescriptionService = (repository: IPrescriptionRepository) => ({
  list: async (params?: Parameters<IPrescriptionRepository["findAll"]>[0]): Promise<IPrescriptionListResponse> => {
    const result = await repository.findAll(params)
    return {
      data: result.prescriptions.map(map),
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / result.limit)) },
    }
  },

  getById: async (id: string, storeId: string): Promise<IPrescriptionResponse> => {
    const prescription = await repository.findById(id, storeId)
    if (!prescription) throw new NotFoundError("Prescription not found")
    return map(prescription)
  },

  create: async (data: CreatePrescriptionData, storeId: string): Promise<IPrescriptionResponse> => {
    const existing = await repository.findByNumber(data.number, storeId)
    if (existing) throw new ConflictError("A prescription with this number already exists")
    await validateClient(data.client_id, storeId)
    const medicineNames = await resolveMedicineNames(data.items.map((i) => i.medicine_id), storeId)
    const prescription = await repository.create(data, storeId, medicineNames)
    return map(prescription)
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
    return map(prescription)
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
    return map(prescription)
  },

  delete: async (id: string, storeId: string): Promise<void> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Prescription not found")
    await repository.softDelete(id, storeId)
  },
})
