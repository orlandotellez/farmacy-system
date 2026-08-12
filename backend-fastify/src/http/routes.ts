import { authRoutes } from "@/modules/auth/presentation/auth.routes"
import { usersRoutes } from "@/modules/users/presentation/users.routes"
import { FastifyInstance, FastifyPluginOptions } from "fastify"

export const routes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  fastify.register(authRoutes, { prefix: "/auth" })
  fastify.register(usersRoutes, { prefix: "/users" })
}

