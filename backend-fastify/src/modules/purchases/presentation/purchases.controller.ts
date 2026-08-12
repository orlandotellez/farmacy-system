import type { FastifyReply, FastifyRequest } from "fastify"
import { createPurchaseService } from "../application/purchases.service"
import { PurchaseRepository } from "../infrastructure/purchases.drizzle.repository"
import { CreatePurchaseDtoSchema, PurchaseQuerySchema, ReceivePurchaseDtoSchema, UpdatePurchaseDtoSchema } from "./purchases.dto"

const service = createPurchaseService(PurchaseRepository)

export const purchasesController = {
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = PurchaseQuerySchema.parse(request.query)
    const result = await service.list({ ...query, storeId: request.storeId! })
    return reply.send(result)
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const result = await service.getById(id, request.storeId!)
    return reply.send(result)
  },

  create: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = CreatePurchaseDtoSchema.parse(request.body)
    const result = await service.create(data, request.storeId!, request.userId!)
    return reply.status(201).send(result)
  },

  update: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const data = UpdatePurchaseDtoSchema.parse(request.body)
    const result = await service.update(id, data, request.storeId!)
    return reply.send(result)
  },

  approve: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const result = await service.approve(id, request.storeId!, request.userId!)
    return reply.send(result)
  },

  receive: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const data = ReceivePurchaseDtoSchema.parse(request.body)
    const result = await service.receive(id, request.storeId!, request.userId!, data.batches)
    return reply.send(result)
  },

  cancel: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    await service.cancel(id, request.storeId!)
    return reply.send({ message: "Purchase cancelled successfully" })
  },
}
