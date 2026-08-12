import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { medicinesController } from "./medicines.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const medicinesRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  fastify.get(
    "/",
    { preHandler: [authGuard, storeGuard] },
    medicinesController.list
  )

  fastify.get(
    "/barcode/:barcode",
    { preHandler: [authGuard, storeGuard] },
    medicinesController.getByBarcode
  )

  fastify.get(
    "/:id",
    { preHandler: [authGuard, storeGuard] },
    medicinesController.getById
  )

  fastify.post(
    "/",
    { preHandler: [authGuard, storeGuard] },
    medicinesController.create
  )

  fastify.put(
    "/:id",
    { preHandler: [authGuard, storeGuard] },
    medicinesController.update
  )

  fastify.delete(
    "/:id",
    { preHandler: [authGuard, storeGuard] },
    medicinesController.delete
  )
}
