import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

interface SeedProduct {
  name: string
  sku: string
  denomination: number
  costPrice: number
  sellPrice: number
  requiresZone?: boolean
}

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const isProduction = process.env.NODE_ENV === 'production'
  const adminEmail = process.env.SEED_ADMIN_EMAIL || (isProduction ? '' : 'admin@nexatopup.com')
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || (isProduction ? '' : 'admin123')

  if (!adminEmail || !adminPassword) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before seeding production.')
  }

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12)
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedAdminPassword,
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin created:', admin.email)

  if (!isProduction) {
    const userPassword = await bcrypt.hash('user123', 12)
    const user = await prisma.user.upsert({
      where: { email: 'user@nexatopup.com' },
      update: {},
      create: {
        email: 'user@nexatopup.com',
        passwordHash: userPassword,
        fullName: 'Test User',
        phone: '08123456789',
      },
    })
    console.log('✅ User created:', user.email)
  }

  // Create games
  const gamesData = [
    {
      name: 'Mobile Legends: Bang Bang',
      slug: 'mobile-legends',
      logo: 'https://cdn.nexatopup.com/games/mlbb-logo.png',
      banner: 'https://cdn.nexatopup.com/games/mlbb-banner.jpg',
      description: 'MOBA 5v5 paling populer di Indonesia dengan jutaan pemain aktif.',
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Free Fire',
      slug: 'free-fire',
      logo: 'https://cdn.nexatopup.com/games/ff-logo.png',
      banner: 'https://cdn.nexatopup.com/games/ff-banner.jpg',
      description: 'Battle Royale survival game dengan durasi match singkat.',
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'PUBG Mobile',
      slug: 'pubg-mobile',
      logo: 'https://cdn.nexatopup.com/games/pubg-logo.png',
      banner: 'https://cdn.nexatopup.com/games/pubg-banner.jpg',
      description: 'Battle Royale tactical shooter dengan grafis realistis.',
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Genshin Impact',
      slug: 'genshin-impact',
      logo: 'https://cdn.nexatopup.com/games/genshin-logo.png',
      banner: 'https://cdn.nexatopup.com/games/genshin-banner.jpg',
      description: 'Open world action RPG dengan visual anime yang memukau.',
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'Honor of Kings',
      slug: 'honor-of-kings',
      logo: 'https://cdn.nexatopup.com/games/hok-logo.png',
      banner: 'https://cdn.nexatopup.com/games/hok-banner.jpg',
      description: 'MOBA 5v5 dari Tencent dengan hero unik dan gameplay cepat.',
      isActive: true,
      sortOrder: 5,
    },
    {
      name: 'Valorant',
      slug: 'valorant',
      logo: 'https://cdn.nexatopup.com/games/valorant-logo.png',
      banner: 'https://cdn.nexatopup.com/games/valorant-banner.jpg',
      description: 'Tactical FPS 5v5 dengan agent unik dan gameplay strategis.',
      isActive: true,
      sortOrder: 6,
    },
    {
      name: 'Roblox',
      slug: 'roblox',
      logo: 'https://cdn.nexatopup.com/games/roblox-logo.png',
      banner: 'https://cdn.nexatopup.com/games/roblox-banner.jpg',
      description: 'Platform game user-generated dengan jutaan game buatan pemain.',
      isActive: true,
      sortOrder: 7,
    },
  ]

  for (const gameData of gamesData) {
    await prisma.game.upsert({
      where: { slug: gameData.slug },
      update: gameData,
      create: gameData,
    })
  }
  console.log('✅ Games created')

  // Create products for each game
  const games = await prisma.game.findMany({ where: { isActive: true } })

  for (const game of games) {
    let productsData: SeedProduct[] = []

    switch (game.slug) {
      case 'mobile-legends':
        productsData = [
          { name: '12 Diamonds', sku: 'MLBB_12_DIA', denomination: 12, costPrice: 1500, sellPrice: 2000 },
          { name: '86 Diamonds', sku: 'MLBB_86_DIA', denomination: 86, costPrice: 10000, sellPrice: 13000 },
          { name: '172 Diamonds', sku: 'MLBB_172_DIA', denomination: 172, costPrice: 19000, sellPrice: 24000 },
          { name: '257 Diamonds', sku: 'MLBB_257_DIA', denomination: 257, costPrice: 28000, sellPrice: 35000 },
          { name: '344 Diamonds', sku: 'MLBB_344_DIA', denomination: 344, costPrice: 37000, sellPrice: 46000 },
          { name: '514 Diamonds', sku: 'MLBB_514_DIA', denomination: 514, costPrice: 55000, sellPrice: 68000 },
          { name: '862 Diamonds', sku: 'MLBB_862_DIA', denomination: 862, costPrice: 90000, sellPrice: 110000 },
          { name: '1720 Diamonds', sku: 'MLBB_1720_DIA', denomination: 1720, costPrice: 175000, sellPrice: 210000 },
          { name: '2296 Diamonds', sku: 'MLBB_2296_DIA', denomination: 2296, costPrice: 230000, sellPrice: 275000 },
        ]
        break
      case 'free-fire':
        productsData = [
          { name: '100 Diamonds', sku: 'FF_100_DIA', denomination: 100, costPrice: 2000, sellPrice: 2500 },
          { name: '310 Diamonds', sku: 'FF_310_DIA', denomination: 310, costPrice: 5500, sellPrice: 7000 },
          { name: '520 Diamonds', sku: 'FF_520_DIA', denomination: 520, costPrice: 9000, sellPrice: 11000 },
          { name: '1060 Diamonds', sku: 'FF_1060_DIA', denomination: 1060, costPrice: 18000, sellPrice: 22000 },
          { name: '2180 Diamonds', sku: 'FF_2180_DIA', denomination: 2180, costPrice: 36000, sellPrice: 44000 },
          { name: '5600 Diamonds', sku: 'FF_5600_DIA', denomination: 5600, costPrice: 90000, sellPrice: 110000 },
        ]
        break
      case 'pubg-mobile':
        productsData = [
          { name: '60 UC', sku: 'PUBG_60_UC', denomination: 60, costPrice: 1000, sellPrice: 1500 },
          { name: '325 UC', sku: 'PUBG_325_UC', denomination: 325, costPrice: 5000, sellPrice: 6500 },
          { name: '660 UC', sku: 'PUBG_660_UC', denomination: 660, costPrice: 10000, sellPrice: 12500 },
          { name: '1800 UC', sku: 'PUBG_1800_UC', denomination: 1800, costPrice: 27000, sellPrice: 33000 },
          { name: '3850 UC', sku: 'PUBG_3850_UC', denomination: 3850, costPrice: 55000, sellPrice: 68000 },
          { name: '8100 UC', sku: 'PUBG_8100_UC', denomination: 8100, costPrice: 110000, sellPrice: 135000 },
        ]
        break
      case 'genshin-impact':
        productsData = [
          { name: '60 Genesis Crystals', sku: 'GENSHIN_60_GC', denomination: 60, costPrice: 1000, sellPrice: 1500, requiresZone: true },
          { name: '300 Genesis Crystals', sku: 'GENSHIN_300_GC', denomination: 300, costPrice: 5000, sellPrice: 6500, requiresZone: true },
          { name: '980 Genesis Crystals', sku: 'GENSHIN_980_GC', denomination: 980, costPrice: 15000, sellPrice: 19000, requiresZone: true },
          { name: '1980 Genesis Crystals', sku: 'GENSHIN_1980_GC', denomination: 1980, costPrice: 30000, sellPrice: 38000, requiresZone: true },
          { name: '3280 Genesis Crystals', sku: 'GENSHIN_3280_GC', denomination: 3280, costPrice: 50000, sellPrice: 62000, requiresZone: true },
          { name: '6480 Genesis Crystals', sku: 'GENSHIN_6480_GC', denomination: 6480, costPrice: 100000, sellPrice: 120000, requiresZone: true },
        ]
        break
      case 'honor-of-kings':
        productsData = [
          { name: '60 Tokens', sku: 'HOK_60_TOK', denomination: 60, costPrice: 1000, sellPrice: 1500, requiresZone: true },
          { name: '180 Tokens', sku: 'HOK_180_TOK', denomination: 180, costPrice: 3000, sellPrice: 4000, requiresZone: true },
          { name: '300 Tokens', sku: 'HOK_300_TOK', denomination: 300, costPrice: 5000, sellPrice: 6500, requiresZone: true },
          { name: '680 Tokens', sku: 'HOK_680_TOK', denomination: 680, costPrice: 11000, sellPrice: 14000, requiresZone: true },
          { name: '1280 Tokens', sku: 'HOK_1280_TOK', denomination: 1280, costPrice: 20000, sellPrice: 25000, requiresZone: true },
          { name: '2150 Tokens', sku: 'HOK_2150_TOK', denomination: 2150, costPrice: 33000, sellPrice: 41000, requiresZone: true },
        ]
        break
      case 'valorant':
        productsData = [
          { name: '475 VP', sku: 'VAL_475_VP', denomination: 475, costPrice: 7000, sellPrice: 9000 },
          { name: '1000 VP', sku: 'VAL_1000_VP', denomination: 1000, costPrice: 14000, sellPrice: 18000 },
          { name: '2050 VP', sku: 'VAL_2050_VP', denomination: 2050, costPrice: 28000, sellPrice: 35000 },
          { name: '3650 VP', sku: 'VAL_3650_VP', denomination: 3650, costPrice: 49000, sellPrice: 60000 },
          { name: '5350 VP', sku: 'VAL_5350_VP', denomination: 5350, costPrice: 70000, sellPrice: 85000 },
          { name: '11000 VP', sku: 'VAL_11000_VP', denomination: 11000, costPrice: 140000, sellPrice: 170000 },
        ]
        break
      case 'roblox':
        productsData = [
          { name: '400 Robux', sku: 'ROBLOX_400_RBX', denomination: 400, costPrice: 6000, sellPrice: 8000 },
          { name: '800 Robux', sku: 'ROBLOX_800_RBX', denomination: 800, costPrice: 12000, sellPrice: 15000 },
          { name: '1700 Robux', sku: 'ROBLOX_1700_RBX', denomination: 1700, costPrice: 24000, sellPrice: 30000 },
          { name: '4500 Robux', sku: 'ROBLOX_4500_RBX', denomination: 4500, costPrice: 60000, sellPrice: 75000 },
          { name: '10000 Robux', sku: 'ROBLOX_10000_RBX', denomination: 10000, costPrice: 130000, sellPrice: 160000 },
        ]
        break
      default:
        productsData = [
          { name: 'Basic Package', sku: `${game.slug.toUpperCase()}_BASIC`, denomination: 100, costPrice: 5000, sellPrice: 7000 },
          { name: 'Standard Package', sku: `${game.slug.toUpperCase()}_STD`, denomination: 500, costPrice: 20000, sellPrice: 28000 },
          { name: 'Premium Package', sku: `${game.slug.toUpperCase()}_PREM`, denomination: 1000, costPrice: 38000, sellPrice: 50000 },
        ]
    }

    for (let i = 0; i < productsData.length; i++) {
      const productData = productsData[i]
      const margin = ((productData.sellPrice - productData.costPrice) / productData.costPrice) * 100

      await prisma.product.upsert({
        where: { sku: productData.sku },
        update: {},
        create: {
          gameId: game.id,
          name: productData.name,
          sku: productData.sku,
          denomination: productData.denomination,
          costPrice: productData.costPrice,
          sellPrice: productData.sellPrice,
          margin: Math.round(margin * 100) / 100,
          isActive: true,
          requiresZone: productData.requiresZone || false,
          zoneLabel: productData.requiresZone ? 'Server ID' : 'Zone ID',
          sortOrder: i + 1,
        },
      })
    }
  }
  console.log('✅ Products created')

  // Create manual supplier
  await prisma.supplier.upsert({
    where: { code: 'MANUAL' },
    update: {},
    create: {
      name: 'Manual Processing',
      code: 'MANUAL',
      status: 'ACTIVE',
      isManual: true,
      config: { description: 'Admin memproses pesanan secara manual' },
    },
  })
  console.log('✅ Manual supplier created')

  // Create default settings
  const defaultSettings = [
    { key: 'site.name', value: 'NEXATOPUP', description: 'Nama website', isPublic: true },
    { key: 'site.description', value: 'Top Up Game Murah, Cepat & Aman', description: 'Deskripsi website', isPublic: true },
    { key: 'site.contactEmail', value: 'support@nexatopup.com', description: 'Email kontak', isPublic: true },
    { key: 'site.contactPhone', value: '+62 21 1234 5678', description: 'Telepon kontak', isPublic: true },
    { key: 'payment.gateway', value: 'midtrans', description: 'Payment gateway aktif', isPublic: false },
    { key: 'payment.midtrans.isProduction', value: false, description: 'Midtrans production mode', isPublic: false },
    { key: 'supplier.default', value: 'MANUAL', description: 'Supplier default', isPublic: false },
    { key: 'email.from', value: 'noreply@nexatopup.com', description: 'Email pengirim', isPublic: false },
    { key: 'email.replyTo', value: 'support@nexatopup.com', description: 'Email balasan', isPublic: false },
    { key: 'site.maintenanceMode', value: false, description: 'Mode maintenance', isPublic: true },
    { key: 'site.registrationEnabled', value: true, description: 'Registrasi dibuka', isPublic: true },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Default settings created')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })