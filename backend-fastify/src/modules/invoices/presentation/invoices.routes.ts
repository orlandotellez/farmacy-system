import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { invoicesController } from "./invoices.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const invoicesRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  const preHandler = [authGuard, storeGuard]

  fastify.post("/:id/cancel", { preHandler }, invoicesController.cancel)
  fastify.get("/:id", { preHandler }, invoicesController.getById)
  fastify.get("/", { preHandler }, invoicesController.list)
  fastify.post("/", { preHandler }, invoicesController.create)
}
