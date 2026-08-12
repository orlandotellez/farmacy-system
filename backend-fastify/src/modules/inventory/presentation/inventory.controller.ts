import type { FastifyReply, FastifyRequest } from "fastify"
import { createInventoryService } from "../application/inventory.service"
import { InventoryRepository } from "../infrastructure/inventory.drizzle.repository"
import { MedicineRepository } from "@/modules/medicines/infrastructure/medicines.drizzle.repository"
import { CreateMovementDtoSchema, MovementQuerySchema } from "./inventory.dto"

const service = createInventoryService(InventoryRepository, MedicineRepository)

export const inventoryController = {
  createMovement: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = CreateMovementDtoSchema.parse(request.body)
    return reply.status(201).send(await service.create(data, request.userId!, request.storeId!))
  },

  getByProduct: async (request: FastifyRequest, reply: FastifyReply) => {
    const { medicineId } = request.params as { medicineId: string }
    return reply.send(await service.getByProduct(medicineId, request.storeId!))
  },

  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = MovementQuerySchema.parse(request.query)
    return reply.send(await service.list({ ...query, storeId: request.storeId! }))
  },

  lowStock: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await service.getLowStockProducts(request.storeId!)
    return reply.send({ data, count: data.length })
  },
}
