import type { IDashboardReport, IFinancialReport } from "./reports.types"

export interface IReportRepository {
  getDashboard(storeId: string): Promise<IDashboardReport>
  getFinancial(params: { from?: Date; to?: Date; storeId: string }): Promise<IFinancialReport>
}
