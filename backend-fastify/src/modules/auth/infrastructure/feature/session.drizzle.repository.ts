import { randomUUID } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { session } from "@/db/schema";
import { db } from "@/index";
import { ISessionRepository } from "../../domain/auth.interface";
import { CreateSessionData, ISessionEntity } from "../../domain/auth.entities";
import { mapDrizzleSessionToEntity } from "../mappers/auth.drizzle.mappers";

export const SessionRepository: ISessionRepository = {
  async create(data: CreateSessionData): Promise<ISessionEntity> {
    const [result] = await db
      .insert(session)
      .values({
        id: randomUUID(),
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      })
      .returning();

    return mapDrizzleSessionToEntity(result);
  },

  async findByToken(token: string): Promise<ISessionEntity | null> {
    const [result] = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (!result) return null;

    return mapDrizzleSessionToEntity(result);
  },

  async findByUserId(userId: string): Promise<ISessionEntity[]> {
    const results = await db
      .select()
      .from(session)
      .where(eq(session.userId, userId));

    return results.map(mapDrizzleSessionToEntity);
  },

  async delete(token: string): Promise<void> {
    await db.delete(session).where(eq(session.token, token));
  },

  async deleteByUserId(userId: string): Promise<void> {
    await db.delete(session).where(eq(session.userId, userId));
  },

  async deleteExpiredSessions(): Promise<number> {
    const result = await db
      .delete(session)
      .where(lt(session.expiresAt, new Date()));

    return result.rowCount ?? 0;
  },
};
