import type { FastifyReply, FastifyRequest } from "fastify"
import { createSaleService } from "../application/sales.service"
import { SaleRepository } from "../infrastructure/sales.drizzle.repository"
import { CancelSaleDtoSchema, CreateSaleDtoSchema, ReportQuerySchema, RevenueTrendQuerySchema, SaleQuerySchema } from "./sales.dto"

const service = createSaleService(SaleRepository)

export const salesController = {
  create: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = CreateSaleDtoSchema.parse(request.body)
    return reply.status(201).send(await service.create({ ...data, user_id: request.userId! }, request.storeId!))
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.send(await service.getById(id, request.storeId!))
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = SaleQuerySchema.parse(request.query)
    return reply.send(await service.list({ ...query, storeId: request.storeId! }))
  },

  cancel: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const { reason } = CancelSaleDtoSchema.parse(request.body)
    return reply.send(await service.cancel(id, reason, request.userId!, request.storeId!))
  },

  report: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = ReportQuerySchema.parse(request.query)
    return reply.send(await service.getReport({ ...query, storeId: request.storeId! }))
  },

  revenueTrend: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = RevenueTrendQuerySchema.parse(request.query)
    return reply.send(await service.getRevenueTrend({ ...query, store_id: request.storeId! }))
  },
}
