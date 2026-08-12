import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { reportsController } from "./reports.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const reportsRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  const preHandler = [authGuard, storeGuard]

  fastify.get("/dashboard", { preHandler }, reportsController.dashboard)
  fastify.get("/financial", { preHandler }, reportsController.financial)
}
