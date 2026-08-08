import { ConflictError } from "@/core/errors/AppError";
import { hashPassword } from "./common/auth.crypto";
import { generateTokens } from "./common/auth.token";
import { IAuthRepository } from "../domain/auth.interface";
import { IRegisterStorePayload, IRegisterStoreResponse } from "../domain/auth.types";
import { mapUserToResponse } from "./common/auth.mappers";

const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export const createAuthService = (repository: IAuthRepository) => ({
  registerStore: async (
    data: IRegisterStorePayload,
  ): Promise<IRegisterStoreResponse> => {
    const { storeName, storeAddress, storePhone, adminName, adminEmail, adminPassword } = data;

    const existingStore = await repository.store.findByName(storeName);
    if (existingStore) {
      throw new ConflictError("A store with this name already exists");
    }

    const existingUser = await repository.user.findByEmail(adminEmail);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await hashPassword(adminPassword);

    // 1. Create store
    const store = await repository.store.create({
      name: storeName,
      address: storeAddress,
      phone: storePhone,
    });

    // 2. Create admin user
    const user = await repository.user.create({
      name: adminName,
      email: adminEmail,
      role: "admin",
      email_verified: true,
      store_id: store.id,
    });

    // 3. Create credentials account with hashed password
    await repository.account.create({
      account_id: user.id,
      provider_id: "credentials",
      user_id: user.id,
      password: hashedPassword,
    });

    // 4. Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.email,
      user.role,
      store.id,
      store.name,
    );

    // 5. Persist refresh session
    await repository.session.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY),
    });

    return {
      message: "Store created successfully",
      user: mapUserToResponse(user),
      store,
      accessToken,
      refreshToken,
    };
  },
});
