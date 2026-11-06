# NEXATOPUP - Game Top-up Platform

Production-ready game top-up platform for Indonesian market with real payment gateway integration (Midtrans/Xendit) and supplier API integration.

## 🚀 Features

### Customer Features
- **Game Catalog**: Browse 7+ popular games (MLBB, Free Fire, PUBG, Genshin, HOK, Valorant, Roblox)
- **Product Selection**: Dynamic denominations with real-time pricing
- **Order Management**: Create orders, track status, guest order check
- **Payment Gateway**: Midtrans (primary) + Xendit (fallback)
  - QRIS, GoPay, DANA, OVO, ShopeePay
  - Virtual Account (BCA, BNI, BRI, Mandiri, Permata, CIMB)
  - Convenience Store (Alfamart, Indomaret)
  - Bank Transfer & Credit Card
- **Order Tracking**: Real-time status updates via webhooks
- **Guest Checkout**: No registration required for purchases

### Admin Features
- **Dashboard**: Real-time stats (orders, revenue, users, pending)
- **Order Management**: Full CRUD, status updates, filtering, pagination
- **Game Management**: CRUD games with logo/banner, active toggle
- **Product Management**: CRUD products with auto price calculation
- **Supplier Management**: Multiple suppliers (API + Manual), game/product mapping
- **User Management**: Customer & admin users, role-based access
- **Settings**: Centralized configuration (site, payment, email, supplier)
- **Activity Logs**: Complete audit trail with filters

### Technical Features
- **Next.js 14** (App Router) + TypeScript
- **Prisma ORM** + PostgreSQL
- **NextAuth.js v5** (Session + Role-based auth)
- **Midtrans** (Primary) + **Xendit** (Fallback) payment
- **Supplier Adapter Pattern** (Digiflazz + Manual + Extensible)
- **Docker** deployment ready
- **Security**: Rate limiting, webhook verification, input validation, audit logs

---

## 📋 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL 15+, Prisma ORM |
| Auth | NextAuth.js v5 (Credentials + Session) |
| Payment | Midtrans (Primary), Xendit (Fallback) |
| Supplier | Adapter Pattern (Digiflazz + Manual) |
| State | TanStack Query, Zustand |
| Forms | React Hook Form + Zod |
| UI | shadcn/ui, Framer Motion, Lucide React |
| Deploy | Docker, Nginx, PM2 |

---

## 🏗️ Project Structure

```
nexatopup/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed script
│   └── migrations/            # Migration files
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (customer)/        # Customer pages
│   │   │   ├── games/         # Game listing & detail
│   │   │   ├── orders/        # Order history & detail
│   │   │   ├── payment/       # Payment pages
│   │   │   ├── check-order/   # Guest order check
│   │   │   └── contact/       # Contact, privacy, terms
│   │   ├── (admin)/           # Admin pages
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   ├── orders/        # Order management
│   │   │   ├── games/         # Game management
│   │   │   ├── products/      # Product management
│   │   │   ├── suppliers/     # Supplier management
│   │   │   ├── users/         # User management
│   │   │   ├── settings/      # Settings
│   │   │   └── logs/          # Activity logs
│   │   └── api/               # API Routes
│   │       ├── auth/          # NextAuth
│   │       ├── customer/      # Customer APIs
│   │       └── admin/         # Admin APIs
│   ├── components/            # React Components
│   │   ├── ui/                # shadcn/ui base components
│   │   ├── layout/            # Header, Footer, AdminLayout
│   │   ├── customer/          # Customer components
│   │   ├── admin/             # Admin components
│   │   └── forms/             # Form components
│   ├── lib/                   # Core Libraries
│   │   ├── auth/              # NextAuth config
│   │   ├── db/                # Prisma + Queries
│   │   ├── payments/          # Midtrans, Xendit, Factory
│   │   ├── suppliers/         # Adapters, Processor
│   │   ├── utils/             # Crypto, Validation, Format
│   │   ├── email/             # Email sender
│   │   └── rate-limit/        # Rate limiter
│   ├── hooks/                 # Custom Hooks
│   ├── store/                 # Zustand Stores
│   ├── types/                 # TypeScript Types
│   └── constants/             # Constants
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
├── docs/
│   ├── INSTALLATION.md
│   ├── DEPLOYMENT.md
│   ├── PAYMENT_GATEWAY_SETUP.md
│   ├── SUPPLIER_API_SETUP.md
│   ├── ADMIN_GUIDE.md
│   └── API_REFERENCE.md
├── .env.example
├── .env.local
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- pnpm (recommended)

### Installation

```bash
# Clone & install
git clone <repo-url>
cd nexatopup
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your config

