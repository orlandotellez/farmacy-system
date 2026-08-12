export interface ISupplierResponse {
  id: string
  name: string
  company?: string
  ruc?: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  is_active: boolean
  medicine_count?: number
  created_at: string
  updated_at: string
}

export interface ISupplierListResponse {
  data: ISupplierResponse[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
