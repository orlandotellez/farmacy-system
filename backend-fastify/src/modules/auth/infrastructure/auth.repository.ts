import { IAuthRepository } from "../domain/auth.interface";
import { UserRepository } from "./feature/user.drizzle.repository";
import { StoreRepository } from "./feature/store.drizzle.repository";
import { AccountRepository } from "./feature/account.drizzle.repository";
import { SessionRepository } from "./feature/session.drizzle.repository";
import { VerificationRepository } from "./feature/verification.drizzle.repository";

export const authRepository: IAuthRepository = {
  user: UserRepository,
  store: StoreRepository,
  account: AccountRepository,
  session: SessionRepository,
  verification: VerificationRepository,
};
