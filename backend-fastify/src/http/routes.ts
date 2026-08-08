import { authRoutes } from "@/modules/auth/presentation/auth.routes"
import { FastifyInstance, FastifyPluginOptions } from "fastify"

export const routes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  fastify.register(authRoutes, { prefix: "/auth" })
}

