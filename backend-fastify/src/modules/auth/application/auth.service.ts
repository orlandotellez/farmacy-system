import { ConflictError, UnauthorizedError } from "@/core/errors/AppError";
import { comparePassword, hashPassword } from "./common/auth.crypto";
import { generateTokens } from "./common/auth.token";
import { IAuthRepository } from "../domain/auth.interface";
import { IAuthResponse, ILoginPayload, IRegisterStorePayload, IRegisterStoreResponse, Role } from "../domain/auth.types";
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
    const { accessToken, refreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: store.id,
      storeName: store.name,
    });

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

  login: async (data: ILoginPayload): Promise<IAuthResponse> => {
    const account = await repository.account.findCredentialsAccountByEmail(data.email)
    if (!account) throw new UnauthorizedError("Invalid credentials")

    if (!account.password) throw new UnauthorizedError("Invalid credentials")

    const isValidPassword = await comparePassword(data.password, account.password)
    if (!isValidPassword) throw new UnauthorizedError("Invalid credentials")

    const user = await repository.user.findById(account.user_id!)
    if (!user) throw new UnauthorizedError("User not found")

    if (user.deleted_at) throw new UnauthorizedError("Account has been deactivated")

    const store = await repository.store.getStoreInfo(user.store_id)

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      storeId: store.id,
      storeName: store.name
    })

    await repository.session.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + SESSION_EXPIRY)
    })

    return {
      message: "Token refreshed successfully",
      user: mapUserToResponse(user),
      store,
      accessToken,
      refreshToken: newRefreshToken
    }
  }
});
















