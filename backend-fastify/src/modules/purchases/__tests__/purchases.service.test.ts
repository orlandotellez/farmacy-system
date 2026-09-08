import { describe, it, expect, vi, beforeEach } from "vitest"
import { createPurchaseService } from "../application/purchases.service"
import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import { SupplierRepository } from "@/modules/suppliers/infrastructure/suppliers.drizzle.repository"
import { MedicineRepository } from "@/modules/medicines/infrastructure/medicines.drizzle.repository"
import type { IPurchaseRepository } from "../domain/purchases.interface"
import type { IPurchaseEntity } from "../domain/purchases.entities"

vi.mock("@/modules/suppliers/infrastructure/suppliers.drizzle.repository", () => ({
  SupplierRepository: { findById: vi.fn() },
}))

vi.mock("@/modules/medicines/infrastructure/medicines.drizzle.repository", () => ({
  MedicineRepository: { findById: vi.fn() },
}))

function makePurchase(overrides?: Partial<IPurchaseEntity>): IPurchaseEntity {
  return {
    id: "pur-1",
    number: "P-001",
    status: "borrador",
    total: 50,
    user_id: "user-1",
    items: [
      {
        id: "item-1",
        medicine_id: "med-1",
        medicine_name: "Paracetamol 500mg",
        quantity: 10,
        unit_cost: 5,
        line_total: 50,
        received: 0,
      },
    ],
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function mockPurchaseRepository(overrides?: Partial<IPurchaseRepository>): IPurchaseRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ purchases: [makePurchase()], total: 1, page: 1, limit: 10 }),
    findById: vi.fn().mockResolvedValue(makePurchase()),
    create: vi.fn().mockResolvedValue(makePurchase()),
    update: vi.fn().mockResolvedValue(makePurchase()),
    approve: vi.fn().mockResolvedValue(makePurchase({ status: "aprobada" })),
    receive: vi.fn().mockResolvedValue(makePurchase({ status: "recibida" })),
    cancel: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe("PurchaseService", () => {
  let repo: IPurchaseRepository
  let service: ReturnType<typeof createPurchaseService>

  beforeEach(() => {
    repo = mockPurchaseRepository()
    service = createPurchaseService(repo)
    vi.mocked(SupplierRepository.findById).mockResolvedValue({ id: "sup-1" } as never)
    vi.mocked(MedicineRepository.findById).mockResolvedValue({
      id: "med-1",
      commercial_name: "Paracetamol 500mg",
    } as never)
  })

  describe("list", () => {
    it("returns paginated purchases", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({
        purchases: [makePurchase(), makePurchase({ id: "pur-2" })],
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
    it("throws NotFoundError when purchase does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("pur-x", "store-1")).rejects.toThrow(NotFoundError)
    })

    it("returns the mapped purchase", async () => {
      const result = await service.getById("pur-1", "store-1")

      expect(result.number).toBe("P-001")
    })
  })

  describe("create", () => {
    it("throws NotFoundError when the supplier does not exist", async () => {
      vi.mocked(SupplierRepository.findById).mockResolvedValue(null)

      await expect(
        service.create(
          {
            supplier_id: "sup-x",
            items: [{ medicine_id: "med-1", quantity: 5, unit_cost: 5 }],
          },
          "store-1",
          "user-1"
        )
      ).rejects.toThrow(NotFoundError)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("throws BadRequestError when a medicine is not found", async () => {
      vi.mocked(MedicineRepository.findById).mockResolvedValue(null)

      await expect(
        service.create(
          { items: [{ medicine_id: "med-x", quantity: 5, unit_cost: 5 }] },
          "store-1",
          "user-1"
        )
      ).rejects.toThrow(BadRequestError)
    })

    it("resolves medicine names and delegates to the repository", async () => {
      await service.create(
        { supplier_id: "sup-1", items: [{ medicine_id: "med-1", quantity: 5, unit_cost: 5 }] },
        "store-1",
        "user-1"
      )

      const medicineNames = new Map([["med-1", "Paracetamol 500mg"]])
      expect(SupplierRepository.findById).toHaveBeenCalledWith("sup-1", "store-1")
      expect(repo.create).toHaveBeenCalledWith(
        { supplier_id: "sup-1", items: [{ medicine_id: "med-1", quantity: 5, unit_cost: 5 }] },
        "store-1",
        "user-1",
        medicineNames
      )
    })
  })

  describe("update", () => {
    it("throws NotFoundError when purchase does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.update("pur-x", { notes: "x" }, "store-1")).rejects.toThrow(
        NotFoundError
      )
    })

    it("throws BadRequestError when purchase is not draft or pending", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePurchase({ status: "aprobada" }))

      await expect(service.update("pur-1", { notes: "x" }, "store-1")).rejects.toThrow(
        BadRequestError
      )
      expect(repo.update).not.toHaveBeenCalled()
    })

    it("throws NotFoundError when the new supplier does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePurchase({ status: "borrador" }))
      vi.mocked(SupplierRepository.findById).mockResolvedValue(null)

      await expect(
        service.update("pur-1", { supplier_id: "sup-x" }, "store-1")
      ).rejects.toThrow(NotFoundError)
    })

    it("updates items and resolves medicine names", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePurchase({ status: "borrador" }))
      vi.mocked(repo.update).mockResolvedValue(makePurchase({ notes: "urgente" }))

      const result = await service.update(
        "pur-1",
        { notes: "urgente", items: [{ medicine_id: "med-1", quantity: 8, unit_cost: 5 }] },
        "store-1"
      )

      expect(result.notes).toBe("urgente")
      expect(repo.update).toHaveBeenCalledWith(
        "pur-1",
        { notes: "urgente", items: [{ medicine_id: "med-1", quantity: 8, unit_cost: 5 }] },
        "store-1",
        new Map([["med-1", "Paracetamol 500mg"]])
      )
    })
  })

  describe("approve", () => {
    it("delegates to the repository", async () => {
      vi.mocked(repo.approve).mockResolvedValue(
        makePurchase({ status: "aprobada", approved_by: "user-1" })
      )

      const result = await service.approve("pur-1", "store-1", "user-1")

      expect(repo.approve).toHaveBeenCalledWith("pur-1", "store-1", "user-1")
      expect(result.status).toBe("aprobada")
    })
  })

  describe("receive", () => {
    const batches = [
      { batch_number: "B-1", medicine_id: "med-1", expiry_date: "2028-01-01", quantity: 10 },
    ]

    it("delegates to the repository", async () => {
      const result = await service.receive("pur-1", "store-1", "user-1", batches)

      expect(repo.receive).toHaveBeenCalledWith("pur-1", "store-1", "user-1", batches)
      expect(result.status).toBe("recibida")
    })

    it("maps PURCHASE_NOT_FOUND to NotFoundError", async () => {
      vi.mocked(repo.receive).mockRejectedValue(new Error("PURCHASE_NOT_FOUND"))

      await expect(service.receive("pur-x", "store-1", "user-1", batches)).rejects.toThrow(
        NotFoundError
      )
    })

    it("maps domain errors to BadRequestError", async () => {
      vi.mocked(repo.receive).mockRejectedValue(new Error("RECEIVED_EXCEEDS_ORDERED"))

      await expect(service.receive("pur-1", "store-1", "user-1", batches)).rejects.toThrow(
        "Received quantity exceeds the ordered quantity"
      )
    })

    it("re-throws unknown errors", async () => {
      const boom = new Error("DATABASE_DOWN")
      vi.mocked(repo.receive).mockRejectedValue(boom)

      await expect(service.receive("pur-1", "store-1", "user-1", batches)).rejects.toThrow(boom)
    })
  })

  describe("cancel", () => {
    it("throws NotFoundError when purchase does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.cancel("pur-x", "store-1")).rejects.toThrow(NotFoundError)
      expect(repo.cancel).not.toHaveBeenCalled()
    })

    it("throws BadRequestError when purchase was received", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePurchase({ status: "recibida" }))

      await expect(service.cancel("pur-1", "store-1")).rejects.toThrow(BadRequestError)
    })

    it("throws BadRequestError when purchase is already cancelled", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePurchase({ status: "anulada" }))

      await expect(service.cancel("pur-1", "store-1")).rejects.toThrow(BadRequestError)
    })

    it("cancels a draft or pending purchase", async () => {
      await service.cancel("pur-1", "store-1")

      expect(repo.cancel).toHaveBeenCalledWith("pur-1", "store-1")
    })
  })
})