import { randomUUID } from "node:crypto";
import { and, asc, count, eq, ilike, isNull, or } from "drizzle-orm";
import { account, users } from "@/db/schema";
import { db } from "@/index";
import { IUserRepository } from "../domain/users.interface";
import { CreateUserData, IUserEntity, UpdateUserData } from "../domain/users.entities";
import { Role } from "@/modules/auth/domain/auth.types";
import { NotFoundError } from "@/core/errors/AppError";
import { hashPassword } from "@/modules/auth/application/common/auth.crypto";

function mapRowToEntity(user: typeof users.$inferSelect): IUserEntity {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.emailVerified,
    role: user.role,
    phone: user.phone ?? null,
    image: user.image ?? null,
    store_id: user.storeId,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    deleted_at: user.deletedAt ?? null,
  };
}

export const UserRepository: IUserRepository = {
  async findAll(params) {
    const conditions = [isNull(users.deletedAt)];
    if (params?.storeId) conditions.push(eq(users.storeId, params.storeId));
    if (params?.role) conditions.push(eq(users.role, params.role as Role));
    if (params?.search) {
      conditions.push(
        or(
          ilike(users.name, `%${params.search}%`),
          ilike(users.email, `%${params.search}%`),
        )!,
      );
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(users)
        .where(and(...conditions))
        .orderBy(asc(users.name))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ total: count() })
        .from(users)
        .where(and(...conditions)),
    ]);

    const total = totalRows[0]?.total ?? 0;

    return {
      users: rows.map(mapRowToEntity),
      total,
      page,
      limit,
    };
  },

  async findById(id: string, storeId: string): Promise<IUserEntity | null> {
    const [result] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, id),
          eq(users.storeId, storeId),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    if (!result) return null;

    return mapRowToEntity(result);
  },

  async findByEmail(email: string, storeId: string): Promise<IUserEntity | null> {
    const [result] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.storeId, storeId),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    if (!result) return null;

    return mapRowToEntity(result);
  },

  async create(data: CreateUserData): Promise<IUserEntity> {
    const hashedPassword = await hashPassword(data.password);

    const [result] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        role: data.role ?? "cajero",
        emailVerified: true,
        storeId: data.store_id!,
      })
      .returning();

    await db.insert(account).values({
      id: randomUUID(),
      accountId: result.id,
      providerId: "credentials",
      userId: result.id,
      password: hashedPassword,
    });

    return mapRowToEntity(result);
  },

  async update(id: string, data: UpdateUserData, storeId: string): Promise<IUserEntity> {
    const [result] = await db
      .update(users)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.phone !== undefined && { phone: data.phone }),
      })
      .where(
        and(
          eq(users.id, id),
          eq(users.storeId, storeId),
          isNull(users.deletedAt),
        ),
      )
      .returning();

    if (!result) throw new NotFoundError("User not found");

    return mapRowToEntity(result);
  },

  async softDelete(id: string, storeId: string): Promise<void> {
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(users.id, id),
          eq(users.storeId, storeId),
          isNull(users.deletedAt),
        ),
      );
  },

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await db
      .update(account)
      .set({ password: hashedPassword })
      .where(eq(account.userId, id));
  },
};
