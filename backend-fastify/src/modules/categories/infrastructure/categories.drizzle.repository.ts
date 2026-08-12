import { randomUUID } from "node:crypto";
import { and, asc, count, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { category, medicine } from "@/db/schema";
import { db } from "@/index";
import { ICategoryRepository } from "../domain/categories.interface";
import { ICategoryEntity, CreateCategoryData, UpdateCategoryData } from "../domain/categories.entities";
import { NotFoundError } from "@/core/errors/AppError";

const medicineCount = sql<number>`(SELECT count(*)::int FROM ${medicine} WHERE ${medicine.categoryId} = ${category.id} AND ${medicine.deletedAt} IS NULL)`;

type CategoryRow = Pick<typeof category.$inferSelect, "id" | "name" | "description" | "createdAt" | "updatedAt" | "deletedAt"> & { medicine_count?: number };

function mapRowToEntity(row: CategoryRow): ICategoryEntity {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    deleted_at: row.deletedAt ?? undefined,
    medicine_count: row.medicine_count,
  };
}

export const CategoryRepository: ICategoryRepository = {
  async findAll(params) {
    const conditions = [isNull(category.deletedAt)];
    if (params?.storeId) conditions.push(eq(category.storeId, params.storeId));
    if (params?.search) {
      conditions.push(
        or(
          ilike(category.name, `%${params.search}%`),
          ilike(category.description, `%${params.search}%`),
        )!,
      );
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;

    const [rows, totalRows] = await Promise.all([
      db
        .select({
          id: category.id,
          name: category.name,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          deletedAt: category.deletedAt,
          medicine_count: medicineCount,
        })
        .from(category)
        .where(and(...conditions))
        .orderBy(asc(category.name))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: count() })
        .from(category)
        .where(and(...conditions)),
    ]);

    return {
      categories: rows.map(mapRowToEntity),
      total: totalRows[0]?.total ?? 0,
      page,
      limit,
    };
  },

  async findById(id: string, storeId?: string): Promise<ICategoryEntity | null> {
    const conditions = [eq(category.id, id), isNull(category.deletedAt)];
    if (storeId) conditions.push(eq(category.storeId, storeId));

    const [result] = await db
      .select({
        id: category.id,
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        deletedAt: category.deletedAt,
        medicine_count: medicineCount,
      })
      .from(category)
      .where(and(...conditions))
      .limit(1);

    if (!result) return null;

    return mapRowToEntity(result);
  },

  async findByName(name: string, storeId?: string): Promise<ICategoryEntity | null> {
    const conditions = [eq(category.name, name), isNull(category.deletedAt)];
    if (storeId) conditions.push(eq(category.storeId, storeId));

    const [result] = await db
      .select()
      .from(category)
      .where(and(...conditions))
      .limit(1);

    if (!result) return null;

    return mapRowToEntity(result);
  },

  async create(data: CreateCategoryData, storeId?: string): Promise<ICategoryEntity> {
    const [result] = await db
      .insert(category)
      .values({
        id: randomUUID(),
        name: data.name,
        description: data.description ?? null,
        storeId: storeId!,
      })
      .returning();

    return mapRowToEntity(result);
  },

  async update(id: string, data: UpdateCategoryData, storeId?: string): Promise<ICategoryEntity> {
    const conditions = [eq(category.id, id), isNull(category.deletedAt)];
    if (storeId) conditions.push(eq(category.storeId, storeId));

    const [result] = await db
      .update(category)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      })
      .where(and(...conditions))
      .returning();

    if (!result) throw new NotFoundError("Category not found");

    return mapRowToEntity(result);
  },

  async softDelete(id: string, storeId?: string): Promise<void> {
    const conditions = [eq(category.id, id), isNull(category.deletedAt)];
    if (storeId) conditions.push(eq(category.storeId, storeId));

    await db
      .update(category)
      .set({ deletedAt: new Date() })
      .where(and(...conditions));
  },
};
