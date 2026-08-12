import { randomUUID } from "node:crypto";
import { and, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { invoice, sale } from "@/db/schema";
import { db } from "@/index";
import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError";
import type { IInvoiceRepository } from "../domain/invoices.interface";
import type { CreateInvoiceData, IInvoiceEntity } from "../domain/invoices.entities";

type InvoiceRow = typeof invoice.$inferSelect;

function mapInvoice(row: InvoiceRow): IInvoiceEntity {
  return {
    id: row.id,
    number: row.number,
    invoice_type: row.invoiceType as IInvoiceEntity["invoice_type"],
    sale_id: row.saleId,
    client_id: row.clientId ?? null,
    client_name: row.clientName ?? null,
    client_document: row.clientDocument ?? null,
    client_address: row.clientAddress ?? null,
    client_phone: row.clientPhone ?? null,
    client_email: row.clientEmail ?? null,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    status: row.status as IInvoiceEntity["status"],
    cancelled_at: row.cancelledAt ?? null,
    cancelled_by: row.cancelledBy ?? null,
    issued_by: row.issuedBy ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export const InvoiceRepository: IInvoiceRepository = {
  async create(data: CreateInvoiceData, storeId: string): Promise<IInvoiceEntity> {
    const invoiceId = await db.transaction(async (tx) => {
      // Serialize invoice numbering per store
      await tx.execute(sql`
        SELECT "id"
        FROM "store"
        WHERE "id" = ${storeId}
        FOR UPDATE
      `);

      // Lock the sale row to serialize with sale cancellation
      await tx.execute(sql`
        SELECT "id"
        FROM "sale"
        WHERE "id" = ${data.sale_id}
          AND "store_id" = ${storeId}
        FOR UPDATE
      `);

      const [saleRow] = await tx
        .select()
        .from(sale)
        .where(and(eq(sale.id, data.sale_id), eq(sale.storeId, storeId)))
        .limit(1);
      if (!saleRow) throw new NotFoundError("Sale not found in this store");
      if (saleRow.status !== "completada") throw new BadRequestError("Only completed sales can be invoiced");

      const [existing] = await tx
        .select({ id: invoice.id })
        .from(invoice)
        .where(and(eq(invoice.saleId, saleRow.id), eq(invoice.storeId, storeId), eq(invoice.status, "emitida")))
        .limit(1);
      if (existing) throw new ConflictError("This sale already has an emitted invoice");

      const year = new Date().getFullYear();
      const prefix = `FAC-${year}-`;
      const [last] = await tx
        .select({ number: invoice.number })
        .from(invoice)
        .where(and(eq(invoice.storeId, storeId), ilike(invoice.number, `${prefix}%`)))
        .orderBy(desc(invoice.number))
        .limit(1);
      const next = last ? Number(last.number.slice(prefix.length)) + 1 : 1;
      const number = `${prefix}${String(next).padStart(6, "0")}`;

      const [created] = await tx
        .insert(invoice)
        .values({
          id: randomUUID(),
          number,
          invoiceType: data.invoice_type,
          saleId: saleRow.id,
          clientId: saleRow.clientId ?? null,
          clientName: data.client_name ?? null,
          clientDocument: data.client_document ?? null,
          clientAddress: data.client_address ?? null,
          clientPhone: data.client_phone ?? null,
          clientEmail: data.client_email ?? null,
          subtotal: saleRow.subtotal,
          total: saleRow.total,
          status: "emitida",
          issuedBy: data.user_id,
          storeId,
        })
        .returning({ id: invoice.id });

      return created.id;
    });

    const result = await InvoiceRepository.findById(invoiceId, storeId);
    if (!result) throw new NotFoundError("Invoice not found");
    return result;
  },

  async findById(id, storeId) {
    const [row] = await db
      .select()
      .from(invoice)
      .where(and(eq(invoice.id, id), eq(invoice.storeId, storeId)))
      .limit(1);
    return row ? mapInvoice(row) : null;
  },

  async findAll(params) {
    const conditions = [];
    if (params?.storeId) conditions.push(eq(invoice.storeId, params.storeId));
    if (params?.invoiceType) conditions.push(eq(invoice.invoiceType, params.invoiceType));
    if (params?.from) conditions.push(gte(invoice.createdAt, params.from));
    if (params?.to) conditions.push(lte(invoice.createdAt, params.to));
    if (params?.search) {
      conditions.push(or(
        ilike(invoice.number, `%${params.search}%`),
        ilike(invoice.clientName, `%${params.search}%`),
        ilike(invoice.clientDocument, `%${params.search}%`),
      )!);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const rows = await db
      .select()
      .from(invoice)
      .where(and(...conditions))
      .orderBy(desc(invoice.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    const [totalRows] = await db
      .select({ total: count() })
      .from(invoice)
      .where(and(...conditions));

    return {
      invoices: rows.map(mapInvoice),
      total: totalRows?.total ?? 0,
      page,
      limit,
    };
  },

  async cancel(id, reason, userId, storeId) {
    const invoiceId = await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(invoice)
        .where(and(eq(invoice.id, id), eq(invoice.storeId, storeId)))
        .limit(1);
      if (!current) throw new NotFoundError("Invoice not found");
      if (current.status === "anulada") throw new BadRequestError("Invoice is already cancelled");

      const [claimed] = await tx
        .update(invoice)
        .set({ status: "anulada", cancelledAt: new Date(), cancelledBy: userId })
        .where(and(eq(invoice.id, id), eq(invoice.storeId, storeId), eq(invoice.status, "emitida")))
        .returning({ id: invoice.id });
      if (!claimed) throw new BadRequestError("Invoice was already cancelled; try again");

      return id;
    });

    const result = await InvoiceRepository.findById(invoiceId, storeId);
    if (!result) throw new NotFoundError("Invoice not found");
    return result;
  },
};
