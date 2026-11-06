# NEXATOPUP - Panduan Deployment Production (VPS)

## Arsitektur Deployment

```
Internet → Nginx (SSL, Rate Limit) → Next.js (Docker) → PostgreSQL
                                                    → Redis
```

## Spesifikasi VPS Minimum

- **OS**: Ubuntu 22.04 LTS / 24.04 LTS
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Storage**: 50 GB SSD
- **Network**: IPv4 publik, port 80, 443, 22

## Cara Deploy yang Didukung Repo Ini

Repo ini menyediakan `Dockerfile`, `docker-compose.prod.yml`, migrasi Prisma awal, dan contoh environment production. VPS dan domain belum termasuk; siapkan VPS Ubuntu dengan Docker terlebih dahulu. Domain bisa disambungkan belakangan untuk uji akses, tetapi HTTPS dan domain wajib sebelum mengaktifkan pembayaran production/webhook.

1. Clone repo di VPS, lalu buat environment privat:

   ```bash
   cp .env.production.example .env.production
   chmod 600 .env.production
   ```

2. Edit `.env.production`. Jika belum punya domain, untuk uji awal yang hanya dilakukan dari VPS melalui SSH, gunakan `http://localhost:3000` untuk kedua URL aplikasi. Jangan buka port 3000 langsung ke internet. Setelah punya domain dan HTTPS, ganti keduanya ke `https://domain-anda`. Isi rahasia dengan nilai acak dan gunakan kredensial Midtrans sandbox dahulu. Buat nilai acak dengan:

   ```bash
   openssl rand -hex 32
   ```

   Gunakan hasil berbeda untuk `NEXTAUTH_SECRET`, `DB_PASSWORD`, dan password bootstrap admin. Jangan commit atau kirim `.env.production`.

3. Validasi konfigurasi tanpa mencetak nilai rahasia, lalu build dan jalankan:

   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet
   docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
   ```

   App hanya dipublish ke `127.0.0.1:3000`; pasang Nginx + HTTPS sebelum membuka layanan ke internet. PostgreSQL tidak dipublish ke port publik. Migrasi dijalankan otomatis sebelum app mulai.

4. Isi katalog dan buat akun admin awal:

   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml run --rm --entrypoint npx migrate tsx prisma/seed.ts
   ```

   Seed production hanya membuat akun admin dari `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD`; tidak membuat akun test.    Hapus kedua nilai bootstrap dari `.env.production` setelah seed. App tidak menerima variabel bootstrap tersebut. Recreate app:

   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml up -d --force-recreate app
   ```

   Jangan gunakan akun demo `admin123`/`user123` di production. Kredensial demo hanya untuk development.

5. Periksa status dan log:

   ```bash
   docker compose --env-file .env.production -f docker-compose.prod.yml ps
   docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 app
   ```

   Sebelum membuka pembayaran production, setelah domain HTTPS siap, ganti semua kredensial sandbox dengan kredensial live, set `MIDTRANS_IS_PRODUCTION=true`, daftarkan webhook di dashboard Midtrans, dan uji transaksi end-to-end.

Simpan backup PostgreSQL di luar VPS dan uji proses restore sebelum menerima transaksi nyata. Jangan jalankan `db:push` untuk production; deployment menggunakan migrasi yang tersimpan di `prisma/migrations`.

## 1. Setup VPS

### Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip htop ufw fail2ban
```

### Setup Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (v2)
sudo apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version

# Logout & login again for group changes
newgrp docker
```

## 2. Deploy Application

The manual setup previously documented in sections 2–4 is superseded by **Cara Deploy yang Didukung Repo Ini** above. Use the committed production Compose file and continue with the Nginx and HTTPS sections below; do not create a second Dockerfile or Compose file.

### Clone Repository

```bash
cd /opt
sudo mkdir nexatopup
sudo chown $USER:$USER nexatopup
cd nexatopup
git clone <repository-url> .
```

### Setup Environment

```bash
cp .env.example .env.production
```

Edit `.env.production` dengan nilai production:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

DATABASE_URL=postgresql://nexatopup:strong_password@localhost:5432/nexatopup?schema=public

MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxx
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_MERCHANT_ID=G123456789

UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

EMAIL_SERVER_HOST=smtp.yourprovider.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=noreply@yourdomain.com
EMAIL_SERVER_PASSWORD=your_smtp_password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_REPLY_TO=support@yourdomain.com
```

### Generate Secure Secrets

```bash
# NEXTAUTH_SECRET (32+ chars)
openssl rand -base64 32

# Database password
openssl rand -base64 24
```

## 3. Setup Database & Redis

### Option A: Docker Compose (Recommended for simple setup)

```bash
# Create docker-compose.prod.yml
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: nexatopup-postgres
    environment:
      POSTGRES_USER: nexatopup
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: nexatopup
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nexatopup -d nexatopup"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: nexatopup-redis
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
EOF

# Set database password
export DB_PASSWORD=$(openssl rand -base64 24)

# Start services
docker compose -f docker-compose.prod.yml up -d
```

