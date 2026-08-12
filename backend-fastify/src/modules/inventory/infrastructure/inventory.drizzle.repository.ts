import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { batch, inventoryMovement, medicine, users } from "@/db/schema";
import { db } from "@/index";
import { BadRequestError, NotFoundError } from "@/core/errors/AppError";
import type { IInventoryRepository } from "../domain/inventory.interface";
import type { CreateMovementData, IInventoryMovementEntity } from "../domain/inventory.entities";
import type { InventoryMovementType, IProductStockResponse } from "../domain/inventory.types";

type MovementRow = typeof inventoryMovement.$inferSelect;
type MedicineRow = typeof medicine.$inferSelect;
type UserRow = typeof users.$inferSelect;

interface RichMovementRow extends MovementRow {
  medicine?: MedicineRow | null
  user?: UserRow | null
}

function mapRowToEntity(row: RichMovementRow): IInventoryMovementEntity {
  return {
    id: row.id,
    medicine_id: row.medicineId,
    medicine_name: row.medicine?.commercialName ?? null,
    movement_type: row.movementType as InventoryMovementType,
    quantity: row.quantity,
    note: row.note ?? null,
    user_id: row.userId,
    user_name: row.user?.name ?? null,
    batch_id: row.batchId ?? null,
    store_id: row.storeId,
    created_at: row.createdAt,
  };
}

const richSelect = {
  movement: inventoryMovement,
  medicine,
  user: users,
};

function movementDelta(data: CreateMovementData): number {
  if (data.movement_type === "ajuste") return data.quantity;
  if (["entrada", "devolucion"].includes(data.movement_type)) return data.quantity;
  return -data.quantity;
}

async function selectMovementRows(params: {
  medicine_id?: string
  movement_type?: string
  from?: string
  to?: string
  search?: string
  storeId?: string
  page?: number
  limit?: number
}) {
  const conditions = [];
  if (params.storeId) conditions.push(eq(inventoryMovement.storeId, params.storeId));
  if (params.medicine_id) conditions.push(eq(inventoryMovement.medicineId, params.medicine_id));
  if (params.movement_type) conditions.push(eq(inventoryMovement.movementType, params.movement_type));
  if (params.from) conditions.push(gte(inventoryMovement.createdAt, new Date(params.from)));
  if (params.to) conditions.push(lte(inventoryMovement.createdAt, new Date(params.to)));
  if (params.search) {
    conditions.push(
      or(
        ilike(medicine.commercialName, `%${params.search}%`),
        ilike(medicine.genericName, `%${params.search}%`),
        ilike(inventoryMovement.note, `%${params.search}%`),
      )!,
    );
  }

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const rows = await db
    .select(richSelect)
    .from(inventoryMovement)
    .leftJoin(medicine, eq(inventoryMovement.medicineId, medicine.id))
    .leftJoin(users, eq(inventoryMovement.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(inventoryMovement.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const [totalRows] = await db
    .select({ total: count() })
    .from(inventoryMovement)
    .leftJoin(medicine, eq(inventoryMovement.medicineId, medicine.id))
    .where(and(...conditions));

  return { rows, total: totalRows?.total ?? 0, page, limit };
}

export const InventoryRepository: IInventoryRepository = {
  async create(data, userId, storeId) {
    const movementId = await db.transaction(async (tx) => {
      const [medicineRow] = await tx
        .select()
        .from(medicine)
        .where(and(eq(medicine.id, data.medicine_id), eq(medicine.storeId, storeId)))
        .limit(1);
      if (!medicineRow) throw new NotFoundError("Medicine not found");

      let batchRow: typeof batch.$inferSelect | undefined;
      if (data.batch_id) {
        const [foundBatch] = await tx
          .select()
          .from(batch)
          .where(and(eq(batch.id, data.batch_id), eq(batch.storeId, storeId), eq(batch.medicineId, data.medicine_id)))
          .limit(1);
        if (!foundBatch) throw new NotFoundError("Batch not found");
        batchRow = foundBatch;
      }

      const delta = movementDelta(data);
      if (medicineRow.stock + delta < 0) throw new BadRequestError("Insufficient stock");
      if (batchRow && batchRow.quantity + delta < 0) throw new BadRequestError("Insufficient batch stock");

      const updatedMedicine = await tx
        .update(medicine)
        .set({ stock: sql`${medicine.stock} + ${delta}` })
        .where(and(
          eq(medicine.id, data.medicine_id),
          eq(medicine.storeId, storeId),
          ...(delta < 0 ? [gte(medicine.stock, -delta)] : []),
        ))
        .returning({ id: medicine.id });
      if (!updatedMedicine.length) throw new BadRequestError("Insufficient stock or concurrent stock change");

      if (batchRow) {
        const updatedBatch = await tx
          .update(batch)
          .set({ quantity: sql`${batch.quantity} + ${delta}` })
          .where(and(
            eq(batch.id, data.batch_id!),
            eq(batch.storeId, storeId),
            ...(delta < 0 ? [gte(batch.quantity, -delta)] : []),
          ))
          .returning({ id: batch.id });
        if (!updatedBatch.length) throw new BadRequestError("Insufficient batch stock or concurrent batch change");
      }

      const [created] = await tx
        .insert(inventoryMovement)
        .values({
          id: randomUUID(),
          medicineId: data.medicine_id,
          movementType: data.movement_type,
          quantity: data.quantity,
          note: data.note ?? null,
          batchId: data.batch_id ?? null,
          userId,
          storeId,
        })
        .returning({ id: inventoryMovement.id });

      return created.id;
    });

    const [row] = await db
      .select(richSelect)
      .from(inventoryMovement)
      .leftJoin(medicine, eq(inventoryMovement.medicineId, medicine.id))
      .leftJoin(users, eq(inventoryMovement.userId, users.id))
      .where(and(eq(inventoryMovement.id, movementId), eq(inventoryMovement.storeId, storeId)))
      .limit(1);
    if (!row) throw new NotFoundError("Inventory movement not found");
    return mapRowToEntity({ ...row.movement, medicine: row.medicine, user: row.user });
  },

  async findByProductId(medicineId, params) {
    const result = await selectMovementRows({ medicine_id: medicineId, storeId: params?.storeId, page: 1, limit: params?.limit ?? 100 });
    return result.rows.map((row) => mapRowToEntity({ ...row.movement, medicine: row.medicine, user: row.user }));
  },

  async findAll(params) {
    const result = await selectMovementRows(params ?? {});
    return {
      movements: result.rows.map((row) => mapRowToEntity({ ...row.movement, medicine: row.medicine, user: row.user })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  },

  async findLowStock(storeId): Promise<IProductStockResponse[]> {
    const rows = await db
      .select({
        id: medicine.id,
        name: medicine.commercialName,
        stock: medicine.stock,
        threshold: medicine.lowStockThreshold,
      })
      .from(medicine)
      .where(and(eq(medicine.storeId, storeId), lte(medicine.stock, medicine.lowStockThreshold), sql`${medicine.deletedAt} is null`))
      .orderBy(asc(medicine.stock), asc(medicine.commercialName));

    return rows.map((row) => ({
      medicine_id: row.id,
      medicine_name: row.name,
      stock: row.stock,
      low_stock_threshold: row.threshold,
      is_low_stock: row.stock <= row.threshold,
    }));
  },
};
