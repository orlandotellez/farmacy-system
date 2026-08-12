import { randomUUID } from "node:crypto";
import { and, eq, lt } from "drizzle-orm";
import { verificacion } from "@/db/schema";
import { db } from "@/index";
import { IVerificationRepository } from "../../domain/auth.interface";
import { CreateVerificationData, IVerificationEntity } from "../../domain/auth.entities";
import { mapDrizzleVerificationToEntity } from "../mappers/auth.drizzle.mappers";

export const VerificationRepository: IVerificationRepository = {
  async create(data: CreateVerificationData): Promise<IVerificationEntity> {
    await db.delete(verificacion).where(eq(verificacion.identifier, data.identifier));

    const [result] = await db
      .insert(verificacion)
      .values({
        id: randomUUID(),
        identifier: data.identifier,
        value: data.value,
        expiresAt: data.expiresAt,
      })
      .returning();

    return mapDrizzleVerificationToEntity(result);
  },

  async findByIdentifier(identifier: string): Promise<IVerificationEntity | null> {
    const [result] = await db
      .select()
      .from(verificacion)
      .where(eq(verificacion.identifier, identifier))
      .limit(1);

    if (!result) return null;

    return mapDrizzleVerificationToEntity(result);
  },

  async findByIdentifierAndValue(
    identifier: string,
    value: string,
  ): Promise<IVerificationEntity | null> {
    const [result] = await db
      .select()
      .from(verificacion)
      .where(
        and(
          eq(verificacion.identifier, identifier),
          eq(verificacion.value, value),
        ),
      )
      .limit(1);

    if (!result) return null;

    return mapDrizzleVerificationToEntity(result);
  },

  async delete(id: string): Promise<void> {
    await db.delete(verificacion).where(eq(verificacion.id, id));
  },

  async deleteByIdentifier(identifier: string): Promise<void> {
    await db.delete(verificacion).where(eq(verificacion.identifier, identifier));
  },

  async deleteExpired(): Promise<number> {
    const result = await db
      .delete(verificacion)
      .where(lt(verificacion.expiresAt, new Date()));

    return result.rowCount ?? 0;
  },
};
