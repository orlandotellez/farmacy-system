import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { categoriesController } from "./categories.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const categoriesRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  fastify.get(
    "/",
    { preHandler: [authGuard, storeGuard] },
    categoriesController.listSimple
  )

  fastify.get(
    "/paginated",
    { preHandler: [authGuard, storeGuard] },
    categoriesController.list
  )

  fastify.get(
    "/:id",
    { preHandler: [authGuard, storeGuard] },
    categoriesController.getById
  )

  fastify.post(
    "/",
    { preHandler: [authGuard, storeGuard] },
    categoriesController.create
  )

  fastify.put(
    "/:id",
    { preHandler: [authGuard, storeGuard] },
    categoriesController.update
  )

  fastify.delete(
    "/:id",
    { preHandler: [authGuard, storeGuard] },
    categoriesController.delete
  )
}
