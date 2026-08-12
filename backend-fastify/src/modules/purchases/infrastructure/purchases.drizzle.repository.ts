import { randomUUID } from "node:crypto";
import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { batch as batchTable, inventoryMovement, medicine, purchase, purchaseItem, supplier, users } from "@/db/schema";
import { db } from "@/index";
import { BadRequestError, NotFoundError } from "@/core/errors/AppError";
import { IPurchaseRepository } from "../domain/purchases.interface";
import { CreatePurchaseData, IPurchaseEntity, IPurchaseItemEntity, IReceiveBatchData, UpdatePurchaseData } from "../domain/purchases.entities";

type PurchaseRow = typeof purchase.$inferSelect;
type PurchaseItemRow = typeof purchaseItem.$inferSelect;
type SupplierRow = typeof supplier.$inferSelect;
type UserRow = typeof users.$inferSelect;

interface RichPurchaseRow extends PurchaseRow {
  supplier?: SupplierRow | null
  user?: UserRow | null
  items?: PurchaseItemRow[]
}

function mapItem(row: PurchaseItemRow): IPurchaseItemEntity {
  return {
    id: row.id,
    medicine_id: row.medicineId,
    medicine_name: row.medicineName,
    quantity: row.quantity,
    unit_cost: Number(row.unitCost),
    line_total: Number(row.lineTotal),
    received: row.received,
  };
}

function mapRowToEntity(row: RichPurchaseRow): IPurchaseEntity {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    supplier_id: row.supplierId ?? null,
    supplier_name: row.supplier?.name ?? null,
    expected_date: row.expectedDate ?? null,
    notes: row.notes ?? null,
    total: Number(row.total),
    approved_by: row.approvedBy ?? null,
    approved_at: row.approvedAt ?? null,
    received_by: row.receivedBy ?? null,
    received_at: row.receivedAt ?? null,
    user_id: row.userId,
    user_name: row.user?.name ?? null,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    items: (row.items ?? []).map(mapItem),
  };
}

const baseSelect = {
  purchase: purchase,
  supplier: supplier,
  user: users,
};

async function findRichById(id: string, storeId?: string): Promise<RichPurchaseRow | null> {
  const conditions = [eq(purchase.id, id)];
  if (storeId) conditions.push(eq(purchase.storeId, storeId));

  const [row] = await db
    .select(baseSelect)
    .from(purchase)
    .leftJoin(supplier, eq(purchase.supplierId, supplier.id))
    .leftJoin(users, eq(purchase.userId, users.id))
    .where(and(...conditions))
    .limit(1);

  if (!row) return null;

  const items = await db
    .select()
    .from(purchaseItem)
    .where(eq(purchaseItem.purchaseId, id));

  return { ...row.purchase, supplier: row.supplier, user: row.user, items };
}

