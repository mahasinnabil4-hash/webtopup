import { SupplierAdapter, OrderRequest, OrderResponse, StatusCheckResponse } from './types'

export class ManualSupplierAdapter implements SupplierAdapter {
  name = 'Manual Processing'
  code = 'MANUAL'

  initialize(): void {}

  async submitOrder(request: OrderRequest): Promise<OrderResponse> {
    return {
      success: true,
      supplierOrderId: `MANUAL-${request.orderNumber}`,
      status: 'PENDING',
      message: 'Order queued for manual processing by admin',
    }
  }

  async checkStatus(supplierOrderId: string): Promise<StatusCheckResponse> {
    return {
      success: true,
      status: 'PENDING',
      supplierOrderId,
      message: 'Waiting for admin to process manually',
    }
  }
}