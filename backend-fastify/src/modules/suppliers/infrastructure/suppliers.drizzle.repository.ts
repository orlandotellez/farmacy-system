import { randomUUID } from "node:crypto";
import { and, asc, count, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { medicine, supplier } from "@/db/schema";
import { db } from "@/index";
import { ISupplierRepository } from "../domain/suppliers.interface";
import { ISupplierEntity, CreateSupplierData, UpdateSupplierData } from "../domain/suppliers.entities";
import { NotFoundError } from "@/core/errors/AppError";

const medicineCount = sql<number>`(SELECT count(*)::int FROM ${medicine} WHERE ${medicine.supplierId} = ${supplier.id} AND ${medicine.deletedAt} IS NULL)`;

type SupplierRow = Pick<typeof supplier.$inferSelect, "id" | "name" | "company" | "ruc" | "contactName" | "email" | "phone" | "address" | "notes" | "isActive" | "createdAt" | "updatedAt" | "deletedAt"> & { medicine_count?: number };

function mapRowToEntity(row: SupplierRow): ISupplierEntity {
  return {
    id: row.id,
    name: row.name,
    company: row.company ?? null,
    ruc: row.ruc ?? null,
    contact_name: row.contactName ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    address: row.address ?? null,
    notes: row.notes ?? null,
    is_active: row.isActive,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    deleted_at: row.deletedAt ?? null,
    medicine_count: row.medicine_count,
  };
}

export const SupplierRepository: ISupplierRepository = {
  async findAll(params) {
    const conditions = [isNull(supplier.deletedAt)];
    if (params?.storeId) conditions.push(eq(supplier.storeId, params.storeId));
    if (params?.is_active !== undefined) conditions.push(eq(supplier.isActive, params.is_active));
    if (params?.search) {
      conditions.push(
        or(
          ilike(supplier.name, `%${params.search}%`),
          ilike(supplier.company, `%${params.search}%`),
          ilike(supplier.contactName, `%${params.search}%`),
          ilike(supplier.email, `%${params.search}%`),
        )!,
      );
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: supplier.id,
          name: supplier.name,
          company: supplier.company,
          ruc: supplier.ruc,
          contactName: supplier.contactName,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          notes: supplier.notes,
          isActive: supplier.isActive,
          createdAt: supplier.createdAt,
          updatedAt: supplier.updatedAt,
          deletedAt: supplier.deletedAt,
          medicine_count: medicineCount,
        })
        .from(supplier)
        .where(and(...conditions))
        .orderBy(asc(supplier.name))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: count() })
        .from(supplier)
        .where(and(...conditions)),
    ]);

    return {
      suppliers: rows.map(mapRowToEntity),
      total: totalRows[0]?.total ?? 0,
      page,
      limit,
    };
  },

  async findById(id: string, storeId?: string): Promise<ISupplierEntity | null> {
    const conditions = [eq(supplier.id, id), isNull(supplier.deletedAt)];
    if (storeId) conditions.push(eq(supplier.storeId, storeId));

    const [result] = await db
      .select({
        id: supplier.id,
        name: supplier.name,
        company: supplier.company,
        ruc: supplier.ruc,
        contactName: supplier.contactName,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        notes: supplier.notes,
        isActive: supplier.isActive,
        createdAt: supplier.createdAt,
        updatedAt: supplier.updatedAt,
        deletedAt: supplier.deletedAt,
        medicine_count: medicineCount,
      })
      .from(supplier)
      .where(and(...conditions))
      .limit(1);

    if (!result) return null;

    return mapRowToEntity(result);
  },

  async findByRuc(ruc: string, storeId?: string): Promise<ISupplierEntity | null> {
    const conditions = [eq(supplier.ruc, ruc), isNull(supplier.deletedAt)];
    if (storeId) conditions.push(eq(supplier.storeId, storeId));

    const [result] = await db
      .select()
      .from(supplier)
      .where(and(...conditions))
      .limit(1);

    if (!result) return null;

    return mapRowToEntity(result);
  },

  async create(data: CreateSupplierData, storeId?: string): Promise<ISupplierEntity> {
    const [result] = await db
      .insert(supplier)
      .values({
        id: randomUUID(),
        name: data.name,
        company: data.company ?? null,
        ruc: data.ruc ?? null,
        contactName: data.contact_name ?? null,
        email: data.email || null,
        phone: data.phone ?? null,
        address: data.address ?? null,
        notes: data.notes ?? null,
        isActive: data.is_active ?? true,
        storeId: storeId!,
      })
      .returning();

    return mapRowToEntity(result);
  },

  async update(id: string, data: UpdateSupplierData, storeId?: string): Promise<ISupplierEntity> {
    const conditions = [eq(supplier.id, id), isNull(supplier.deletedAt)];
    if (storeId) conditions.push(eq(supplier.storeId, storeId));

    const [result] = await db
      .update(supplier)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.company !== undefined && { company: data.company }),
        ...(data.ruc !== undefined && { ruc: data.ruc }),
        ...(data.contact_name !== undefined && { contactName: data.contact_name }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.is_active !== undefined && { isActive: data.is_active }),
      })
      .where(and(...conditions))
      .returning();

    if (!result) throw new NotFoundError("Supplier not found");

    return mapRowToEntity(result);
  },

  async softDelete(id: string, storeId?: string): Promise<void> {
    const conditions = [eq(supplier.id, id), isNull(supplier.deletedAt)];
    if (storeId) conditions.push(eq(supplier.storeId, storeId));

    await db
      .update(supplier)
      .set({ deletedAt: new Date() })
      .where(and(...conditions));
  },
};
