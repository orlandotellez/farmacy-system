import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMedicineService } from "../application/medicines.service"
import { mockMedicineRepository, makeMedicine } from "./medicine.test-helpers"
import { NotFoundError, ConflictError } from "@/core/errors/AppError"
import type { IMedicineRepository } from "../domain/medicines.interface"

describe("MedicineService", () => {
  let repo: IMedicineRepository
  let service: ReturnType<typeof createMedicineService>

  beforeEach(() => {
    repo = mockMedicineRepository()
    service = createMedicineService(repo)
  })


  describe("list", () => {
    it("returns paginated medicines", async () => {
      const medicines = [makeMedicine({ id: "med-1" }), makeMedicine({ id: "med-2" })]
      vi.mocked(repo.findAll).mockResolvedValue({ medicines, total: 2, page: 1, limit: 10 })

      const result = await service.list({ page: 1, limit: 10 })

      expect(result.data).toHaveLength(2)
      expect(result.meta.totalPages).toBe(1)
    })
  })


  describe("getById", () => {
    it("throws NotFoundError when medicine is soft-deleted", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeMedicine({ deleted_at: new Date() }))

      await expect(service.getById("med-1")).rejects.toThrow(NotFoundError)
    })
  })


  describe("create", () => {
    it("throws ConflictError when barcode already exists", async () => {
      vi.mocked(repo.findByBarcode).mockResolvedValue(makeMedicine({ barcode: "7501234567890" }))

      await expect(
        service.create({ commercial_name: "Duplicado", sale_price: 10, barcode: "7501234567890" })
      ).rejects.toThrow(ConflictError)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("throws ConflictError on unique violation race", async () => {
      vi.mocked(repo.findByBarcode).mockResolvedValue(null)
      const uniqueViolation = Object.assign(new Error("dup"), { code: "23505" })
      vi.mocked(repo.create).mockRejectedValue(uniqueViolation)

      await expect(
        service.create({ commercial_name: "Race", sale_price: 10, barcode: "123" })
      ).rejects.toThrow(ConflictError)
    })
  })


  describe("update", () => {
    it("throws NotFoundError when medicine does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.update("med-1", { sale_price: 15 })).rejects.toThrow(NotFoundError)
    })

    it("throws ConflictError when changing to an existing barcode", async () => {
      const existing = makeMedicine({ id: "med-1", barcode: "111" })
      vi.mocked(repo.findById).mockResolvedValue(existing)
      vi.mocked(repo.findByBarcode).mockResolvedValue(makeMedicine({ id: "med-2", barcode: "222" }))

      await expect(service.update("med-1", { barcode: "222" })).rejects.toThrow(ConflictError)
    })

    it("allows updating without changing the barcode", async () => {
      const existing = makeMedicine({ id: "med-1", barcode: "111", sale_price: 5 })
      vi.mocked(repo.findById).mockResolvedValue(existing)
      vi.mocked(repo.update).mockResolvedValue({ ...existing, sale_price: 8 })

      const result = await service.update("med-1", { sale_price: 8 })

      expect(result.sale_price).toBe(8)
      expect(repo.findByBarcode).not.toHaveBeenCalled()
    })
  })


  describe("delete", () => {
    it("soft-deletes an existing medicine", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeMedicine({ id: "med-1" }))

      await service.delete("med-1")

      expect(repo.softDelete).toHaveBeenCalledWith("med-1", undefined)
    })

    it("throws NotFoundError when already deleted", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makeMedicine({ deleted_at: new Date() }))

      await expect(service.delete("med-1")).rejects.toThrow(NotFoundError)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })
  })
})