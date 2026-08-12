export interface ITodayKpi {
  revenue: number
  sales_count: number
  average_ticket: number
  items_sold: number
}

export interface IPaymentBreakdown {
  method: string
  count: number
  total: number
}

export interface ITopProduct {
  medicine_id: string
  medicine_name: string
  quantity: number
  revenue: number
}

export interface IRecentSale {
  id: string
  subtotal: number
  total: number
  payment_method: string
  status: string
  user_id: string
  user_name?: string | null
  client_id?: string | null
  client_name?: string | null
  prescription_id?: string | null
  created_at: string
  updated_at: string
}

export interface IDashboardReport {
  today: ITodayKpi
  low_stock_count: number
  out_of_stock_count: number
  expiring_soon_count: number
  expired_count: number
  revenue_30d: { period: string; revenue: number }[]
  sales_by_payment: IPaymentBreakdown[]
  top_products_week: ITopProduct[]
  recent_sales: IRecentSale[]
}

export interface IProductFinancial {
  medicine_id: string
  medicine_name: string
  quantity: number
  revenue: number
  profit: number
}

export interface ILaboratoryFinancial {
  laboratory: string
  revenue: number
  profit: number
}

export interface ICashFlowItem {
  period: string
  revenue: number
  purchases: number
}

export interface IFinancialReport {
  total_revenue: number
  total_cost: number
  total_profit: number
  profit_margin: number
  by_product: IProductFinancial[]
  by_laboratory: ILaboratoryFinancial[]
  cash_flow: ICashFlowItem[]
}
