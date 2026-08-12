import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { inventoryController } from "./inventory.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const inventoryRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  const preHandler = [authGuard, storeGuard]

  fastify.get("/low-stock", { preHandler }, inventoryController.lowStock)
  fastify.get("/product/:medicineId", { preHandler }, inventoryController.getByProduct)
  fastify.get("/", { preHandler }, inventoryController.list)
  fastify.post("/", { preHandler }, inventoryController.createMovement)
}
