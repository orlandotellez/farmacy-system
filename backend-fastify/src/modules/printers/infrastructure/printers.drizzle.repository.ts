import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, isNull, ne, sql } from "drizzle-orm";
import { printer, printJob, sale, saleItem } from "@/db/schema";
import { db } from "@/index";
import { NotFoundError } from "@/core/errors/AppError";
import type { IPrinterRepository } from "../domain/printers.interface";
import type { IPrinterEntity, CreatePrinterData, UpdatePrinterData } from "../domain/printers.entities";
import type {
  PrinterConnType,
  PrinterProfile,
  PrinterActualStatus,
  PrinterRole,
  PrinterCutType,
} from "../domain/printers.types";

type PrinterRow = typeof printer.$inferSelect;

function mapPrinter(row: PrinterRow): IPrinterEntity {
  return {
    id: row.id,
    store_id: row.storeId,
    name: row.name,
    connection_type: row.connectionType as PrinterConnType,
    address: row.address,
    port: row.port,
    paper_width: row.paperWidth,
    profile: row.profile as PrinterProfile,
    codepage: row.codepage,
    auto_cut: row.autoCut,
    cut_type: row.cutType as PrinterCutType | null,
    open_cash_drawer: row.openCashDrawer,
    default_copies: row.defaultCopies,
    role: row.role as PrinterRole,
    is_default: row.isDefault,
    is_active: row.isActive,
    last_status: row.lastStatus as PrinterActualStatus,
    last_seen_at: row.lastSeenAt,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export const PrinterRepository: IPrinterRepository = {
  async findByStore(storeId: string): Promise<IPrinterEntity[]> {
    const rows = await db
      .select()
      .from(printer)
      .where(and(eq(printer.storeId, storeId), isNull(printer.deletedAt)))
      .orderBy(desc(printer.isDefault), asc(printer.name));
    return rows.map(mapPrinter);
  },

  async findById(id, storeId) {
    const [row] = await db
      .select()
      .from(printer)
      .where(and(eq(printer.id, id), eq(printer.storeId, storeId), isNull(printer.deletedAt)))
      .limit(1);
    return row ? mapPrinter(row) : null;
  },

  async findDefault(storeId, role) {
    const [row] = await db
      .select()
      .from(printer)
      .where(and(
        eq(printer.storeId, storeId),
        eq(printer.role, role),
        eq(printer.isDefault, true),
        eq(printer.isActive, true),
        isNull(printer.deletedAt),
      ))
      .limit(1);
    return row ? mapPrinter(row) : null;
  },

  async create(data: CreatePrinterData, clearRoles?: PrinterRole[]): Promise<IPrinterEntity> {
    return db.transaction(async (tx) => {
      if (clearRoles?.length) {
        for (const role of clearRoles) {
          await tx
            .update(printer)
            .set({ isDefault: false })
            .where(and(eq(printer.storeId, data.store_id), eq(printer.role, role), eq(printer.isDefault, true), isNull(printer.deletedAt)));
        }
      }
      const [row] = await tx
        .insert(printer)
        .values({
          id: randomUUID(),
          storeId: data.store_id,
          name: data.name,
          connectionType: data.connection_type,
          address: data.address,
          port: data.port ?? null,
          paperWidth: data.paper_width,
          profile: data.profile,
          codepage: data.codepage ?? "ISO-8859-1",
          autoCut: data.auto_cut ?? true,
          cutType: data.cut_type ?? null,
          openCashDrawer: data.open_cash_drawer ?? false,
          defaultCopies: data.default_copies ?? 1,
          role: data.role,
          isDefault: data.is_default ?? false,
          isActive: data.is_active ?? true,
        })
        .returning();
      return mapPrinter(row);
    });
  },

  async update(id, storeId, data: UpdatePrinterData, clearRoles?: PrinterRole[]): Promise<IPrinterEntity> {
    return db.transaction(async (tx) => {
      if (clearRoles?.length) {
        for (const role of clearRoles) {
          await tx
            .update(printer)
            .set({ isDefault: false })
            .where(and(eq(printer.storeId, storeId), eq(printer.role, role), eq(printer.isDefault, true), ne(printer.id, id), isNull(printer.deletedAt)));
        }
      }
      const [row] = await tx
        .update(printer)
        .set({
          ...(data.name !== undefined && { name: data.name }),
          ...(data.connection_type !== undefined && { connectionType: data.connection_type }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.port !== undefined && { port: data.port }),
          ...(data.paper_width !== undefined && { paperWidth: data.paper_width }),
          ...(data.profile !== undefined && { profile: data.profile }),
          ...(data.codepage !== undefined && { codepage: data.codepage }),
          ...(data.auto_cut !== undefined && { autoCut: data.auto_cut }),
          ...(data.cut_type !== undefined && { cutType: data.cut_type }),
          ...(data.open_cash_drawer !== undefined && { openCashDrawer: data.open_cash_drawer }),
          ...(data.default_copies !== undefined && { defaultCopies: data.default_copies }),
          ...(data.role !== undefined && { role: data.role }),
          ...(data.is_default !== undefined && { isDefault: data.is_default }),
          ...(data.is_active !== undefined && { isActive: data.is_active }),
        })
        .where(and(eq(printer.id, id), eq(printer.storeId, storeId), isNull(printer.deletedAt)))
        .returning();
      if (!row) throw new NotFoundError("Printer not found");
      return mapPrinter(row);
    });
  },

  async setDefault(id, storeId, clearRoles: PrinterRole[]): Promise<IPrinterEntity> {
    return db.transaction(async (tx) => {
      for (const role of clearRoles) {
        await tx
          .update(printer)
          .set({ isDefault: false })
          .where(and(eq(printer.storeId, storeId), eq(printer.role, role), eq(printer.isDefault, true), ne(printer.id, id), isNull(printer.deletedAt)));
      }
      const [row] = await tx
        .update(printer)
        .set({ isDefault: true })
        .where(and(eq(printer.id, id), eq(printer.storeId, storeId), isNull(printer.deletedAt)))
        .returning();
      if (!row) throw new NotFoundError("Printer not found");
      return mapPrinter(row);
    });
  },

  async softDelete(id, storeId): Promise<IPrinterEntity> {
    const [row] = await db
      .update(printer)
      .set({ deletedAt: new Date(), isActive: false })
      .where(and(eq(printer.id, id), eq(printer.storeId, storeId), isNull(printer.deletedAt)))
      .returning();
    if (!row) throw new NotFoundError("Printer not found");
    return mapPrinter(row);
  },

  async existsByName(storeId, name, exceptId?) {
    const conditions = [eq(printer.storeId, storeId), eq(printer.name, name), isNull(printer.deletedAt)];
    if (exceptId) conditions.push(ne(printer.id, exceptId));
    const [row] = await db
      .select({ total: count() })
      .from(printer)
      .where(and(...conditions));
    return (row?.total ?? 0) > 0;
  },

  async updateStatus(id, storeId, status) {
    await db
      .update(printer)
      .set({ lastStatus: status as PrinterActualStatus, lastSeenAt: new Date() })
      .where(and(eq(printer.id, id), eq(printer.storeId, storeId)));
  },

  async createJob(data: { printerId: string; saleId?: string | null; payload: Uint8Array }): Promise<string> {
    const [row] = await db
      .insert(printJob)
      .values({
        id: randomUUID(),
        printerId: data.printerId,
        saleId: data.saleId ?? null,
        payload: sql`${Buffer.from(data.payload)}::bytea`,
        status: "pending",
        attempts: 0,
        maxAttempts: 3,
      })
      .returning({ id: printJob.id });
    return row.id;
  },

  async updateJobStatus(id: string, status: string, error?: string): Promise<void> {
    const now = new Date();
    await db
      .update(printJob)
      .set({
        status,
        attempts: sql`${printJob.attempts} + 1`,
        errorMsg: error ?? null,
        sentAt: status === "sent" || status === "success" ? now : printJob.sentAt,
        finishedAt: status === "success" || status === "failed" ? now : null,
      })
      .where(eq(printJob.id, id));
  },

  async findSaleWithItems(saleId, storeId) {
    const [row] = await db
      .select()
      .from(sale)
      .where(and(eq(sale.id, saleId), eq(sale.storeId, storeId)))
      .limit(1);
    if (!row) return null;
    const items = await db.select().from(saleItem).where(eq(saleItem.saleId, saleId));
    return {
      id: row.id,
      user_name: row.userName ?? null,
      created_at: row.createdAt,
      subtotal: Number(row.subtotal),
      total: Number(row.total),
      payment_method: row.paymentMethod,
      amount_received: row.amountReceived === null ? null : Number(row.amountReceived),
      change_given: row.changeGiven === null ? null : Number(row.changeGiven),
      items: items.map((item) => ({
        medicine_name: item.medicineName,
        quantity: item.quantity,
        line_total: Number(item.lineTotal),
      })),
    };
  },
};
