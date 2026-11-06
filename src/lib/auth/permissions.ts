export const PERMISSIONS = {
  // User permissions
  USER: ['read:profile', 'update:profile', 'create:order', 'read:own_orders'],
  
  // Admin permissions
  ADMIN: [
    'read:dashboard',
    'read:orders',
    'update:orders',
    'read:games',
    'create:games',
    'update:games',
    'delete:games',
    'read:products',
    'create:products',
    'update:products',
    'delete:products',
    'read:suppliers',
    'create:suppliers',
    'update:suppliers',
    'delete:suppliers',
    'read:users',
    'update:users',
    'read:settings',
    'update:settings',
    'read:logs',
  ],
  
  // Super admin permissions
  SUPER_ADMIN: [
    'read:dashboard',
    'read:orders',
    'update:orders',
    'read:games',
    'create:games',
    'update:games',
    'delete:games',
    'read:products',
    'create:products',
    'update:products',
    'delete:products',
    'read:suppliers',
    'create:suppliers',
    'update:suppliers',
    'delete:suppliers',
    'read:users',
    'update:users',
    'create:admins',
    'update:admins',
    'delete:admins',
    'read:settings',
    'update:settings',
    'read:logs',
  ],
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][number]

export function hasPermission(role: string, permission: Permission): boolean {
  const rolePermissions = PERMISSIONS[role as keyof typeof PERMISSIONS] || []
  return (rolePermissions as readonly string[]).includes(permission as string)
}

export function canAccessAdmin(role: string): boolean {
  return ['ADMIN', 'SUPER_ADMIN'].includes(role)
}

export function canManageAdmins(role: string): boolean {
  return role === 'SUPER_ADMIN'
}