export const GAME_CATEGORIES = [
  'MOBILE',
  'PC',
  'CONSOLE',
] as const

export const POPULAR_GAMES = [
  {
    name: 'Mobile Legends: Bang Bang',
    slug: 'mobile-legends',
    logo: '/images/games/mlbb-logo.png',
    banner: '/images/games/mlbb-banner.jpg',
    description: 'MOBA 5v5 paling populer di Indonesia',
    requiresZone: true,
    zoneLabel: 'Zone ID',
  },
  {
    name: 'Free Fire',
    slug: 'free-fire',
    logo: '/images/games/ff-logo.png',
    banner: '/images/games/ff-banner.jpg',
    description: 'Battle Royale survival game',
    requiresZone: false,
  },
  {
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    logo: '/images/games/pubg-logo.png',
    banner: '/images/games/pubg-banner.jpg',
    description: 'Battle Royale tactical shooter',
    requiresZone: false,
  },
  {
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    logo: '/images/games/genshin-logo.png',
    banner: '/images/games/genshin-banner.jpg',
    description: 'Open world action RPG',
    requiresZone: true,
    zoneLabel: 'Server',
  },
  {
    name: 'Honor of Kings',
    slug: 'honor-of-kings',
    logo: '/images/games/hok-logo.png',
    banner: '/images/games/hok-banner.jpg',
    description: 'MOBA 5v5 dari Tencent',
    requiresZone: true,
    zoneLabel: 'Zone ID',
  },
  {
    name: 'Valorant',
    slug: 'valorant',
    logo: '/images/games/valorant-logo.png',
    banner: '/images/games/valorant-banner.jpg',
    description: 'Tactical FPS 5v5',
    requiresZone: false,
  },
  {
    name: 'Roblox',
    slug: 'roblox',
    logo: '/images/games/roblox-logo.png',
    banner: '/images/games/roblox-banner.jpg',
    description: 'Platform game user-generated',
    requiresZone: false,
  },
] as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  WAITING_PAYMENT: 'Menunggu Pembayaran',
  PAID: 'Dibayar',
  PROCESSING: 'Diproses',
  SUCCESS: 'Berhasil',
  FAILED: 'Gagal',
  REFUNDED: 'Dikembalikan',
  CANCELLED: 'Dibatalkan',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  WAITING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  SETTLEMENT: 'Berhasil',
  CAPTURE: 'Ditangkap',
  DENY: 'Ditolak',
  CANCEL: 'Dibatalkan',
  EXPIRE: 'Kedaluwarsa',
  FAILURE: 'Gagal',
  REFUND: 'Dikembalikan',
  PARTIAL_REFUND: 'Sebagian Dikembalikan',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  QRIS: 'QRIS',
  GOPAY: 'GoPay',
  DANA: 'DANA',
  OVO: 'OVO',
  SHOPEEPAY: 'ShopeePay',
  VIRTUAL_ACCOUNT: 'Virtual Account',
  BANK_TRANSFER: 'Transfer Bank',
  CREDIT_CARD: 'Kartu Kredit',
  ALFAMART: 'Alfamart',
  INDOMARET: 'Indomaret',
}

export const PAYMENT_METHOD_ICONS: Record<string, string> = {
  QRIS: '📱',
  GOPAY: '💚',
  DANA: '💙',
  OVO: '💜',
  SHOPEEPAY: '🧡',
  VIRTUAL_ACCOUNT: '🏦',
  BANK_TRANSFER: '🏦',
  CREDIT_CARD: '💳',
  ALFAMART: '🏪',
  INDOMARET: '🏪',
}

export const SUPPLIER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktif',
  INACTIVE: 'Nonaktif',
  MAINTENANCE: 'Pemeliharaan',
}