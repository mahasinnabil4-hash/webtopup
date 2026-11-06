# NEXATOPUP - Panduan Instalasi Lokal

## Prasyarat

- Node.js 18+ (direkomendasikan 20+)
- PostgreSQL 15+
- Redis 7+ (untuk rate limiting & session)
- pnpm (direkomendasikan) atau npm/yarn

## 1. Clone Repository

```bash
git clone <repository-url>
cd nexatopup
```

## 2. Install Dependencies

```bash
pnpm install
# atau
npm install
```

## 3. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` dengan konfigurasi lokal Anda:

```env
# Database (gunakan Docker Compose atau PostgreSQL lokal)
DATABASE_URL=postgresql://nexatopup:nexatopup_dev_password@localhost:5432/nexatopup?schema=public

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production-min-32-chars

# Payment Gateway (Midtrans Sandbox)
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxx
MIDTRANS_IS_PRODUCTION=false

# Email (opsional untuk development)
# EMAIL_SERVER_HOST=smtp.example.com
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=
# EMAIL_SERVER_PASSWORD=
# EMAIL_FROM=noreply@localhost
```

## 4. Setup Database dengan Docker

```bash
# Start PostgreSQL & Redis
docker compose up -d

# Verify containers running
docker compose ps
```

## 5. Initialize Database

```bash
# Generate Prisma Client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database with sample data
pnpm db:seed
```

## 6. Start Development Server

```bash
pnpm dev
```

Buka http://localhost:3000

## 7. Login Admin

- URL: http://localhost:3000/admin/login
- Email: admin@nexatopup.com
- Password: admin123

## 8. Test Login User

- URL: http://localhost:3000/login
- Email: user@nexatopup.com
- Password: user123

---

## Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
docker compose logs postgres

# Restart containers
docker compose restart
```

### Prisma Client Not Generated

```bash
pnpm db:generate
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Migration Issues

```bash
# Reset database (WARNING: deletes all data)
pnpm db:migrate:reset

# Or push schema directly (development only)
pnpm db:push
```

---

## Development Commands

```bash
# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Open Prisma Studio
pnpm db:studio

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Project Structure

```
nexatopup/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Seed script
│   └── migrations/        # Migration files
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (customer)/    # Customer pages
│   │   ├── (admin)/       # Admin pages
│   │   └── api/           # API routes
│   ├── components/        # React components
│   ├── lib/               # Core libraries
│   ├── hooks/             # Custom hooks
│   └── types/             # TypeScript types
├── public/                # Static assets
├── docker-compose.yml     # Docker services
└── docs/                  # Documentation
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| NEXTAUTH_URL | Yes | Base URL aplikasi |
| NEXTAUTH_SECRET | Yes | Secret untuk JWT (min 32 chars) |
| MIDTRANS_SERVER_KEY | Yes* | Midtrans server key |
| MIDTRANS_CLIENT_KEY | Yes* | Midtrans client key |
| MIDTRANS_IS_PRODUCTION | No | true/false (default: false) |
| EMAIL_SERVER_HOST | No | SMTP host |
| EMAIL_SERVER_PORT | No | SMTP port (default: 587) |
| EMAIL_SERVER_USER | No | SMTP username |
| EMAIL_SERVER_PASSWORD | No | SMTP password |
| EMAIL_FROM | No | Email pengirim |

*Required untuk fitur pembayaran