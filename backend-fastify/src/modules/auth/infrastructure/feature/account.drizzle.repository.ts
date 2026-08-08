import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { account, users } from "@/db/schema";
import { db } from "@/index";
import { IAccountRepository } from "../../domain/auth.interface";
import { CreateAccountData, IAccountEntity } from "../../domain/auth.entities";
import { mapDrizzleAccountToEntity } from "../mappers/auth.drizzle.mappers";

const toDrizzleFields = (data: CreateAccountData) => ({
  accountId: data.account_id,
  providerId: data.provider_id,
  userId: data.user_id,
  accessToken: data.access_token,
  refreshToken: data.refresh_token,
  idToken: data.id_token,
  accessTokenExpiresAt: data.access_token_expires_at,
  refreshTokenExpiresAt: data.refresh_token_expires_at,
  scope: data.scope,
  password: data.password,
});

export const AccountRepository: IAccountRepository = {
  async findByProviderAndAccountId(
    providerId: string,
    accountId: string,
  ): Promise<IAccountEntity | null> {
    const [result] = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.providerId, providerId),
          eq(account.accountId, accountId),
        ),
      )
      .limit(1);

    if (!result) return null;

    return mapDrizzleAccountToEntity(result);
  },

  async findByUserId(userId: string): Promise<IAccountEntity[]> {
    const results = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId));

    return results.map(mapDrizzleAccountToEntity);
  },

  async findCredentialsAccountByEmail(email: string): Promise<IAccountEntity | null> {
    const [result] = await db
      .select({ account })
      .from(account)
      .innerJoin(users, eq(account.userId, users.id))
      .where(
        and(
          eq(users.email, email),
          eq(account.providerId, "credentials"),
        ),
      )
      .limit(1);

    if (!result) return null;

    return mapDrizzleAccountToEntity(result.account);
  },

  async create(data: CreateAccountData): Promise<IAccountEntity> {
    const [result] = await db
      .insert(account)
      .values({
        id: randomUUID(),
        ...toDrizzleFields(data),
      })
      .returning();

    return mapDrizzleAccountToEntity(result);
  },

  async update(
    id: string,
    data: Partial<CreateAccountData>,
  ): Promise<IAccountEntity> {
    const [result] = await db
      .update(account)
      .set(toDrizzleFields(data as CreateAccountData))
      .where(eq(account.id, id))
      .returning();

    return mapDrizzleAccountToEntity(result);
  },

  async delete(id: string): Promise<void> {
    await db.delete(account).where(eq(account.id, id));
  },

  async deleteByUserId(userId: string): Promise<void> {
    await db.delete(account).where(eq(account.userId, userId));
  },
};
