import { randomUUID } from "node:crypto";
import { and, asc, count, eq, ilike, isNull, or } from "drizzle-orm";
import { client } from "@/db/schema";
import { db } from "@/index";
import { IClientRepository } from "../domain/clients.interface";
import { IClientEntity, CreateClientData, UpdateClientData } from "../domain/clients.entities";
import { NotFoundError } from "@/core/errors/AppError";

function mapRowToEntity(row: typeof client.$inferSelect): IClientEntity {
  return {
    id: row.id,
    full_name: row.fullName,
    document_type: row.documentType,
    document_number: row.documentNumber ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    address: row.address ?? null,
    birth_date: row.birthDate ?? null,
    sex: row.sex ?? null,
    allergies: row.allergies ?? null,
    chronic_diseases: row.chronicDiseases ?? null,
    observations: row.observations ?? null,
    is_frequent: row.isFrequent,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    deleted_at: row.deletedAt ?? null,
  };
}

function dateValue(value?: string | null): Date | null {
  return value ? new Date(value) : null;
}

export const ClientRepository: IClientRepository = {
  async findAll(params) {
    const conditions = [isNull(client.deletedAt)];
    if (params?.storeId) conditions.push(eq(client.storeId, params.storeId));
    if (params?.is_frequent !== undefined) conditions.push(eq(client.isFrequent, params.is_frequent));
    if (params?.search) {
      conditions.push(
        or(
          ilike(client.fullName, `%${params.search}%`),
          ilike(client.documentNumber, `%${params.search}%`),
          ilike(client.phone, `%${params.search}%`),
          ilike(client.email, `%${params.search}%`),
        )!,
      );
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(client)
        .where(and(...conditions))
        .orderBy(asc(client.fullName))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: count() })
        .from(client)
        .where(and(...conditions)),
    ]);

    return {
      clients: rows.map(mapRowToEntity),
      total: totalRows[0]?.total ?? 0,
      page,
      limit,
    };
  },

  async findById(id: string, storeId?: string): Promise<IClientEntity | null> {
    const conditions = [eq(client.id, id), isNull(client.deletedAt)];
    if (storeId) conditions.push(eq(client.storeId, storeId));

    const [result] = await db
      .select()
      .from(client)
      .where(and(...conditions))
      .limit(1);

    if (!result) return null;

    return mapRowToEntity(result);
  },

  async create(data: CreateClientData, storeId: string): Promise<IClientEntity> {
    const [result] = await db
      .insert(client)
      .values({
        id: randomUUID(),
        fullName: data.full_name,
        documentType: data.document_type ?? "cedula",
        documentNumber: data.document_number ?? null,
        phone: data.phone ?? null,
        email: data.email || null,
        address: data.address ?? null,
        birthDate: dateValue(data.birth_date),
        sex: data.sex ?? null,
        allergies: data.allergies ?? null,
        chronicDiseases: data.chronic_diseases ?? null,
        observations: data.observations ?? null,
        isFrequent: data.is_frequent ?? false,
        storeId,
      })
      .returning();

    return mapRowToEntity(result);
  },

  async update(id: string, data: UpdateClientData, storeId: string): Promise<IClientEntity> {
    const conditions = [eq(client.id, id), eq(client.storeId, storeId), isNull(client.deletedAt)];

    const [result] = await db
      .update(client)
      .set({
        ...(data.full_name !== undefined && { fullName: data.full_name }),
        ...(data.document_type !== undefined && { documentType: data.document_type }),
        ...(data.document_number !== undefined && { documentNumber: data.document_number }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.birth_date !== undefined && { birthDate: dateValue(data.birth_date) }),
        ...(data.sex !== undefined && { sex: data.sex }),
        ...(data.allergies !== undefined && { allergies: data.allergies }),
        ...(data.chronic_diseases !== undefined && { chronicDiseases: data.chronic_diseases }),
        ...(data.observations !== undefined && { observations: data.observations }),
        ...(data.is_frequent !== undefined && { isFrequent: data.is_frequent }),
      })
      .where(and(...conditions))
      .returning();

    if (!result) throw new NotFoundError("Client not found");

    return mapRowToEntity(result);
  },

  async softDelete(id: string, storeId: string): Promise<void> {
    await db
      .update(client)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(client.id, id),
          eq(client.storeId, storeId),
          isNull(client.deletedAt),
        ),
      );
  },
};
