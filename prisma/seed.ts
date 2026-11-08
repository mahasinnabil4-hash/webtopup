import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding games and products...')

  const games = [
    {
      name: 'Mobile Legends: Bang Bang',
      slug: 'mobile-legends',
      logo: '/images/games/mobile-legends.png',
      banner: '/images/games/banners/mobile-legends.jpg',
      description: 'Top-up Diamond Mobile Legends secara instan dan aman. Harga terbaik untuk Diamond MLBB.',
      isActive: true,
      sortOrder: 1,
      products: [
        { name: '12 Diamond', sku: 'ML-12', denomination: 12, costPrice: 1800, sellPrice: 2200, margin: 22.22, sortOrder: 1 },
        { name: '25 Diamond', sku: 'ML-25', denomination: 25, costPrice: 3500, sellPrice: 4200, margin: 20.00, sortOrder: 2 },
        { name: '56 Diamond', sku: 'ML-56', denomination: 56, costPrice: 7800, sellPrice: 9200, margin: 17.95, sortOrder: 3 },
        { name: '86 Diamond', sku: 'ML-86', denomination: 86, costPrice: 11800, sellPrice: 13800, margin: 16.95, sortOrder: 4 },
        { name: '172 Diamond', sku: 'ML-172', denomination: 172, costPrice: 23000, sellPrice: 26800, margin: 16.52, sortOrder: 5 },
        { name: '257 Diamond', sku: 'ML-257', denomination: 257, costPrice: 34000, sellPrice: 39500, margin: 16.18, sortOrder: 6 },
        { name: '344 Diamond', sku: 'ML-344', denomination: 344, costPrice: 45000, sellPrice: 52000, margin: 15.56, sortOrder: 7 },
        { name: '429 Diamond', sku: 'ML-429', denomination: 429, costPrice: 56000, sellPrice: 64500, margin: 15.18, sortOrder: 8 },
        { name: '514 Diamond', sku: 'ML-514', denomination: 514, costPrice: 67000, sellPrice: 77000, margin: 14.93, sortOrder: 9 },
        { name: '600 Diamond', sku: 'ML-600', denomination: 600, costPrice: 78000, sellPrice: 89500, margin: 14.74, sortOrder: 10 },
        { name: '706 Diamond', sku: 'ML-706', denomination: 706, costPrice: 91000, sellPrice: 104500, margin: 14.84, sortOrder: 11 },
        { name: '844 Diamond', sku: 'ML-844', denomination: 844, costPrice: 109000, sellPrice: 125000, margin: 14.68, sortOrder: 12 },
        { name: '1018 Diamond', sku: 'ML-1018', denomination: 1018, costPrice: 131000, sellPrice: 150000, margin: 14.50, sortOrder: 13 },
        { name: '1192 Diamond', sku: 'ML-1192', denomination: 1192, costPrice: 153000, sellPrice: 175000, margin: 14.38, sortOrder: 14 },
        { name: '1366 Diamond', sku: 'ML-1366', denomination: 1366, costPrice: 175000, sellPrice: 200000, margin: 14.29, sortOrder: 15 },
        { name: '1720 Diamond', sku: 'ML-1720', denomination: 1720, costPrice: 220000, sellPrice: 250000, margin: 13.64, sortOrder: 16 },
        { name: '2075 Diamond', sku: 'ML-2075', denomination: 2075, costPrice: 265000, sellPrice: 300000, margin: 13.21, sortOrder: 17 },
        { name: '2430 Diamond', sku: 'ML-2430', denomination: 2430, costPrice: 310000, sellPrice: 350000, margin: 12.90, sortOrder: 18 },
        { name: '2784 Diamond', sku: 'ML-2784', denomination: 2784, costPrice: 355000, sellPrice: 400000, margin: 12.68, sortOrder: 19 },
        { name: '3440 Diamond', sku: 'ML-3440', denomination: 3440, costPrice: 440000, sellPrice: 495000, margin: 12.50, sortOrder: 20 },
      ],
    },
    {
      name: 'Free Fire',
      slug: 'free-fire',
      logo: '/images/games/free-fire.png',
      banner: '/images/games/banners/free-fire.jpg',
      description: 'Top-up Diamond Free Fire (FF) dan Free Fire MAX. Proses cepat, harga murah, garansi masuk.',
      isActive: true,
      sortOrder: 2,
      products: [
        { name: '10 Diamond', sku: 'FF-10', denomination: 10, costPrice: 1500, sellPrice: 1800, margin: 20.00, sortOrder: 1 },
        { name: '20 Diamond', sku: 'FF-20', denomination: 20, costPrice: 2800, sellPrice: 3400, margin: 21.43, sortOrder: 2 },
        { name: '30 Diamond', sku: 'FF-30', denomination: 30, costPrice: 4200, sellPrice: 5000, margin: 19.05, sortOrder: 3 },
        { name: '50 Diamond', sku: 'FF-50', denomination: 50, costPrice: 6800, sellPrice: 8000, margin: 17.65, sortOrder: 4 },
        { name: '70 Diamond', sku: 'FF-70', denomination: 70, costPrice: 9500, sellPrice: 11000, margin: 15.79, sortOrder: 5 },
        { name: '100 Diamond', sku: 'FF-100', denomination: 100, costPrice: 13000, sellPrice: 15000, margin: 15.38, sortOrder: 6 },
        { name: '140 Diamond', sku: 'FF-140', denomination: 140, costPrice: 18000, sellPrice: 20500, margin: 13.89, sortOrder: 7 },
        { name: '210 Diamond', sku: 'FF-210', denomination: 210, costPrice: 26500, sellPrice: 30000, margin: 13.21, sortOrder: 8 },
        { name: '280 Diamond', sku: 'FF-280', denomination: 280, costPrice: 35000, sellPrice: 39500, margin: 12.86, sortOrder: 9 },
        { name: '355 Diamond', sku: 'FF-355', denomination: 355, costPrice: 44000, sellPrice: 50000, margin: 13.64, sortOrder: 10 },
        { name: '510 Diamond', sku: 'FF-510', denomination: 510, costPrice: 63000, sellPrice: 71500, margin: 13.49, sortOrder: 11 },
        { name: '720 Diamond', sku: 'FF-720', denomination: 720, costPrice: 88000, sellPrice: 100000, margin: 13.64, sortOrder: 12 },
        { name: '1020 Diamond', sku: 'FF-1020', denomination: 1020, costPrice: 124000, sellPrice: 141000, margin: 13.71, sortOrder: 13 },
        { name: '1530 Diamond', sku: 'FF-1530', denomination: 1530, costPrice: 185000, sellPrice: 210000, margin: 13.51, sortOrder: 14 },
        { name: '2050 Diamond', sku: 'FF-2050', denomination: 2050, costPrice: 245000, sellPrice: 278000, margin: 13.47, sortOrder: 15 },
        { name: '3100 Diamond', sku: 'FF-3100', denomination: 3100, costPrice: 370000, sellPrice: 420000, margin: 13.51, sortOrder: 16 },
        { name: '5180 Diamond', sku: 'FF-5180', denomination: 5180, costPrice: 615000, sellPrice: 695000, margin: 13.01, sortOrder: 17 },
      ],
    },
    {
      name: 'PUBG Mobile',
      slug: 'pubg-mobile',
      logo: '/images/games/pubg-mobile.png',
      banner: '/images/games/banners/pubg-mobile.jpg',
      description: 'Beli UC PUBG Mobile (Unknown Cash) untuk skin, outfit, dan Royale Pass. Proses otomatis 24 jam.',
      isActive: true,
      sortOrder: 3,
      products: [
        { name: '60 UC', sku: 'PUBG-60', denomination: 60, costPrice: 11000, sellPrice: 13000, margin: 18.18, sortOrder: 1, requiresZone: true },
        { name: '325 UC', sku: 'PUBG-325', denomination: 325, costPrice: 55000, sellPrice: 64000, margin: 16.36, sortOrder: 2, requiresZone: true },
        { name: '660 UC', sku: 'PUBG-660', denomination: 660, costPrice: 110000, sellPrice: 127000, margin: 15.45, sortOrder: 3, requiresZone: true },
        { name: '1800 UC', sku: 'PUBG-1800', denomination: 1800, costPrice: 295000, sellPrice: 335000, margin: 13.56, sortOrder: 4, requiresZone: true },
        { name: '3850 UC', sku: 'PUBG-3850', denomination: 3850, costPrice: 625000, sellPrice: 710000, margin: 13.60, sortOrder: 5, requiresZone: true },
        { name: '8100 UC', sku: 'PUBG-8100', denomination: 8100, costPrice: 1310000, sellPrice: 1480000, margin: 12.98, sortOrder: 6, requiresZone: true },
      ],
    },
    {
      name: 'Genshin Impact',
      slug: 'genshin-impact',
      logo: '/images/games/genshin-impact.png',
      banner: '/images/games/banners/genshin-impact.jpg',
      description: 'Top-up Genesis Crystal Genshin Impact. Mendukung server Asia, America, Europe, dan TW/HK/MO.',
      isActive: true,
      sortOrder: 4,
      products: [
        { name: '60 Genesis Crystal', sku: 'GI-60', denomination: 60, costPrice: 12000, sellPrice: 14000, margin: 16.67, sortOrder: 1, requiresZone: true, zoneLabel: 'Server' },
        { name: '300 Genesis Crystal', sku: 'GI-300', denomination: 300, costPrice: 58000, sellPrice: 67000, margin: 15.52, sortOrder: 2, requiresZone: true, zoneLabel: 'Server' },
        { name: '980 Genesis Crystal', sku: 'GI-980', denomination: 980, costPrice: 185000, sellPrice: 214000, margin: 15.68, sortOrder: 3, requiresZone: true, zoneLabel: 'Server' },
        { name: '1980 Genesis Crystal', sku: 'GI-1980', denomination: 1980, costPrice: 370000, sellPrice: 428000, margin: 15.68, sortOrder: 4, requiresZone: true, zoneLabel: 'Server' },
        { name: '3280 Genesis Crystal', sku: 'GI-3280', denomination: 3280, costPrice: 610000, sellPrice: 706000, margin: 15.74, sortOrder: 5, requiresZone: true, zoneLabel: 'Server' },
        { name: '6480 Genesis Crystal', sku: 'GI-6480', denomination: 6480, costPrice: 1205000, sellPrice: 1395000, margin: 15.77, sortOrder: 6, requiresZone: true, zoneLabel: 'Server' },
      ],
    },
    {
      name: 'Honor of Kings',
      slug: 'honor-of-kings',
      logo: '/images/games/honor-of-kings.png',
      banner: '/images/games/banners/honor-of-kings.jpg',
      description: 'Top-up Token Honor of Kings (King of Glory). Proses cepat via User ID dan Zone ID.',
      isActive: true,
      sortOrder: 5,
      products: [
        { name: '60 Token', sku: 'HOK-60', denomination: 60, costPrice: 11500, sellPrice: 13500, margin: 17.39, sortOrder: 1, requiresZone: true },
        { name: '315 Token', sku: 'HOK-315', denomination: 315, costPrice: 57000, sellPrice: 66500, margin: 16.67, sortOrder: 2, requiresZone: true },
        { name: '645 Token', sku: 'HOK-645', denomination: 645, costPrice: 115000, sellPrice: 133000, margin: 15.65, sortOrder: 3, requiresZone: true },
        { name: '1095 Token', sku: 'HOK-1095', denomination: 1095, costPrice: 195000, sellPrice: 225000, margin: 15.38, sortOrder: 4, requiresZone: true },
        { name: '2220 Token', sku: 'HOK-2220', denomination: 2220, costPrice: 395000, sellPrice: 455000, margin: 15.19, sortOrder: 5, requiresZone: true },
        { name: '5550 Token', sku: 'HOK-5550', denomination: 5550, costPrice: 980000, sellPrice: 1130000, margin: 15.31, sortOrder: 6, requiresZone: true },
      ],
    },
    {
      name: 'Valorant',
      slug: 'valorant',
      logo: '/images/games/valorant.png',
      banner: '/images/games/banners/valorant.jpg',
      description: 'Top-up Valorant Points (VP) untuk skin senjata, battle pass, dan aksesoris. Mendukung server SEA.',
      isActive: true,
      sortOrder: 6,
      products: [
        { name: '475 VP', sku: 'VAL-475', denomination: 475, costPrice: 65000, sellPrice: 75000, margin: 15.38, sortOrder: 1 },
        { name: '1000 VP', sku: 'VAL-1000', denomination: 1000, costPrice: 130000, sellPrice: 150000, margin: 15.38, sortOrder: 2 },
        { name: '2050 VP', sku: 'VAL-2050', denomination: 2050, costPrice: 260000, sellPrice: 300000, margin: 15.38, sortOrder: 3 },
        { name: '3650 VP', sku: 'VAL-3650', denomination: 3650, costPrice: 460000, sellPrice: 530000, margin: 15.22, sortOrder: 4 },
        { name: '5350 VP', sku: 'VAL-5350', denomination: 5350, costPrice: 675000, sellPrice: 780000, margin: 15.56, sortOrder: 5 },
        { name: '11000 VP', sku: 'VAL-11000', denomination: 11000, costPrice: 1380000, sellPrice: 1590000, margin: 15.22, sortOrder: 6 },
      ],
    },
    {
      name: 'Roblox',
      slug: 'roblox',
      logo: '/images/games/roblox.png',
      banner: '/images/games/banners/roblox.jpg',
      description: 'Beli Robux Roblox untuk aksesoris avatar, game passes, dan item premium. Kode digital instan.',
      isActive: true,
      sortOrder: 7,
      products: [
        { name: '400 Robux', sku: 'RBX-400', denomination: 400, costPrice: 65000, sellPrice: 75000, margin: 15.38, sortOrder: 1 },
        { name: '800 Robux', sku: 'RBX-800', denomination: 800, costPrice: 125000, sellPrice: 145000, margin: 16.00, sortOrder: 2 },
        { name: '1700 Robux', sku: 'RBX-1700', denomination: 1700, costPrice: 260000, sellPrice: 300000, margin: 15.38, sortOrder: 3 },
        { name: '4500 Robux', sku: 'RBX-4500', denomination: 4500, costPrice: 680000, sellPrice: 785000, margin: 15.44, sortOrder: 4 },
        { name: '10000 Robux', sku: 'RBX-10000', denomination: 10000, costPrice: 1500000, sellPrice: 1730000, margin: 15.33, sortOrder: 5 },
        { name: '22500 Robux', sku: 'RBX-22500', denomination: 22500, costPrice: 3350000, sellPrice: 3880000, margin: 15.82, sortOrder: 6 },
      ],
    },
    {
      name: 'Call of Duty Mobile',
      slug: 'call-of-duty-mobile',
      logo: '/images/games/cod-mobile.png',
      banner: '/images/games/banners/cod-mobile.jpg',
      description: 'Top-up COD Points (CP) Call of Duty Mobile untuk Battle Pass, skin operator, dan bundle senjata.',
      isActive: true,
      sortOrder: 8,
      products: [
        { name: '80 CP', sku: 'COD-80', denomination: 80, costPrice: 15000, sellPrice: 17500, margin: 16.67, sortOrder: 1 },
        { name: '400 CP', sku: 'COD-400', denomination: 400, costPrice: 72000, sellPrice: 83000, margin: 15.28, sortOrder: 2 },
        { name: '800 CP', sku: 'COD-800', denomination: 800, costPrice: 142000, sellPrice: 164000, margin: 15.49, sortOrder: 3 },
        { name: '2000 CP', sku: 'COD-2000', denomination: 2000, costPrice: 350000, sellPrice: 405000, margin: 15.71, sortOrder: 4 },
        { name: '4000 CP', sku: 'COD-4000', denomination: 4000, costPrice: 695000, sellPrice: 805000, margin: 15.83, sortOrder: 5 },
        { name: '8000 CP', sku: 'COD-8000', denomination: 8000, costPrice: 1380000, sellPrice: 1595000, margin: 15.58, sortOrder: 6 },
      ],
    },
    {
      name: 'League of Legends: Wild Rift',
      slug: 'wild-rift',
      logo: '/images/games/wild-rift.png',
      banner: '/images/games/banners/wild-rift.jpg',
      description: 'Top-up Wild Cores Wild Rift untuk skin champion, emote, pose, dan battle pass. Server SEA/JP/KR.',
      isActive: true,
      sortOrder: 9,
      products: [
        { name: '590 Wild Cores', sku: 'WR-590', denomination: 590, costPrice: 75000, sellPrice: 87000, margin: 16.00, sortOrder: 1 },
        { name: '1150 Wild Cores', sku: 'WR-1150', denomination: 1150, costPrice: 145000, sellPrice: 168000, margin: 15.86, sortOrder: 2 },
        { name: '2300 Wild Cores', sku: 'WR-2300', denomination: 2300, costPrice: 290000, sellPrice: 335000, margin: 15.52, sortOrder: 3 },
        { name: '5750 Wild Cores', sku: 'WR-5750', denomination: 5750, costPrice: 720000, sellPrice: 835000, margin: 15.97, sortOrder: 4 },
        { name: '11500 Wild Cores', sku: 'WR-11500', denomination: 11500, costPrice: 1430000, sellPrice: 1655000, margin: 15.73, sortOrder: 5 },
      ],
    },
    {
      name: 'Honkai: Star Rail',
      slug: 'honkai-star-rail',
      logo: '/images/games/honkai-star-rail.png',
      banner: '/images/games/banners/honkai-star-rail.jpg',
      description: 'Top-up Oneiric Shard / Express Supply Pass Honkai Star Rail. Mendukung server Asia, America, Europe.',
      isActive: true,
      sortOrder: 10,
      products: [
        { name: '60 Oneiric Shard', sku: 'HSR-60', denomination: 60, costPrice: 12000, sellPrice: 14000, margin: 16.67, sortOrder: 1, requiresZone: true, zoneLabel: 'Server' },
        { name: '300 Oneiric Shard', sku: 'HSR-300', denomination: 300, costPrice: 58000, sellPrice: 67000, margin: 15.52, sortOrder: 2, requiresZone: true, zoneLabel: 'Server' },
        { name: '980 Oneiric Shard', sku: 'HSR-980', denomination: 980, costPrice: 185000, sellPrice: 214000, margin: 15.68, sortOrder: 3, requiresZone: true, zoneLabel: 'Server' },
        { name: '1980 Oneiric Shard', sku: 'HSR-1980', denomination: 1980, costPrice: 370000, sellPrice: 428000, margin: 15.68, sortOrder: 4, requiresZone: true, zoneLabel: 'Server' },
        { name: '3280 Oneiric Shard', sku: 'HSR-3280', denomination: 3280, costPrice: 610000, sellPrice: 706000, margin: 15.74, sortOrder: 5, requiresZone: true, zoneLabel: 'Server' },
        { name: '6480 Oneiric Shard', sku: 'HSR-6480', denomination: 6480, costPrice: 1205000, sellPrice: 1395000, margin: 15.77, sortOrder: 6, requiresZone: true, zoneLabel: 'Server' },
        { name: 'Express Supply Pass', sku: 'HSR-ESP', denomination: 1, costPrice: 75000, sellPrice: 87000, margin: 16.00, sortOrder: 7, requiresZone: true, zoneLabel: 'Server' },
      ],
    },
    {
      name: 'Zenless Zone Zero',
      slug: 'zenless-zone-zero',
      logo: '/images/games/zenless-zone-zero.png',
      banner: '/images/games/banners/zenless-zone-zero.jpg',
      description: 'Top-up Monochrome Film / Polychrome Zenless Zone Zero. Proses instan via UID dan Server.',
      isActive: true,
      sortOrder: 11,
      products: [
        { name: '60 Monochrome Film', sku: 'ZZZ-60', denomination: 60, costPrice: 12000, sellPrice: 14000, margin: 16.67, sortOrder: 1, requiresZone: true, zoneLabel: 'Server' },
        { name: '300 Monochrome Film', sku: 'ZZZ-300', denomination: 300, costPrice: 58000, sellPrice: 67000, margin: 15.52, sortOrder: 2, requiresZone: true, zoneLabel: 'Server' },
        { name: '980 Monochrome Film', sku: 'ZZZ-980', denomination: 980, costPrice: 185000, sellPrice: 214000, margin: 15.68, sortOrder: 3, requiresZone: true, zoneLabel: 'Server' },
        { name: '1980 Monochrome Film', sku: 'ZZZ-1980', denomination: 1980, costPrice: 370000, sellPrice: 428000, margin: 15.68, sortOrder: 4, requiresZone: true, zoneLabel: 'Server' },
        { name: '3280 Monochrome Film', sku: 'ZZZ-3280', denomination: 3280, costPrice: 610000, sellPrice: 706000, margin: 15.74, sortOrder: 5, requiresZone: true, zoneLabel: 'Server' },
        { name: '6480 Monochrome Film', sku: 'ZZZ-6480', denomination: 6480, costPrice: 1205000, sellPrice: 1395000, margin: 15.77, sortOrder: 6, requiresZone: true, zoneLabel: 'Server' },
      ],
    },
    {
      name: 'Wuthering Waves',
      slug: 'wuthering-waves',
      logo: '/images/games/wuthering-waves.png',
      banner: '/images/games/banners/wuthering-waves.jpg',
      description: 'Top-up Lunite / Astrite Wuthering Waves. Mendukung server global, proses cepat dan aman.',
      isActive: true,
      sortOrder: 12,
      products: [
        { name: '60 Astrite', sku: 'WW-60', denomination: 60, costPrice: 12000, sellPrice: 14000, margin: 16.67, sortOrder: 1, requiresZone: true, zoneLabel: 'Server' },
        { name: '300 Astrite', sku: 'WW-300', denomination: 300, costPrice: 58000, sellPrice: 67000, margin: 15.52, sortOrder: 2, requiresZone: true, zoneLabel: 'Server' },
        { name: '980 Astrite', sku: 'WW-980', denomination: 980, costPrice: 185000, sellPrice: 214000, margin: 15.68, sortOrder: 3, requiresZone: true, zoneLabel: 'Server' },
        { name: '1980 Astrite', sku: 'WW-1980', denomination: 1980, costPrice: 370000, sellPrice: 428000, margin: 15.68, sortOrder: 4, requiresZone: true, zoneLabel: 'Server' },
        { name: '3280 Astrite', sku: 'WW-3280', denomination: 3280, costPrice: 610000, sellPrice: 706000, margin: 15.74, sortOrder: 5, requiresZone: true, zoneLabel: 'Server' },
        { name: '6480 Astrite', sku: 'WW-6480', denomination: 6480, costPrice: 1205000, sellPrice: 1395000, margin: 15.77, sortOrder: 6, requiresZone: true, zoneLabel: 'Server' },
      ],
    },
    {
      name: 'Genshin Impact (Hoyoverse)',
      slug: 'hoyoverse',
      logo: '/images/games/hoyoverse.png',
      banner: '/images/games/banners/hoyoverse.jpg',
      description: 'Top-up Genesis Crystal untuk Genshin Impact, Honkai Star Rail, Zenless Zone Zero, dan Honkai Impact 3rd via Hoyoverse.',
      isActive: false,
      sortOrder: 13,
      products: [],
    },
    {
      name: 'Arena of Valor',
      slug: 'arena-of-valor',
      logo: '/images/games/arena-of-valor.png',
      banner: '/images/games/banners/arena-of-valor.jpg',
      description: 'Top-up Voucher Arena of Valor (AOV) untuk skin hero, battle pass, dan item eksklusif. Server Indonesia/SEA.',
      isActive: true,
      sortOrder: 14,
      products: [
        { name: '72 Voucher', sku: 'AOV-72', denomination: 72, costPrice: 13000, sellPrice: 15000, margin: 15.38, sortOrder: 1 },
        { name: '219 Voucher', sku: 'AOV-219', denomination: 219, costPrice: 38000, sellPrice: 44000, margin: 15.79, sortOrder: 2 },
        { name: '445 Voucher', sku: 'AOV-445', denomination: 445, costPrice: 76000, sellPrice: 88000, margin: 15.79, sortOrder: 3 },
        { name: '720 Voucher', sku: 'AOV-720', denomination: 720, costPrice: 123000, sellPrice: 142000, margin: 15.45, sortOrder: 4 },
        { name: '1095 Voucher', sku: 'AOV-1095', denomination: 1095, costPrice: 187000, sellPrice: 216000, margin: 15.51, sortOrder: 5 },
        { name: '2220 Voucher', sku: 'AOV-2220', denomination: 2220, costPrice: 378000, sellPrice: 437000, margin: 15.61, sortOrder: 6 },
      ],
    },
    {
      name: 'Lost Saga',
      slug: 'lost-saga',
      logo: '/images/games/lost-saga.png',
      banner: '/images/games/banners/lost-saga.jpg',
      description: 'Top-up Cash Lost Saga untuk hero, skin, dan item premium. Proses otomatis via ID karakter.',
      isActive: true,
      sortOrder: 15,
      products: [
        { name: '5000 Cash', sku: 'LS-5000', denomination: 5000, costPrice: 50000, sellPrice: 58000, margin: 16.00, sortOrder: 1 },
        { name: '10000 Cash', sku: 'LS-10000', denomination: 10000, costPrice: 98000, sellPrice: 113000, margin: 15.31, sortOrder: 2 },
        { name: '25000 Cash', sku: 'LS-25000', denomination: 25000, costPrice: 240000, sellPrice: 278000, margin: 15.83, sortOrder: 3 },
        { name: '50000 Cash', sku: 'LS-50000', denomination: 50000, costPrice: 475000, sellPrice: 550000, margin: 15.79, sortOrder: 4 },
        { name: '100000 Cash', sku: 'LS-100000', denomination: 100000, costPrice: 940000, sellPrice: 1085000, margin: 15.43, sortOrder: 5 },
      ],
    },
    {
      name: 'Point Blank',
      slug: 'point-blank',
      logo: '/images/games/point-blank.png',
      banner: '/images/games/banners/point-blank.jpg',
      description: 'Top-up Cash Point Blank (PB) untuk senjata, skin, karakter, dan item premium. Server Indonesia.',
      isActive: true,
      sortOrder: 16,
      products: [
        { name: '5000 Cash', sku: 'PB-5000', denomination: 5000, costPrice: 48000, sellPrice: 56000, margin: 16.67, sortOrder: 1 },
        { name: '10000 Cash', sku: 'PB-10000', denomination: 10000, costPrice: 95000, sellPrice: 110000, margin: 15.79, sortOrder: 2 },
        { name: '20000 Cash', sku: 'PB-20000', denomination: 20000, costPrice: 188000, sellPrice: 218000, margin: 15.96, sortOrder: 3 },
        { name: '50000 Cash', sku: 'PB-50000', denomination: 50000, costPrice: 465000, sellPrice: 540000, margin: 16.13, sortOrder: 4 },
        { name: '100000 Cash', sku: 'PB-100000', denomination: 100000, costPrice: 920000, sellPrice: 1065000, margin: 15.76, sortOrder: 5 },
      ],
    },
  ]

  for (const gameData of games) {
    const { products, ...gameInfo } = gameData
    const game = await prisma.game.upsert({
      where: { slug: gameInfo.slug },
      update: gameInfo,
      create: gameInfo,
    })

    if (products.length > 0) {
      for (const product of products) {
        await prisma.product.upsert({
          where: { sku: product.sku },
          update: { ...product, gameId: game.id },
          create: { ...product, gameId: game.id },
        })
      }
    }
    console.log(`✓ Seeded: ${game.name} (${products.length} products)`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })