export type InvoiceType = "ticket" | "simplificada" | "fiscal"
export type InvoiceStatus = "emitida" | "anulada"

export interface IInvoiceResponse {
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
  cancelled_at?: string | null
  cancelled_by?: string | null
  issued_by?: string | null
  created_at: string
  updated_at: string
}

export interface IInvoiceListResponse {
  data: IInvoiceResponse[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
