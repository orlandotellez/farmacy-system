import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { purchasesController } from "./purchases.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const purchasesRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  const preHandler = [authGuard, storeGuard]

  fastify.get(
    "/",
    { preHandler },
    purchasesController.list
  )

  fastify.get(
    "/:id",
    { preHandler },
    purchasesController.getById
  )

  fastify.post(
    "/",
    { preHandler },
    purchasesController.create
  )

  fastify.put(
    "/:id",
    { preHandler },
    purchasesController.update
  )

  fastify.post(
    "/:id/approve",
    { preHandler },
    purchasesController.approve
  )

  fastify.post(
    "/:id/receive",
    { preHandler },
    purchasesController.receive
  )

  fastify.post(
    "/:id/cancel",
    { preHandler },
    purchasesController.cancel
  )
}
