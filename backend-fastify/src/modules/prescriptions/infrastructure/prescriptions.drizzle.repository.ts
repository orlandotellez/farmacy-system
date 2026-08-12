import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { client, prescription, prescriptionItem } from "@/db/schema";
import { db } from "@/index";
import { IPrescriptionRepository } from "../domain/prescriptions.interface";
import {
  CreatePrescriptionData,
  IPrescriptionItemEntity,
  IPrescriptionWithItemsEntity,
  UpdatePrescriptionData,
} from "../domain/prescriptions.entities";
import { IAuthorizedItem, PrescriptionStatus } from "../domain/prescriptions.types";
import { NotFoundError } from "@/core/errors/AppError";

function mapRowToEntity(
  row: typeof prescription.$inferSelect & { client_name?: string | null },
  items: IPrescriptionItemEntity[],
): IPrescriptionWithItemsEntity {
  return {
    id: row.id,
    number: row.number,
    doctor_name: row.doctorName ?? null,
    medical_center: row.medicalCenter ?? null,
    issue_date: row.issueDate ?? null,
    expiry_date: row.expiryDate ?? null,
    image: row.image ?? null,
    notes: row.notes ?? null,
    status: row.status as PrescriptionStatus,
    validated_by: row.validatedBy ?? null,
    validated_at: row.validatedAt ?? null,
    client_id: row.clientId ?? null,
    store_id: row.storeId,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
    deleted_at: row.deletedAt ?? null,
    client_name: row.client_name ?? null,
    items,
  };
}

function mapItemRowToEntity(row: typeof prescriptionItem.$inferSelect): IPrescriptionItemEntity {
  return {
    id: row.id,
    prescription_id: row.prescriptionId,
    medicine_id: row.medicineId,
    medicine_name: row.medicineName,
    quantity: row.quantity,
    authorized_quantity: row.authorizedQuantity,
    authorized_by: row.authorizedBy ?? null,
    created_at: row.createdAt,
  };
}

function dateValue(value?: string | null): Date | null {
  return value ? new Date(value) : null;
}

async function fetchItems(prescriptionId: string): Promise<IPrescriptionItemEntity[]> {
  const rows = await db
    .select()
    .from(prescriptionItem)
    .where(eq(prescriptionItem.prescriptionId, prescriptionId))
    .orderBy(asc(prescriptionItem.createdAt));

  return rows.map(mapItemRowToEntity);
}

async function fetchWithClient(prescriptionId: string, storeId: string): Promise<IPrescriptionWithItemsEntity | null> {
  const [row] = await db
    .select({
      prescription: prescription,
      client_name: client.fullName,
    })
    .from(prescription)
    .leftJoin(client, eq(prescription.clientId, client.id))
    .where(
      and(
        eq(prescription.id, prescriptionId),
        eq(prescription.storeId, storeId),
      ),
    )
    .limit(1);

  if (!row) return null;

  return mapRowToEntity(
    { ...row.prescription, client_name: row.client_name },
    await fetchItems(prescriptionId),
  );
}

