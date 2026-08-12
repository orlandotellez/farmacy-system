import { Role } from "@/modules/auth/domain/auth.types"

export interface IUserResponse {
  id: string
  name: string
  email: string
  email_verified: boolean
  role: Role
  phone?: string | null
  image?: string | null
  store_id?: string | null
  created_at: string
  updated_at: string
}

export interface IUserListResponse {
  data: IUserResponse[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
