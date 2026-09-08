import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { client, prescription, sale, saleItem } from "@/db/schema";
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

  async findSalesByClient(id: string, storeId: string) {
    const rows = await db
      .select({
        id: sale.id,
        total: sale.total,
        created_at: sale.createdAt,
        payment_method: sale.paymentMethod,
      })
      .from(sale)
      .where(
        and(
          eq(sale.clientId, id),
          eq(sale.storeId, storeId),
          eq(sale.status, "completada"),
        ),
      )
      .orderBy(desc(sale.createdAt));

    return rows.map((row) => ({
      id: row.id,
      total: Number(row.total),
      created_at: row.created_at.toISOString(),
      payment_method: row.payment_method,
    }));
  },

  async findPrescriptionsByClient(id: string, storeId: string) {
    const rows = await db
      .select({
        id: prescription.id,
        number: prescription.number,
        status: prescription.status,
      })
      .from(prescription)
      .where(
        and(
          eq(prescription.clientId, id),
          eq(prescription.storeId, storeId),
          isNull(prescription.deletedAt),
        ),
      )
      .orderBy(desc(prescription.createdAt));

    return rows.map((row) => ({
      id: row.id,
      number: row.number,
      status: row.status,
    }));
  },

  async findFrequentProductsByClient(id: string, storeId: string) {
    const sales = await db
      .select({ id: sale.id })
      .from(sale)
      .where(
        and(
          eq(sale.clientId, id),
          eq(sale.storeId, storeId),
          eq(sale.status, "completada"),
        ),
      );

    if (sales.length === 0) return [];

    const totalQuantity = sql<number>`SUM(${saleItem.quantity})::int`;

    const rows = await db
      .select({
        medicine_id: saleItem.medicineId,
        medicine_name: saleItem.medicineName,
        quantity: totalQuantity,
      })
      .from(saleItem)
      .where(inArray(saleItem.saleId, sales.map((row) => row.id)))
      .groupBy(saleItem.medicineId, saleItem.medicineName)
      .orderBy(desc(totalQuantity))
      .limit(5);

    return rows.map((row) => ({
      medicine_id: row.medicine_id,
      medicine_name: row.medicine_name,
      quantity: row.quantity,
    }));
  },
};
