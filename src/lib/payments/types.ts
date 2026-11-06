export interface PaymentRequest {
  orderId: string
  orderNumber: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone?: string
  paymentMethod?: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  callbackUrl: string
  expiryMinutes?: number
}

export interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  token?: string
  transactionId?: string
  vaNumbers?: Array<{ bank: string; vaNumber: string }>
  qrCode?: string
  qrString?: string
  error?: string
}

export interface WebhookPayload {
  transaction_id?: string
  order_id?: string
  gross_amount?: string
  payment_type?: string
  transaction_time?: string
  transaction_status?: string
  fraud_status?: string
  status_code?: string
  signature_key?: string
  [key: string]: any
}

export interface VerifiedWebhookResult {
  isValid: boolean
  payload?: WebhookPayload
  error?: string
}