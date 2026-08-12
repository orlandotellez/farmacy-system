import type { FastifyReply, FastifyRequest } from "fastify"
import { createInvoiceService } from "../application/invoices.service"
import { InvoiceRepository } from "../infrastructure/invoices.drizzle.repository"
import { CancelInvoiceDtoSchema, CreateInvoiceDtoSchema, InvoiceQuerySchema } from "./invoices.dto"

const service = createInvoiceService(InvoiceRepository)

export const invoicesController = {
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = InvoiceQuerySchema.parse(request.query)
    return reply.send(await service.list({ ...query, storeId: request.storeId! }))
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.send(await service.getById(id, request.storeId!))
  },

  create: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = CreateInvoiceDtoSchema.parse(request.body)
    return reply.status(201).send(await service.create({ ...data, user_id: request.userId! }, request.storeId!))
  },

  cancel: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const { reason } = CancelInvoiceDtoSchema.parse(request.body)
    return reply.send(await service.cancel(id, reason, request.userId!, request.storeId!))
  },
}
