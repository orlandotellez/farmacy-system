import { describe, it, expect, vi, beforeEach } from "vitest"
import { createInvoiceService } from "../application/invoices.service"
import { NotFoundError } from "@/core/errors/AppError"
import type { IInvoiceRepository } from "../domain/invoices.interface"
import type { IInvoiceEntity } from "../domain/invoices.entities"

function makeInvoice(overrides?: Partial<IInvoiceEntity>): IInvoiceEntity {
  return {
    id: "inv-1",
    number: "F001",
    invoice_type: "ticket",
    sale_id: "sale-1",
    subtotal: 100,
    total: 100,
    status: "emitida",
    issued_by: "user-1",
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function mockInvoiceRepository(overrides?: Partial<IInvoiceRepository>): IInvoiceRepository {
  return {
    create: vi.fn().mockResolvedValue(makeInvoice()),
    findById: vi.fn().mockResolvedValue(makeInvoice()),
    findAll: vi.fn().mockResolvedValue({ invoices: [makeInvoice()], total: 1, page: 1, limit: 10 }),
    cancel: vi.fn().mockResolvedValue(makeInvoice({ status: "anulada" })),
    ...overrides,
  }
}

describe("InvoiceService", () => {
  let repo: IInvoiceRepository
  let service: ReturnType<typeof createInvoiceService>

  beforeEach(() => {
    repo = mockInvoiceRepository()
    service = createInvoiceService(repo)
  })

  describe("create", () => {
    it("delegates to the repository", async () => {
      const data = {
        sale_id: "sale-1",
        invoice_type: "fiscal" as const,
        user_id: "user-1",
      }

      const result = await service.create(data, "store-1")

      expect(repo.create).toHaveBeenCalledWith(data, "store-1")
      expect(result.invoice_type).toBe("ticket")
    })
  })

  describe("getById", () => {
    it("throws NotFoundError when invoice does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("inv-x", "store-1")).rejects.toThrow(NotFoundError)
    })

    it("returns the mapped invoice", async () => {
      const result = await service.getById("inv-1", "store-1")

      expect(result.number).toBe("F001")
    })
  })

  describe("list", () => {
    it("converts from and to into Date objects", async () => {
      await service.list({
        from: "2026-01-01",
        to: "2026-01-15",
        storeId: "store-1",
      })

      const [params] = vi.mocked(repo.findAll).mock.calls[0]
      expect(params?.from).toBeInstanceOf(Date)
      expect(params?.to).toBeInstanceOf(Date)
      expect(params?.to!.getHours()).toBe(23)
      expect(params?.to!.getMinutes()).toBe(59)
      expect(params?.to!.getSeconds()).toBe(59)
    })

    it("maps invoice_type to invoiceType", async () => {
      await service.list({ invoice_type: "fiscal", storeId: "store-1" })

      const [params] = vi.mocked(repo.findAll).mock.calls[0]
      expect(params?.invoiceType).toBe("fiscal")
    })

    it("returns paginated invoices", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({
        invoices: [makeInvoice(), makeInvoice({ id: "inv-2" })],
        total: 2,
        page: 1,
        limit: 10,
      })

      const result = await service.list({ page: 1, limit: 10, storeId: "store-1" })

      expect(result.data).toHaveLength(2)
      expect(result.meta.totalPages).toBe(1)
    })
  })

  describe("cancel", () => {
    it("delegates cancellation to the repository", async () => {
      const result = await service.cancel("inv-1", "Cliente pidió anulación", "user-1", "store-1")

      expect(repo.cancel).toHaveBeenCalledWith("inv-1", "Cliente pidió anulación", "user-1", "store-1")
      expect(result.status).toBe("anulada")
    })
  })
})