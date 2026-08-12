export interface IPurchaseItemEntity {
  id: string
  medicine_id: string
  medicine_name: string
  quantity: number
  unit_cost: number
  line_total: number
  received: number
}

export interface IPurchaseEntity {
  id: string
  number: string
  status: string
  supplier_id?: string | null
  supplier_name?: string | null
  expected_date?: Date | null
  notes?: string | null
  total: number
  approved_by?: string | null
  approved_at?: Date | null
  received_by?: string | null
  received_at?: Date | null
  user_id: string
  user_name?: string | null
  created_at: Date
  updated_at: Date
  items: IPurchaseItemEntity[]
}

export interface CreatePurchaseItemData {
  medicine_id: string
  quantity: number
  unit_cost: number
}

export interface CreatePurchaseData {
  supplier_id?: string
  expected_date?: string
  notes?: string
  items: CreatePurchaseItemData[]
}

export interface UpdatePurchaseData {
  supplier_id?: string
  expected_date?: string
  notes?: string
  items?: CreatePurchaseItemData[]
}

export interface IReceiveBatchData {
  batch_number: string
  medicine_id: string
  manufacture_date?: string
  expiry_date: string
  quantity: number
  unit_cost?: number
}
