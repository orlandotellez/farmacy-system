import { IUserEntity } from "../../domain/auth.entities";
import { IStoreResponse, IUserResponse, Role } from "../../domain/auth.types";

export const mapUserToResponse = (user: IUserEntity): IUserResponse => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.email_verified,
    role: user.role as Role,
    phone: user.phone,
    image: user.image,
    store_id: user.store_id,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

export const mapStoreToResponse = (store: { id: string; name: string; address?: string | null; phone?: string | null }): IStoreResponse => {
  return {
    id: store.id,
    name: store.name,
    address: store.address || undefined,
    phone: store.phone || undefined,
  }
}
