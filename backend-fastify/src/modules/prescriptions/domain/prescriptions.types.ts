export type PrescriptionStatus = "pendiente" | "validada" | "expirada" | "anulada"

export interface IPrescriptionItemResponse {
  id: string
  medicine_id: string
  medicine_name: string
  quantity: number
  authorized_quantity: number
  authorized_by?: string | null
}

export interface IPrescriptionResponse {
  id: string
  number: string
  doctor_name?: string | null
  medical_center?: string | null
  issue_date?: string | null
  expiry_date?: string | null
  image?: string | null
  notes?: string | null
  status: PrescriptionStatus
  validated_by?: string | null
  validated_at?: string | null
  client_id?: string | null
  client_name?: string | null
  items: IPrescriptionItemResponse[]
  created_at: string
  updated_at: string
}

export interface IPrescriptionListResponse {
  data: IPrescriptionResponse[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

export interface IAuthorizedItem {
  medicine_id: string
  quantity: number
}
