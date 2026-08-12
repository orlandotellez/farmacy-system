import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { salesController } from "./sales.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const salesRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  const preHandler = [authGuard, storeGuard]

  fastify.get("/report", { preHandler }, salesController.report)
  fastify.get("/revenue-trend", { preHandler }, salesController.revenueTrend)
  fastify.post("/:id/cancel", { preHandler }, salesController.cancel)
  fastify.get("/:id", { preHandler }, salesController.getById)
  fastify.get("/", { preHandler }, salesController.list)
  fastify.post("/", { preHandler }, salesController.create)
}
