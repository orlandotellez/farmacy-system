import { describe, it, expect, vi, beforeEach } from "vitest"
import { createPrescriptionService } from "../application/prescriptions.service"
import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError"
import { MedicineRepository } from "@/modules/medicines/infrastructure/medicines.drizzle.repository"
import { ClientRepository } from "@/modules/clients/infrastructure/clients.drizzle.repository"
import type { IPrescriptionRepository } from "../domain/prescriptions.interface"
import type { IPrescriptionWithItemsEntity } from "../domain/prescriptions.entities"

vi.mock("@/modules/medicines/infrastructure/medicines.drizzle.repository", () => ({
  MedicineRepository: { findById: vi.fn() },
}))

vi.mock("@/modules/clients/infrastructure/clients.drizzle.repository", () => ({
  ClientRepository: { findById: vi.fn() },
}))

function makePrescription(
  overrides?: Partial<IPrescriptionWithItemsEntity>
): IPrescriptionWithItemsEntity {
  return {
    id: "rx-1",
    number: "RX-001",
    status: "pendiente",
    store_id: "store-1",
    items: [
      {
        id: "item-1",
        prescription_id: "rx-1",
        medicine_id: "med-1",
        medicine_name: "Paracetamol 500mg",
        quantity: 10,
        authorized_quantity: 0,
        created_at: new Date("2026-01-15T10:00:00Z"),
      },
    ],
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function mockPrescriptionRepository(
  overrides?: Partial<IPrescriptionRepository>
): IPrescriptionRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ prescriptions: [makePrescription()], total: 1, page: 1, limit: 10 }),
    findById: vi.fn().mockResolvedValue(makePrescription()),
    findByNumber: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(makePrescription()),
    update: vi.fn().mockResolvedValue(makePrescription()),
    replaceItems: vi.fn().mockResolvedValue(makePrescription().items),
    validate: vi.fn().mockResolvedValue(makePrescription()),
    softDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe("PrescriptionService", () => {
  let repo: IPrescriptionRepository
  let service: ReturnType<typeof createPrescriptionService>

  beforeEach(() => {
    repo = mockPrescriptionRepository()
    service = createPrescriptionService(repo)
    vi.mocked(MedicineRepository.findById).mockResolvedValue({
      id: "med-1",
      commercial_name: "Paracetamol 500mg",
    } as never)
    vi.mocked(ClientRepository.findById).mockResolvedValue({ id: "client-1" } as never)
  })

  describe("list", () => {
    it("returns paginated prescriptions", async () => {
      vi.mocked(repo.findAll).mockResolvedValue({
        prescriptions: [makePrescription(), makePrescription({ id: "rx-2" })],
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
    it("throws NotFoundError when prescription does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("rx-x", "store-1")).rejects.toThrow(NotFoundError)
    })

    it("returns the mapped prescription", async () => {
      const result = await service.getById("rx-1", "store-1")

      expect(result.number).toBe("RX-001")
      expect(result.items).toHaveLength(1)
    })
  })

  describe("create", () => {
    it("throws ConflictError when the number already exists", async () => {
      vi.mocked(repo.findByNumber).mockResolvedValue(makePrescription())

      await expect(
        service.create(
          { number: "RX-001", items: [{ medicine_id: "med-1", quantity: 5 }] },
          "store-1"
        )
      ).rejects.toThrow(ConflictError)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("throws NotFoundError when the client does not exist", async () => {
      vi.mocked(ClientRepository.findById).mockResolvedValue(null)

      await expect(
        service.create(
          {
            number: "RX-002",
            client_id: "client-x",
            items: [{ medicine_id: "med-1", quantity: 5 }],
          },
          "store-1"
        )
      ).rejects.toThrow(NotFoundError)
    })

    it("throws BadRequestError when a medicine is not found", async () => {
      vi.mocked(MedicineRepository.findById).mockResolvedValue(null)

      await expect(
        service.create(
          { number: "RX-002", items: [{ medicine_id: "med-x", quantity: 5 }] },
          "store-1"
        )
      ).rejects.toThrow(BadRequestError)
    })

    it("resolves medicine names and delegates to the repository", async () => {
      await service.create(
        { number: "RX-002", items: [{ medicine_id: "med-1", quantity: 5 }] },
        "store-1"
      )

      const medicineNames = new Map([["med-1", "Paracetamol 500mg"]])
      expect(repo.create).toHaveBeenCalledWith(
        { number: "RX-002", items: [{ medicine_id: "med-1", quantity: 5 }] },
        "store-1",
        medicineNames
      )
    })
  })

  describe("update", () => {
    it("throws NotFoundError when prescription does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.update("rx-x", { notes: "x" }, "store-1")).rejects.toThrow(
        NotFoundError
      )
    })

    it("throws BadRequestError when prescription is not pending", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrescription({ status: "validada" }))

      await expect(service.update("rx-1", { notes: "x" }, "store-1")).rejects.toThrow(
        BadRequestError
      )
    })

    it("throws ConflictError when changing to an existing number", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrescription({ number: "RX-001" }))
      vi.mocked(repo.findByNumber).mockResolvedValue(
        makePrescription({ id: "rx-2", number: "RX-099" })
      )

      await expect(
        service.update("rx-1", { number: "RX-099" }, "store-1")
      ).rejects.toThrow(ConflictError)
    })

    it("updates items and resolves medicine names", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrescription({ number: "RX-001" }))
      vi.mocked(repo.update).mockResolvedValue(
        makePrescription({ number: "RX-002", items: [] })
      )

      const result = await service.update(
        "rx-1",
        { number: "RX-002", items: [{ medicine_id: "med-1", quantity: 3 }] },
        "store-1"
      )

      expect(result.number).toBe("RX-002")
      expect(repo.update).toHaveBeenCalledWith(
        "rx-1",
        { number: "RX-002", items: [{ medicine_id: "med-1", quantity: 3 }] },
        "store-1",
        new Map([["med-1", "Paracetamol 500mg"]])
      )
    })
  })

  describe("validate", () => {
    it("throws NotFoundError when prescription does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(
        service.validate("rx-x", "store-1", "user-1", {})
      ).rejects.toThrow(NotFoundError)
    })

    it("throws BadRequestError when prescription is not pending", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrescription({ status: "anulada" }))

      await expect(
        service.validate("rx-1", "store-1", "user-1", {})
      ).rejects.toThrow(BadRequestError)
    })

    it("throws BadRequestError when an authorized item is not in the prescription", async () => {
      await expect(
        service.validate("rx-1", "store-1", "user-1", {
          authorized_items: [{ medicine_id: "med-x", quantity: 1 }],
        })
      ).rejects.toThrow(BadRequestError)
    })

    it("authorizes all items by default when no authorized_items are given", async () => {
      await service.validate("rx-1", "store-1", "user-1", {})

      expect(repo.validate).toHaveBeenCalledWith(
        "rx-1",
        "store-1",
        "user-1",
        [{ medicine_id: "med-1", quantity: 10 }]
      )
    })

    it("passes the authorized items through", async () => {
      await service.validate("rx-1", "store-1", "user-1", {
        authorized_items: [{ medicine_id: "med-1", quantity: 4 }],
      })

      expect(repo.validate).toHaveBeenCalledWith(
        "rx-1",
        "store-1",
        "user-1",
        [{ medicine_id: "med-1", quantity: 4 }]
      )
    })
  })

  describe("delete", () => {
    it("throws NotFoundError when prescription does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.delete("rx-x", "store-1")).rejects.toThrow(NotFoundError)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })

    it("soft-deletes an existing prescription", async () => {
      await service.delete("rx-1", "store-1")

      expect(repo.softDelete).toHaveBeenCalledWith("rx-1", "store-1")
    })
  })
})