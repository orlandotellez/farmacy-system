import type { FastifyReply, FastifyRequest } from "fastify"
import { createAuthService } from "../application/auth.service"
import { LoginPayloadDtoSchema, RegisterStoreDtoSchema } from "./auth.dto"
import { clearAuthCookies, setAuthCookies } from "./auth.http"
import { env } from "@/config/env"
import { authRepository } from "../infrastructure/auth.repository"
import { resolveCurrentUserId } from "../application/common/auth.utils"
import { ConflictError } from "@/core/errors/AppError"

const authService = createAuthService(authRepository)


export const authController = {
  registerStore: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = RegisterStoreDtoSchema.parse(request.body)

    const result = await authService.registerStore(data)

    setAuthCookies(reply, result.accessToken, result.refreshToken, env.NODE_ENV === "production")

    return reply.status(201).send({
      message: result.message,
      user: result.user,
      store: result.store,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    })
  },

  login: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = LoginPayloadDtoSchema.parse(request.body)

    const currentUserId = await resolveCurrentUserId(request, reply)

    const result = await authService.login(data)

    if (currentUserId && currentUserId === result.user.id) {
      throw new ConflictError("Already logged in with this user. Please logout first.")
    }

    if (currentUserId && currentUserId !== result.user.id) {
      await clearAuthCookies(reply)
    }

    setAuthCookies(
      reply,
      result.accessToken,
      result.refreshToken,
      env.NODE_ENV === "production"
    )

    return reply.status(200).send({
      message: result.message,
      user: result.user,
      store: result.store,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    })

  }

}
