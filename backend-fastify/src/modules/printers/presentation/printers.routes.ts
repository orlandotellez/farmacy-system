import type { FastifyInstance, FastifyPluginOptions } from "fastify"
import { printersController } from "./printers.controller"
import { authGuard, storeGuard } from "@/modules/auth/application/common/auth.guard"

export const printersRoutes = async (fastify: FastifyInstance, _opts: FastifyPluginOptions) => {
  const preHandler = [authGuard, storeGuard]

  fastify.get("/", { preHandler }, printersController.list)
  fastify.post("/", { preHandler }, printersController.create)
  fastify.post("/:id/test", { preHandler }, printersController.testPrint)
  fastify.post("/:id/probe", { preHandler }, printersController.probePrint)
  fastify.post("/send-tcp", { preHandler }, printersController.sendTcp)
  fastify.post("/:id/print-receipt", { preHandler }, printersController.printReceipt)
  fastify.post("/:id/set-default", { preHandler }, printersController.setAsDefault)
  fastify.get("/:id", { preHandler }, printersController.getById)
  fastify.patch("/:id", { preHandler }, printersController.update)
  fastify.delete("/:id", { preHandler }, printersController.delete)
}
