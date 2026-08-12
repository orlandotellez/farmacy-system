export interface ICategoryResponse {
  id: string
  name: string
  description?: string
  medicine_count?: number
  created_at: string
  updated_at: string
}

export interface ICategoryListResponse {
  data: ICategoryResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
