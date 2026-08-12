import { NotFoundError } from "@/core/errors/AppError"
import { endOfDay } from "@/core/utils/date"
import type { IInvoiceRepository } from "../domain/invoices.interface"
import type { CreateInvoiceData } from "../domain/invoices.entities"
import type { IInvoiceListResponse, IInvoiceResponse } from "../domain/invoices.types"
import { mapInvoiceToResponse } from "./common/invoices.mappers"

export const createInvoiceService = (repository: IInvoiceRepository) => ({
  create: async (data: CreateInvoiceData, storeId: string): Promise<IInvoiceResponse> =>
    mapInvoiceToResponse(await repository.create(data, storeId)),

  getById: async (id: string, storeId: string): Promise<IInvoiceResponse> => {
    const invoice = await repository.findById(id, storeId)
    if (!invoice) throw new NotFoundError("Invoice not found")
    return mapInvoiceToResponse(invoice)
  },

  list: async (params: {
    search?: string
    invoice_type?: string
    from?: string
    to?: string
    page?: number
    limit?: number
    storeId?: string
  }): Promise<IInvoiceListResponse> => {
    const result = await repository.findAll({
      search: params.search,
      invoiceType: params.invoice_type,
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? endOfDay(params.to) : undefined,
      page: params.page,
      limit: params.limit,
      storeId: params.storeId,
    })
    return {
      data: result.invoices.map(mapInvoiceToResponse),
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / result.limit)) },
    }
  },

  cancel: async (id: string, reason: string, userId: string, storeId: string): Promise<IInvoiceResponse> =>
    mapInvoiceToResponse(await repository.cancel(id, reason, userId, storeId)),
})
