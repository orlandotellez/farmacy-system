import { ConflictError, NotFoundError } from "@/core/errors/AppError"
import type { IMedicineRepository } from "../domain/medicines.interface"
import type { CreateMedicineData, IMedicineEntity, UpdateMedicineData } from "../domain/medicines.entities"
import type { IMedicineListResponse, IMedicineResponse } from "../domain/medicines.types"

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "23505"
}

interface RichMedicineEntity extends IMedicineEntity {
  category?: { id: string; name: string } | null
  supplier?: { id: string; name: string } | null
}

function mapMedicineToResponse(medicine: RichMedicineEntity): IMedicineResponse {
  return {
    id: medicine.id,
    barcode: medicine.barcode || undefined,
    internal_code: medicine.internal_code || undefined,
    commercial_name: medicine.commercial_name,
    generic_name: medicine.generic_name || undefined,
    active_ingredient: medicine.active_ingredient || undefined,
    concentration: medicine.concentration || undefined,
    presentation: medicine.presentation || undefined,
    pharmaceutical_form: medicine.pharmaceutical_form || undefined,
    laboratory: medicine.laboratory || undefined,
    category_id: medicine.category_id || undefined,
    supplier_id: medicine.supplier_id || undefined,
    unit_type: medicine.unit_type || undefined,
    unit_quantity: medicine.unit_quantity ?? undefined,
    purchase_price: Number(medicine.purchase_price),
    sale_price: Number(medicine.sale_price),
    stock: medicine.stock,
    low_stock_threshold: medicine.low_stock_threshold,
    requires_prescription: medicine.requires_prescription,
    is_controlled: medicine.is_controlled,
    image: medicine.image || undefined,
    active: medicine.active,
    category: medicine.category ?? null,
    supplier: medicine.supplier ?? null,
    created_at: medicine.created_at.toISOString(),
    updated_at: medicine.updated_at.toISOString(),
  }
}

export const createMedicineService = (repository: IMedicineRepository) => ({
  list: async (params?: Parameters<IMedicineRepository["findAll"]>[0]): Promise<IMedicineListResponse> => {
    const result = await repository.findAll(params)
    return {
      data: result.medicines.map((medicine) => mapMedicineToResponse(medicine as RichMedicineEntity)),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      },
    }
  },

  getById: async (id: string, storeId?: string): Promise<IMedicineResponse> => {
    const medicine = await repository.findById(id, storeId)
    if (!medicine || medicine.deleted_at) throw new NotFoundError("Medicine not found")
    return mapMedicineToResponse(medicine as RichMedicineEntity)
  },

  getByBarcode: async (barcode: string, storeId?: string): Promise<IMedicineResponse | null> => {
    const medicine = await repository.findByBarcode(barcode, storeId)
    return medicine && !medicine.deleted_at ? mapMedicineToResponse(medicine as RichMedicineEntity) : null
  },

  create: async (data: CreateMedicineData, storeId?: string): Promise<IMedicineResponse> => {
    if (data.barcode && await repository.findByBarcode(data.barcode, storeId)) {
      throw new ConflictError("A medicine with this barcode already exists")
    }
    try {
      const medicine = await repository.create(data, storeId)
      return mapMedicineToResponse(medicine as RichMedicineEntity)
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("A medicine with this barcode already exists")
      throw err
    }
  },

  update: async (id: string, data: UpdateMedicineData, storeId?: string): Promise<IMedicineResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing || existing.deleted_at) throw new NotFoundError("Medicine not found")
    if (data.barcode && data.barcode !== existing.barcode) {
      const duplicate = await repository.findByBarcode(data.barcode, storeId)
      if (duplicate && duplicate.id !== id) throw new ConflictError("A medicine with this barcode already exists")
    }
    try {
      const medicine = await repository.update(id, data, storeId)
      return mapMedicineToResponse(medicine as RichMedicineEntity)
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("A medicine with this barcode already exists")
      throw err
    }
  },

  delete: async (id: string, storeId?: string): Promise<void> => {
    const existing = await repository.findById(id, storeId)
    if (!existing || existing.deleted_at) throw new NotFoundError("Medicine not found")
    await repository.softDelete(id, storeId)
  },
})
