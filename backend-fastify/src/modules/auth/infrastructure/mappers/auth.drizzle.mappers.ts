import type { account, session, users, verificacion } from "@/db/schema"
import type {
  IAccountEntity,
  ISessionEntity,
  IUserEntity,
  IVerificationEntity,
} from "../../domain/auth.entities"

type UserRow = typeof users.$inferSelect
type AccountRow = typeof account.$inferSelect
type SessionRow = typeof session.$inferSelect
type VerificationRow = typeof verificacion.$inferSelect

export function mapDrizzleUserToEntity(user: UserRow): IUserEntity {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.emailVerified,
    phone: user.phone ?? undefined,
    image: user.image ?? undefined,
    role: user.role,
    store_id: user.storeId,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    deleted_at: user.deletedAt ?? undefined,
  }
}

export function mapDrizzleAccountToEntity(row: AccountRow): IAccountEntity {
  return {
    id: row.id,
    account_id: row.accountId,
    provider_id: row.providerId,
    user_id: row.userId ?? undefined,
    access_token: row.accessToken ?? undefined,
    refresh_token: row.refreshToken ?? undefined,
    id_token: row.idToken ?? undefined,
    access_token_expires_at: row.accessTokenExpiresAt ?? undefined,
    refresh_token_expires_at: row.refreshTokenExpiresAt ?? undefined,
    scope: row.scope ?? undefined,
    password: row.password ?? undefined,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}

export function mapDrizzleSessionToEntity(row: SessionRow): ISessionEntity {
  return {
    id: row.id,
    expires_at: row.expiresAt!,
    token: row.token,
    ip_address: row.ipAddress ?? undefined,
    user_agent: row.userAgent ?? undefined,
    user_id: row.userId,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}

export function mapDrizzleVerificationToEntity(
  row: VerificationRow,
): IVerificationEntity {
  return {
    id: row.id,
    identifier: row.identifier,
    value: row.value,
    expires_at: row.expiresAt,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  }
}
