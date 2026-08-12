export interface IClientResponse {
  id: string
  full_name: string
  document_type: string
  document_number?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  birth_date?: string | null
  sex?: string | null
  allergies?: string | null
  chronic_diseases?: string | null
  observations?: string | null
  is_frequent: boolean
  created_at: string
  updated_at: string
}

export interface IClientListResponse {
  data: IClientResponse[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface IClientSaleSummary {
  id: string
  total: number
  created_at: string
}

export interface IClientPrescriptionSummary {
  id: string
  number: string
  status: string
}

export interface IFrequentProduct {
  medicine_id: string
  medicine_name: string
  quantity: number
}

export interface IClientHistoryResponse {
  client: IClientResponse
  sales: IClientSaleSummary[]
  prescriptions: IClientPrescriptionSummary[]
  total_spent: number
  visit_count: number
  frequent_products: IFrequentProduct[]
}
