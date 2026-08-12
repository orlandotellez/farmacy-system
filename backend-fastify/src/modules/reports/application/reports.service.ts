import { endOfDay } from "@/core/utils/date"
import type { IReportRepository } from "../domain/reports.interface"
import type { IDashboardReport, IFinancialReport } from "../domain/reports.types"

export const createReportService = (repository: IReportRepository) => ({
  dashboard: async (storeId: string): Promise<IDashboardReport> => repository.getDashboard(storeId),

  financial: async (params: { from?: string; to?: string; storeId: string }): Promise<IFinancialReport> =>
    repository.getFinancial({
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? endOfDay(params.to) : undefined,
      storeId: params.storeId,
    }),
})
