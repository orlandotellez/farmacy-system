import { NotFoundError } from "@/core/errors/AppError"
import type { ISaleRepository } from "../domain/sales.interface"
import type { CreateSaleData } from "../domain/sales.entities"
import type { GroupBy, ISaleListResponse, ISaleReport, ISaleResponse, IRevenueTrendItem } from "../domain/sales.types"
import { endOfDay, mapSaleToResponse } from "./common/sales.mappers"

export const createSaleService = (repository: ISaleRepository) => ({
  create: async (data: CreateSaleData, storeId: string): Promise<ISaleResponse> =>
    mapSaleToResponse(await repository.create(data, storeId)),

  getById: async (id: string, storeId: string): Promise<ISaleResponse> => {
    const sale = await repository.findById(id, storeId)
    if (!sale) throw new NotFoundError("Sale not found")
    return mapSaleToResponse(sale)
  },

  cancel: async (id: string, reason: string, userId: string, storeId: string): Promise<ISaleResponse> =>
    mapSaleToResponse(await repository.cancel(id, reason, userId, storeId)),

  list: async (params: {
    from?: string
    to?: string
    status?: string
    payment_method?: string
    user_id?: string
    search?: string
    min_amount?: number
    min_items?: number
    page?: number
    limit?: number
    storeId?: string
  }): Promise<ISaleListResponse> => {
    const result = await repository.findAll({
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? endOfDay(params.to) : undefined,
      status: params.status,
      paymentMethod: params.payment_method,
      userId: params.user_id,
      search: params.search,
      minAmount: params.min_amount,
      minItems: params.min_items,
      page: params.page,
      limit: params.limit,
      storeId: params.storeId,
    })
    return {
      data: result.sales.map(mapSaleToResponse),
      meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / result.limit)) },
    }
  },

  getReport: async (params: { from?: string; to?: string; storeId?: string }): Promise<ISaleReport> =>
    repository.getReport({
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? endOfDay(params.to) : undefined,
      storeId: params.storeId,
    }),

  getRevenueTrend: async (params: { start_date: string; end_date: string; group_by: GroupBy; store_id: string }): Promise<IRevenueTrendItem[]> =>
    repository.getRevenueTrend({
      startDate: new Date(params.start_date),
      endDate: endOfDay(params.end_date),
      groupBy: params.group_by,
      storeId: params.store_id,
    }),
})
