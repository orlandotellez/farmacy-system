import { describe, it, expect, vi, beforeEach } from "vitest"
import { createClientService } from "../application/clients.service"
import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import type { IClientRepository } from "../domain/clients.interface"
import type { IClientEntity } from "../domain/clients.entities"

function makeClient(overrides?: Partial<IClientEntity>): IClientEntity {
  return {
    id: "client-1",
    full_name: "Juan Perez",
    document_type: "DNI",
    is_frequent: false,
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function mockClientRepository(overrides?: Partial<IClientRepository>): IClientRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ clients: [makeClient()], total: 1, page: 1, limit: 10 }),
    findById: vi.fn().mockResolvedValue(makeClient()),
    create: vi.fn().mockResolvedValue(makeClient()),
    update: vi.fn().mockResolvedValue(makeClient()),
    softDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

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

    it("returns an empty history summary for now", async () => {
      const result = await service.getHistory("client-1", "store-1")

      expect(result.client.full_name).toBe("Juan Perez")
      expect(result.sales).toEqual([])
      expect(result.prescriptions).toEqual([])
      expect(result.total_spent).toBe(0)
      expect(result.visit_count).toBe(0)
      expect(result.frequent_products).toEqual([])
    })
  })
})