import type { FastifyReply, FastifyRequest } from "fastify"
import { createMedicineService } from "../application/medicines.service"
import { MedicineRepository } from "../infrastructure/medicines.drizzle.repository"
import type { CreateMedicineData, UpdateMedicineData } from "../domain/medicines.entities"
import { CreateMedicineDtoSchema, MedicineQuerySchema, UpdateMedicineDtoSchema } from "./medicines.dto"

const medicineService = createMedicineService(MedicineRepository)

export const medicinesController = {
  list: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = MedicineQuerySchema.parse(request.query)
    const result = await medicineService.list({
      ...query,
      lowStock: query.low_stock,
      outOfStock: query.out_of_stock,
      storeId: request.storeId,
    })
    return reply.status(200).send(result)
  },

  getById: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    return reply.status(200).send(await medicineService.getById(id, request.storeId))
  },

  getByBarcode: async (request: FastifyRequest, reply: FastifyReply) => {
    const { barcode } = request.params as { barcode: string }
    const result = await medicineService.getByBarcode(barcode, request.storeId)
    if (!result) return reply.status(404).send({ message: "Medicine not found" })
    return reply.status(200).send(result)
  },

  create: async (request: FastifyRequest, reply: FastifyReply) => {
    const data = CreateMedicineDtoSchema.parse(request.body) as CreateMedicineData
    return reply.status(201).send(await medicineService.create(data, request.storeId))
  },

  update: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const data = UpdateMedicineDtoSchema.parse(request.body) as UpdateMedicineData
    return reply.status(200).send(await medicineService.update(id, data, request.storeId))
  },

  delete: async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    await medicineService.delete(id, request.storeId)
    return reply.status(200).send({ message: "Medicine deleted successfully" })
  },
}
