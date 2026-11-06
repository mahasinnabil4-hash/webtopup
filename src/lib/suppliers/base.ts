import { SupplierAdapter, SupplierConfig, OrderRequest, OrderResponse, StatusCheckResponse } from './types'

export abstract class BaseSupplierAdapter implements SupplierAdapter {
  abstract name: string
  abstract code: string
  protected config: SupplierConfig = {}

  initialize(config: SupplierConfig): void {
    this.config = config
  }

  abstract submitOrder(request: OrderRequest): Promise<OrderResponse>
  abstract checkStatus(supplierOrderId: string): Promise<StatusCheckResponse>

  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.message || `HTTP ${response.status}` }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Request failed' }
    }
  }

  protected generateSignature(params: Record<string, string>, secret: string): string {
    const crypto = require('crypto')
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&')
    return crypto.createHmac('sha256', secret).update(sortedParams).digest('hex')
  }
}