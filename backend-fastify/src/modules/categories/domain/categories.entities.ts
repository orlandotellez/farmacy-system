export interface ICategoryEntity {
  id: string
  name: string
  description?: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
  medicine_count?: number
}

export type CreateCategoryData = {
  name: string
  description?: string | null
}

export type UpdateCategoryData = Partial<CreateCategoryData>
