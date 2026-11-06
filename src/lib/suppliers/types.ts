export interface SupplierConfig {
  baseUrl?: string
  apiKey?: string
  apiSecret?: string
  username?: string
  password?: string
  callbackUrl?: string
  customConfig?: Record<string, any>
}

export interface ProductMapping {
  productId: string
  supplierProductCode: string
  supplierPrice: number
}

export interface GameMapping {
  gameId: string
  supplierGameCode: string
}

export interface OrderRequest {
  orderId: string
  orderNumber: string
  productCode: string
  gameCode: string
  userId: string
  zoneId?: string
  quantity: number
  price: number
  callbackUrl?: string
}

export interface OrderResponse {
  success: boolean
  supplierOrderId?: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  message?: string
  data?: any
}

export interface StatusCheckResponse {
  success: boolean
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  supplierOrderId?: string
  message?: string
  data?: any
}

export interface SupplierAdapter {
  name: string
  code: string
  initialize(config: SupplierConfig): void
  submitOrder(request: OrderRequest): Promise<OrderResponse>
  checkStatus(supplierOrderId: string): Promise<StatusCheckResponse>
  getBalance?(): Promise<{ success: boolean; balance?: number; error?: string }>
  getProductList?(): Promise<{ success: boolean; products?: any[]; error?: string }>
}