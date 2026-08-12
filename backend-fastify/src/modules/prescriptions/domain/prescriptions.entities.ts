import { PrescriptionStatus } from "./prescriptions.types"

export interface IPrescriptionEntity {
  id: string
  number: string
  doctor_name?: string | null
  medical_center?: string | null
  issue_date?: Date | null
  expiry_date?: Date | null
  image?: string | null
  notes?: string | null
  status: PrescriptionStatus
  validated_by?: string | null
  validated_at?: Date | null
  client_id?: string | null
  store_id: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
}

export interface IPrescriptionItemEntity {
  id: string
  prescription_id: string
  medicine_id: string
  medicine_name: string
  quantity: number
  authorized_quantity: number
  authorized_by?: string | null
  created_at: Date
}

export interface IPrescriptionWithItemsEntity extends IPrescriptionEntity {
  items: IPrescriptionItemEntity[]
  client_name?: string | null
}

export interface IPrescriptionItemInput {
  medicine_id: string
  quantity: number
}

export type CreatePrescriptionData = {
  number: string
  doctor_name?: string
  medical_center?: string
  issue_date?: string
  expiry_date?: string
  image?: string
  notes?: string
  client_id?: string | null
  items: IPrescriptionItemInput[]
}

export type UpdatePrescriptionData = Partial<Omit<CreatePrescriptionData, "items">> & {
  items?: IPrescriptionItemInput[]
}
