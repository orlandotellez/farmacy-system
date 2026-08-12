import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { batchInventoryController } from "./batch-inventory.controller"
import { BatchQuerySchema, CreateBatchDtoSchema, UpdateBatchDtoSchema } from "./batch-inventory.dto"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const batchInventoryRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  const preHandler = [authGuard, storeGuard]

  fastify.get("/", { preHandler }, batchInventoryController.list)
  fastify.get("/expiring", { preHandler }, batchInventoryController.expiring)
  fastify.get("/expired", { preHandler }, batchInventoryController.expired)
  fastify.get("/:id", { preHandler }, batchInventoryController.getById)
  fastify.post("/", { preHandler }, batchInventoryController.create)
  fastify.put("/:id", { preHandler }, batchInventoryController.update)
}
