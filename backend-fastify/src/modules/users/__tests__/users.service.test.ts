import { describe, it, expect, vi, beforeEach } from "vitest"
import { createUserService } from "../application/users.service"
import { NotFoundError, ConflictError } from "@/core/errors/AppError"
import type { IUserRepository } from "../domain/users.interface"
import type { IUserEntity } from "../domain/users.entities"

function makeUser(overrides?: Partial<IUserEntity>): IUserEntity {
  return {
    id: "user-1",
    name: "Ana",
    email: "ana@mail.com",
    email_verified: false,
    role: "cajero",
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function mockUserRepository(overrides?: Partial<IUserRepository>): IUserRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ users: [makeUser()], total: 1, page: 1, limit: 10 }),
    findById: vi.fn().mockResolvedValue(makeUser()),
    findByEmail: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(makeUser()),
    update: vi.fn().mockResolvedValue(makeUser()),
    softDelete: vi.fn().mockResolvedValue(undefined),
    updatePassword: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe("UserService", () => {
  let repo: IUserRepository
  let service: ReturnType<typeof createUserService>

  beforeEach(() => {
    repo = mockUserRepository()
    service = createUserService(repo)
  })

  describe("list", () => {
    it("returns paginated users with totalPages", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({
        users: [makeUser(), makeUser({ id: "user-2" })],
        total: 2,
        page: 1,
        limit: 10,
      })

      const result = await service.list({ page: 1, limit: 10, storeId: "store-1" })

      expect(result.data).toHaveLength(2)
      expect(result.meta.totalPages).toBe(1)
      expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, storeId: "store-1" })
    })
  })

  describe("getById", () => {
    it("throws NotFoundError when user does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("user-x", "store-1")).rejects.toThrow(NotFoundError)
    })

    it("returns the mapped user", async () => {
      const result = await service.getById("user-1", "store-1")

      expect(result.id).toBe("user-1")
      expect(result.email).toBe("ana@mail.com")
    })
  })

  describe("create", () => {
    it("throws ConflictError when email already exists in the store", async () => {
      vi.mocked(repo.findByEmail).mockResolvedValue(makeUser())

      await expect(
        service.create({ name: "Ana", email: "ana@mail.com", password: "secret" }, "store-1")
      ).rejects.toThrow(ConflictError)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("creates the user scoped to the store", async () => {
      const result = await service.create(
        { name: "Ana", email: "ana@mail.com", password: "secret" },
        "store-1"
      )

      expect(repo.create).toHaveBeenCalledWith({
        name: "Ana",
        email: "ana@mail.com",
        password: "secret",
        store_id: "store-1",
      })
      expect(result.email).toBe("ana@mail.com")
    })
  })

  describe("update", () => {
    it("throws NotFoundError when user does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.update("user-x", { name: "Nuevo" }, "store-1")).rejects.toThrow(
        NotFoundError
      )
    })

    it("throws ConflictError when changing to an email owned by another user", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeUser({ email: "ana@mail.com" }))
      vi.mocked(repo.findByEmail).mockResolvedValue(
        makeUser({ id: "user-2", email: "otra@mail.com" })
      )

      await expect(
        service.update("user-1", { email: "otra@mail.com" }, "store-1")
      ).rejects.toThrow(ConflictError)
    })

    it("does not check email uniqueness when email is unchanged", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeUser({ email: "ana@mail.com" }))

      await service.update("user-1", { name: "Ana Maria" }, "store-1")

      expect(repo.findByEmail).not.toHaveBeenCalled()
      expect(repo.update).toHaveBeenCalledWith("user-1", { name: "Ana Maria" }, "store-1")
    })
  })

  describe("delete", () => {
    it("soft-deletes an existing user", async () => {
      await service.delete("user-1", "store-1")

      expect(repo.softDelete).toHaveBeenCalledWith("user-1", "store-1")
    })

    it("throws NotFoundError when user does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.delete("user-x", "store-1")).rejects.toThrow(NotFoundError)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })
  })
})