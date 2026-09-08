import { describe, it, expect, vi, beforeEach } from "vitest"
import { createSupplierService } from "../application/suppliers.service"
import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError"
import type { ISupplierRepository } from "../domain/suppliers.interface"
import type { ISupplierEntity } from "../domain/suppliers.entities"

function makeSupplier(overrides?: Partial<ISupplierEntity>): ISupplierEntity {
  return {
    id: "sup-1",
    name: "Distribuidora Norte",
    ruc: "123456789",
    is_active: true,
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function mockSupplierRepository(overrides?: Partial<ISupplierRepository>): ISupplierRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ suppliers: [makeSupplier()], total: 1, page: 1, limit: 10 }),
    findById: vi.fn().mockResolvedValue(makeSupplier()),
    findByRuc: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(makeSupplier()),
    update: vi.fn().mockResolvedValue(makeSupplier()),
    softDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe("SupplierService", () => {
  let repo: ISupplierRepository
  let service: ReturnType<typeof createSupplierService>

  beforeEach(() => {
    repo = mockSupplierRepository()
    service = createSupplierService(repo)
  })

  describe("list", () => {
    it("returns paginated suppliers", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({
        suppliers: [makeSupplier(), makeSupplier({ id: "sup-2" })],
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
    it("throws NotFoundError when supplier does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("sup-x", "store-1")).rejects.toThrow(NotFoundError)
    })

    it("returns the mapped supplier", async () => {
      const result = await service.getById("sup-1", "store-1")

      expect(result.name).toBe("Distribuidora Norte")
    })
  })

  describe("create", () => {
    it("throws BadRequestError when name is empty", async () => {
      await expect(service.create({ name: "   " }, "store-1")).rejects.toThrow(BadRequestError)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("throws ConflictError when RUC already exists", async () => {
      vi.mocked(repo.findByRuc).mockResolvedValue(makeSupplier())

      await expect(service.create({ name: "Otro", ruc: "123456789" }, "store-1")).rejects.toThrow(
        ConflictError
      )
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("throws ConflictError on unique violation race", async () => {
      const uniqueViolation = Object.assign(new Error("dup"), { code: "23505" })
      vi.mocked(repo.create).mockRejectedValue(uniqueViolation)

      await expect(service.create({ name: "Otro", ruc: "999" }, "store-1")).rejects.toThrow(
        ConflictError
      )
    })

    it("creates a supplier", async () => {
      const result = await service.create({ name: "Distribuidora Norte", ruc: "123456789" }, "store-1")

      expect(repo.create).toHaveBeenCalledWith(
        { name: "Distribuidora Norte", ruc: "123456789" },
        "store-1"
      )
      expect(result.name).toBe("Distribuidora Norte")
    })
  })

  describe("update", () => {
    it("throws NotFoundError when supplier does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(
        service.update("sup-x", { name: "Nuevo" }, "store-1")
      ).rejects.toThrow(NotFoundError)
    })

    it("throws ConflictError when changing to an existing RUC", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeSupplier({ ruc: "111" }))
      vi.mocked(repo.findByRuc).mockResolvedValue(makeSupplier({ id: "sup-2", ruc: "222" }))

      await expect(service.update("sup-1", { ruc: "222" }, "store-1")).rejects.toThrow(
        ConflictError
      )
    })

    it("updates when RUC is unchanged", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeSupplier({ ruc: "111" }))

      await service.update("sup-1", { name: "Nuevo nombre" }, "store-1")

      expect(repo.findByRuc).not.toHaveBeenCalled()
      expect(repo.update).toHaveBeenCalledWith(
        "sup-1",
        { name: "Nuevo nombre" },
        "store-1"
      )
    })
  })

  describe("delete", () => {
    it("soft-deletes an existing supplier", async () => {
      await service.delete("sup-1", "store-1")

      expect(repo.softDelete).toHaveBeenCalledWith("sup-1", "store-1")
    })

    it("throws NotFoundError when supplier does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.delete("sup-x", "store-1")).rejects.toThrow(NotFoundError)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })
  })
})