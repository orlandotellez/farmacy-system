import { randomUUID } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";
import { users } from "@/db/schema";
import { IUserRepository } from "../../domain/auth.interface";
import { IUserEntity, CreateUserData, UpdateUserData } from "../../domain/auth.entities";
import { db } from "@/index";
import { mapDrizzleUserToEntity } from "../mappers/auth.drizzle.mappers";

export const UserRepository: IUserRepository = {
  async findByEmail(email: string, storeId?: string): Promise<IUserEntity | null> {
    const conditions = [
      eq(users.email, email),
      isNull(users.deletedAt),
    ];

    if (storeId) {
      conditions.push(eq(users.storeId, storeId));
    }

    const [result] = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .limit(1);

    if (!result) return null;

    return mapDrizzleUserToEntity(result);
  },

  async findById(id: string): Promise<IUserEntity | null> {
    const conditions = [
      eq(users.id, id),
      isNull(users.deletedAt)
    ]

    const [result] = await db
      .select()
      .from(users)
      .where(
        and(...conditions),
      )
      .limit(1);

    if (!result) return null;

    return mapDrizzleUserToEntity(result);
  },

  async create(data: CreateUserData): Promise<IUserEntity> {
    const [result] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        image: data.image,
        role: data.role ?? "cajero",
        emailVerified: data.email_verified ?? false,
        storeId: data.store_id,
      })
      .returning();

    return mapDrizzleUserToEntity(result);
  },

  async update(
    id: string,
    data: UpdateUserData,
  ): Promise<IUserEntity> {
    const { email_verified, ...rest } = data;

    const [result] = await db
      .update(users)
      .set({
        ...rest,
        ...(email_verified !== undefined && { emailVerified: email_verified }),
      })
      .where(eq(users.id, id))
      .returning();

    return mapDrizzleUserToEntity(result);
  },

  async softDelete(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(users.id, id));
  },
};


