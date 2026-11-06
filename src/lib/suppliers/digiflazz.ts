import { BaseSupplierAdapter } from './base'
import { SupplierConfig, OrderRequest, OrderResponse, StatusCheckResponse } from './types'

export class DigiflazzAdapter extends BaseSupplierAdapter {
  name = 'Digiflazz'
  code = 'DIGIFLAZZ'

  async submitOrder(request: OrderRequest): Promise<OrderResponse> {
    const { username, apiKey, baseUrl } = this.config
    const url = `${baseUrl || 'https://api.digiflazz.com/v1'}/transaction`

    const timestamp = Date.now().toString()
    const sign = this.generateSignature({ username: username!, timestamp }, apiKey!)

    const payload = {
      username,
      buyer_sku_code: request.productCode,
      customer_no: request.zoneId ? `${request.userId}.${request.zoneId}` : request.userId,
      qty: request.quantity,
      ref_id: request.orderNumber,
      sign,
    }

    const result = await this.makeRequest<{ data: any }>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!result.success) {
      return { success: false, status: 'FAILED', message: result.error }
    }

    const data = result.data?.data
    if (!data) {
      return { success: false, status: 'FAILED', message: 'Invalid response from supplier' }
    }

    const statusMap: Record<string, OrderResponse['status']> = {
      'Pending': 'PENDING',
      'Processing': 'PROCESSING',
      'Success': 'SUCCESS',
      'Failed': 'FAILED',
    }

    return {
      success: true,
      supplierOrderId: data.ref_id,
      status: statusMap[data.status] || 'PENDING',
      message: data.message,
      data,
    }
  }

  async checkStatus(supplierOrderId: string): Promise<StatusCheckResponse> {
    const { username, apiKey, baseUrl } = this.config
    const url = `${baseUrl || 'https://api.digiflazz.com/v1'}/cek-status`

    const timestamp = Date.now().toString()
    const sign = this.generateSignature({ username: username!, timestamp }, apiKey!)

    const payload = {
      username,
      ref_id: supplierOrderId,
      sign,
    }

    const result = await this.makeRequest<{ data: any }>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!result.success) {
      return { success: false, status: 'FAILED', message: result.error }
    }

    const data = result.data?.data
    if (!data) {
      return { success: false, status: 'FAILED', message: 'Invalid response from supplier' }
    }

    const statusMap: Record<string, StatusCheckResponse['status']> = {
      'Pending': 'PENDING',
      'Processing': 'PROCESSING',
      'Success': 'SUCCESS',
      'Failed': 'FAILED',
    }

    return {
      success: true,
      status: statusMap[data.status] || 'PENDING',
      supplierOrderId: data.ref_id,
      message: data.message,
      data,
    }
  }

  async getBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
    const { username, apiKey, baseUrl } = this.config
    const url = `${baseUrl || 'https://api.digiflazz.com/v1'}/depo/cek-saldo`

    const timestamp = Date.now().toString()
    const sign = this.generateSignature({ username: username!, timestamp }, apiKey!)

    const payload = { username, sign }

    const result = await this.makeRequest<{ data: { balance: number } }>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return { success: true, balance: result.data?.data?.balance }
  }

  async getProductList(): Promise<{ success: boolean; products?: any[]; error?: string }> {
    const { username, apiKey, baseUrl } = this.config
    const url = `${baseUrl || 'https://api.digiflazz.com/v1'}/pricelist`

    const timestamp = Date.now().toString()
    const sign = this.generateSignature({ username: username!, timestamp }, apiKey!)

    const payload = { username, sign }

    const result = await this.makeRequest<{ data: any[] }>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    return { success: true, products: result.data?.data }
  }
}