import { BadRequestError } from "@/core/errors/AppError"
import { MedicineRepository } from "@/modules/medicines/infrastructure/medicines.drizzle.repository"
import { IPurchaseEntity } from "../../domain/purchases.entities"
import { IPurchaseResponse } from "../../domain/purchases.types"

export function iso(value?: Date | string | null): string | null {
  if (!value) return null
  return value instanceof Date ? value.toISOString() : value
}

export function mapItem(item: IPurchaseEntity["items"][number]) {
  return {
    id: item.id,
    medicine_id: item.medicine_id,
    medicine_name: item.medicine_name,
    quantity: item.quantity,
    unit_cost: item.unit_cost,
    line_total: item.line_total,
    received: item.received,
  }
}

export function mapPurchase(purchase: IPurchaseEntity): IPurchaseResponse {
  return {
    id: purchase.id,
    number: purchase.number,
    status: purchase.status as IPurchaseResponse["status"],
    supplier_id: purchase.supplier_id ?? null,
    supplier_name: purchase.supplier_name ?? null,
    expected_date: iso(purchase.expected_date),
    notes: purchase.notes ?? null,
    total: purchase.total,
    approved_by: purchase.approved_by ?? null,
    approved_at: iso(purchase.approved_at),
    received_by: purchase.received_by ?? null,
    received_at: iso(purchase.received_at),
    user_id: purchase.user_id,
    user_name: purchase.user_name ?? null,
    created_at: purchase.created_at.toISOString(),
    updated_at: purchase.updated_at.toISOString(),
    items: purchase.items.map(mapItem),
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

export const RECEIVE_ERROR_MESSAGES: Record<string, string> = {
  PURCHASE_NOT_FOUND: "Purchase not found",
  PURCHASE_NOT_APPROVED: "Only approved purchases can be received",
  MEDICINE_NOT_IN_PURCHASE: "Received medicine is not part of the purchase",
  RECEIVED_EXCEEDS_ORDERED: "Received quantity exceeds the ordered quantity",
  INVALID_EXPIRY_DATE: "Expiry date must be a valid future date",
}