# Start database (Docker)
docker compose up -d

# Initialize database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Start dev server
pnpm dev
```

Visit http://localhost:3000

### Default Accounts
These credentials are for local development only. Never use them in production.

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@nexatopup.com | admin123 |
| Test User | user@nexatopup.com | user123 |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Installation](docs/INSTALLATION.md) | Local development setup |
| [Deployment](docs/DEPLOYMENT.md) | VPS production deployment (Docker/Nginx) |
| [Payment Gateway](docs/PAYMENT_GATEWAY_SETUP.md) | Midtrans/Xendit configuration |
| [Supplier API](docs/SUPPLIER_API_SETUP.md) | Supplier integration guide |
| [Admin Guide](docs/ADMIN_GUIDE.md) | Dashboard usage guide |
| [API Reference](docs/API_REFERENCE.md) | Complete API documentation |

---

## 🔧 Key Configurations

### Environment Variables
```env
# App
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/nexatopup

# Midtrans (Primary)
MIDTRANS_SERVER_KEY=Mid-server-xxx
MIDTRANS_CLIENT_KEY=Mid-client-xxx
MIDTRANS_IS_PRODUCTION=true

# Xendit (Fallback)
XENDIT_API_KEY=xnd_production_xxx
XENDIT_CALLBACK_TOKEN=xxx

# Digiflazz Supplier
DIGIFLAZZ_USERNAME=xxx
DIGIFLAZZ_API_KEY=xxx

# Email (Optional)
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_USER=noreply@yourdomain.com
EMAIL_SERVER_PASSWORD=xxx
```

### Payment Gateway Webhooks
Configure in provider dashboards:
- **Midtrans**: `https://yourdomain.com/api/customer/payment/webhook/midtrans`
- **Xendit**: `https://yourdomain.com/api/customer/payment/webhook/xendit`

---

## 🐳 Docker Deployment

```bash
# Build image
docker build -t nexatopup:latest .

# Run with Docker Compose
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker exec nexatopup-app npx prisma migrate deploy
```

---

## 🧪 Testing

```bash
# Unit & Integration tests
pnpm test

# E2E tests
pnpm test:e2e

# Linting
pnpm lint

# Type checking
pnpm typecheck
```

---

## 🔒 Security Features

- **Rate Limiting**: Auth (10/15min), Payment (30/min), API (100/min)
- **Webhook Verification**: Midtrans SHA512, Xendit Callback Token
- **Input Validation**: Zod schemas on all endpoints
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: React auto-escaping
- **CSRF Protection**: NextAuth + SameSite Cookies
- **Secure Cookies**: HttpOnly, Secure, SameSite=Lax
- **Password Hashing**: bcryptjs (12 rounds)
- **Audit Logs**: Complete activity tracking

---

## 📦 Supplier Integration

### Built-in Adapters
1. **Manual Supplier** (Default) - Admin processes via dashboard
2. **Digiflazz** - Full API integration with polling

### Adding New Supplier
```typescript
// 1. Create adapter in src/lib/suppliers/your-supplier.ts
export class YourSupplierAdapter extends BaseSupplierAdapter {
  name = 'Your Supplier'
  code = 'YOUR_CODE'
  async submitOrder(request) { ... }
  async checkStatus(id) { ... }
}

// 2. Register in src/lib/suppliers/factory.ts
case 'YOUR_CODE': adapter = new YourSupplierAdapter()

// 3. Add via Admin Dashboard → Suppliers → New
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 📞 Support

- **Documentation**: Check `docs/` folder
- **Issues**: GitHub Issues
- **Email**: support@nexatopup.com

---

**Built with ❤️ for Indonesian gamers**