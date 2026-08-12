import { IUserEntity } from "../../domain/users.entities";
import { IUserResponse } from "../../domain/users.types";

export function mapUserToResponse(user: IUserEntity): IUserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.email_verified,
    role: user.role,
    phone: user.phone ?? undefined,
    image: user.image ?? undefined,
    store_id: user.store_id ?? undefined,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  }
}
