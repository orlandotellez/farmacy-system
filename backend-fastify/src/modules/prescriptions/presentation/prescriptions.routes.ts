import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { prescriptionsController } from "./prescriptions.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const prescriptionsRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  const preHandler = [authGuard, storeGuard]

  fastify.get(
    "/",
    { preHandler },
    prescriptionsController.list
  )

  fastify.get(
    "/:id",
    { preHandler },
    prescriptionsController.getById
  )

  fastify.post(
    "/",
    { preHandler },
    prescriptionsController.create
  )

  fastify.put(
    "/:id",
    { preHandler },
    prescriptionsController.update
  )

  fastify.post(
    "/:id/validate",
    { preHandler },
    prescriptionsController.validate
  )

  fastify.delete(
    "/:id",
    { preHandler },
    prescriptionsController.delete
  )
}
