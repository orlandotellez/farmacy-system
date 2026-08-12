import { BadRequestError } from "@/core/errors/AppError"
import type { IBatchEntity } from "../../domain/batch-inventory.entities"
import type { IBatchResponse } from "../../domain/batch-inventory.types"

export function mapBatchToResponse(batch: IBatchEntity): IBatchResponse {
  return {
    id: batch.id,
    batch_number: batch.batch_number,
    medicine_id: batch.medicine_id,
    medicine_name: batch.medicine_name ?? null,
    purchase_id: batch.purchase_id ?? null,
    supplier_id: batch.supplier_id ?? null,
    supplier_name: batch.supplier_name ?? null,
    manufacture_date: batch.manufacture_date?.toISOString() ?? null,
    expiry_date: batch.expiry_date.toISOString(),
    quantity: batch.quantity,
    unit_cost: batch.unit_cost ?? null,
    notes: batch.notes ?? null,
    created_at: batch.created_at.toISOString(),
    updated_at: batch.updated_at.toISOString(),
  }
}

export function assertFutureDate(value: string): void {
  const date = new Date(value)
  if (Number.isNaN(date.getTime()) || date <= new Date()) {
    throw new BadRequestError("Expiry date must be a valid future date")
  }
}

export function assertValidDate(value: string | undefined, field: string): void {
  if (!value) return
  if (Number.isNaN(new Date(value).getTime())) {
    throw new BadRequestError(`${field} must be a valid date`)
  }
}
