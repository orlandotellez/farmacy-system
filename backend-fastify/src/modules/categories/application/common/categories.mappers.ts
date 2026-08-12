import { ICategoryResponse } from "../../domain/categories.types";

interface RichCategory {
  id: string
  name: string
  description?: string | null
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
  medicine_count?: number
}

export function mapCategoryToResponse(category: RichCategory): ICategoryResponse {
  return {
    id: category.id,
    name: category.name,
    description: category.description || undefined,
    medicine_count: category.medicine_count,
    created_at: category.created_at instanceof Date ? category.created_at.toISOString() : category.created_at,
    updated_at: category.updated_at instanceof Date ? category.updated_at.toISOString() : category.updated_at,
  }
}

