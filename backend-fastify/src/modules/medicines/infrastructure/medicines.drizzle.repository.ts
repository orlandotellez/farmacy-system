import { randomUUID } from "node:crypto";
import { and, asc, count, eq, gt, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { category, medicine, supplier, unitTypeEnum } from "@/db/schema";
import { db } from "@/index";
import { IMedicineRepository } from "../domain/medicines.interface";
import { CreateMedicineData, IMedicineEntity, UpdateMedicineData } from "../domain/medicines.entities";
import { NotFoundError } from "@/core/errors/AppError";

type MedicineRow = typeof medicine.$inferSelect;
type CategoryRow = typeof category.$inferSelect;
type SupplierRow = typeof supplier.$inferSelect;
type UnitType = (typeof unitTypeEnum)["enumValues"][number];

type RichMedicineEntity = IMedicineEntity & {
  category?: { id: string; name: string } | null
  supplier?: { id: string; name: string } | null
}

function mapRowToEntity(
  row: MedicineRow,
  categoryRow?: CategoryRow | null,
  supplierRow?: SupplierRow | null,
): RichMedicineEntity {
  return {
    id: row.id,
    barcode: row.barcode || undefined,
    internal_code: row.internalCode || undefined,
    commercial_name: row.commercialName,
    generic_name: row.genericName || undefined,
    active_ingredient: row.activeIngredient || undefined,
    concentration: row.concentration || undefined,
    presentation: row.presentation || undefined,
    pharmaceutical_form: row.pharmaceuticalForm || undefined,
    laboratory: row.laboratory || undefined,
    category_id: row.categoryId || undefined,
    supplier_id: row.supplierId || undefined,
    unit_type: row.unitType || undefined,
    unit_quantity: row.unitQuantity ?? undefined,
    purchase_price: Number(row.purchasePrice),
    sale_price: Number(row.salePrice),
    stock: row.stock,
    low_stock_threshold: row.lowStockThreshold,
    requires_prescription: row.requiresPrescription,
    is_controlled: row.isControlled,
    image: row.image || undefined,
    active: row.active,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    deleted_at: row.deletedAt ?? undefined,
    category: categoryRow ? { id: categoryRow.id, name: categoryRow.name } : null,
    supplier: supplierRow ? { id: supplierRow.id, name: supplierRow.name } : null,
  };
}

export const MedicineRepository: IMedicineRepository = {
  async findAll(params) {
    const conditions = [isNull(medicine.deletedAt)];
    if (params?.storeId) conditions.push(eq(medicine.storeId, params.storeId));
    if (params?.search) {
      conditions.push(
        or(
          ilike(medicine.commercialName, `%${params.search}%`),
          ilike(medicine.genericName, `%${params.search}%`),
          ilike(medicine.activeIngredient, `%${params.search}%`),
          ilike(medicine.barcode, `%${params.search}%`),
          ilike(medicine.internalCode, `%${params.search}%`),
        )!,
      );
    }
    if (params?.category_id) conditions.push(eq(medicine.categoryId, params.category_id));
    if (params?.supplier_id) conditions.push(eq(medicine.supplierId, params.supplier_id));
    if (params?.active !== undefined) conditions.push(eq(medicine.active, params.active));
    if (params?.requires_prescription !== undefined) conditions.push(eq(medicine.requiresPrescription, params.requires_prescription));
    if (params?.is_controlled !== undefined) conditions.push(eq(medicine.isControlled, params.is_controlled));
    if (params?.outOfStock) conditions.push(lte(medicine.stock, 0));
    if (params?.lowStock) {
      conditions.push(gt(medicine.stock, 0), lte(medicine.stock, medicine.lowStockThreshold));
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const rows = await db
      .select({
        medicine: medicine,
        category: category,
        supplier: supplier,
      })
      .from(medicine)
      .leftJoin(category, eq(medicine.categoryId, category.id))
      .leftJoin(supplier, eq(medicine.supplierId, supplier.id))
      .where(and(...conditions))
      .orderBy(asc(medicine.commercialName))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalRows] = await db
      .select({ total: count() })
      .from(medicine)
      .where(and(...conditions));

    return {
      medicines: rows.map((row) => mapRowToEntity(row.medicine, row.category, row.supplier)),
      total: totalRows?.total ?? 0,
      page,
      limit,
    };
  },

  async findById(id: string, storeId?: string): Promise<IMedicineEntity | null> {
    const conditions = [eq(medicine.id, id), isNull(medicine.deletedAt)];
    if (storeId) conditions.push(eq(medicine.storeId, storeId));

    const [row] = await db
      .select({
        medicine: medicine,
        category: category,
        supplier: supplier,
      })
      .from(medicine)
      .leftJoin(category, eq(medicine.categoryId, category.id))
      .leftJoin(supplier, eq(medicine.supplierId, supplier.id))
      .where(and(...conditions))
      .limit(1);

    if (!row) return null;

    return mapRowToEntity(row.medicine, row.category, row.supplier);
  },

  async findByBarcode(barcode: string, storeId?: string): Promise<IMedicineEntity | null> {
    const conditions = [eq(medicine.barcode, barcode), isNull(medicine.deletedAt)];
    if (storeId) conditions.push(eq(medicine.storeId, storeId));

    const [row] = await db
      .select({
        medicine: medicine,
        category: category,
        supplier: supplier,
      })
      .from(medicine)
      .leftJoin(category, eq(medicine.categoryId, category.id))
      .leftJoin(supplier, eq(medicine.supplierId, supplier.id))
      .where(and(...conditions))
      .limit(1);

    if (!row) return null;

    return mapRowToEntity(row.medicine, row.category, row.supplier);
  },

  async create(data: CreateMedicineData, storeId?: string): Promise<IMedicineEntity> {
    const [result] = await db
      .insert(medicine)
      .values({
        id: randomUUID(),
        barcode: data.barcode ?? null,
        internalCode: data.internal_code ?? null,
        commercialName: data.commercial_name,
        genericName: data.generic_name ?? null,
        activeIngredient: data.active_ingredient ?? null,
        concentration: data.concentration ?? null,
        presentation: data.presentation ?? null,
        pharmaceuticalForm: data.pharmaceutical_form ?? null,
        laboratory: data.laboratory ?? null,
        categoryId: data.category_id ?? null,
        supplierId: data.supplier_id ?? null,
        unitType: (data.unit_type as UnitType | undefined) ?? null,
        unitQuantity: data.unit_quantity ?? null,
        purchasePrice: (data.purchase_price ?? 0).toString(),
        salePrice: data.sale_price.toString(),
        stock: data.stock ?? 0,
        lowStockThreshold: data.low_stock_threshold ?? 5,
        requiresPrescription: data.requires_prescription ?? false,
        isControlled: data.is_controlled ?? false,
        image: data.image ?? null,
        active: data.active ?? true,
        storeId: storeId!,
      })
      .returning();

    return mapRowToEntity(result);
  },

  async update(id: string, data: UpdateMedicineData, storeId?: string): Promise<IMedicineEntity> {
    const conditions = [eq(medicine.id, id), isNull(medicine.deletedAt)];
    if (storeId) conditions.push(eq(medicine.storeId, storeId));

    const [result] = await db
      .update(medicine)
      .set({
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.internal_code !== undefined && { internalCode: data.internal_code }),
        ...(data.commercial_name !== undefined && { commercialName: data.commercial_name }),
        ...(data.generic_name !== undefined && { genericName: data.generic_name }),
        ...(data.active_ingredient !== undefined && { activeIngredient: data.active_ingredient }),
        ...(data.concentration !== undefined && { concentration: data.concentration }),
        ...(data.presentation !== undefined && { presentation: data.presentation }),
        ...(data.pharmaceutical_form !== undefined && { pharmaceuticalForm: data.pharmaceutical_form }),
        ...(data.laboratory !== undefined && { laboratory: data.laboratory }),
        ...(data.category_id !== undefined && { categoryId: data.category_id }),
        ...(data.supplier_id !== undefined && { supplierId: data.supplier_id }),
        ...(data.unit_type !== undefined && { unitType: (data.unit_type as UnitType | undefined) ?? null }),
        ...(data.unit_quantity !== undefined && { unitQuantity: data.unit_quantity }),
        ...(data.purchase_price !== undefined && { purchasePrice: data.purchase_price.toString() }),
        ...(data.sale_price !== undefined && { salePrice: data.sale_price.toString() }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.low_stock_threshold !== undefined && { lowStockThreshold: data.low_stock_threshold }),
        ...(data.requires_prescription !== undefined && { requiresPrescription: data.requires_prescription }),
        ...(data.is_controlled !== undefined && { isControlled: data.is_controlled }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.active !== undefined && { active: data.active }),
      })
      .where(and(...conditions))
      .returning();

    if (!result) throw new NotFoundError("Medicine not found");

    return mapRowToEntity(result);
  },

  async softDelete(id: string, storeId?: string): Promise<void> {
    const conditions = [eq(medicine.id, id), isNull(medicine.deletedAt)];
    if (storeId) conditions.push(eq(medicine.storeId, storeId));

    await db
      .update(medicine)
      .set({ deletedAt: new Date() })
      .where(and(...conditions));
  },

  async updateStock(id: string, quantity: number, storeId?: string): Promise<IMedicineEntity> {
    const conditions = [eq(medicine.id, id), isNull(medicine.deletedAt)];
    if (storeId) conditions.push(eq(medicine.storeId, storeId));

    const [result] = await db
      .update(medicine)
      .set({ stock: sql`${medicine.stock} + ${quantity}` })
      .where(and(...conditions))
      .returning();

    if (!result) throw new NotFoundError("Medicine not found");

    return mapRowToEntity(result);
  },
};
