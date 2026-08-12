export interface IClientEntity {
  id: string
  full_name: string
  document_type: string
  document_number?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  birth_date?: Date | null
  sex?: string | null
  allergies?: string | null
  chronic_diseases?: string | null
  observations?: string | null
  is_frequent: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
}

export type CreateClientData = {
  full_name: string
  document_type?: string
  document_number?: string
  phone?: string
  email?: string
  address?: string
  birth_date?: string
  sex?: string
  allergies?: string
  chronic_diseases?: string
  observations?: string
  is_frequent?: boolean
}

export type UpdateClientData = Partial<CreateClientData>
