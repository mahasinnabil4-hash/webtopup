import { PaymentRequest, PaymentResponse, WebhookPayload, VerifiedWebhookResult } from './types'

const XENDIT_API_KEY = process.env.XENDIT_API_KEY!
const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN!
const XENDIT_IS_PRODUCTION = process.env.XENDIT_IS_PRODUCTION === 'true'

const BASE_URL = XENDIT_IS_PRODUCTION
  ? 'https://api.xendit.co'
  : 'https://api.xendit.co'

function getAuthHeader(): string {
  return 'Basic ' + Buffer.from(XENDIT_API_KEY + ':').toString('base64')
}

export async function createXenditInvoice(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    const payload = {
      external_id: request.orderNumber,
      amount: Math.round(request.amount),
      description: request.items.map((i) => `${i.name} x${i.quantity}`).join(', '),
      customer: {
        given_names: request.customerName,
        email: request.customerEmail,
        mobile_number: request.customerPhone,
      },
      items: request.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: Math.round(item.price),
        category: 'Game Top-up',
      })),
      success_redirect_url: `${request.callbackUrl}?status=success`,
      failure_redirect_url: `${request.callbackUrl}?status=failed`,
      callback_url: `${process.env.NEXTAUTH_URL}/api/customer/payment/webhook/xendit`,
      currency: 'IDR',
    }

    const response = await fetch(`${BASE_URL}/v2/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to create invoice',
      }
    }

    return {
      success: true,
      paymentUrl: data.invoice_url,
      transactionId: data.id,
    }
  } catch (error) {
    console.error('Xendit payment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export function verifyXenditCallback(payload: WebhookPayload): VerifiedWebhookResult {
  try {
    const callbackToken = payload['x-callback-token'] || payload.callback_token
    
    if (!callbackToken || callbackToken !== XENDIT_CALLBACK_TOKEN) {
      return { isValid: false, error: 'Invalid callback token' }
    }

    return { isValid: true, payload }
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    }
  }
}

export function getXenditInvoiceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'PENDING',
    PAID: 'SETTLEMENT',
    SETTLED: 'SETTLEMENT',
    EXPIRED: 'EXPIRE',
    FAILED: 'FAILURE',
  }
  return statusMap[status?.toUpperCase()] || 'PENDING'
}

export async function getXenditInvoiceStatusById(invoiceId: string) {
  try {
    const response = await fetch(`${BASE_URL}/v2/invoices/${invoiceId}`, {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get invoice status')
    }

    return response.json()
  } catch (error) {
    console.error('Xendit status check error:', error)
    throw error
  }
}