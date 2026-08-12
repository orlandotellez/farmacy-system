import type { IInvoiceEntity } from "../../domain/invoices.entities"
import type { IInvoiceResponse } from "../../domain/invoices.types"

export function mapInvoiceToResponse(invoice: IInvoiceEntity): IInvoiceResponse {
  return {
    id: invoice.id,
    number: invoice.number,
    invoice_type: invoice.invoice_type,
    sale_id: invoice.sale_id,
    client_id: invoice.client_id ?? null,
    client_name: invoice.client_name ?? null,
    client_document: invoice.client_document ?? null,
    client_address: invoice.client_address ?? null,
    client_phone: invoice.client_phone ?? null,
    client_email: invoice.client_email ?? null,
    subtotal: invoice.subtotal,
    total: invoice.total,
    status: invoice.status,
    cancelled_at: invoice.cancelled_at?.toISOString() ?? null,
    cancelled_by: invoice.cancelled_by ?? null,
    issued_by: invoice.issued_by ?? null,
    created_at: invoice.created_at.toISOString(),
    updated_at: invoice.updated_at.toISOString(),
  }
}

