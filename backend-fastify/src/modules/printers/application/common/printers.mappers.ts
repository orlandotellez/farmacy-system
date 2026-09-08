import type { IPrinterEntity } from "../../domain/printers.entities"
import type { IPrinterResponse } from "../../domain/printers.types"

export function mapPrinterToResponse(entity: IPrinterEntity): IPrinterResponse {
  return {
    id: entity.id,
    store_id: entity.store_id,
    name: entity.name,
    connection_type: entity.connection_type,
    address: entity.address,
    port: entity.port,
    paper_width: entity.paper_width,
    profile: entity.profile,
    codepage: entity.codepage,
    auto_cut: entity.auto_cut,
    cut_type: entity.cut_type,
    open_cash_drawer: entity.open_cash_drawer,
    default_copies: entity.default_copies,
    role: entity.role,
    is_default: entity.is_default,
    is_active: entity.is_active,
    last_status: entity.last_status,
    last_seen_at: entity.last_seen_at instanceof Date ? entity.last_seen_at.toISOString() : entity.last_seen_at,
    created_at: entity.created_at instanceof Date ? entity.created_at.toISOString() : entity.created_at,
    updated_at: entity.updated_at instanceof Date ? entity.updated_at.toISOString() : entity.updated_at,
  }
}
