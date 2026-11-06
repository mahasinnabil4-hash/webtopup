import crypto from 'crypto'
import { PaymentRequest, PaymentResponse, WebhookPayload, VerifiedWebhookResult } from './types'

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true'

const BASE_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://api.midtrans.com'
  : 'https://api.sandbox.midtrans.com'

function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')
}

export async function createMidtransPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const payload = {
      transaction_details: {
        order_id: request.orderNumber,
        gross_amount: Math.round(request.amount),
      },
      customer_details: {
        first_name: request.customerName,
        email: request.customerEmail,
        phone: request.customerPhone,
      },
      item_details: request.items.map((item) => ({
        id: item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name,
      })),
      callbacks: {
        finish: `${request.callbackUrl}?status=finish`,
        error: `${request.callbackUrl}?status=error`,
        pending: `${request.callbackUrl}?status=pending`,
      },
      expiry: {
        start_time: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' +0700',
        unit: 'minute',
        duration: request.expiryMinutes || 24 * 60,
      },
      enable_payments: request.paymentMethod ? [request.paymentMethod] : undefined,
    }

    const response = await fetch(`${BASE_URL}/v2/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error_messages?.join(', ') || 'Failed to create payment',
      }
    }

    return {
      success: true,
      paymentUrl: data.redirect_url,
      token: data.token,
      transactionId: data.transaction_id,
      vaNumbers: data.va_numbers,
      qrCode: data.qr_code,
      qrString: data.qr_string,
    }
  } catch (error) {
    console.error('Midtrans payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function verifyMidtransSignature(payload: WebhookPayload): VerifiedWebhookResult {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      ...rest
    } = payload

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return { isValid: false, error: 'Missing required fields for verification' }
    }

    const input = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`
    const expectedSignature = crypto
      .createHash('sha512')
      .update(input)
      .digest('hex')

    const isValid = expectedSignature === signature_key

    return {
      isValid,
      payload: isValid ? payload : undefined,
      error: isValid ? undefined : 'Invalid signature',
    }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

export function getMidtransPaymentMethod(paymentType: string): string {
  const methodMap: Record<string, string> = {
    qris: 'QRIS',
    gopay: 'GOPAY',
    dana: 'DANA',
    ovo: 'OVO',
    shopeepay: 'SHOPEEPAY',
    bank_transfer: 'VIRTUAL_ACCOUNT',
    echannel: 'VIRTUAL_ACCOUNT',
    permata: 'VIRTUAL_ACCOUNT',
    bca_va: 'VIRTUAL_ACCOUNT',
    bni_va: 'VIRTUAL_ACCOUNT',
    bri_va: 'VIRTUAL_ACCOUNT',
    mandiri_va: 'VIRTUAL_ACCOUNT',
    cimb_va: 'VIRTUAL_ACCOUNT',
    other_va: 'VIRTUAL_ACCOUNT',
    alfamart: 'ALFAMART',
    indomaret: 'INDOMARET',
    credit_card: 'CREDIT_CARD',
  }
  return methodMap[paymentType?.toLowerCase()] || paymentType?.toUpperCase() || 'UNKNOWN'
}

export function getMidtransOrderStatus(status: string, fraudStatus?: string): string {
  const statusMap: Record<string, string> = {
    capture: 'SETTLEMENT',
    settlement: 'SETTLEMENT',
    pending: 'PENDING',
    deny: 'DENY',
    cancel: 'CANCEL',
    expire: 'EXPIRE',
    failure: 'FAILURE',
    refund: 'REFUND',
    partial_refund: 'PARTIAL_REFUND',
  }
  return statusMap[status?.toLowerCase()] || 'PENDING'
}

export async function getMidtransTransactionStatus(orderId: string) {
  try {
    const response = await fetch(`${BASE_URL}/v2/${orderId}/status`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: getAuthHeader(),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get transaction status')
    }

    return response.json()
  } catch (error) {
    console.error('Midtrans status check error:', error)
    throw error
  }
}