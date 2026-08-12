import { randomUUID } from "node:crypto";
import { and, asc, count, eq, gt, gte, ilike, lte, or, sql } from "drizzle-orm";
import { batch, inventoryMovement, medicine, purchase, supplier } from "@/db/schema";
import { db } from "@/index";
import { BadRequestError, NotFoundError } from "@/core/errors/AppError";
import type { IBatchInventoryRepository } from "../domain/batch-inventory.interface";
import type { CreateBatchData, IBatchEntity, UpdateBatchData } from "../domain/batch-inventory.entities";

type BatchRow = typeof batch.$inferSelect;
type MedicineRow = typeof medicine.$inferSelect;
type SupplierRow = typeof supplier.$inferSelect;

interface RichBatchRow extends BatchRow {
  medicine?: MedicineRow | null
  supplier?: SupplierRow | null
}

function mapRowToEntity(row: RichBatchRow): IBatchEntity {
  return {
    id: row.id,
    batch_number: row.batchNumber,
    medicine_id: row.medicineId,
    medicine_name: row.medicine?.commercialName ?? null,
    purchase_id: row.purchaseId ?? null,
    supplier_id: row.supplierId ?? null,
    supplier_name: row.supplier?.name ?? null,
    manufacture_date: row.manufactureDate ?? null,
    expiry_date: row.expiryDate,
    quantity: row.quantity,
    unit_cost: row.unitCost === null ? null : Number(row.unitCost),
    notes: row.notes ?? null,
    user_id: row.userId,
    store_id: row.storeId,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

const richSelect = {
  batch,
  medicine,
  supplier,
};

async function findRichById(id: string, storeId: string): Promise<RichBatchRow | null> {
  const [row] = await db
    .select(richSelect)
    .from(batch)
    .leftJoin(medicine, eq(batch.medicineId, medicine.id))
    .leftJoin(supplier, eq(batch.supplierId, supplier.id))
    .where(and(eq(batch.id, id), eq(batch.storeId, storeId)))
    .limit(1);

  if (!row) return null;
  return { ...row.batch, medicine: row.medicine, supplier: row.supplier };
}

export const BatchInventoryRepository: IBatchInventoryRepository = {
  async findAll(params) {
    const conditions = [];
    if (params?.storeId) conditions.push(eq(batch.storeId, params.storeId));
    if (params?.medicine_id) conditions.push(eq(batch.medicineId, params.medicine_id));
    if (params?.supplier_id) conditions.push(eq(batch.supplierId, params.supplier_id));

    if (params?.search) {
      conditions.push(
        or(
          ilike(batch.batchNumber, `%${params.search}%`),
          ilike(medicine.commercialName, `%${params.search}%`),
          ilike(supplier.name, `%${params.search}%`),
        )!,
      );
    }

    const now = new Date();
    if (params?.expired) conditions.push(lte(batch.expiryDate, now));
    if (params?.expiring_soon) {
      const alertDays = params.expiration_alert_days ?? 60;
      const alertLimit = new Date(now.getTime() + alertDays * 24 * 60 * 60 * 1000);
      conditions.push(gt(batch.expiryDate, now), lte(batch.expiryDate, alertLimit));
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const rows = await db
      .select(richSelect)
      .from(batch)
      .leftJoin(medicine, eq(batch.medicineId, medicine.id))
      .leftJoin(supplier, eq(batch.supplierId, supplier.id))
      .where(and(...conditions))
      .orderBy(asc(batch.expiryDate))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalRows] = await db
      .select({ total: count() })
      .from(batch)
      .leftJoin(medicine, eq(batch.medicineId, medicine.id))
      .leftJoin(supplier, eq(batch.supplierId, supplier.id))
      .where(and(...conditions));

    return {
      batches: rows.map((row) => mapRowToEntity({ ...row.batch, medicine: row.medicine, supplier: row.supplier })),
      total: totalRows?.total ?? 0,
      page,
      limit,
    };
  },

  async findById(id, storeId) {
    const row = await findRichById(id, storeId);
    return row ? mapRowToEntity(row) : null;
  },

  async create(data: CreateBatchData, userId: string, storeId: string) {
    const batchId = await db.transaction(async (tx) => {
      const [medicineRow] = await tx
        .select({ id: medicine.id })
        .from(medicine)
        .where(and(eq(medicine.id, data.medicine_id), eq(medicine.storeId, storeId)))
        .limit(1);
      if (!medicineRow) throw new NotFoundError("Medicine not found");

      if (data.supplier_id) {
        const [supplierRow] = await tx
          .select({ id: supplier.id })
          .from(supplier)
          .where(and(eq(supplier.id, data.supplier_id), eq(supplier.storeId, storeId)))
          .limit(1);
        if (!supplierRow) throw new NotFoundError("Supplier not found");
      }

      if (data.purchase_id) {
        const [purchaseRow] = await tx
          .select({ id: purchase.id })
          .from(purchase)
          .where(and(eq(purchase.id, data.purchase_id), eq(purchase.storeId, storeId)))
          .limit(1);
        if (!purchaseRow) throw new NotFoundError("Purchase not found");
      }

      const [created] = await tx
        .insert(batch)
        .values({
          id: randomUUID(),
          batchNumber: data.batch_number,
          medicineId: data.medicine_id,
          purchaseId: data.purchase_id ?? null,
          supplierId: data.supplier_id ?? null,
          manufactureDate: data.manufacture_date ? new Date(data.manufacture_date) : null,
          expiryDate: new Date(data.expiry_date),
          initialQuantity: data.quantity,
          quantity: data.quantity,
          unitCost: data.unit_cost?.toString() ?? null,
          notes: data.notes ?? null,
          userId,
          storeId,
        })
        .returning({ id: batch.id });

      await tx
        .update(medicine)
        .set({ stock: sql`${medicine.stock} + ${data.quantity}` })
        .where(and(eq(medicine.id, data.medicine_id), eq(medicine.storeId, storeId)));

      await tx.insert(inventoryMovement).values({
        id: randomUUID(),
        medicineId: data.medicine_id,
        movementType: "entrada",
        quantity: data.quantity,
        note: data.notes ?? "Entrada manual de inventario",
        batchId: created.id,
        userId,
        storeId,
      });

      return created.id;
    });

    const result = await findRichById(batchId, storeId);
    if (!result) throw new NotFoundError("Batch not found");
    return mapRowToEntity(result);
  },

  async update(id: string, data: UpdateBatchData, userId: string, storeId: string) {
    const batchId = await db.transaction(async (tx) => {
      const [current] = await tx
        .select({ batch, medicine })
        .from(batch)
        .innerJoin(medicine, eq(batch.medicineId, medicine.id))
        .where(and(eq(batch.id, id), eq(batch.storeId, storeId)))
        .limit(1);
      if (!current) throw new NotFoundError("Batch not found");

      const delta = data.quantity === undefined ? 0 : data.quantity - current.batch.quantity;
      if (delta < 0 && current.medicine.stock + delta < 0) {
        throw new BadRequestError("Batch adjustment would make stock negative");
      }

      const updatedBatch = await tx
        .update(batch)
        .set({
          ...(data.batch_number !== undefined && { batchNumber: data.batch_number }),
          ...(data.expiry_date !== undefined && { expiryDate: new Date(data.expiry_date) }),
          ...(data.quantity !== undefined && { quantity: data.quantity }),
          ...(data.notes !== undefined && { notes: data.notes }),
        })
        .where(and(eq(batch.id, id), eq(batch.storeId, storeId), eq(batch.quantity, current.batch.quantity)))
        .returning({ id: batch.id });
      if (!updatedBatch.length) throw new BadRequestError("Batch changed concurrently; try again");

      if (delta !== 0) {
        const updatedMedicine = await tx
          .update(medicine)
          .set({ stock: sql`${medicine.stock} + ${delta}` })
          .where(and(
            eq(medicine.id, current.batch.medicineId),
            eq(medicine.storeId, storeId),
            ...(delta < 0 ? [gte(medicine.stock, -delta)] : []),
          ))
          .returning({ id: medicine.id });
        if (!updatedMedicine.length) throw new BadRequestError("Insufficient stock or concurrent stock change");

        await tx.insert(inventoryMovement).values({
          id: randomUUID(),
          medicineId: current.batch.medicineId,
          movementType: "ajuste",
          quantity: delta,
          note: data.notes ?? `Ajuste del lote ${current.batch.batchNumber}`,
          batchId: id,
          userId,
          storeId,
        });
      }

      return id;
    });

    const result = await findRichById(batchId, storeId);
    if (!result) throw new NotFoundError("Batch not found");
    return mapRowToEntity(result);
  },
};
