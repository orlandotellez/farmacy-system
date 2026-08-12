import type { CreateSaleData, ISaleEntity } from "./sales.entities"
import type { GroupBy, ISaleReport, IRevenueTrendItem } from "./sales.types"

export interface ISaleRepository {
  create(data: CreateSaleData, storeId: string): Promise<ISaleEntity>
  findById(id: string, storeId: string): Promise<ISaleEntity | null>
  findAll(params?: {
    from?: Date
    to?: Date
    status?: string
    paymentMethod?: string
    search?: string
    userId?: string
    minAmount?: number
    minItems?: number
    page?: number
    limit?: number
    storeId?: string
  }): Promise<{ sales: ISaleEntity[]; total: number; page: number; limit: number }>
  cancel(id: string, reason: string, userId: string, storeId: string): Promise<ISaleEntity>
  getReport(params?: { from?: Date; to?: Date; storeId?: string }): Promise<ISaleReport>
  getRevenueTrend(params: { startDate: Date; endDate: Date; groupBy: GroupBy; storeId: string }): Promise<IRevenueTrendItem[]>
}
