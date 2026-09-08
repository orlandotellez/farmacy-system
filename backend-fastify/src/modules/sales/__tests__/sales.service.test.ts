import { describe, it, expect, vi, beforeEach } from "vitest"
import { createSaleService } from "../application/sales.service"
import { mockSaleRepository, makeSale, makeCreateSaleData } from "@/__tests__/helpers"
import { NotFoundError } from "@/core/errors/AppError"
import type { ISaleRepository } from "../domain/sales.interface"

describe("SaleService", () => {
  let repo: ISaleRepository
  let service: ReturnType<typeof createSaleService>

  beforeEach(() => {
    repo = mockSaleRepository()
    service = createSaleService(repo)
  })


  describe("create", () => {
    it("creates a sale and maps the entity to a response", async () => {
      const created = makeSale({ id: "sale-123", total: 10.0, items: [] })
      vi.mocked(repo.create).mockResolvedValue(created)

      const result = await service.create(makeCreateSaleData(), "store-1")

      expect(result.id).toBe("sale-123")
      expect(result.total).toBe(10.0)
      expect(result.payment_method).toBe("efectivo")
      expect(result.created_at).toBe("2026-01-15T10:00:00.000Z")
      expect(result.created_at).not.toBeInstanceOf(Date)
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: "user-1", payment_method: "efectivo" }),
        "store-1"
      )
    })
  })


  describe("getById", () => {
    it("returns a sale by id and store", async () => {
      const sale = makeSale({ id: "sale-1" })
      vi.mocked(repo.findById).mockResolvedValue(sale)

      const result = await service.getById("sale-1", "store-1")

      expect(result.id).toBe("sale-1")
      expect(repo.findById).toHaveBeenCalledWith("sale-1", "store-1")
    })

    it("throws NotFoundError when the sale does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("nonexistent", "store-1")).rejects.toThrow(NotFoundError)
    })
  })


  describe("cancel", () => {
    it("cancels a sale with reason and user", async () => {
      const cancelled = makeSale({ id: "sale-1", status: "anulada", cancellation_reason: "Error de caja" })
      vi.mocked(repo.cancel).mockResolvedValue(cancelled)

      const result = await service.cancel("sale-1", "Error de caja", "user-1", "store-1")

      expect(result.status).toBe("anulada")
      expect(result.cancellation_reason).toBe("Error de caja")
      expect(repo.cancel).toHaveBeenCalledWith("sale-1", "Error de caja", "user-1", "store-1")
    })
  })


  describe("list", () => {
    it("returns paginated sales and maps to response", async () => {
      const sales = [makeSale({ id: "sale-1" }), makeSale({ id: "sale-2" })]
      vi.mocked(repo.findAll).mockResolvedValue({ sales, total: 2, page: 1, limit: 10 })

      const result = await service.list({ page: 1, limit: 10, storeId: "store-1" })

      expect(result.data).toHaveLength(2)
      expect(result.meta.total).toBe(2)
      expect(result.meta.totalPages).toBe(1)
    })

    it("converts ISO date strings to Date objects for the repository", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({ sales: [], total: 0, page: 1, limit: 10 })

      await service.list({ from: "2026-01-01", to: "2026-01-31", storeId: "store-1" })

      const [params] = vi.mocked(repo.findAll).mock.calls[0]
      expect(params?.from).toBeInstanceOf(Date)
      expect(params?.to).toBeInstanceOf(Date)

      expect(params?.to!.getHours()).toBe(23)
      expect(params?.to!.getMinutes()).toBe(59)
      expect(params?.to!.getSeconds()).toBe(59)
    })

    it("forwards snake_case query params to the repository as camelCase", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({ sales: [], total: 0, page: 1, limit: 10 })

      await service.list({ payment_method: "tarjeta_debito", user_id: "user-1", min_amount: 50, min_items: 2, storeId: "store-1" })

      const [params] = vi.mocked(repo.findAll).mock.calls[0]
      expect(params?.paymentMethod).toBe("tarjeta_debito")
      expect(params?.userId).toBe("user-1")
      expect(params?.minAmount).toBe(50)
      expect(params?.minItems).toBe(2)
    })
  })


  describe("getReport", () => {
    it("delegates to repository with converted dates", async () => {
      const report = {
        total_sales: 10,
        total_revenue: 1000,
        total_profit: 300,
        average_ticket: 100,
        by_payment_method: { efectivo: 700, tarjeta_debito: 300 },
        top_products: [],
      }
      vi.mocked(repo.getReport).mockResolvedValue(report)

      const result = await service.getReport({ from: "2026-01-01", to: "2026-01-31", storeId: "store-1" })

      expect(result.total_sales).toBe(10)
      expect(result.total_revenue).toBe(1000)
      const [params] = vi.mocked(repo.getReport).mock.calls[0]
      expect(params?.from).toBeInstanceOf(Date)
      expect(params?.to).toBeInstanceOf(Date)
    })
  })


  describe("getRevenueTrend", () => {
    it("delegates to repository with converted dates and group_by", async () => {
      const trend = [{ period: "2026-01-01", revenue: 100, count: 2 }]
      vi.mocked(repo.getRevenueTrend).mockResolvedValue(trend)

      const result = await service.getRevenueTrend({
        start_date: "2026-01-01",
        end_date: "2026-01-10",
        group_by: "day",
        store_id: "store-1",
      })

      expect(result).toEqual(trend)
      const call = vi.mocked(repo.getRevenueTrend).mock.calls[0][0]
      expect(call.startDate).toBeInstanceOf(Date)
      expect(call.groupBy).toBe("day")
      expect(call.storeId).toBe("store-1")
    })
  })
})