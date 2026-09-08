import { describe, it, expect, vi, beforeEach } from "vitest"
import { createCategoryService } from "../application/categories.service"
import { mockCategoryRepository, makeCategory } from "@/__tests__/helpers"
import { NotFoundError, ConflictError, BadRequestError } from "@/core/errors/AppError"
import type { ICategoryRepository } from "../domain/categories.interface"

describe("CategoryService", () => {
  let repo: ICategoryRepository
  let service: ReturnType<typeof createCategoryService>

  beforeEach(() => {
    repo = mockCategoryRepository()
    service = createCategoryService(repo)
  })


  describe("list", () => {
    it("returns paginated categories from repository", async () => {
      const cats = [makeCategory({ name: "A" }), makeCategory({ name: "B" })]
      vi.mocked(repo.findAll).mockResolvedValue({ categories: cats, total: 2, page: 1, limit: 10 })

      const result = await service.list({ page: 1, limit: 10 })

      expect(result.data).toHaveLength(2)
      expect(result.meta.total).toBe(2)
      expect(result.meta.totalPages).toBe(1)
      expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 })
    })

    it("calculates totalPages correctly", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({ categories: [], total: 25, page: 1, limit: 10 })

      const result = await service.list()

      expect(result.meta.totalPages).toBe(3)
    })

    it("returns at least 1 totalPages when total is 0", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({ categories: [], total: 0, page: 1, limit: 10 })

      const result = await service.list()

      expect(result.meta.totalPages).toBe(1)
    })
  })


  describe("getById", () => {
    it("returns a category by id", async () => {
      const cat = makeCategory({ id: "cat-123" })
      vi.mocked(repo.findById).mockResolvedValue(cat)

      const result = await service.getById("cat-123")

      expect(result.id).toBe("cat-123")
      expect(result.name).toBe("Antibióticos")
    })

    it("throws NotFoundError when category does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("nonexistent")).rejects.toThrow(NotFoundError)
    })

    it("throws NotFoundError when category is soft-deleted", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeCategory({ deleted_at: new Date() }))

      await expect(service.getById("cat-123")).rejects.toThrow(NotFoundError)
    })
  })


  describe("create", () => {
    it("creates a category with valid data", async () => {
      vi.mocked(repo.findByName).mockResolvedValue(null)
      const created = makeCategory({ name: "Nueva Categoría" })
      vi.mocked(repo.create).mockResolvedValue(created)

      const result = await service.create({ name: "Nueva Categoría" })

      expect(result.name).toBe("Nueva Categoría")
      expect(repo.create).toHaveBeenCalledOnce()
    })

    it("throws BadRequestError when name is empty", async () => {
      await expect(service.create({ name: "" })).rejects.toThrow(BadRequestError)
      await expect(service.create({ name: "   " })).rejects.toThrow(BadRequestError)
    })

    it("throws ConflictError when name already exists in the store", async () => {
      vi.mocked(repo.findByName).mockResolvedValue(makeCategory({ name: "Existente" }))

      await expect(service.create({ name: "Existente" })).rejects.toThrow(ConflictError)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("throws ConflictError on DB unique violation (race condition)", async () => {
      vi.mocked(repo.findByName).mockResolvedValue(null)
      const uniqueViolation = Object.assign(new Error("duplicate key"), { code: "23505" })
      vi.mocked(repo.create).mockRejectedValue(uniqueViolation)

      await expect(service.create({ name: "Race" })).rejects.toThrow(ConflictError)
    })
  })


  describe("update", () => {
    it("updates a category", async () => {
      const existing = makeCategory({ id: "cat-1", name: "Viejo Nombre" })
      vi.mocked(repo.findById).mockResolvedValue(existing)
      vi.mocked(repo.findByName).mockResolvedValue(null)
      vi.mocked(repo.update).mockResolvedValue({ ...existing, name: "Nuevo Nombre" })

      const result = await service.update("cat-1", { name: "Nuevo Nombre" })

      expect(result.name).toBe("Nuevo Nombre")
    })

    it("throws NotFoundError when category does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.update("nonexistent", { name: "X" })).rejects.toThrow(NotFoundError)
    })

    it("throws ConflictError when new name conflicts with another category", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeCategory({ id: "cat-1", name: "A" }))
      vi.mocked(repo.findByName).mockResolvedValue(makeCategory({ id: "cat-2", name: "B" }))

      await expect(service.update("cat-1", { name: "B" })).rejects.toThrow(ConflictError)
    })

    it("allows keeping the same name", async () => {
      const existing = makeCategory({ id: "cat-1", name: "MismoNombre" })
      vi.mocked(repo.findById).mockResolvedValue(existing)
      vi.mocked(repo.update).mockResolvedValue(existing)

      const result = await service.update("cat-1", { name: "MismoNombre" })

      expect(result.name).toBe("MismoNombre")
      expect(repo.findByName).not.toHaveBeenCalled()
    })
  })


  describe("delete", () => {
    it("soft-deletes an existing category", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeCategory({ id: "cat-1" }))

      await service.delete("cat-1")

      expect(repo.softDelete).toHaveBeenCalledWith("cat-1", undefined)
    })

    it("throws NotFoundError when category does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.delete("nonexistent")).rejects.toThrow(NotFoundError)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })

    it("throws NotFoundError when category is already deleted", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeCategory({ deleted_at: new Date() }))

      await expect(service.delete("cat-1")).rejects.toThrow(NotFoundError)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })
  })
})
