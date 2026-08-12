import type { CreateInvoiceData, IInvoiceEntity } from "./invoices.entities"

export interface IInvoiceRepository {
  create(data: CreateInvoiceData, storeId: string): Promise<IInvoiceEntity>
  findById(id: string, storeId: string): Promise<IInvoiceEntity | null>
  findAll(params?: {
    search?: string
    invoiceType?: string
    from?: Date
    to?: Date
    page?: number
    limit?: number
    storeId?: string
  }): Promise<{ invoices: IInvoiceEntity[]; total: number; page: number; limit: number }>
  cancel(id: string, reason: string, userId: string, storeId: string): Promise<IInvoiceEntity>
}
