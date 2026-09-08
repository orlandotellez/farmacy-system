import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError"
import type { IPrinterRepository } from "../domain/printers.interface"
import type { IPrinterResponse, PrinterRole } from "../domain/printers.types"
import type { CreatePrinterData, UpdatePrinterData } from "../domain/printers.entities"
import type { CreatePrinterDto, UpdatePrinterDto } from "../presentation/printers.dto"
import { mapPrinterToResponse } from "./common/printers.mappers"
import { duplicateForCopies, renderCodepageProbe, renderSaleReceipt, renderTestTicket, resolveCurrencySymbol } from "../infrastructure/escpos/encoder"
import { sendBytesViaTCP } from "../infrastructure/escpos/transport.tcp"
import type { SaleReceiptItem } from "../infrastructure/escpos/encoder"

function rolesToClear(role: PrinterRole): PrinterRole[] {
  if (role === "both") return ["receipt", "kitchen", "both"]
  return [role]
}

export const createPrintersService = (repository: IPrinterRepository) => ({
  list: async (storeId: string): Promise<IPrinterResponse[]> => {
    const printers = await repository.findByStore(storeId)
    return printers.map(mapPrinterToResponse)
  },

  getById: async (id: string, storeId: string): Promise<IPrinterResponse> => {
    const printer = await repository.findById(id, storeId)
    if (!printer) throw new NotFoundError("Printer not found")
    return mapPrinterToResponse(printer)
  },

  create: async (data: CreatePrinterDto, storeId: string): Promise<IPrinterResponse> => {
    if (data.name.trim().length === 0) throw new BadRequestError("Printer name is required")
    if (await repository.existsByName(storeId, data.name)) {
      throw new ConflictError("A printer with that name already exists in this store")
    }

    const createData: CreatePrinterData = { ...data, store_id: storeId }
    const created = await repository.create(createData, data.is_default === true ? rolesToClear(data.role) : undefined)
    return mapPrinterToResponse(created)
  },

  update: async (id: string, storeId: string, data: UpdatePrinterDto): Promise<IPrinterResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Printer not found")

    if (data.name !== undefined && data.name !== existing.name) {
      if (data.name.trim().length === 0) throw new BadRequestError("Printer name is required")
      if (await repository.existsByName(storeId, data.name, id)) {
        throw new ConflictError("A printer with that name already exists in this store")
      }
    }

    const newRole = data.role ?? existing.role
    const updated = await repository.update(
      id,
      storeId,
      data as UpdatePrinterData,
      data.is_default === true ? rolesToClear(newRole) : undefined,
    )
    return mapPrinterToResponse(updated)
  },

  delete: async (id: string, storeId: string): Promise<void> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Printer not found")

    const sameRoleOthers = (await repository.findByStore(storeId)).filter(
      (p) => p.role === existing.role && p.id !== existing.id && p.is_active,
    )
    if (sameRoleOthers.length === 0) {
      throw new ConflictError(
        `This is the only active printer for role '${existing.role}'. Add another before deleting this one.`,
      )
    }
    if (existing.is_default) {
      throw new ConflictError(
        `This is the default printer for role '${existing.role}'. Set another as default before deleting it.`,
      )
    }

    await repository.softDelete(id, storeId)
  },

  setAsDefault: async (id: string, storeId: string, role: PrinterRole): Promise<IPrinterResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing) throw new NotFoundError("Printer not found")

    if (existing.role !== "both" && existing.role !== role) {
      throw new BadRequestError(
        `Printer role is '${existing.role}' and cannot be default for role '${role}'`,
      )
    }

    const clearRoles: PrinterRole[] =
      role === "both"
        ? ["receipt", "kitchen", "both"]
        : role === "receipt"
          ? ["receipt", "both"]
          : ["kitchen", "both"]

    const updated = await repository.setDefault(id, storeId, clearRoles)
    return mapPrinterToResponse(updated)
  },

  testPrint: async (id: string, storeId: string, copies: number) => {
    const printer = await repository.findById(id, storeId)
    if (!printer) throw new NotFoundError("Printer not found")
    if (printer.connection_type !== "net") {
      throw new BadRequestError(
        `Only TCP network printers are supported for now. This printer is type '${printer.connection_type}'.`,
      )
    }
    if (!printer.address || !printer.port) {
      throw new BadRequestError("Printer has no IP or port configured")
    }

    const ticket = renderTestTicket({
      paper_width: printer.paper_width === 58 ? 58 : 80,
      profile: printer.profile,
      codepage: printer.codepage,
      open_cash_drawer: printer.open_cash_drawer,
      cut_type: printer.cut_type,
      copies,
      store_name: "POS System",
    })
    const allBytes = duplicateForCopies(ticket, copies)
    const ticketBase64 = Buffer.from(allBytes).toString("base64")

    return {
      success: true,
      ticket_base64: ticketBase64,
      ticket_bytes: allBytes.length,
      printer: {
        id: printer.id,
        name: printer.name,
        address: printer.address,
        port: printer.port,
        paper_width: printer.paper_width,
        profile: printer.profile,
        codepage: printer.codepage,
      },
    }
  },

  probePrint: async (id: string, storeId: string) => {
    const printer = await repository.findById(id, storeId)
    if (!printer) throw new NotFoundError("Printer not found")
    if (printer.connection_type !== "net") {
      throw new BadRequestError(
        `Only TCP network printers are supported for now. This printer is type '${printer.connection_type}'.`,
      )
    }
    if (!printer.address || !printer.port) {
      throw new BadRequestError("Printer has no IP or port configured")
    }

    const bytes = renderCodepageProbe()
    const ticketBase64 = Buffer.from(bytes).toString("base64")

    return {
      success: true,
      ticket_base64: ticketBase64,
      ticket_bytes: bytes.length,
      printer: {
        id: printer.id,
        name: printer.name,
        address: printer.address,
        port: printer.port,
        paper_width: printer.paper_width,
        profile: printer.profile,
        codepage: printer.codepage,
      },
      indices_tested: Array.from({ length: 41 }, (_, i) => i),
      hint: "Look for the line where 'ñ á é í ó ú' renders correctly. That index is the right codepage for your printer.",
    }
  },

  sendTcp: async (ticketBase64: string, address: string, port: number) => {
    const bytes = Buffer.from(ticketBase64, "base64")
    return await sendBytesViaTCP(address, port, bytes)
  },

  printReceipt: async (id: string, storeId: string, saleId: string, copies: number, currency: string = "NIO") => {
    const printer = await repository.findById(id, storeId)
    if (!printer) throw new NotFoundError("Printer not found")
    if (printer.connection_type !== "net") {
      throw new BadRequestError(
        `Only TCP network printers are supported for now. This printer is type '${printer.connection_type}'.`,
      )
    }
    if (!printer.address || !printer.port) {
      throw new BadRequestError("Printer has no IP or port configured")
    }

    const sale = await repository.findSaleWithItems(saleId, storeId)
    if (!sale) throw new NotFoundError("Sale not found")

    const items: SaleReceiptItem[] = sale.items.map((i) => ({
      product_name: i.medicine_name,
      quantity: i.quantity,
      line_total: i.line_total,
    }))

    const ticket = renderSaleReceipt(
      {
        paper_width: printer.paper_width === 58 ? 58 : 80,
        profile: printer.profile,
        codepage: printer.codepage,
        open_cash_drawer: printer.open_cash_drawer,
        cut_type: printer.cut_type as "full" | "partial" | null,
      },
      {
        store_name: "Mi Negocio",
        store_address: null,
        store_phone: null,
        ticket_footer: null,
        sale_id: sale.id,
        user_name: sale.user_name ?? "",
        created_at: sale.created_at,
        subtotal: sale.subtotal,
        total: sale.total,
        payment_method: sale.payment_method,
        amount_received: sale.amount_received,
        change_given: sale.change_given,
        currency_symbol: resolveCurrencySymbol(currency),
        items,
      }
    )

    const allBytes = duplicateForCopies(ticket, copies)
    const ticketBase64 = Buffer.from(allBytes).toString("base64")

    const jobId = await repository.createJob({
      printerId: printer.id,
      saleId: sale.id,
      payload: allBytes,
    })

    const result = await sendBytesViaTCP(printer.address, printer.port, allBytes)
    if (result.success) {
      await repository.updateJobStatus(jobId, "success")
      await repository.updateStatus(printer.id, storeId, "online")
    } else {
      await repository.updateJobStatus(jobId, "failed", result.error)
      await repository.updateStatus(printer.id, storeId, "offline")
    }

    return {
      success: result.success,
      job_id: jobId,
      ticket_base64: ticketBase64,
      ticket_bytes: allBytes.length,
      send_result: result,
      printer: {
        id: printer.id,
        name: printer.name,
        address: printer.address,
        port: printer.port,
        paper_width: printer.paper_width,
        profile: printer.profile,
        codepage: printer.codepage,
      },
    }
  },
})
