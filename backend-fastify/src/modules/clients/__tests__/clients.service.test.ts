import { describe, it, expect, vi, beforeEach } from "vitest"
import { createClientService } from "../application/clients.service"
import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import type { IClientRepository } from "../domain/clients.interface"
import { makeClient, mockClientRepository } from "@/__tests__/helpers"

describe("ClientService", () => {
  let repo: IClientRepository
  let service: ReturnType<typeof createClientService>

  beforeEach(() => {
    repo = mockClientRepository()
    service = createClientService(repo)
  })

  describe("list", () => {
    it("returns paginated clients", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({
        clients: [makeClient(), makeClient({ id: "client-2" })],
        total: 2,
        page: 1,
        limit: 10,
      })

      const result = await service.list({ page: 1, limit: 10, storeId: "store-1" })

      expect(result.data).toHaveLength(2)
      expect(result.meta.totalPages).toBe(1)
    })
  })

  describe("getById", () => {
    it("throws NotFoundError when client does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("client-x", "store-1")).rejects.toThrow(NotFoundError)
    })

    it("returns the mapped client", async () => {
      const result = await service.getById("client-1", "store-1")

      expect(result.full_name).toBe("Juan Perez")
    })
  })

  describe("create", () => {
    it("throws BadRequestError when full name is empty", async () => {
      await expect(service.create({ full_name: "  " }, "store-1")).rejects.toThrow(
        BadRequestError
      )
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("creates a client scoped to the store", async () => {
      const result = await service.create({ full_name: "Juan Perez" }, "store-1")

      expect(repo.create).toHaveBeenCalledWith({ full_name: "Juan Perez" }, "store-1")
      expect(result.full_name).toBe("Juan Perez")
    })
  })

  describe("update", () => {
    it("throws NotFoundError when client does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(
        service.update("client-x", { phone: "555" }, "store-1")
      ).rejects.toThrow(NotFoundError)
      expect(repo.update).not.toHaveBeenCalled()
    })

    it("updates an existing client", async () => {
      const result = await service.update("client-1", { phone: "555" }, "store-1")

      expect(repo.update).toHaveBeenCalledWith("client-1", { phone: "555" }, "store-1")
      expect(result.phone).toBeNull()
    })
  })

  describe("delete", () => {
    it("soft-deletes an existing client", async () => {
      await service.delete("client-1", "store-1")

      expect(repo.softDelete).toHaveBeenCalledWith("client-1", "store-1")
    })

    it("throws NotFoundError when client does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.delete("client-x", "store-1")).rejects.toThrow(NotFoundError)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })
  })

  describe("getHistory", () => {
    it("throws NotFoundError when client does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getHistory("client-x", "store-1")).rejects.toThrow(NotFoundError)
    })

    it("returns zeros and empty arrays when the client has no data", async () => {
      vi.mocked(repo.findSalesByClient).mockResolvedValue([])
      vi.mocked(repo.findPrescriptionsByClient).mockResolvedValue([])
      vi.mocked(repo.findFrequentProductsByClient).mockResolvedValue([])

      const result = await service.getHistory("client-1", "store-1")

      expect(result.client.full_name).toBe("Juan Perez")
      expect(result.sales).toEqual([])
      expect(result.prescriptions).toEqual([])
      expect(result.total_spent).toBe(0)
      expect(result.visit_count).toBe(0)
      expect(result.frequent_products).toEqual([])
    })

    it("aggregates total_spent and visit_count from completada sales", async () => {
      vi.mocked(repo.findSalesByClient).mockResolvedValue([
        { id: "sale-1", total: 100, created_at: "2026-01-15T10:00:00.000Z", payment_method: "efectivo" },
        { id: "sale-2", total: 200, created_at: "2026-01-14T10:00:00.000Z", payment_method: "tarjeta" },
        { id: "sale-3", total: 50, created_at: "2026-01-13T10:00:00.000Z", payment_method: "efectivo" },
      ])

      const result = await service.getHistory("client-1", "store-1")

      expect(result.total_spent).toBe(350)
      expect(result.visit_count).toBe(3)
      // rows are mapped to the IClientSaleSummary subtype (payment_method dropped)
      expect(result.sales).toEqual([
        { id: "sale-1", total: 100, created_at: "2026-01-15T10:00:00.000Z" },
        { id: "sale-2", total: 200, created_at: "2026-01-14T10:00:00.000Z" },
        { id: "sale-3", total: 50, created_at: "2026-01-13T10:00:00.000Z" },
      ])
    })

    it("excludes anulada sales from total_spent and visit_count (repo filters completada only)", async () => {
      // anulada rows never reach the service: the repository filters status='completada'
      vi.mocked(repo.findSalesByClient).mockResolvedValue([
        { id: "sale-1", total: 300, created_at: "2026-01-15T10:00:00.000Z", payment_method: "efectivo" },
      ])

      const result = await service.getHistory("client-1", "store-1")

      expect(result.total_spent).toBe(300)
      expect(result.visit_count).toBe(1)
      expect(result.sales).toHaveLength(1)
    })

    it("passes through only non-deleted prescriptions", async () => {
      // soft-deleted rows never reach the service: the repository filters deletedAt IS NULL
      vi.mocked(repo.findPrescriptionsByClient).mockResolvedValue([
        { id: "rx-1", number: "RX-001", status: "validada" },
        { id: "rx-2", number: "RX-002", status: "pendiente" },
      ])

      const result = await service.getHistory("client-1", "store-1")

      expect(result.prescriptions).toEqual([
        { id: "rx-1", number: "RX-001", status: "validada" },
        { id: "rx-2", number: "RX-002", status: "pendiente" },
      ])
    })

    it("passes through the top-5 frequent products in descending order", async () => {
      vi.mocked(repo.findFrequentProductsByClient).mockResolvedValue([
        { medicine_id: "med-a", medicine_name: "A", quantity: 10 },
        { medicine_id: "med-b", medicine_name: "B", quantity: 5 },
        { medicine_id: "med-c", medicine_name: "C", quantity: 3 },
        { medicine_id: "med-d", medicine_name: "D", quantity: 2 },
        { medicine_id: "med-e", medicine_name: "E", quantity: 1 },
      ])

      const result = await service.getHistory("client-1", "store-1")

      expect(result.frequent_products).toHaveLength(5)
      expect(result.frequent_products.map((product) => product.medicine_id)).toEqual([
        "med-a",
        "med-b",
        "med-c",
        "med-d",
        "med-e",
      ])
    })

    it("sums string totals numerically (Postgres numeric returns strings)", async () => {
      vi.mocked(repo.findSalesByClient).mockResolvedValue([
        { id: "sale-1", total: "123.45" as unknown as number, created_at: "2026-01-15T10:00:00.000Z", payment_method: "efectivo" },
        { id: "sale-2", total: "76.55" as unknown as number, created_at: "2026-01-14T10:00:00.000Z", payment_method: "efectivo" },
      ])

      const result = await service.getHistory("client-1", "store-1")

      expect(result.total_spent).toBe(200)
      expect(result.sales[0]?.total).toBe(123.45)
      expect(typeof result.sales[0]?.total).toBe("number")
    })
  })
})