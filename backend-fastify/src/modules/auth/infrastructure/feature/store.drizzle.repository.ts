import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { IStoreRepository } from "../../domain/auth.interface";
import { IStoreResponse } from "../../domain/auth.types";
import { CreateStoreData } from "../../domain/auth.entities";
import { NotFoundError } from "@/core/errors/AppError";
import { db } from "@/index";
import { store } from "@/db/schema";
import { mapStoreToResponse } from "../../application/common/auth.mappers";

export const StoreRepository: IStoreRepository = {
  async getStoreInfo(storeId: string): Promise<IStoreResponse> {
    const [result] = await db
      .select()
      .from(store)
      .where(eq(store.id, storeId));

    if (!result) throw new NotFoundError("Store not found");

    return mapStoreToResponse(result);
  },

  async findByName(name: string): Promise<IStoreResponse | null> {
    const [result] = await db
      .select()
      .from(store)
      .where(eq(store.name, name))
      .limit(1);

    if (!result) return null;

    return mapStoreToResponse(result);
  },

  async create(data: CreateStoreData): Promise<IStoreResponse> {
    const [result] = await db
      .insert(store)
      .values({
        id: randomUUID(),
        name: data.name,
        address: data.address,
        phone: data.phone,
        createdAt: new Date(),
      })
      .returning();

    return mapStoreToResponse(result);
  },
};
