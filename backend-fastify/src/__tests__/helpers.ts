/**
 * Test helpers — factories for mock entities and repository builders.
 *
 * Every `make*` function produces a realistic object with sensible defaults.
 * Override only what the specific test needs.
 */
import { vi } from "vitest"
import type { ISaleEntity, ISaleItemEntity, CreateSaleData } from "@/modules/sales/domain/sales.entities"
import type { ISaleRepository } from "@/modules/sales/domain/sales.interface"
import type { ICategoryEntity } from "@/modules/categories/domain/categories.entities"
import type { ICategoryRepository } from "@/modules/categories/domain/categories.interface"
import type { IMedicineEntity } from "@/modules/medicines/domain/medicines.entities"
import type { IClientEntity } from "@/modules/clients/domain/clients.entities"
import type { IClientRepository } from "@/modules/clients/domain/clients.interface"

// ─── IDs ────────────────────────────────────────────────────────────────

let idCounter = 0
export function fakeId(): string {
  idCounter++
  return `00000000-0000-0000-0000-${String(idCounter).padStart(12, "0")}`
}

// ─── Sale factories ─────────────────────────────────────────────────────

export function makeSaleItem(overrides?: Partial<ISaleItemEntity>): ISaleItemEntity {
  return {
    id: fakeId(),
    sale_id: "sale-1",
    medicine_id: "med-1",
    medicine_name: "Paracetamol 500mg",
    quantity: 2,
    unit_price: 5.0,
    line_total: 10.0,
    batch_id: null,
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

export function makeSale(overrides?: Partial<ISaleEntity>): ISaleEntity {
  return {
    id: fakeId(),
    subtotal: 10.0,
    total: 10.0,
    payment_method: "efectivo",
    amount_received: 15.0,
    change_given: 5.0,
    status: "completada",
    cancellation_reason: null,
    cancelled_at: null,
    cancelled_by: null,
    user_id: "user-1",
    user_name: "Cajero Test",
    client_id: null,
    client_name: null,
    prescription_id: null,
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    items: [makeSaleItem()],
    ...overrides,
  }
}

export function makeCreateSaleData(
  overrides?: Partial<Omit<CreateSaleData, "items"> & { items: CreateSaleData["items"] }>
): CreateSaleData {
  return {
    items: [{ medicine_id: "med-1", quantity: 2 }],
    payment_method: "efectivo",
    amount_received: 20.0,
    user_id: "user-1",
    user_name: "Cajero Test",
    ...overrides,
  }
}

// ─── Category factories ─────────────────────────────────────────────────

export function makeCategory(overrides?: Partial<ICategoryEntity>): ICategoryEntity {
  return {
    id: fakeId(),
    name: "Antibióticos",
    description: "Medicamentos antibióticos",
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    deleted_at: undefined,
    medicine_count: 0,
    ...overrides,
  }
}

// ─── Medicine factories ─────────────────────────────────────────────────

export function makeMedicine(overrides?: Partial<IMedicineEntity>): IMedicineEntity {
  return {
    id: fakeId(),
    commercial_name: "Paracetamol 500mg",
    purchase_price: 3.0,
    sale_price: 5.0,
    stock: 100,
    low_stock_threshold: 5,
    requires_prescription: false,
    is_controlled: false,
    active: true,
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

// ─── Mock repository builders ───────────────────────────────────────────
// Each builder returns a vi.fn()-based object that satisfies the
// corresponding repository interface. Override individual methods
// per test.

export function mockSaleRepository(overrides?: Partial<ISaleRepository>): ISaleRepository {
  return {
    create: vi.fn().mockResolvedValue(makeSale()),
    findById: vi.fn().mockResolvedValue(makeSale()),
    findAll: vi.fn().mockResolvedValue({ sales: [makeSale()], total: 1, page: 1, limit: 10 }),
    cancel: vi.fn().mockResolvedValue({ ...makeSale(), status: "anulada" }),
    getReport: vi.fn().mockResolvedValue({
      total_sales: 1,
      total_revenue: 10,
      total_profit: 5,
      average_ticket: 10,
      by_payment_method: { efectivo: 10 },
      top_products: [],
    }),
    getRevenueTrend: vi.fn().mockResolvedValue([]),
    ...overrides,
  }
}

export function mockCategoryRepository(overrides?: Partial<ICategoryRepository>): ICategoryRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ categories: [makeCategory()], total: 1, page: 1, limit: 10 }),
    findById: vi.fn().mockResolvedValue(makeCategory()),
    findByName: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(makeCategory()),
    update: vi.fn().mockResolvedValue(makeCategory()),
    softDelete: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

// ─── Client factories ───────────────────────────────────────────────────

export function makeClient(overrides?: Partial<IClientEntity>): IClientEntity {
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

export function mockClientRepository(overrides?: Partial<IClientRepository>): IClientRepository {
  return {
    findAll: vi.fn().mockResolvedValue({ clients: [makeClient()], total: 1, page: 1, limit: 10 }),
    findById: vi.fn().mockResolvedValue(makeClient()),
    create: vi.fn().mockResolvedValue(makeClient()),
    update: vi.fn().mockResolvedValue(makeClient()),
    softDelete: vi.fn().mockResolvedValue(undefined),
    findSalesByClient: vi.fn().mockResolvedValue([]),
    findPrescriptionsByClient: vi.fn().mockResolvedValue([]),
    findFrequentProductsByClient: vi.fn().mockResolvedValue([]),
    ...overrides,
  }
}