### Option B: External Managed Services (Recommended for production)

Gunakan:
- **PostgreSQL**: Supabase, Neon, Railway, AWS RDS, DigitalOcean Managed DB
- **Redis**: Upstash, Redis Cloud, AWS ElastiCache

Update `DATABASE_URL` dan `UPSTASH_REDIS_REST_URL` di `.env.production`

## 4. Build & Run Application

### Build Docker Image

```bash
cat > Dockerfile << 'EOF'
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma Client
FROM base AS prisma
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma/
RUN npx prisma generate

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=prisma /app/node_modules ./node_modules
COPY --from=prisma /app/prisma ./prisma/
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
EOF

# Update next.config.ts for standalone output
# Add: output: 'standalone',
```

### Build & Start

```bash
# Build image
docker build -t nexatopup:latest .

# Run container
docker run -d \
  --name nexatopup-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  nexatopup:latest
```

### Or Use Docker Compose for App

```yaml
# Add to docker-compose.prod.yml
  app:
    build: .
    container_name: nexatopup-app
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
```

## 5. Setup Nginx Reverse Proxy

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Create nginx config
sudo tee /etc/nginx/conf.d/nexatopup-rate-limit.conf << 'EOF'
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
EOF

sudo tee /etc/nginx/sites-available/nexatopup << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/nexatopup /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Setup SSL with Let's Encrypt

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## 7. Database Migration

```bash
# Run new migrations using the dedicated migration image
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm migrate

# Or if running locally
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

## 8. Setup PM2 (Alternative to Docker for App)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'nexatopup',
    script: 'node',
    args: 'server.js',
    cwd: '/opt/nexatopup',
    env_file: '.env.production',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    error_file: '/var/log/nexatopup/error.log',
    out_file: '/var/log/nexatopup/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 9. Setup Log Rotation

```bash
sudo tee /etc/logrotate.d/nexatopup << 'EOF'
/var/log/nexatopup/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

## 10. Monitoring & Health Checks

### Health Check Endpoint

```bash
curl https://yourdomain.com/api/health
```

### Setup Uptime Monitoring

Gunakan: UptimeRobot, Better Uptime, atau Pingdom

### Log Monitoring

```bash
# View logs
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
# or
pm2 logs nexatopup

# System logs
journalctl -u nginx -f
```

## 11. Backup Strategy

### Database Backup Script

```bash
cat > /opt/backup-db.sh << 'EOF'
#!/bin/bash
set -euo pipefail
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"

mkdir -p "$BACKUP_DIR"

cd /opt/nexatopup
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres pg_dump -U nexatopup nexatopup | gzip > "$BACKUP_DIR/nexatopup_$DATE.sql.gz"

# Keep last 30 days
find "$BACKUP_DIR" -name "nexatopup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: nexatopup_$DATE.sql.gz"
EOF

chmod +x /opt/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# 0 2 * * * /opt/backup-db.sh
```

### Restore Database

```bash
cd /opt/nexatopup
gunzip -c /opt/backups/nexatopup_20240115_020000.sql.gz | docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres psql -U nexatopup -d nexatopup
```

## 12. Security Hardening

### Fail2Ban for Nginx

```bash
sudo tee /etc/fail2ban/jail.d/nginx.conf << 'EOF'
[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 3600
maxretry = 10
EOF

sudo systemctl restart fail2ban
```

### SSH Hardening

```bash
sudo tee /etc/ssh/sshd_config.d/99-hardening.conf << 'EOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
EOF

sudo systemctl reload sshd
```

## 13. Post-Deployment Checklist

- [ ] SSL certificate valid & auto-renewal working
- [ ] Health check endpoint responding
- [ ] Payment gateway (Midtrans) webhook configured
- [ ] Midtrans production keys configured
- [ ] Test transaction successful (sandbox → production)
- [ ] Email sending working
- [ ] Database backups running
- [ ] Log rotation configured
- [ ] Monitoring alerts configured
- [ ] Rate limiting working
- [ ] Admin dashboard accessible
- [ ] Customer flow: browse → order → pay → success

## 14. Rollback Procedure

```bash
# Quick rollback to previous Docker image
docker tag nexatopup:previous nexatopup:latest
docker compose restart app

# Or PM2 rollback
pm2 stop nexatopup
git checkout previous-stable-tag
npm run build
pm2 start ecosystem.config.js
```

## 15. Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.prod.yml
services:
  app:
    deploy:
      replicas: 3
    # Add to nginx upstream
```

### Database Connection Pooling

Gunakan PgBouncer untuk pooling connection PostgreSQL

### CDN untuk Static Assets

Konfigurasi Cloudflare atau AWS CloudFront untuk `/images`, `/_next/static`

---

## Quick Commands Reference

```bash
# View app logs
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app

# Restart app
docker compose --env-file .env.production -f docker-compose.prod.yml restart app

# Run migration
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm migrate

# Backup DB
/opt/backup-db.sh

# Check SSL expiry
certbot certificates

# Update application
cd /opt/nexatopup
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```