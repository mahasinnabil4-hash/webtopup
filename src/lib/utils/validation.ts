import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email format')
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters')
export const phoneSchema = z.string().regex(/^(\+62|62|0)8[1-9][0-9]{7,9}$/, 'Invalid Indonesian phone number')
export const userIdSchema = z.string().min(1, 'User ID is required')
export const zoneIdSchema = z.string().optional()
export const quantitySchema = z.number().int().min(1).max(100)
export const orderNumberSchema = z.string().regex(/^TOPUP-[A-Z0-9]+$/, 'Invalid order number format')

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2).max(100).optional(),
  phone: phoneSchema.optional(),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const createOrderSchema = z.object({
  productId: z.string().cuid(),
  userGameId: userIdSchema,
  userZoneId: zoneIdSchema,
  quantity: quantitySchema.default(1),
})

export const checkOrderSchema = z.object({
  orderNumber: orderNumberSchema,
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
}).refine((data) => data.phone || data.email, {
  message: 'Either phone or email is required',
  path: ['phone'],
})

export const gameSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  logo: z.string().url(),
  banner: z.string().url().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

export const productSchema = z.object({
  gameId: z.string().cuid(),
  name: z.string().min(2).max(100),
  sku: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/),
  denomination: z.number().int().positive(),
  costPrice: z.number().positive(),
  sellPrice: z.number().positive(),
  margin: z.number().min(0).max(1000),
  isActive: z.boolean().default(true),
  requiresZone: z.boolean().default(false),
  zoneLabel: z.string().max(50).default('Zone ID'),
  sortOrder: z.number().int().default(0),
})

export const supplierSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(30).regex(/^[A-Z0-9_]+$/),
  baseUrl: z.string().url().optional().nullable(),
  apiKey: z.string().optional().nullable(),
  apiSecret: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  callbackUrl: z.string().url().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
  config: z.any().optional().nullable(),
  isManual: z.boolean().default(false),
})

export const adminCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2).max(100),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
})

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    throw new Error(Object.values(errors).flat().join(', '))
  }
  return result.data
}