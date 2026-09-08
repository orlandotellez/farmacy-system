import { vi } from "vitest"
import type { IMedicineEntity } from "@/modules/medicines/domain/medicines.entities"
import type { IMedicineRepository } from "@/modules/medicines/domain/medicines.interface"
import { makeMedicine } from "@/__tests__/helpers"

export { makeMedicine }

export function mockMedicineRepository(overrides?: Partial<IMedicineRepository>): IMedicineRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ medicines: [makeMedicine()], total: 1, page: 1, limit: 10 }),
    findById: vi.fn().mockResolvedValue(makeMedicine()),
    findByBarcode: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(makeMedicine()),
    update: vi.fn().mockResolvedValue(makeMedicine()),
    softDelete: vi.fn().mockResolvedValue(undefined),
    updateStock: vi.fn().mockResolvedValue(makeMedicine()),
    ...overrides,
  }
}