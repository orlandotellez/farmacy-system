import { BadRequestError, NotFoundError } from "@/core/errors/AppError"
import type { IClientRepository } from "../domain/clients.interface"
import type { CreateClientData, IClientEntity, UpdateClientData } from "../domain/clients.entities"
import type { IClientHistoryResponse, IClientListResponse, IClientResponse, IClientSaleSummary } from "../domain/clients.types"
import { mapClient } from "./common/clients.mappers"

async function findOrThrow(repository: IClientRepository, id: string, storeId: string): Promise<IClientEntity> {
  const client = await repository.findById(id, storeId)
  if (!client) throw new NotFoundError("Client not found")
  return client
}

export const createClientService = (repository: IClientRepository) => ({
  list: async (params?: Parameters<IClientRepository["findAll"]>[0]): Promise<IClientListResponse> => {
    const result = await repository.findAll(params)
    return { data: result.clients.map(mapClient), meta: { page: result.page, limit: result.limit, total: result.total, totalPages: Math.max(1, Math.ceil(result.total / result.limit)) } }
  },

  getById: async (id: string, storeId: string): Promise<IClientResponse> => {
    return mapClient(await findOrThrow(repository, id, storeId))
  },

  create: async (data: CreateClientData, storeId: string): Promise<IClientResponse> => {
    if (!data.full_name?.trim()) throw new BadRequestError("Full name is required")
    return mapClient(await repository.create(data, storeId))
  },

  update: async (id: string, data: UpdateClientData, storeId: string): Promise<IClientResponse> => {
    await findOrThrow(repository, id, storeId)
    return mapClient(await repository.update(id, data, storeId))
  },

  delete: async (id: string, storeId: string): Promise<void> => {
    await findOrThrow(repository, id, storeId)
    await repository.softDelete(id, storeId)
  },

  getHistory: async (id: string, storeId: string): Promise<IClientHistoryResponse> => {
    const client = mapClient(await findOrThrow(repository, id, storeId))

    // El repositorio ya filtra status='completada' para ventas y deletedAt IS NULL
    // para recetas; el servicio solo agrega sobre filas ya filtradas.
    const [sales, prescriptions, frequent_products] = await Promise.all([
      repository.findSalesByClient(id, storeId),
      repository.findPrescriptionsByClient(id, storeId),
      repository.findFrequentProductsByClient(id, storeId),
    ])

    const saleSummaries: IClientSaleSummary[] = sales.map((sale) => ({
      id: sale.id,
      total: Number(sale.total),
      created_at: sale.created_at,
    }))

    return {
      client,
      sales: saleSummaries,
      prescriptions,
      total_spent: sales.reduce((sum, sale) => sum + Number(sale.total), 0),
      visit_count: sales.length,
      frequent_products,
    }
  },
})
