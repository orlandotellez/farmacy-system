import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { clientsController } from "./clients.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const clientsRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  const preHandler = [authGuard, storeGuard]

  fastify.get(
    "/",
    { preHandler },
    clientsController.list
  )

  fastify.get(
    "/:id/history",
    { preHandler },
    clientsController.getHistory
  )

  fastify.get(
    "/:id",
    { preHandler },
    clientsController.getById
  )

  fastify.post(
    "/",
    { preHandler },
    clientsController.create
  )

  fastify.put(
    "/:id",
    { preHandler },
    clientsController.update
  )

  fastify.delete(
    "/:id",
    { preHandler },
    clientsController.delete
  )
}
