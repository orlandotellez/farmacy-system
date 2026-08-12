import { BadRequestError } from "@/core/errors/AppError"
import type { IInventoryMovementEntity } from "../../domain/inventory.entities"
import type { IInventoryMovementResponse } from "../../domain/inventory.types"

export function assertValidFilterDate(value: string | undefined, field: string): void {
  if (value && Number.isNaN(new Date(value).getTime())) {
    throw new BadRequestError(`${field} must be a valid date`)
  }
}

export function mapMovementToResponse(movement: IInventoryMovementEntity): IInventoryMovementResponse {
  return {
    id: movement.id,
    medicine_id: movement.medicine_id,
    medicine_name: movement.medicine_name ?? null,
    movement_type: movement.movement_type,
    quantity: movement.quantity,
    note: movement.note ?? null,
    user_id: movement.user_id,
    user_name: movement.user_name ?? null,
    batch_id: movement.batch_id ?? null,
    created_at: movement.created_at.toISOString(),
  }
}

