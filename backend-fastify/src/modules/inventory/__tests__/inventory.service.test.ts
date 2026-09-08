import { describe, it, expect, vi, beforeEach } from "vitest"
import { createInventoryService } from "../application/inventory.service"
import { makeMedicine } from "@/__tests__/helpers"
import { NotFoundError, BadRequestError } from "@/core/errors/AppError"
import type { IInventoryRepository } from "../domain/inventory.interface"
import type { IMedicineRepository } from "@/modules/medicines/domain/medicines.interface"

function mockInventoryRepository(overrides?: Partial<IInventoryRepository>): IInventoryRepository {
  return {
    create: vi.fn().mockImplementation(async (data, userId, storeId) => ({
      id: "mov-1",
      medicine_id: data.medicine_id,
      movement_type: data.movement_type,
      quantity: data.quantity,
      note: data.note ?? null,
      user_id: userId,
      batch_id: data.batch_id ?? null,
      store_id: storeId,
      created_at: new Date(),
    })),
    findByProductId: vi.fn().mockResolvedValue([]),
    findAll: vi.fn().mockResolvedValue({ movements: [], total: 0, page: 1, limit: 10 }),
    findLowStock: vi.fn().mockResolvedValue([]),
    ...overrides,
  }
}

function mockMedicineRepo(overrides?: Partial<IMedicineRepository>): IMedicineRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ medicines: [], total: 0, page: 1, limit: 10 }),
    findById: vi.fn().mockResolvedValue(makeMedicine()),
    findByBarcode: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(makeMedicine()),
    update: vi.fn().mockResolvedValue(makeMedicine()),
    softDelete: vi.fn().mockResolvedValue(undefined),
    updateStock: vi.fn().mockResolvedValue(makeMedicine()),
    ...overrides,
  }
}

describe("InventoryService", () => {
  let movRepo: IInventoryRepository
  let medRepo: IMedicineRepository
  let service: ReturnType<typeof createInventoryService>

  beforeEach(() => {
    movRepo = mockInventoryRepository()
    medRepo = mockMedicineRepo()
    service = createInventoryService(movRepo, medRepo)
  })


  describe("create", () => {
    it("creates a movement with positive quantity", async () => {
      const result = await service.create(
        { medicine_id: "med-1", movement_type: "entrada", quantity: 10 },
        "user-1",
        "store-1"
      )

      expect(result.medicine_id).toBe("med-1")
      expect(result.movement_type).toBe("entrada")
      expect(movRepo.create).toHaveBeenCalledWith(
        { medicine_id: "med-1", movement_type: "entrada", quantity: 10 },
        "user-1",
        "store-1"
      )
    })

    it("throws NotFoundError when medicine does not exist", async () => {
      vi.mocked(medRepo.findById).mockResolvedValue(null)

      await expect(
        service.create({ medicine_id: "med-x", movement_type: "entrada", quantity: 5 }, "u1", "s1")
      ).rejects.toThrow(NotFoundError)
    })

    it("throws NotFoundError when medicine is soft-deleted", async () => {
      vi.mocked(medRepo.findById).mockResolvedValue(makeMedicine({ deleted_at: new Date() }))

      await expect(
        service.create({ medicine_id: "med-1", movement_type: "entrada", quantity: 5 }, "u1", "s1")
      ).rejects.toThrow(NotFoundError)
    })

    it("rejects zero or negative quantity for regular movements", async () => {
      await expect(
        service.create({ medicine_id: "med-1", movement_type: "salida", quantity: 0 }, "u1", "s1")
      ).rejects.toThrow(BadRequestError)

      await expect(
        service.create({ medicine_id: "med-1", movement_type: "merma", quantity: -3 }, "u1", "s1")
      ).rejects.toThrow(BadRequestError)
    })

    it("rejects zero quantity for adjustment (ajuste)", async () => {
      await expect(
        service.create({ medicine_id: "med-1", movement_type: "ajuste", quantity: 0 }, "u1", "s1")
      ).rejects.toThrow(BadRequestError)
    })

    it("allows negative adjustment quantity", async () => {
      vi.mocked(movRepo.create).mockResolvedValue({
        id: "mov-1",
        medicine_id: "med-1",
        movement_type: "ajuste",
        quantity: -5,
        note: null,
        user_id: "u1",
        batch_id: null,
        store_id: "s1",
        created_at: new Date(),
      })

      const result = await service.create(
        { medicine_id: "med-1", movement_type: "ajuste", quantity: -5 },
        "u1",
        "s1"
      )

      expect(result.quantity).toBe(-5)
    })
  })


  describe("getByProduct", () => {
    it("returns movements for a product", async () => {
      vi.mocked(movRepo.findByProductId).mockResolvedValue([
        {
          id: "mov-1",
          medicine_id: "med-1",
          movement_type: "entrada",
          quantity: 10,
          user_id: "u1",
          store_id: "s1",
          created_at: new Date(),
        },
      ])

      const result = await service.getByProduct("med-1", "store-1")

      expect(result.data).toHaveLength(1)
      expect(movRepo.findByProductId).toHaveBeenCalledWith("med-1", { storeId: "store-1" })
    })

    it("throws NotFoundError when medicine does not exist", async () => {
      vi.mocked(medRepo.findById).mockResolvedValue(null)

      await expect(service.getByProduct("med-x", "store-1")).rejects.toThrow(NotFoundError)
    })
  })


  describe("getLowStockProducts", () => {
    it("returns low stock products from repository", async () => {
      vi.mocked(movRepo.findLowStock).mockResolvedValue([
        { medicine_id: "med-1", medicine_name: "A", stock: 2, low_stock_threshold: 5, is_low_stock: true },
      ])

      const result = await service.getLowStockProducts("store-1")

      expect(result).toHaveLength(1)
      expect(result[0].is_low_stock).toBe(true)
    })
  })
})