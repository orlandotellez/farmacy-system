import type { PrinterRole } from "./printers.types"
import type { IPrinterEntity, CreatePrinterData, UpdatePrinterData } from "./printers.entities"

export interface IPrinterRepository {
  findByStore(storeId: string): Promise<IPrinterEntity[]>
  findById(id: string, storeId: string): Promise<IPrinterEntity | null>
  findDefault(storeId: string, role: PrinterRole): Promise<IPrinterEntity | null>
  create(data: CreatePrinterData, clearRoles?: PrinterRole[]): Promise<IPrinterEntity>
  update(id: string, storeId: string, data: UpdatePrinterData, clearRoles?: PrinterRole[]): Promise<IPrinterEntity>
  setDefault(id: string, storeId: string, clearRoles: PrinterRole[]): Promise<IPrinterEntity>
  softDelete(id: string, storeId: string): Promise<IPrinterEntity>
  existsByName(storeId: string, name: string, exceptId?: string): Promise<boolean>
  updateStatus(id: string, storeId: string, status: string): Promise<void>
  createJob(data: { printerId: string; saleId?: string | null; payload: Uint8Array }): Promise<string>
  updateJobStatus(id: string, status: string, error?: string): Promise<void>
  findSaleWithItems(saleId: string, storeId: string): Promise<{ id: string; user_name: string | null; created_at: Date; subtotal: number; total: number; payment_method: string; amount_received: number | null; change_given: number | null; items: { medicine_name: string; quantity: number; line_total: number }[] } | null>
}
