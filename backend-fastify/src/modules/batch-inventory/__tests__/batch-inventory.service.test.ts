import { describe, it, expect, vi, beforeEach } from "vitest"
import { createBatchInventoryService } from "../application/batch-inventory.service"
import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import type { IBatchInventoryRepository } from "../domain/batch-inventory.interface"
import type { IBatchEntity } from "../domain/batch-inventory.entities"

function makeBatch(overrides?: Partial<IBatchEntity>): IBatchEntity {
  return {
    id: "batch-1",
    batch_number: "B-001",
    medicine_id: "med-1",
    expiry_date: new Date("2028-01-01T00:00:00Z"),
    quantity: 50,
    user_id: "user-1",
    store_id: "store-1",
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function mockBatchRepository(overrides?: Partial<IBatchInventoryRepository>): IBatchInventoryRepository {
  return {
    create: vi.fn().mockResolvedValue(makeBatch()),
    findById: vi.fn().mockResolvedValue(makeBatch()),
    findAll: vi.fn().mockResolvedValue({ batches: [makeBatch()], total: 1, page: 1, limit: 10 }),
    update: vi.fn().mockResolvedValue(makeBatch()),
    ...overrides,
  }
}

const futureExpiry = "2030-06-30"

describe("BatchInventoryService", () => {
  let repo: IBatchInventoryRepository
  let service: ReturnType<typeof createBatchInventoryService>

  beforeEach(() => {
    repo = mockBatchRepository()
    service = createBatchInventoryService(repo)
  })

  describe("create", () => {
    it("throws BadRequestError when expiry date is in the past", async () => {
      await expect(
        service.create(
          { batch_number: "B-2", medicine_id: "med-1", expiry_date: "2020-01-01", quantity: 10 },
          "user-1",
          "store-1"
        )
      ).rejects.toThrow(BadRequestError)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("throws BadRequestError when expiry date is invalid", async () => {
      await expect(
        service.create(
          { batch_number: "B-2", medicine_id: "med-1", expiry_date: "not-a-date", quantity: 10 },
          "user-1",
          "store-1"
        )
      ).rejects.toThrow(BadRequestError)
    })

    it("throws BadRequestError when manufacture date equals or exceeds expiry date crossing check", async () => {
      await expect(
        service.create(
          {
            batch_number: "B-2",
            medicine_id: "med-1",
            manufacture_date: "2031-01-01",
            expiry_date: futureExpiry,
            quantity: 10,
          },
          "user-1",
          "store-1"
        )
      ).rejects.toThrow("Manufacture date cannot be after expiry date")
    })

    it("throws BadRequestError when manufacture date is invalid", async () => {
      await expect(
        service.create(
          {
            batch_number: "B-2",
            medicine_id: "med-1",
            manufacture_date: "invalid",
            expiry_date: futureExpiry,
            quantity: 10,
          },
          "user-1",
          "store-1"
        )
      ).rejects.toThrow(BadRequestError)
    })

    it("creates a valid batch", async () => {
      const data = {
        batch_number: "B-2",
        medicine_id: "med-1",
        manufacture_date: "2026-05-01",
        expiry_date: futureExpiry,
        quantity: 10,
      }

      const result = await service.create(data, "user-1", "store-1")

      expect(repo.create).toHaveBeenCalledWith(data, "user-1", "store-1")
      expect(result.batch_number).toBe("B-001")
    })
  })

  describe("getById", () => {
    it("throws NotFoundError when batch does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("batch-x", "store-1")).rejects.toThrow(NotFoundError)
    })

    it("returns the mapped batch", async () => {
      const result = await service.getById("batch-1", "store-1")

      expect(result.batch_number).toBe("B-001")
    })
  })

  describe("list", () => {
    it("returns paginated batches", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({
        batches: [makeBatch(), makeBatch({ id: "batch-2" })],
        total: 2,
        page: 1,
        limit: 10,
      })

      const result = await service.list({ page: 1, limit: 10, storeId: "store-1" })

      expect(result.data).toHaveLength(2)
      expect(result.meta.totalPages).toBe(1)
    })
  })

  describe("update", () => {
    it("throws BadRequestError when new expiry date is in the past", async () => {
      await expect(
        service.update("batch-1", { expiry_date: "2020-01-01" }, "user-1", "store-1")
      ).rejects.toThrow(BadRequestError)
      expect(repo.update).not.toHaveBeenCalled()
    })

    it("updates without date validation when expiry is unchanged", async () => {
      const result = await service.update("batch-1", { notes: "revisado" }, "user-1", "store-1")

      expect(repo.update).toHaveBeenCalledWith("batch-1", { notes: "revisado" }, "user-1", "store-1")
      expect(result.notes).not.toBeUndefined()
    })
  })
})