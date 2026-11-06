import { createMidtransPayment, verifyMidtransSignature, getMidtransOrderStatus, getMidtransPaymentMethod } from './midtrans'
import { createXenditInvoice, verifyXenditCallback, getXenditInvoiceStatus } from './xendit'
import { PaymentRequest, PaymentResponse, VerifiedWebhookResult } from './types'

export type PaymentGateway = 'midtrans' | 'xendit'

export function getActiveGateway(): PaymentGateway {
  const gateway = process.env.PAYMENT_GATEWAY || 'midtrans'
  return gateway as PaymentGateway
}

export async function createPayment(request: PaymentRequest, gateway?: PaymentGateway): Promise<PaymentResponse> {
  const activeGateway = gateway || getActiveGateway()
  
  switch (activeGateway) {
    case 'midtrans':
      return createMidtransPayment(request)
    case 'xendit':
      return createXenditInvoice(request)
    default:
      return {
        success: false,
        error: `Unsupported payment gateway: ${activeGateway}`,
      }
  }
}

export function verifyWebhook(payload: any, gateway?: PaymentGateway): VerifiedWebhookResult {
  const activeGateway = gateway || getActiveGateway()
  
  switch (activeGateway) {
    case 'midtrans':
      return verifyMidtransSignature(payload)
    case 'xendit':
      return verifyXenditCallback(payload)
    default:
      return { isValid: false, error: `Unsupported payment gateway: ${activeGateway}` }
  }
}

export function parsePaymentStatus(status: string, gateway?: PaymentGateway): string {
  const activeGateway = gateway || getActiveGateway()
  
  switch (activeGateway) {
    case 'midtrans':
      return getMidtransOrderStatus(status)
    case 'xendit':
      return getXenditInvoiceStatus(status)
    default:
      return 'PENDING'
  }
}

export function parsePaymentMethod(paymentType: string, gateway?: PaymentGateway): string {
  const activeGateway = gateway || getActiveGateway()
  
  switch (activeGateway) {
    case 'midtrans':
      return getMidtransPaymentMethod(paymentType)
    case 'xendit':
      return paymentType.toUpperCase()
    default:
      return paymentType.toUpperCase()
  }
}

export async function checkPaymentStatus(transactionId: string, gateway?: PaymentGateway) {
  const activeGateway = gateway || getActiveGateway()
  
  switch (activeGateway) {
    case 'midtrans':
      return getMidtransTransactionStatus(transactionId)
    case 'xendit':
      return getXenditInvoiceStatusById(transactionId)
    default:
      throw new Error(`Unsupported payment gateway: ${activeGateway}`)
  }
}

async function getMidtransTransactionStatus(orderId: string) {
  const { getMidtransTransactionStatus: midtransStatus } = await import('./midtrans')
  return midtransStatus(orderId)
}

async function getXenditInvoiceStatusById(invoiceId: string) {
  const { getXenditInvoiceStatusById: xenditStatus } = await import('./xendit')
  return xenditStatus(invoiceId)
}