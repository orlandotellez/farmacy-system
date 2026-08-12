import type { ISaleEntity } from "../../domain/sales.entities"
import type { ISaleItemResponse, ISaleResponse } from "../../domain/sales.types"

export function mapSaleItemToResponse(item: ISaleEntity["items"][number]): ISaleItemResponse {
  return {
    id: item.id,
    medicine_id: item.medicine_id,
    medicine_name: item.medicine_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total,
    batch_id: item.batch_id ?? null,
  }
}

export function mapSaleToResponse(sale: ISaleEntity): ISaleResponse {
  return {
    id: sale.id,
    subtotal: sale.subtotal,
    total: sale.total,
    payment_method: sale.payment_method,
    amount_received: sale.amount_received ?? null,
    change_given: sale.change_given ?? null,
    status: sale.status,
    cancellation_reason: sale.cancellation_reason ?? null,
    cancelled_at: sale.cancelled_at?.toISOString() ?? null,
    cancelled_by: sale.cancelled_by ?? null,
    user_id: sale.user_id,
    user_name: sale.user_name ?? null,
    client_id: sale.client_id ?? null,
    client_name: sale.client_name ?? null,
    prescription_id: sale.prescription_id ?? null,
    created_at: sale.created_at.toISOString(),
    updated_at: sale.updated_at.toISOString(),
    items: sale.items.map(mapSaleItemToResponse),
  }
}

export function endOfDay(value: string): Date {
  const date = new Date(value)
  date.setHours(23, 59, 59, 999)
  return date
}

