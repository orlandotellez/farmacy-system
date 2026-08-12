import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, gte, gt, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { batch, client, inventoryMovement, medicine, prescription, prescriptionItem, sale, saleItem, users } from "@/db/schema";
import { db } from "@/index";
import { BadRequestError, NotFoundError } from "@/core/errors/AppError";
import type { ISaleRepository } from "../domain/sales.interface";
import type { CreateSaleData, ISaleEntity, ISaleItemEntity } from "../domain/sales.entities";
import type { GroupBy, ISaleReport, IRevenueTrendItem } from "../domain/sales.types";

type SaleRow = typeof sale.$inferSelect;
type SaleItemRow = typeof saleItem.$inferSelect;
type UserRow = typeof users.$inferSelect;
type ClientRow = typeof client.$inferSelect;

interface RichSaleRow extends SaleRow {
  user?: UserRow | null
  client?: ClientRow | null
  items?: SaleItemRow[]
}

function mapItem(row: SaleItemRow): ISaleItemEntity {
  return {
    id: row.id,
    sale_id: row.saleId,
    medicine_id: row.medicineId,
    medicine_name: row.medicineName,
    quantity: row.quantity,
    unit_price: Number(row.unitPrice),
    line_total: Number(row.lineTotal),
    batch_id: row.batchId ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

function mapSale(row: RichSaleRow): ISaleEntity {
  return {
    id: row.id,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    payment_method: row.paymentMethod as ISaleEntity["payment_method"],
    amount_received: row.amountReceived === null ? null : Number(row.amountReceived),
    change_given: row.changeGiven === null ? null : Number(row.changeGiven),
    status: row.status as ISaleEntity["status"],
    cancellation_reason: row.cancellationReason ?? null,
    cancelled_at: row.cancelledAt ?? null,
    cancelled_by: row.cancelledBy ?? null,
    user_id: row.userId,
    user_name: row.userName ?? row.user?.name ?? null,
    client_id: row.clientId ?? null,
    client_name: row.client?.fullName ?? null,
    prescription_id: row.prescriptionId ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    items: (row.items ?? []).map(mapItem),
  };
}

const richSelect = {
  sale,
  user: users,
  client,
};

async function findRichById(id: string, storeId: string): Promise<RichSaleRow | null> {
  const [row] = await db
    .select(richSelect)
    .from(sale)
    .leftJoin(users, eq(sale.userId, users.id))
    .leftJoin(client, eq(sale.clientId, client.id))
    .where(and(eq(sale.id, id), eq(sale.storeId, storeId)))
    .limit(1);
  if (!row) return null;

  const items = await db.select().from(saleItem).where(eq(saleItem.saleId, id));
  return { ...row.sale, user: row.user, client: row.client, items };
}

interface SaleLine {
  medicineId: string
  quantity: number
  batchId?: string
}

export const SaleRepository: ISaleRepository = {
  async create(data: CreateSaleData, storeId: string): Promise<ISaleEntity> {
    const saleId = await db.transaction(async (tx) => {
      const medicineIds = [...new Set(data.items.map((item) => item.medicine_id))];
      const medicineRows = await tx
        .select()
        .from(medicine)
        .where(and(inArray(medicine.id, medicineIds), eq(medicine.storeId, storeId), eq(medicine.active, true), sql`${medicine.deletedAt} is null`));
      const medicines = new Map(medicineRows.map((row) => [row.id, row]));

      for (const id of medicineIds) {
        if (!medicines.has(id)) throw new BadRequestError("Medicine not found in this store");
      }

      const quantities = new Map<string, number>();
      for (const item of data.items) {
        quantities.set(item.medicine_id, (quantities.get(item.medicine_id) ?? 0) + item.quantity);
      }
      for (const [medicineId, quantity] of quantities) {
        const row = medicines.get(medicineId)!;
        if (row.stock < quantity) throw new BadRequestError(`Insufficient stock for ${row.commercialName}`);
      }

      if (data.client_id) {
        const [clientRow] = await tx
          .select({ id: client.id })
          .from(client)
          .where(and(eq(client.id, data.client_id), eq(client.storeId, storeId), sql`${client.deletedAt} is null`))
          .limit(1);
        if (!clientRow) throw new BadRequestError("Client not found in this store");
      }

      let prescriptionRow: typeof prescription.$inferSelect | undefined;
      let prescriptionItems: typeof prescriptionItem.$inferSelect[] = [];
      if (data.prescription_id) {
        await tx.execute(sql`
          SELECT "id"
          FROM "prescription"
          WHERE "id" = ${data.prescription_id}
            AND "store_id" = ${storeId}
          FOR UPDATE
        `);
        const [foundPrescription] = await tx
          .select()
          .from(prescription)
          .where(and(eq(prescription.id, data.prescription_id), eq(prescription.storeId, storeId), sql`${prescription.deletedAt} is null`))
          .limit(1);
        if (!foundPrescription || foundPrescription.status !== "validada") {
          throw new BadRequestError("Prescription must be validated and belong to this store");
        }
        if (foundPrescription.expiryDate && foundPrescription.expiryDate <= new Date()) {
          throw new BadRequestError("Prescription has expired");
        }
        if (foundPrescription.clientId && foundPrescription.clientId !== data.client_id) {
          throw new BadRequestError("Prescription belongs to another client");
        }
        prescriptionRow = foundPrescription;
        prescriptionItems = await tx.select().from(prescriptionItem).where(eq(prescriptionItem.prescriptionId, foundPrescription.id));
      }

      for (const [medicineId] of quantities) {
        const row = medicines.get(medicineId)!;
        if ((row.requiresPrescription || row.isControlled) && !prescriptionRow) {
          throw new BadRequestError(`A validated prescription is required for ${row.commercialName}`);
        }
      }

      if (prescriptionRow) {
        const previousRows = await tx
          .select({ medicineId: saleItem.medicineId, quantity: saleItem.quantity })
          .from(saleItem)
          .innerJoin(sale, eq(saleItem.saleId, sale.id))
          .where(and(eq(sale.prescriptionId, prescriptionRow.id), eq(sale.storeId, storeId), eq(sale.status, "completada")));
        const consumed = new Map<string, number>();
        for (const row of previousRows) consumed.set(row.medicineId, (consumed.get(row.medicineId) ?? 0) + row.quantity);

        for (const [medicineId, quantity] of quantities) {
          const medicineRow = medicines.get(medicineId)!;
          if (!medicineRow.requiresPrescription && !medicineRow.isControlled) continue;
          const authorized = prescriptionItems.find((item) => item.medicineId === medicineId)?.authorizedQuantity ?? 0;
          if ((consumed.get(medicineId) ?? 0) + quantity > authorized) {
            throw new BadRequestError(`Authorized quantity exceeded for ${medicineRow.commercialName}`);
          }
        }
      }

      const now = new Date();
      const allocatedByBatch = new Map<string, number>();
      const batchMedicineIds = new Map<string, string>();

      for (const item of data.items.filter((candidate) => candidate.batch_id)) {
        const [batchRow] = await tx
          .select()
          .from(batch)
          .where(and(eq(batch.id, item.batch_id!), eq(batch.medicineId, item.medicine_id), eq(batch.storeId, storeId)))
          .limit(1);
        if (!batchRow) throw new BadRequestError("Batch does not belong to this store or medicine");
        if (batchRow.expiryDate <= now) throw new BadRequestError("Cannot sell an expired batch");
        const assigned = allocatedByBatch.get(batchRow.id) ?? 0;
        if (batchRow.quantity < assigned + item.quantity) throw new BadRequestError("Insufficient stock in selected batch");
        allocatedByBatch.set(batchRow.id, assigned + item.quantity);
        batchMedicineIds.set(batchRow.id, item.medicine_id);
      }

      const autoAllocatedByBatch = new Map<string, number>();
      for (const [medicineId, requiredQuantity] of quantities) {
        const explicitQuantity = data.items
          .filter((item) => item.medicine_id === medicineId && item.batch_id)
          .reduce((sum, item) => sum + item.quantity, 0);
        let remaining = requiredQuantity - explicitQuantity;
        if (remaining <= 0) continue;

        const batches = await tx
          .select()
          .from(batch)
          .where(and(eq(batch.medicineId, medicineId), eq(batch.storeId, storeId), gt(batch.quantity, 0), gt(batch.expiryDate, now)))
          .orderBy(asc(batch.expiryDate));
        for (const batchRow of batches) {
          const available = batchRow.quantity - (allocatedByBatch.get(batchRow.id) ?? 0);
          if (available <= 0) continue;
          const take = Math.min(available, remaining);
          allocatedByBatch.set(batchRow.id, (allocatedByBatch.get(batchRow.id) ?? 0) + take);
          autoAllocatedByBatch.set(batchRow.id, (autoAllocatedByBatch.get(batchRow.id) ?? 0) + take);
          batchMedicineIds.set(batchRow.id, medicineId);
          remaining -= take;
          if (remaining === 0) break;
        }
      }

      const saleLines: SaleLine[] = [];
      const remainingAuto = new Map(autoAllocatedByBatch);
      for (const item of data.items) {
        if (item.batch_id) {
          saleLines.push({ medicineId: item.medicine_id, quantity: item.quantity, batchId: item.batch_id });
          continue;
        }
        let remaining = item.quantity;
        for (const [batchId, available] of remainingAuto) {
          if (batchMedicineIds.get(batchId) !== item.medicine_id || available <= 0) continue;
          const take = Math.min(available, remaining);
          saleLines.push({ medicineId: item.medicine_id, quantity: take, batchId });
          remainingAuto.set(batchId, available - take);
          remaining -= take;
          if (remaining === 0) break;
        }
        if (remaining > 0) saleLines.push({ medicineId: item.medicine_id, quantity: remaining });
      }

      const subtotal = saleLines.reduce((sum, line) => {
        const medicineRow = medicines.get(line.medicineId)!;
        return sum + Number(medicineRow.salePrice) * line.quantity;
      }, 0);
      const total = subtotal;
      if (data.payment_method === "efectivo" && (data.amount_received === undefined || data.amount_received < total)) {
        throw new BadRequestError("Cash received is insufficient");
      }
      const change = data.amount_received === undefined ? null : data.amount_received - total;

      const [createdSale] = await tx
        .insert(sale)
        .values({
          id: randomUUID(),
          subtotal: subtotal.toString(),
          total: total.toString(),
          paymentMethod: data.payment_method,
          amountReceived: data.amount_received?.toString() ?? null,
          changeGiven: change?.toString() ?? null,
          status: "completada",
          userId: data.user_id,
          userName: data.user_name ?? null,
          clientId: data.client_id ?? null,
          prescriptionId: data.prescription_id ?? null,
          storeId,
        })
        .returning({ id: sale.id });

      await tx.insert(saleItem).values(
        saleLines.map((line) => {
          const medicineRow = medicines.get(line.medicineId)!;
          const unitPrice = Number(medicineRow.salePrice);
          return {
            id: randomUUID(),
            saleId: createdSale.id,
            medicineId: line.medicineId,
            medicineName: medicineRow.commercialName,
            quantity: line.quantity,
            unitPrice: unitPrice.toString(),
            lineTotal: (unitPrice * line.quantity).toString(),
            batchId: line.batchId ?? null,
          };
        }),
      );

      for (const [medicineId, quantity] of quantities) {
        const updated = await tx
          .update(medicine)
          .set({ stock: sql`${medicine.stock} - ${quantity}` })
          .where(and(eq(medicine.id, medicineId), eq(medicine.storeId, storeId), gte(medicine.stock, quantity)))
          .returning({ id: medicine.id });
        if (!updated.length) throw new BadRequestError("Stock changed while processing the sale; try again");
      }

      for (const [batchId, quantity] of allocatedByBatch) {
        const updated = await tx
          .update(batch)
          .set({ quantity: sql`${batch.quantity} - ${quantity}` })
          .where(and(eq(batch.id, batchId), eq(batch.storeId, storeId), gte(batch.quantity, quantity)))
          .returning({ id: batch.id });
        if (!updated.length) throw new BadRequestError("Batch stock changed while processing the sale; try again");

        await tx.insert(inventoryMovement).values({
          id: randomUUID(),
          medicineId: batchMedicineIds.get(batchId)!,
          movementType: "venta",
          quantity,
          note: `Venta #${createdSale.id.slice(0, 8)}`,
          batchId,
          userId: data.user_id,
          storeId,
        });
      }

      for (const line of saleLines.filter((line) => !line.batchId)) {
        await tx.insert(inventoryMovement).values({
          id: randomUUID(),
          medicineId: line.medicineId,
          movementType: "venta",
          quantity: line.quantity,
          note: `Venta #${createdSale.id.slice(0, 8)}`,
          batchId: null,
          userId: data.user_id,
          storeId,
        });
      }

      return createdSale.id;
    });

    const result = await findRichById(saleId, storeId);
    if (!result) throw new NotFoundError("Sale not found");
    return mapSale(result);
  },

  async findById(id, storeId) {
    const result = await findRichById(id, storeId);
    return result ? mapSale(result) : null;
  },

  async findAll(params) {
    const conditions = [];
    if (params?.storeId) conditions.push(eq(sale.storeId, params.storeId));
    if (params?.from) conditions.push(gte(sale.createdAt, params.from));
    if (params?.to) conditions.push(lte(sale.createdAt, params.to));
    if (params?.status) conditions.push(eq(sale.status, params.status));
    if (params?.paymentMethod) conditions.push(eq(sale.paymentMethod, params.paymentMethod));
    if (params?.userId) conditions.push(eq(sale.userId, params.userId));
    if (params?.minAmount !== undefined) conditions.push(gte(sale.total, params.minAmount.toString()));
    if (params?.minItems !== undefined) conditions.push(sql`(SELECT COUNT(*) FROM sale_item item_count WHERE item_count.sale_id = ${sale.id}) >= ${params.minItems}`);
    if (params?.search) {
      conditions.push(or(sql`${sale.id}::text ILIKE ${`%${params.search}%`}`, ilike(users.name, `%${params.search}%`), ilike(client.fullName, `%${params.search}%`))!);
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const rows = await db
      .select(richSelect)
      .from(sale)
      .leftJoin(users, eq(sale.userId, users.id))
      .leftJoin(client, eq(sale.clientId, client.id))
      .where(and(...conditions))
      .orderBy(desc(sale.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    const [totalRows] = await db
      .select({ total: count() })
      .from(sale)
      .leftJoin(users, eq(sale.userId, users.id))
      .leftJoin(client, eq(sale.clientId, client.id))
      .where(and(...conditions));

    const sales: ISaleEntity[] = [];
    for (const row of rows) {
      const items = await db.select().from(saleItem).where(eq(saleItem.saleId, row.sale.id));
      sales.push(mapSale({ ...row.sale, user: row.user, client: row.client, items }));
    }
    return { sales, total: totalRows?.total ?? 0, page, limit };
  },

  async cancel(id, reason, userId, storeId) {
    const saleId = await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(sale)
        .where(and(eq(sale.id, id), eq(sale.storeId, storeId)))
        .limit(1);
      if (!current) throw new NotFoundError("Sale not found");
      if (current.status === "anulada") throw new BadRequestError("Sale is already cancelled");

      const items = await tx.select().from(saleItem).where(eq(saleItem.saleId, id));
      const [claimed] = await tx
        .update(sale)
        .set({ status: "anulada", cancellationReason: reason, cancelledAt: new Date(), cancelledBy: userId })
        .where(and(eq(sale.id, id), eq(sale.storeId, storeId), eq(sale.status, "completada")))
        .returning({ id: sale.id });
      if (!claimed) throw new BadRequestError("Sale was already cancelled or changed; try again");

      for (const item of items) {
        await tx
          .update(medicine)
          .set({ stock: sql`${medicine.stock} + ${item.quantity}` })
          .where(and(eq(medicine.id, item.medicineId), eq(medicine.storeId, storeId)));
        if (item.batchId) {
          const restored = await tx
            .update(batch)
            .set({ quantity: sql`${batch.quantity} + ${item.quantity}` })
            .where(and(eq(batch.id, item.batchId), eq(batch.medicineId, item.medicineId), eq(batch.storeId, storeId)))
            .returning({ id: batch.id });
          if (!restored.length) throw new BadRequestError("The sale batch no longer exists");
        }
        await tx.insert(inventoryMovement).values({
          id: randomUUID(),
          medicineId: item.medicineId,
          movementType: "devolucion",
          quantity: item.quantity,
          note: `Cancelación de venta #${id.slice(0, 8)}: ${reason}`,
          batchId: item.batchId,
          userId,
          storeId,
        });
      }
      return id;
    });

    const result = await findRichById(saleId, storeId);
    if (!result) throw new NotFoundError("Sale not found");
    return mapSale(result);
  },

  async getReport(params): Promise<ISaleReport> {
    const conditions = [eq(sale.status, "completada")];
    if (params?.storeId) conditions.push(eq(sale.storeId, params.storeId));
    if (params?.from) conditions.push(gte(sale.createdAt, params.from));
    if (params?.to) conditions.push(lte(sale.createdAt, params.to));

    const rows = await db
      .select({ sale: sale, item: saleItem, medicine: medicine })
      .from(sale)
      .innerJoin(saleItem, eq(saleItem.saleId, sale.id))
      .innerJoin(medicine, eq(saleItem.medicineId, medicine.id))
      .where(and(...conditions));

    const saleTotals = new Map<string, number>();
    const byPaymentMethod: Record<string, number> = {};
    const products = new Map<string, { medicine_id: string; medicine_name: string; quantity: number; revenue: number }>();
    let totalProfit = 0;
    for (const row of rows) {
      saleTotals.set(row.sale.id, Number(row.sale.total));
      byPaymentMethod[row.sale.paymentMethod] = (byPaymentMethod[row.sale.paymentMethod] ?? 0) + Number(row.item.lineTotal);
      const product = products.get(row.item.medicineId) ?? { medicine_id: row.item.medicineId, medicine_name: row.item.medicineName, quantity: 0, revenue: 0 };
      product.quantity += row.item.quantity;
      product.revenue += Number(row.item.lineTotal);
      products.set(row.item.medicineId, product);
      totalProfit += (Number(row.item.unitPrice) - Number(row.medicine.purchasePrice)) * row.item.quantity;
    }
    const totalRevenue = [...saleTotals.values()].reduce((sum, value) => sum + value, 0);
    return {
      total_sales: saleTotals.size,
      total_revenue: totalRevenue,
      total_profit: totalProfit,
      average_ticket: saleTotals.size ? totalRevenue / saleTotals.size : 0,
      by_payment_method: byPaymentMethod,
      top_products: [...products.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    };
  },

  async getRevenueTrend(params): Promise<IRevenueTrendItem[]> {
    const period = sql.raw(`'${params.groupBy}'`);
    const result = await db.execute(sql`
      SELECT DATE_TRUNC(${period}, "created_at") AS period,
             SUM("total")::numeric AS revenue,
             COUNT(*)::int AS count
      FROM "sale"
      WHERE "store_id" = ${params.storeId}
        AND "status" = 'completada'
        AND "created_at" >= ${params.startDate}
        AND "created_at" <= ${params.endDate}
      GROUP BY DATE_TRUNC(${period}, "created_at")
      ORDER BY period ASC
    `);
    const rows = result.rows as unknown as Array<{ period: Date | string; revenue: string | number; count: number }>;
    return rows.map((row) => ({
      period: row.period instanceof Date ? row.period.toISOString() : String(row.period),
      revenue: Number(row.revenue),
      count: Number(row.count),
    }));
  },
};
