import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { usersController } from "./users.controller"
import { adminGuard, authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const usersRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  fastify.get(
    "/",
    { preHandler: [authGuard, adminGuard, storeGuard] },
    usersController.list
  )

  fastify.get(
    "/:id",
    { preHandler: [authGuard, adminGuard, storeGuard] },
    usersController.getById
  )

  fastify.post(
    "/",
    { preHandler: [authGuard, adminGuard, storeGuard] },
    usersController.create
  )

  fastify.put(
    "/:id",
    { preHandler: [authGuard, adminGuard, storeGuard] },
    usersController.update
  )

  fastify.delete(
    "/:id",
    { preHandler: [authGuard, adminGuard, storeGuard] },
    usersController.delete
  )
}