export const PurchaseRepository: IPurchaseRepository = {
  async findAll(params) {
    const conditions = [];
    if (params?.storeId) conditions.push(eq(purchase.storeId, params.storeId));
    if (params?.status) conditions.push(eq(purchase.status, params.status));
    if (params?.supplier_id) conditions.push(eq(purchase.supplierId, params.supplier_id));
    if (params?.search) {
      conditions.push(
        or(
          ilike(purchase.number, `%${params.search}%`),
          ilike(supplier.name, `%${params.search}%`),
        )!,
      );
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const rows = await db
      .select(baseSelect)
      .from(purchase)
      .leftJoin(supplier, eq(purchase.supplierId, supplier.id))
      .leftJoin(users, eq(purchase.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(purchase.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalRows] = await db
      .select({ total: count() })
      .from(purchase)
      .leftJoin(supplier, eq(purchase.supplierId, supplier.id))
      .where(and(...conditions));

    const purchases: IPurchaseEntity[] = [];
    for (const row of rows) {
      const items = await db
        .select()
        .from(purchaseItem)
        .where(eq(purchaseItem.purchaseId, row.purchase.id));
      purchases.push(mapRowToEntity({ ...row.purchase, supplier: row.supplier, user: row.user, items }));
    }

    return {
      purchases,
      total: totalRows?.total ?? 0,
      page,
      limit,
    };
  },

  async findById(id: string, storeId?: string): Promise<IPurchaseEntity | null> {
    const row = await findRichById(id, storeId);
    if (!row) return null;
    return mapRowToEntity(row);
  },

  async create(data, storeId, userId, medicineNames): Promise<IPurchaseEntity> {
    const total = data.items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0);

    const [row] = await db
      .insert(purchase)
      .values({
        id: randomUUID(),
        number: `OC-${Date.now()}`,
        status: "borrador",
        supplierId: data.supplier_id ?? null,
        expectedDate: data.expected_date ? new Date(data.expected_date) : null,
        notes: data.notes ?? null,
        total: total.toString(),
        userId,
        storeId,
      })
      .returning();

    await db.insert(purchaseItem).values(
      data.items.map((item) => ({
        id: randomUUID(),
        purchaseId: row.id,
        medicineId: item.medicine_id,
        medicineName: medicineNames.get(item.medicine_id)!,
        quantity: item.quantity,
        unitCost: item.unit_cost.toString(),
        lineTotal: (item.quantity * item.unit_cost).toString(),
        received: 0,
      })),
    );

    const rich = await findRichById(row.id);
    return mapRowToEntity(rich!);
  },

  async update(id, data, storeId, medicineNames): Promise<IPurchaseEntity> {
    await db
      .update(purchase)
      .set({
        ...(data.supplier_id !== undefined && { supplierId: data.supplier_id }),
        ...(data.expected_date !== undefined && { expectedDate: data.expected_date ? new Date(data.expected_date) : null }),
        ...(data.notes !== undefined && { notes: data.notes }),
      })
      .where(and(eq(purchase.id, id), eq(purchase.storeId, storeId)));

    if (data.items?.length && medicineNames) {
      const total = data.items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0);
      await db.delete(purchaseItem).where(eq(purchaseItem.purchaseId, id));
      await db.insert(purchaseItem).values(
        data.items.map((item) => ({
          id: randomUUID(),
          purchaseId: id,
          medicineId: item.medicine_id,
          medicineName: medicineNames.get(item.medicine_id)!,
          quantity: item.quantity,
          unitCost: item.unit_cost.toString(),
          lineTotal: (item.quantity * item.unit_cost).toString(),
          received: 0,
        })),
      );
      await db
        .update(purchase)
        .set({ total: total.toString() })
        .where(eq(purchase.id, id));
    }

    const rich = await findRichById(id, storeId);
    return mapRowToEntity(rich!);
  },

  async approve(id, storeId, userId): Promise<IPurchaseEntity> {
    const [row] = await db
      .update(purchase)
      .set({ status: "aprobada", approvedBy: userId, approvedAt: new Date() })
      .where(and(eq(purchase.id, id), eq(purchase.storeId, storeId), inArray(purchase.status, ["borrador", "pendiente"])))
      .returning();

    if (!row) {
      const exists = await findRichById(id, storeId);
      if (!exists) throw new NotFoundError("Purchase not found");
      throw new BadRequestError("Purchase cannot be approved in its current state");
    }

    const rich = await findRichById(id, storeId);
    return mapRowToEntity(rich!);
  },

  async receive(id, storeId, userId, batches): Promise<IPurchaseEntity> {
    return db.transaction(async (tx) => {
      const current = await tx
        .select()
        .from(purchase)
        .leftJoin(supplier, eq(purchase.supplierId, supplier.id))
        .leftJoin(users, eq(purchase.userId, users.id))
        .where(and(eq(purchase.id, id), eq(purchase.storeId, storeId)))
        .limit(1);

      const purchaseRow = current[0]?.purchase;
      if (!purchaseRow) throw new Error("PURCHASE_NOT_FOUND");
      if (purchaseRow.status !== "aprobada") throw new Error("PURCHASE_NOT_APPROVED");

      const items = await tx
        .select()
        .from(purchaseItem)
        .where(eq(purchaseItem.purchaseId, id));

      const requested = new Map<string, number>();
      for (const b of batches) {
        requested.set(b.medicine_id, (requested.get(b.medicine_id) ?? 0) + b.quantity);
      }

      for (const [medicineId, quantity] of requested) {
        const item = items.find((i) => i.medicineId === medicineId);
        if (!item) throw new Error("MEDICINE_NOT_IN_PURCHASE");
        if (item.received + quantity > item.quantity) throw new Error("RECEIVED_EXCEEDS_ORDERED");
      }

      for (const b of batches) {
        const expiry = new Date(b.expiry_date);
        if (Number.isNaN(expiry.getTime()) || expiry <= new Date()) throw new Error("INVALID_EXPIRY_DATE");
      }

      for (const b of batches) {
        const purchaseItemRow = items.find((i) => i.medicineId === b.medicine_id)!;

        const [createdBatch] = await tx
          .insert(batchTable)
          .values({
            id: randomUUID(),
            batchNumber: b.batch_number,
            medicineId: b.medicine_id,
            purchaseId: id,
            supplierId: purchaseRow.supplierId,
            manufactureDate: b.manufacture_date ? new Date(b.manufacture_date) : null,
            expiryDate: new Date(b.expiry_date),
            initialQuantity: b.quantity,
            quantity: b.quantity,
            unitCost: (b.unit_cost ?? Number(purchaseItemRow.unitCost)).toString(),
            userId,
            storeId,
          })
          .returning();

        await tx
          .update(medicine)
          .set({ stock: sql`${medicine.stock} + ${b.quantity}` })
          .where(eq(medicine.id, b.medicine_id));

        await tx.insert(inventoryMovement).values({
          id: randomUUID(),
          medicineId: b.medicine_id,
          movementType: "entrada",
          quantity: b.quantity,
          note: `Recepción ${purchaseRow.number}`,
          batchId: createdBatch!.id,
          userId,
          storeId,
        });

        await tx
          .update(purchaseItem)
          .set({ received: sql`${purchaseItem.received} + ${b.quantity}` })
          .where(eq(purchaseItem.id, purchaseItemRow.id));
      }

      const fullyReceived = items.every((item) => item.received + (requested.get(item.medicineId) ?? 0) >= item.quantity);

      const [updated] = await tx
        .update(purchase)
        .set({
          status: fullyReceived ? "recibida" : "aprobada",
          ...(fullyReceived ? { receivedBy: userId, receivedAt: new Date() } : {}),
        })
        .where(eq(purchase.id, id))
        .returning();

      const rich: RichPurchaseRow = {
        ...updated,
        supplier: current[0]?.supplier ?? null,
        user: current[0]?.users ?? null,
        items: items.map((i) => ({ ...i, received: i.received + (requested.get(i.medicineId) ?? 0) })),
      };
      return mapRowToEntity(rich);
    });
  },

  async cancel(id, storeId): Promise<void> {
    await db
      .update(purchase)
      .set({ status: "anulada" })
      .where(and(eq(purchase.id, id), eq(purchase.storeId, storeId), inArray(purchase.status, ["borrador", "pendiente", "aprobada"])));
  },
};
