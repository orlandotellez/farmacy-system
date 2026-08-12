import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { suppliersController } from "./suppliers.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const suppliersRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  fastify.get(
    "/",
    { preHandler: [authGuard, storeGuard] },
    suppliersController.list
  )

  fastify.get(
    "/:id",
    { preHandler: [authGuard, storeGuard] },
    suppliersController.getById
  )

  fastify.post(
    "/",
    { preHandler: [authGuard, storeGuard] },
    suppliersController.create
  )

  fastify.put(
    "/:id",
    { preHandler: [authGuard, storeGuard] },
    suppliersController.update
  )

  fastify.delete(
    "/:id",
    { preHandler: [authGuard, storeGuard] },
    suppliersController.delete
  )
}
