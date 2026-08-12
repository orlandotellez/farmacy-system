import type { FastifyReply, FastifyRequest } from "fastify"
import { createPrescriptionService } from "../application/prescriptions.service"
import { PrescriptionRepository } from "../infrastructure/prescriptions.drizzle.repository"
import {
  CreatePrescriptionDtoSchema,
  PrescriptionQuerySchema,
  UpdatePrescriptionDtoSchema,
  ValidatePrescriptionDtoSchema,
} from "./prescriptions.dto"

const service = createPrescriptionService(PrescriptionRepository)

export const prescriptionsController = {
  list: async (request: FastifyRequest, reply: FastifyReply) =>
    reply.send(await service.list({ ...PrescriptionQuerySchema.parse(request.query), storeId: request.storeId })),

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.send(await service.getById(id, request.storeId!))
  },

  create: async (request: FastifyRequest, reply: FastifyReply) =>
    reply.status(201).send(await service.create(CreatePrescriptionDtoSchema.parse(request.body), request.storeId!)),

  update: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.send(await service.update(id, UpdatePrescriptionDtoSchema.parse(request.body), request.storeId!))
  },

  validate: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const data = ValidatePrescriptionDtoSchema.parse(request.body)
    return reply.send(await service.validate(id, request.storeId!, request.userId!, data))
  },

  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    await service.delete(id, request.storeId!)
    return reply.send({ message: "Prescription deleted successfully" })
  },
}