export const PrescriptionRepository: IPrescriptionRepository = {
  async findAll(params) {
    const conditions = [eq(prescription.storeId, params?.storeId ?? ""), isNull(prescription.deletedAt)];
    if (params?.status) conditions.push(eq(prescription.status, params.status));
    if (params?.client_id) conditions.push(eq(prescription.clientId, params.client_id));
    if (params?.search) {
      conditions.push(
        or(
          ilike(prescription.number, `%${params.search}%`),
          ilike(prescription.doctorName, `%${params.search}%`),
          ilike(client.fullName, `%${params.search}%`),
        )!,
      );
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    const rows = await db
      .select({
        prescription: prescription,
        client_name: client.fullName,
      })
      .from(prescription)
      .leftJoin(client, eq(prescription.clientId, client.id))
      .where(and(...conditions))
      .orderBy(desc(prescription.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalRows] = await db
      .select({ total: count() })
      .from(prescription)
      .leftJoin(client, eq(prescription.clientId, client.id))
      .where(and(...conditions));

    const itemRows = rows.length
      ? await db
          .select()
          .from(prescriptionItem)
          .where(
            or(...rows.map((r) => eq(prescriptionItem.prescriptionId, r.prescription.id)))!,
          )
          .orderBy(asc(prescriptionItem.createdAt))
      : [];

    const itemsByPrescription = new Map<string, IPrescriptionItemEntity[]>();
    for (const item of itemRows) {
      const list = itemsByPrescription.get(item.prescriptionId) ?? [];
      list.push(mapItemRowToEntity(item));
      itemsByPrescription.set(item.prescriptionId, list);
    }

    return {
      prescriptions: rows.map((row) =>
        mapRowToEntity(
          { ...row.prescription, client_name: row.client_name },
          itemsByPrescription.get(row.prescription.id) ?? [],
        ),
      ),
      total: totalRows?.total ?? 0,
      page,
      limit,
    };
  },

  async findById(id: string, storeId?: string): Promise<IPrescriptionWithItemsEntity | null> {
    const conditions = [eq(prescription.id, id), isNull(prescription.deletedAt)];
    if (storeId) conditions.push(eq(prescription.storeId, storeId));

    const [row] = await db
      .select({
        prescription: prescription,
        client_name: client.fullName,
      })
      .from(prescription)
      .leftJoin(client, eq(prescription.clientId, client.id))
      .where(and(...conditions))
      .limit(1);

    if (!row) return null;

    return mapRowToEntity(
      { ...row.prescription, client_name: row.client_name },
      await fetchItems(row.prescription.id),
    );
  },

  async findByNumber(number: string, storeId?: string): Promise<IPrescriptionWithItemsEntity | null> {
    const conditions = [eq(prescription.number, number), isNull(prescription.deletedAt)];
    if (storeId) conditions.push(eq(prescription.storeId, storeId));

    const [row] = await db
      .select({
        prescription: prescription,
        client_name: client.fullName,
      })
      .from(prescription)
      .leftJoin(client, eq(prescription.clientId, client.id))
      .where(and(...conditions))
      .limit(1);

    if (!row) return null;

    return mapRowToEntity({ ...row.prescription, client_name: row.client_name }, []);
  },

  async create(
    data: CreatePrescriptionData,
    storeId: string,
    medicineNames: Map<string, string>,
  ): Promise<IPrescriptionWithItemsEntity> {
    const [row] = await db
      .insert(prescription)
      .values({
        id: randomUUID(),
        number: data.number,
        doctorName: data.doctor_name ?? null,
        medicalCenter: data.medical_center ?? null,
        issueDate: dateValue(data.issue_date),
        expiryDate: dateValue(data.expiry_date),
        image: data.image ?? null,
        notes: data.notes ?? null,
        status: "pendiente",
        clientId: data.client_id ?? null,
        storeId,
      })
      .returning();

    await this.replaceItems(row.id, data.items, medicineNames);

    return (await fetchWithClient(row.id, storeId))!;
  },

  async update(
    id: string,
    data: UpdatePrescriptionData,
    storeId: string,
    medicineNames?: Map<string, string>,
  ): Promise<IPrescriptionWithItemsEntity> {
    const conditions = [eq(prescription.id, id), eq(prescription.storeId, storeId), isNull(prescription.deletedAt)];

    const [row] = await db
      .update(prescription)
      .set({
        ...(data.number !== undefined && { number: data.number }),
        ...(data.doctor_name !== undefined && { doctorName: data.doctor_name }),
        ...(data.medical_center !== undefined && { medicalCenter: data.medical_center }),
        ...(data.issue_date !== undefined && { issueDate: dateValue(data.issue_date) }),
        ...(data.expiry_date !== undefined && { expiryDate: dateValue(data.expiry_date) }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.client_id !== undefined && { clientId: data.client_id }),
      })
      .where(and(...conditions))
      .returning();

    if (!row) throw new NotFoundError("Prescription not found");

    if (data.items && medicineNames) {
      await this.replaceItems(row.id, data.items, medicineNames);
    }

    return (await fetchWithClient(row.id, storeId))!;
  },

  async replaceItems(
    prescriptionId: string,
    items: CreatePrescriptionData["items"],
    medicineNames: Map<string, string>,
  ): Promise<IPrescriptionItemEntity[]> {
    await db.delete(prescriptionItem).where(eq(prescriptionItem.prescriptionId, prescriptionId));

    if (!items.length) return [];

    const rows = await db
      .insert(prescriptionItem)
      .values(
        items.map((item) => ({
          id: randomUUID(),
          prescriptionId,
          medicineId: item.medicine_id,
          medicineName: medicineNames.get(item.medicine_id) ?? "",
          quantity: item.quantity,
          authorizedQuantity: 0,
        })),
      )
      .returning();

    return rows.map(mapItemRowToEntity);
  },

  async validate(
    id: string,
    storeId: string,
    userId: string,
    authorized: IAuthorizedItem[],
  ): Promise<IPrescriptionWithItemsEntity> {
    const conditions = [eq(prescription.id, id), eq(prescription.storeId, storeId), isNull(prescription.deletedAt)];

    const [row] = await db
      .update(prescription)
      .set({
        status: "validada",
        validatedBy: userId,
        validatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning();

    if (!row) throw new NotFoundError("Prescription not found");

    for (const item of authorized) {
      await db
        .update(prescriptionItem)
        .set({
          authorizedQuantity: item.quantity,
          authorizedBy: userId,
        })
        .where(
          and(
            eq(prescriptionItem.prescriptionId, id),
            eq(prescriptionItem.medicineId, item.medicine_id),
          ),
        );
    }

    return (await fetchWithClient(id, storeId))!;
  },

  async softDelete(id: string, storeId: string): Promise<void> {
    const [row] = await db
      .update(prescription)
      .set({
        deletedAt: new Date(),
        status: "anulada",
      })
      .where(
        and(
          eq(prescription.id, id),
          eq(prescription.storeId, storeId),
          isNull(prescription.deletedAt),
        ),
      )
      .returning({ id: prescription.id });

    if (!row) throw new NotFoundError("Prescription not found");
  },
};
