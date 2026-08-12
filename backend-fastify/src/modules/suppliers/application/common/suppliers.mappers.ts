import { ISupplierEntity } from "../../domain/suppliers.entities";
import { ISupplierResponse } from "../../domain/suppliers.types";

type RichSupplier = ISupplierEntity

export function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "23505"
}

export function mapSupplierToResponse(supplier: RichSupplier): ISupplierResponse {
  return {
    id: supplier.id,
    name: supplier.name,
    company: supplier.company || undefined,
    ruc: supplier.ruc || undefined,
    contact_name: supplier.contact_name || undefined,
    email: supplier.email || undefined,
    phone: supplier.phone || undefined,
    address: supplier.address || undefined,
    notes: supplier.notes || undefined,
    is_active: supplier.is_active,
    medicine_count: supplier.medicine_count,
    created_at: supplier.created_at.toISOString(),
    updated_at: supplier.updated_at.toISOString(),
  }
}
