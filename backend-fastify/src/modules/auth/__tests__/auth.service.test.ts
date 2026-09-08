import { describe, it, expect, vi, beforeEach } from "vitest"
import { createAuthService } from "../application/auth.service"
import { ConflictError, NotFoundError, UnauthorizedError } from "@/core/errors/AppError"
import { hashPassword, comparePassword, generateVerificationCode } from "../application/common/auth.crypto"
import { generateTokens, verifyToken } from "../application/common/auth.token"
import type { IAuthRepository } from "../domain/auth.interface"
import type { IUserEntity, ISessionEntity, IVerificationEntity } from "../domain/auth.entities"
import type { IEmailSender } from "@/modules/email/domain/email.types"

vi.mock("@/config/env", () => ({
  env: {
    JWT_SECRET: "test-secret-at-least-32-chars-long",
    JWT_REFRESH_SECRET: "test-refresh-secret-at-least-32-chars",
    JWT_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "7d",
  },
}))

vi.mock("@/config/logger", () => ({
  logger: { warn: vi.fn() },
}))

vi.mock("../application/common/auth.crypto", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed-password"),
  comparePassword: vi.fn().mockResolvedValue(true),
  generateVerificationCode: vi.fn().mockReturnValue("123456"),
}))

vi.mock("../application/common/auth.token", () => ({
  generateTokens: vi.fn().mockReturnValue({
    accessToken: "access-token",
    refreshToken: "refresh-token",
  }),
  verifyToken: vi.fn().mockReturnValue({ userId: "user-1" }),
}))

