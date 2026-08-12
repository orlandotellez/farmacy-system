import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import { MedicineRepository } from "@/modules/medicines/infrastructure/medicines.drizzle.repository"
import { ClientRepository } from "@/modules/clients/infrastructure/clients.drizzle.repository"
import { IPrescriptionItemEntity, IPrescriptionWithItemsEntity } from "../../domain/prescriptions.entities"
import { IPrescriptionResponse } from "../../domain/prescriptions.types"

export function iso(value?: Date | string | null): string | null {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

export function mapItem(item: IPrescriptionItemEntity) {
  return {
    id: item.id,
    medicine_id: item.medicine_id,
    medicine_name: item.medicine_name,
    quantity: item.quantity,
    authorized_quantity: item.authorized_quantity,
    authorized_by: item.authorized_by ?? null,
  }
}

export function mapPrescription(prescription: IPrescriptionWithItemsEntity): IPrescriptionResponse {
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

export async function resolveMedicineNames(medicineIds: string[], storeId: string): Promise<Map<string, string>> {
  const names = new Map<string, string>()
  for (const medicineId of new Set(medicineIds)) {
    const medicine = await MedicineRepository.findById(medicineId, storeId)
    if (!medicine) throw new BadRequestError("One or more medicines were not found")
    names.set(medicineId, medicine.commercial_name)
  }
  return names
}

export async function validateClient(clientId: string | null | undefined, storeId: string): Promise<void> {
  if (!clientId) return
  const client = await ClientRepository.findById(clientId, storeId)
  if (!client) throw new NotFoundError("Client not found")
}
