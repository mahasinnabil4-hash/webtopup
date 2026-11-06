import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'

export async function getSetting(key: string) {
  return prisma.setting.findUnique({ where: { key } })
}

export async function getPublicSettings() {
  return prisma.setting.findMany({
    where: { isPublic: true },
  })
}

export async function getAllSettings() {
  return prisma.setting.findMany({
    orderBy: { key: 'asc' },
  })
}

export async function setSetting(key: string, value: any, description?: string, isPublic = false) {
  return prisma.setting.upsert({
    where: { key },
    create: { key, value, description, isPublic },
    update: { value, description, isPublic },
  })
}

export async function deleteSetting(key: string) {
  return prisma.setting.delete({ where: { key } })
}

export async function getSettingsByCategory(category: string) {
  return prisma.setting.findMany({
    where: { key: { startsWith: `${category}.` } },
  })
}

export const SETTING_KEYS = {
  SITE_NAME: 'site.name',
  SITE_DESCRIPTION: 'site.description',
  SITE_LOGO: 'site.logo',
  SITE_FAVICON: 'site.favicon',
  CONTACT_EMAIL: 'site.contactEmail',
  CONTACT_PHONE: 'site.contactPhone',
  CONTACT_ADDRESS: 'site.contactAddress',
  SOCIAL_MEDIA: 'site.socialMedia',
  PAYMENT_GATEWAY: 'payment.gateway',
  MIDTRANS_SERVER_KEY: 'payment.midtrans.serverKey',
  MIDTRANS_CLIENT_KEY: 'payment.midtrans.clientKey',
  MIDTRANS_IS_PRODUCTION: 'payment.midtrans.isProduction',
  MIDTRANS_MERCHANT_ID: 'payment.midtrans.merchantId',
  XENDIT_API_KEY: 'payment.xendit.apiKey',
  XENDIT_CALLBACK_TOKEN: 'payment.xendit.callbackToken',
  XENDIT_IS_PRODUCTION: 'payment.xendit.isProduction',
  SUPPLIER_DEFAULT: 'supplier.default',
  EMAIL_FROM: 'email.from',
  EMAIL_REPLY_TO: 'email.replyTo',
  MAINTENANCE_MODE: 'site.maintenanceMode',
  REGISTRATION_ENABLED: 'site.registrationEnabled',
} as const