function makeUser(overrides?: Partial<IUserEntity>): IUserEntity {
  return {
    id: "user-1",
    name: "Ana",
    email: "ana@mail.com",
    email_verified: false,
    role: "cajero",
    store_id: "store-1",
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function makeSession(overrides?: Partial<ISessionEntity>): ISessionEntity {
  return {
    id: "session-1",
    expires_at: new Date(Date.now() + 60_000),
    token: "refresh-token",
    user_id: "user-1",
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function makeVerification(overrides?: Partial<IVerificationEntity>): IVerificationEntity {
  return {
    id: "ver-1",
    identifier: "ana@mail.com",
    value: "123456",
    expires_at: new Date(Date.now() + 60_000),
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function mockAuthRepository(overrides?: Partial<IAuthRepository>): IAuthRepository {
  const base = {
    store: {
      findByName: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "store-1", name: "Mi Farmacia" }),
      getStoreInfo: vi.fn().mockResolvedValue({ id: "store-1", name: "Mi Farmacia" }),
    },
    user: {
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn().mockResolvedValue(makeUser()),
      create: vi.fn().mockResolvedValue(makeUser()),
      update: vi.fn().mockResolvedValue(makeUser({ email_verified: true })),
      softDelete: vi.fn().mockResolvedValue(undefined),
    },
    account: {
      findByProviderAndAccountId: vi.fn().mockResolvedValue(null),
      findByUserId: vi.fn().mockResolvedValue([]),
      findCredentialsAccountByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: "account-1" }),
      update: vi.fn().mockResolvedValue({ id: "account-1" }),
      delete: vi.fn().mockResolvedValue(undefined),
      deleteByUserId: vi.fn().mockResolvedValue(undefined),
    },
    session: {
      create: vi.fn().mockResolvedValue(makeSession()),
      findByToken: vi.fn().mockResolvedValue(makeSession()),
      findByUserId: vi.fn().mockResolvedValue([makeSession()]),
      delete: vi.fn().mockResolvedValue(undefined),
      deleteByUserId: vi.fn().mockResolvedValue(undefined),
      deleteExpiredSessions: vi.fn().mockResolvedValue(0),
    },
    verification: {
      create: vi.fn().mockResolvedValue(makeVerification()),
      findByIdentifier: vi.fn().mockResolvedValue(makeVerification()),
      findByIdentifierAndValue: vi.fn().mockResolvedValue(makeVerification()),
      delete: vi.fn().mockResolvedValue(undefined),
      deleteByIdentifier: vi.fn().mockResolvedValue(undefined),
      deleteExpired: vi.fn().mockResolvedValue(0),
    },
  }
  return { ...base, ...overrides } as IAuthRepository
}

function mockEmailSender(overrides?: Partial<IEmailSender>): IEmailSender {
  return {
    send: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as IEmailSender
}

describe("AuthService", () => {
  let repo: IAuthRepository
  let emailSender: IEmailSender
  let service: ReturnType<typeof createAuthService>

  beforeEach(() => {
    repo = mockAuthRepository()
    emailSender = mockEmailSender()
    service = createAuthService(repo, emailSender)
    vi.mocked(comparePassword).mockResolvedValue(true)
    vi.mocked(hashPassword).mockResolvedValue("hashed-password")
    vi.mocked(generateVerificationCode).mockReturnValue("123456")
    vi.mocked(verifyToken).mockReset()
    vi.mocked(verifyToken).mockReturnValue({ userId: "user-1" })
  })

  describe("registerStore", () => {
    const payload = {
      storeName: "Mi Farmacia",
      adminName: "Ana",
      adminEmail: "ana@mail.com",
      adminPassword: "secret123",
    }

    it("throws ConflictError when the store name already exists", async () => {
      vi.mocked(repo.store.findByName).mockResolvedValue({ id: "store-1", name: "Mi Farmacia" })

      await expect(service.registerStore(payload)).rejects.toThrow(ConflictError)
      expect(repo.store.create).not.toHaveBeenCalled()
    })

    it("throws ConflictError when the email is already registered", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(makeUser())

      await expect(service.registerStore(payload)).rejects.toThrow(ConflictError)
    })

    it("creates store, admin user, account and session", async () => {
      const result = await service.registerStore(payload)

      expect(repo.store.create).toHaveBeenCalledWith({
        name: "Mi Farmacia",
        address: undefined,
        phone: undefined,
      })
      expect(repo.user.create).toHaveBeenCalledWith({
        name: "Ana",
        email: "ana@mail.com",
        role: "admin",
        email_verified: true,
        store_id: "store-1",
      })
      expect(repo.account.create).toHaveBeenCalledWith(
        expect.objectContaining({ provider_id: "credentials", password: "hashed-password" })
      )
      expect(repo.session.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1", token: "refresh-token" })
      )
      expect(result.accessToken).toBe("access-token")
      expect(result.refreshToken).toBe("refresh-token")
    })
  })

  describe("register", () => {
    it("throws ConflictError when email already exists in the store", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(makeUser())

      await expect(
        service.register({ name: "Ana", email: "ana@mail.com", password: "secret" }, "store-1")
      ).rejects.toThrow(ConflictError)
    })

    it("registers with default role cajero and creates verification code", async () => {
      const result = await service.register(
        { name: "Ana", email: "ana@mail.com", password: "secret" },
        "store-1"
      )

      expect(repo.user.create).toHaveBeenCalledWith({
        name: "Ana",
        email: "ana@mail.com",
        role: "cajero",
        email_verified: false,
        store_id: "store-1",
      })
      expect(repo.verification.create).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: "ana@mail.com", value: "123456" })
      )
      expect(emailSender.send).toHaveBeenCalledTimes(1)
      const sentMessage = vi.mocked(emailSender.send).mock.calls[0]![0]
      expect(sentMessage.to).toBe("ana@mail.com")
      expect(sentMessage.subject).toBe("Verify your email")
      expect(sentMessage.text).toContain("123456")
      expect(result.message).toContain("verify your email")
    })

    it("keeps the provided role", async () => {
      await service.register(
        { name: "Ana", email: "ana@mail.com", password: "secret", role: "farmaceutico" },
        "store-1"
      )

      expect(repo.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: "farmaceutico" })
      )
    })

    it("resolves normally when sending the email fails", async () => {
      vi.mocked(emailSender.send).mockRejectedValueOnce(new Error("SMTP down"))

      const result = await service.register(
        { name: "Ana", email: "ana@mail.com", password: "secret" },
        "store-1"
      )

      expect(emailSender.send).toHaveBeenCalledTimes(1)
      expect(result.message).toContain("verify your email")
      expect(result.accessToken).toBe("access-token")
    })
  })

  describe("login", () => {
    it("throws UnauthorizedError when no credentials account exists", async () => {
      vi.mocked(repo.account.findCredentialsAccountByEmail).mockResolvedValue(null)

      await expect(service.login({ email: "ana@mail.com", password: "wrong" })).rejects.toThrow(
        UnauthorizedError
      )
    })

    it("throws UnauthorizedError when password is invalid", async () => {
      vi.mocked(repo.account.findCredentialsAccountByEmail).mockResolvedValue({
        id: "account-1",
        password: "hashed-password",
      } as never)
      vi.mocked(comparePassword).mockResolvedValue(false)

      await expect(service.login({ email: "ana@mail.com", password: "wrong" })).rejects.toThrow(
        UnauthorizedError
      )
    })

    it("throws UnauthorizedError when user is deleted", async () => {
      vi.mocked(repo.account.findCredentialsAccountByEmail).mockResolvedValue({
        id: "account-1",
        user_id: "user-1",
        password: "hashed-password",
      } as never)
      vi.mocked(repo.user.findById).mockResolvedValue(
        makeUser({ deleted_at: new Date("2026-02-01T00:00:00Z") })
      )

      await expect(service.login({ email: "ana@mail.com", password: "secret" })).rejects.toThrow(
        UnauthorizedError
      )
    })

    it("logs in and creates a session", async () => {
      vi.mocked(repo.account.findCredentialsAccountByEmail).mockResolvedValue({
        id: "account-1",
        user_id: "user-1",
        password: "hashed-password",
      } as never)

      const result = await service.login({ email: "ana@mail.com", password: "secret" })

      expect(repo.session.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1", token: "refresh-token" })
      )
      expect(result.message).toBe("Login successfully")
    })
  })

  describe("logout", () => {
    it("deletes the session", async () => {
      const result = await service.logout("refresh-token")

      expect(repo.session.delete).toHaveBeenCalledWith("refresh-token")
      expect(result.message).toBe("Logged out successfully")
    })
  })

  describe("refresh", () => {
    it("throws UnauthorizedError when the token is invalid", async () => {
      vi.mocked(verifyToken).mockImplementation(() => {
        throw new Error("jwt expired")
      })

      await expect(service.refresh("bad-token")).rejects.toThrow(UnauthorizedError)
    })

    it("throws UnauthorizedError when the session does not exist", async () => {
      vi.mocked(repo.session.findByToken).mockResolvedValue(null)

      await expect(service.refresh("refresh-token")).rejects.toThrow(UnauthorizedError)
    })

    it("throws UnauthorizedError and deletes the session when expired", async () => {
      vi.mocked(repo.session.findByToken).mockResolvedValue(
        makeSession({ expires_at: new Date(Date.now() - 60_000) })
      )

      await expect(service.refresh("refresh-token")).rejects.toThrow(UnauthorizedError)
      expect(repo.session.delete).toHaveBeenCalledWith("refresh-token")
    })

    it("rotates the session", async () => {
      const result = await service.refresh("refresh-token")

      expect(repo.session.delete).toHaveBeenCalledWith("refresh-token")
      expect(repo.session.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1", token: "refresh-token" })
      )
      expect(result.accessToken).toBe("access-token")
    })
  })

  describe("verifyEmail", () => {
    it("throws UnauthorizedError when the code is invalid", async () => {
      vi.mocked(repo.verification.findByIdentifierAndValue).mockResolvedValue(null)

      await expect(
        service.verifyEmail({ identifier: "ana@mail.com", code: "000000" })
      ).rejects.toThrow(UnauthorizedError)
    })

    it("throws UnauthorizedError and cleans up when the code expired", async () => {
      vi.mocked(repo.verification.findByIdentifierAndValue).mockResolvedValue(
        makeVerification({ expires_at: new Date(Date.now() - 60_000) })
      )

      await expect(
        service.verifyEmail({ identifier: "ana@mail.com", code: "123456" })
      ).rejects.toThrow(UnauthorizedError)
      expect(repo.verification.deleteByIdentifier).toHaveBeenCalledWith("ana@mail.com")
    })

    it("marks the user verified and returns tokens", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(makeUser({ email_verified: false }))

      const result = await service.verifyEmail({ identifier: "ana@mail.com", code: "123456" })

      expect(repo.user.update).toHaveBeenCalledWith("user-1", { email_verified: true })
      expect(repo.verification.deleteByIdentifier).toHaveBeenCalledWith("ana@mail.com")
      expect(result.accessToken).toBe("access-token")
    })
  })

  describe("resendVerification", () => {
    it("returns a generic message when the email does not exist", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(null)

      const result = await service.resendVerification("nadie@mail.com")

      expect(result.message).toContain("If the email exists")
      expect(repo.verification.create).not.toHaveBeenCalled()
    })

    it("throws ConflictError when the email is already verified", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(makeUser({ email_verified: true }))

      await expect(service.resendVerification("ana@mail.com")).rejects.toThrow(ConflictError)
    })

    it("recreates the verification code", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(makeUser())

      const result = await service.resendVerification("ana@mail.com")

      expect(repo.verification.deleteByIdentifier).toHaveBeenCalledWith("ana@mail.com")
      expect(repo.verification.create).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: "ana@mail.com", value: "123456" })
      )
      expect(emailSender.send).toHaveBeenCalledTimes(1)
      const sentMessage = vi.mocked(emailSender.send).mock.calls[0]![0]
      expect(sentMessage.to).toBe("ana@mail.com")
      expect(sentMessage.subject).toBe("Verify your email")
      expect(sentMessage.text).toContain("123456")
      expect(result.message).toBe("New verification code sent")
    })

    it("resolves normally when sending the email fails", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(makeUser())
      vi.mocked(emailSender.send).mockRejectedValueOnce(new Error("SMTP down"))

      const result = await service.resendVerification("ana@mail.com")

      expect(emailSender.send).toHaveBeenCalledTimes(1)
      expect(result.message).toBe("New verification code sent")
    })
  })

  describe("forgotPassword", () => {
    it("returns a generic message when the email does not exist", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(null)

      const result = await service.forgotPassword({ email: "nadie@mail.com" })

      expect(result.message).toContain("If the email exists")
      expect(repo.verification.create).not.toHaveBeenCalled()
    })

    it("creates a reset verification scoped by email", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(makeUser())

      await service.forgotPassword({ email: "ana@mail.com" })

      expect(repo.verification.create).toHaveBeenCalledWith(
        expect.objectContaining({ identifier: "reset:ana@mail.com", value: "123456" })
      )
      expect(emailSender.send).toHaveBeenCalledTimes(1)
      const sentMessage = vi.mocked(emailSender.send).mock.calls[0]![0]
      expect(sentMessage.to).toBe("ana@mail.com")
      expect(sentMessage.subject).toBe("Password reset code")
      expect(sentMessage.text).toContain("123456")
    })

    it("returns the generic anti-enumeration message when sending fails", async () => {
      vi.mocked(repo.user.findByEmail).mockResolvedValue(makeUser())
      vi.mocked(emailSender.send).mockRejectedValueOnce(new Error("SMTP down"))

      const result = await service.forgotPassword({ email: "ana@mail.com" })

      expect(emailSender.send).toHaveBeenCalledTimes(1)
      expect(result.message).toContain("If the email exists")
    })
  })

  describe("resetPassword", () => {
    it("throws UnauthorizedError when the code is invalid", async () => {
      vi.mocked(repo.verification.findByIdentifierAndValue).mockResolvedValue(null)

      await expect(
        service.resetPassword({ email: "ana@mail.com", code: "000000", newPassword: "nueva" })
      ).rejects.toThrow(UnauthorizedError)
    })

    it("throws UnauthorizedError when the code expired", async () => {
      vi.mocked(repo.verification.findByIdentifierAndValue).mockResolvedValue(
        makeVerification({ identifier: "reset:ana@mail.com", expires_at: new Date(Date.now() - 60_000) })
      )

      await expect(
        service.resetPassword({ email: "ana@mail.com", code: "123456", newPassword: "nueva" })
      ).rejects.toThrow(UnauthorizedError)
    })

    it("hashes the new password, clears sessions and verification", async () => {
      vi.mocked(repo.verification.findByIdentifierAndValue).mockResolvedValue(
        makeVerification({ identifier: "reset:ana@mail.com" })
      )
      vi.mocked(repo.user.findByEmail).mockResolvedValue(makeUser())
      vi.mocked(repo.account.findCredentialsAccountByEmail).mockResolvedValue({
        id: "account-1",
      } as never)

      const result = await service.resetPassword({
        email: "ana@mail.com",
        code: "123456",
        newPassword: "nueva-secret",
      })

      expect(hashPassword).toHaveBeenCalledWith("nueva-secret")
      expect(repo.account.update).toHaveBeenCalledWith("account-1", { password: "hashed-password" })
      expect(repo.session.deleteByUserId).toHaveBeenCalledWith("user-1")
      expect(repo.verification.deleteByIdentifier).toHaveBeenCalledWith("reset:ana@mail.com")
      expect(result.message).toContain("Password reset successfully")
    })
  })

  describe("getUserSessions", () => {
    it("filters out expired sessions", async () => {
      vi.mocked(repo.session.findByUserId).mockResolvedValue([
        makeSession({ id: "session-valid" }),
        makeSession({ id: "session-expired", expires_at: new Date(Date.now() - 60_000) }),
      ])

      const result = await service.getUserSessions("user-1")

      expect(result.sessions).toHaveLength(1)
      expect(result.sessions[0].id).toBe("session-valid")
    })
  })

  describe("revokeSession", () => {
    it("throws NotFoundError when the session does not exist", async () => {
      vi.mocked(repo.session.findByUserId).mockResolvedValue([makeSession({ id: "other" })])

      await expect(service.revokeSession("user-1", "session-x")).rejects.toThrow(NotFoundError)
      expect(repo.session.delete).not.toHaveBeenCalled()
    })

    it("revokes the session by token", async () => {
      const result = await service.revokeSession("user-1", "session-1")

      expect(repo.session.delete).toHaveBeenCalledWith("refresh-token")
      expect(result.message).toBe("Session revoked successfully")
    })
  })
})
