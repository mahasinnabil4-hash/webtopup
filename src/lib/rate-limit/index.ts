interface RateLimitEntry {
  count: number
  resetTime: number
}

const memoryStore = new Map<string, RateLimitEntry>()

export function createRateLimiter(options: {
  windowMs: number
  maxRequests: number
  keyPrefix?: string
}) {
  const { windowMs, maxRequests, keyPrefix = 'rl' } = options

  return async function rateLimit(key: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const fullKey = `${keyPrefix}:${key}`
    const now = Date.now()
    const entry = memoryStore.get(fullKey)

    if (!entry || now > entry.resetTime) {
      memoryStore.set(fullKey, { count: 1, resetTime: now + windowMs })
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs }
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime }
    }

    entry.count++
    return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime }
  }
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'auth',
})

export const paymentRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  keyPrefix: 'payment',
})

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  keyPrefix: 'api',
})

export function cleanupRateLimitStore() {
  const now = Date.now()
  memoryStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      memoryStore.delete(key)
    }
  })
}

setInterval(cleanupRateLimitStore, 5 * 60 * 1000)