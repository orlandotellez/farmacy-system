import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError"
import type { ICategoryRepository } from "../domain/categories.interface"
import type { ICategoryResponse, ICategoryListResponse } from "../domain/categories.types"
import type { CreateCategoryData, UpdateCategoryData } from "../domain/categories.entities"

interface RichCategory {
  id: string
  name: string
  description?: string | null
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
  medicine_count?: number
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: unknown }).code === "23505"
}

function mapCategoryToResponse(category: RichCategory): ICategoryResponse {
  return {
    id: category.id,
    name: category.name,
    description: category.description || undefined,
    medicine_count: category.medicine_count,
    created_at: category.created_at instanceof Date ? category.created_at.toISOString() : category.created_at,
    updated_at: category.updated_at instanceof Date ? category.updated_at.toISOString() : category.updated_at,
  }
}

export const createCategoryService = (repository: ICategoryRepository) => ({
  list: async (params?: { search?: string; page?: number; limit?: number; storeId?: string }): Promise<ICategoryListResponse> => {
    const result = await repository.findAll(params)
    return {
      data: result.categories.map(mapCategoryToResponse),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      },
    }
  },

  getById: async (id: string, storeId?: string): Promise<ICategoryResponse> => {
    const category = await repository.findById(id, storeId)
    if (!category || category.deleted_at) {
      throw new NotFoundError("Category not found")
    }
    return mapCategoryToResponse(category)
  },

  create: async (data: CreateCategoryData, storeId?: string): Promise<ICategoryResponse> => {
    if (!data.name || data.name.trim() === "") {
      throw new BadRequestError("Name is required")
    }

    const existing = await repository.findByName(data.name, storeId)
    if (existing) {
      throw new ConflictError("A category with this name already exists")
    }

    try {
      const category = await repository.create(data, storeId)
      return mapCategoryToResponse(category)
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("A category with this name already exists")
      throw err
    }
  },

  update: async (id: string, data: UpdateCategoryData, storeId?: string): Promise<ICategoryResponse> => {
    const existing = await repository.findById(id, storeId)
    if (!existing || existing.deleted_at) {
      throw new NotFoundError("Category not found")
    }

    if (data.name && data.name !== existing.name) {
      const duplicate = await repository.findByName(data.name, storeId)
      if (duplicate) {
        throw new ConflictError("A category with this name already exists")
      }
    }

    try {
      const category = await repository.update(id, data, storeId)
      return mapCategoryToResponse(category)
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError("A category with this name already exists")
      throw err
    }
  },

  delete: async (id: string, storeId?: string): Promise<void> => {
    const existing = await repository.findById(id, storeId)
    if (!existing || existing.deleted_at) {
      throw new NotFoundError("Category not found")
    }
    await repository.softDelete(id, storeId)
  },
})
