import type { InvoiceStatus, InvoiceType } from "./invoices.types"

export interface IInvoiceEntity {
  id: string
  number: string
  invoice_type: InvoiceType
  sale_id: string
  client_id?: string | null
  client_name?: string | null
  client_document?: string | null
  client_address?: string | null
  client_phone?: string | null
  client_email?: string | null
  subtotal: number
  total: number
  status: InvoiceStatus
  cancelled_at?: Date | null
  cancelled_by?: string | null
  issued_by?: string | null
  created_at: Date
  updated_at: Date
}

export interface CreateInvoiceData {
  sale_id: string
  invoice_type: InvoiceType
  client_name?: string
  client_document?: string
  client_address?: string
  client_phone?: string
  client_email?: string
  user_id: string
}
