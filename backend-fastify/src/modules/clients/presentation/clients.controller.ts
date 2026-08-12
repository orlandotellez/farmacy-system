import type { FastifyReply, FastifyRequest } from "fastify"
import { createClientService } from "../application/clients.service"
import { ClientRepository } from "../infrastructure/clients.drizzle.repository"
import { ClientQuerySchema, CreateClientDtoSchema, UpdateClientDtoSchema } from "./clients.dto"

const service = createClientService(ClientRepository)

export const clientsController = {
  list: async (request: FastifyRequest, reply: FastifyReply) =>
    reply.send(await service.list({ ...ClientQuerySchema.parse(request.query), storeId: request.storeId })),

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.send(await service.getById(id, request.storeId!))
  },

  getHistory: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.send(await service.getHistory(id, request.storeId!))
  },

  create: async (request: FastifyRequest, reply: FastifyReply) =>
    reply.status(201).send(await service.create(CreateClientDtoSchema.parse(request.body), request.storeId!)),

  update: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.send(await service.update(id, UpdateClientDtoSchema.parse(request.body), request.storeId!))
  },

  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    await service.delete(id, request.storeId!)
    return reply.send({ message: "Client deleted successfully" })
  },
}
