import { IMedicineEntity } from "../../domain/medicines.entities";
import { IMedicineResponse } from "../../domain/medicines.types";

export interface RichMedicineEntity extends IMedicineEntity {
  category?: { id: string; name: string } | null
  supplier?: { id: string; name: string } | null
}

export function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "23505"
}

export function mapMedicineToResponse(medicine: RichMedicineEntity): IMedicineResponse {
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
