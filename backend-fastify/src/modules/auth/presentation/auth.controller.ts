import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { createAuthService } from "../application/auth.service"
import { RegisterStoreDtoSchema } from "./auth.dto"
import { setAuthCookies } from "./auth.http"
import { env } from "@/config/env"
import { authRepository } from "../infrastructure/auth.repository"

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

}
