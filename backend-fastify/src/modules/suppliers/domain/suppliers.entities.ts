export interface ISupplierEntity {
  id: string
  name: string
  company?: string | null
  ruc?: string | null
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  notes?: string | null
  is_active: boolean
  medicine_count?: number
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
}

export type CreateSupplierData = {
  name: string
  company?: string
  ruc?: string
  contact_name?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  is_active?: boolean
}

export type UpdateSupplierData = Partial<CreateSupplierData>
