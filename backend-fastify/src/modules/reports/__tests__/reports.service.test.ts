import { describe, it, expect, vi, beforeEach } from "vitest"
import { createReportService } from "../application/reports.service"
import type { IReportRepository } from "../domain/reports.interface"
import type { IDashboardReport } from "../domain/reports.types"

function makeDashboard(): IDashboardReport {
  return {
    today: { revenue: 100, sales_count: 5, average_ticket: 20, items_sold: 12 },
    low_stock_count: 2,
    out_of_stock_count: 1,
    expiring_soon_count: 0,
    expired_count: 0,
    revenue_30d: [{ period: "2026-01-15", revenue: 100 }],
    sales_by_payment: [{ method: "efectivo", count: 5, total: 100 }],
    top_products_week: [],
    recent_sales: [],
  }
}

function mockReportRepository(overrides?: Partial<IReportRepository>): IReportRepository {
  return {
    getDashboard: vi.fn().mockResolvedValue(makeDashboard()),
    getFinancial: vi.fn().mockResolvedValue({
      total_revenue: 500,
      total_cost: 300,
      total_profit: 200,
      profit_margin: 0.4,
      by_product: [],
      by_laboratory: [],
      cash_flow: [],
    }),
    ...overrides,
  }
}

describe("ReportService", () => {
  let repo: IReportRepository
  let service: ReturnType<typeof createReportService>

  beforeEach(() => {
    repo = mockReportRepository()
    service = createReportService(repo)
  })

  describe("dashboard", () => {
    it("delegates to the repository", async () => {
      const result = await service.dashboard("store-1")

      expect(repo.getDashboard).toHaveBeenCalledWith("store-1")
      expect(result.today.sales_count).toBe(5)
    })
  })

  describe("financial", () => {
    it("converts from and to into Date objects with end of day", async () => {
      const result = await service.financial({ from: "2026-01-01", to: "2026-01-15", storeId: "store-1" })

      const [params] = vi.mocked(repo.getFinancial).mock.calls[0]
      expect(params?.from).toBeInstanceOf(Date)
      expect(params?.to).toBeInstanceOf(Date)
      expect(params?.to!.getHours()).toBe(23)
      expect(params?.storeId).toBe("store-1")
      expect(result.total_profit).toBe(200)
    })

    it("leaves dates undefined when not provided", async () => {
      await service.financial({ storeId: "store-1" })

      const [params] = vi.mocked(repo.getFinancial).mock.calls[0]
      expect(params?.from).toBeUndefined()
      expect(params?.to).toBeUndefined()
    })
  })
})