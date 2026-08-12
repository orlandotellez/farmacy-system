import type { FastifyReply, FastifyRequest } from "fastify"
import { createBatchInventoryService } from "../application/batch-inventory.service"
import { BatchInventoryRepository } from "../infrastructure/batch-inventory.drizzle.repository"
import { CreateBatchDtoSchema, BatchQuerySchema, UpdateBatchDtoSchema } from "./batch-inventory.dto"

const service = createBatchInventoryService(BatchInventoryRepository)

export const batchInventoryController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = CreateBatchDtoSchema.parse(request.body)
    return reply.status(201).send(await service.create(data, request.userId!, request.storeId!))
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.send(await service.getById(id, request.storeId!))
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = BatchQuerySchema.parse(request.query)
    return reply.send(await service.list({ ...query, storeId: request.storeId! }))
  },

  expiring: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = BatchQuerySchema.parse(request.query)
    return reply.send(await service.list({ ...query, expiring_soon: true, expired: undefined, storeId: request.storeId! }))
  },

  expired: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = BatchQuerySchema.parse(request.query)
    return reply.send(await service.list({ ...query, expired: true, expiring_soon: undefined, storeId: request.storeId! }))
  },

  update: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const data = UpdateBatchDtoSchema.parse(request.body)
    return reply.send(await service.update(id, data, request.userId!, request.storeId!))
  },
}
