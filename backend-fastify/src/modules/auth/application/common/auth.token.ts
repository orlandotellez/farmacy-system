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

export const generateTokens = ({ userId, email, role, storeId, storeName }: TokenPayload) => {
  const accessTokenOptions: SignOptions = {
    expiresIn: 900  // 15 minutos en segundos
  }

  const refreshTokenOptions: SignOptions = {
    expiresIn: 604000  // 7 días en segundos
  }

  const tokenPayload: TokenPayload = {
    userId,
    email,
    role,
    storeId,
    storeName
  }

  const accessToken = jwt.sign(
    tokenPayload,
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
