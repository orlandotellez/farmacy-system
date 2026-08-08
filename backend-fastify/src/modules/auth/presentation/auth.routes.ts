import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { authController } from "./auth.controller"

export const authRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  // PUBLIC ROUTES
  fastify.post("/register-store", authController.registerStore)

}
