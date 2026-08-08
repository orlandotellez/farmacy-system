import jwt from "jsonwebtoken"
import type { SignOptions } from "jsonwebtoken"
import { env } from "@/config/env"
import type { Role } from "../../domain/auth.types"

interface TokenPayload {
  userId: string
  email: string
  role: Role
  storeId: string
  storeName: string
}

export const generateTokens = (userId: string, email: string, role: Role, storeId: string, storeName: string) => {
  const accessTokenOptions: SignOptions = {
    expiresIn: 900  // 15 minutos en segundos
  }

  const refreshTokenOptions: SignOptions = {
    expiresIn: 604000  // 7 días en segundos
  }

  const accessToken = jwt.sign(
    { userId, email, role, storeId, storeName } as TokenPayload,
    env.JWT_SECRET,
    accessTokenOptions
  )

  const refreshToken = jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    refreshTokenOptions
  )

  return { accessToken, refreshToken }
}

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret)
}
