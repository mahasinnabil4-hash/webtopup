# NEXATOPUP - API Reference

## Base URL
```
Production: https://yourdomain.com/api
Development: http://localhost:3000/api
```

## Authentication

### Customer (Session Cookie)
- Login via `/api/auth/[...nextauth]`
- Session cookie otomatis dikirim browser
- Role: `USER`

### Admin (Session Cookie)
- Login via `/admin/login`
- Session cookie otomatis dikirim browser
- Role: `ADMIN` / `SUPER_ADMIN`

### API Key (Future)
- Header: `Authorization: Bearer <api_key>`
- Untuk integrasi server-to-server

---

## Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Customer APIs

### Games

#### GET `/api/customer/games`
**Get all active games with products**

**Response:**
```json
{
  "games": [
    {
      "id": "clx...",
      "name": "Mobile Legends: Bang Bang",
      "slug": "mobile-legends",
      "logo": "https://...",
      "banner": "https://...",
      "description": "MOBA 5v5...",
      "isActive": true,
      "sortOrder": 1,
      "products": [
        {
          "id": "clx...",
          "name": "86 Diamonds",
          "sku": "MLBB_86_DIA",
          "denomination": 86,
          "sellPrice": 13000,
          "costPrice": 10000,
          "margin": 30,
          "isActive": true,
          "requiresZone": true,
          "zoneLabel": "Zone ID",
          "sortOrder": 1
        }
      ]
    }
  ]
}
```

#### GET `/api/customer/products?gameId=<id>`
**Get products for specific game**

**Query Params:**
- `gameId` (required): Game ID

**Response:**
```json
{
  "products": [
    {
      "id": "clx...",
      "gameId": "clx...",
      "name": "86 Diamonds",
      "sku": "MLBB_86_DIA",
      "denomination": 86,
      "sellPrice": 13000,
      "requiresZone": true,
      "zoneLabel": "Zone ID"
    }
  ]
}
```

### Orders

#### POST `/api/customer/orders`
**Create new order**

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "productId": "clx...",
  "userGameId": "12345678",
  "userZoneId": "1234",
  "quantity": 1
}
```

**Response:**
```json
{
  "order": {
    "id": "clx...",
    "orderNumber": "TOPUP-ABC123",
    "userId": "clx...",
    "productId": "clx...",
    "gameId": "clx...",
    "userGameId": "12345678",
    "userZoneId": "1234",
    "quantity": 1,
    "unitPrice": 13000,
    "totalPrice": 13000,
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: "Product not found or inactive"
- `400`: "Game is not active"
- `400`: "User ID is required"

#### GET `/api/customer/orders`
**Get current user's orders**

**Query Params:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "orders": [
    {
      "id": "clx...",
      "orderNumber": "TOPUP-ABC123",
      "status": "SUCCESS",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "totalPrice": 13000,
      "quantity": 1,
      "product": {
        "name": "86 Diamonds",
        "game": { "name": "Mobile Legends", "slug": "mobile-legends", "logo": "..." }
      },
      "payment": {
        "paymentMethod": "GOPAY",
        "paidAt": "2024-01-15T10:31:00.000Z"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

#### GET `/api/customer/orders/:id`
**Get order detail**

**Response:**
```json
{
  "order": {
    "id": "clx...",
    "orderNumber": "TOPUP-ABC123",
    "status": "SUCCESS",
    "userId": "clx...",
    "productId": "clx...",
    "gameId": "clx...",
    "userGameId": "12345678",
    "userZoneId": "1234",
    "quantity": 1,
    "unitPrice": 13000,
    "totalPrice": 13000,
    "status": "SUCCESS",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "paidAt": "2024-01-15T10:31:00.000Z",
    "completedAt": "2024-01-15T10:32:00.000Z",
    "user": { "id": "clx...", "email": "user@email.com", "fullName": "John", "phone": "08123456789" },
    "product": { "name": "86 Diamonds", "game": { "name": "Mobile Legends", "logo": "..." } },
    "game": { "name": "Mobile Legends", "logo": "..." },
    "payment": {
      "paymentMethod": "GOPAY",
      "amount": 13000,
      "paidAt": "2024-01-15T10:31:00.000Z",
      "gatewayTransactionId": "midtrans-xxx"
    },
    "supplierTransaction": {
      "supplierOrderId": "DIGI-12345",
      "status": "SUCCESS"
    }
  }
}
```

#### POST `/api/customer/orders/check`
**Guest check order (no auth required)**

**Body:**
```json
{
  "orderNumber": "TOPUP-ABC123",
  "phone": "08123456789"
}
```
*Either phone OR email required*

**Response:**
```json
{
  "order": { ...same as GET /orders/:id... }
}
```

**Error:**
- `404`: "Order not found"
- `403`: "Phone number does not match"
- `400`: "Either phone or email is required"

### Payment

#### POST `/api/customer/payment/create?orderId=<id>`
**Create payment for order**

**Query Params:**
- `orderId` (required)

**Body (optional):**
```json
{
  "paymentMethod": "GOPAY"
}
```

**Response:**
```json
{
  "paymentUrl": "https://app.sandbox.midtrans.com/snap/v2/vtweb/...",
  "token": "midtrans-token-xxx",
  "transactionId": "midtrans-transaction-id",
  "vaNumbers": [
    { "bank": "bca", "vaNumber": "1234567890" },
    { "bank": "bni", "vaNumber": "9876543210" }
  ],
  "qrCode": "https://api.midtrans.com/v2/.../qrcode",
  "qrString": "00020101021126670016COM.NOBUBANK.WWW0118936009130000000000..."
}
```

**Error:**
- `400`: "Order not found"
- `400`: "Order cannot be paid"
- `400`: "Payment already pending"
- `500`: "Failed to create payment"

#### GET `/api/customer/payment/:orderId`
**Get payment status**

**Response:**
```json
{
  "payment": {
    "id": "clx...",
    "orderId": "clx...",
    "paymentGateway": "midtrans",
    "gatewayTransactionId": "midtrans-transaction-id",
    "paymentMethod": "GOPAY",
    "amount": 13000,
    "status": "SETTLEMENT",
    "paidAt": "2024-01-15T10:31:00.000Z",
    "gatewayResponse": { ... }
  }
}
```

### Webhooks (No Auth Required)

#### POST `/api/customer/payment/webhook/midtrans`
**Midtrans Payment Notification**

**Headers:**
- `Content-Type: application/json`

**Body (Midtrans format):**
```json
{
  "transaction_id": "midtrans-transaction-id",
  "order_id": "TOPUP-ABC123",
  "gross_amount": "13000.00",
  "payment_type": "gopay",
  "transaction_time": "2024-01-15 10:31:00",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "signature_key": "sha512-hash..."
}
```

**Response:**
```json
{ "status": "ok" }
```

#### POST `/api/customer/payment/webhook/xendit`
**Xendit Invoice Callback**

**Headers:**
- `Content-Type: application/json`
- `x-callback-token: your_callback_token`

**Body (Xendit format):**
```json
{
  "id": "xendit-invoice-id",
  "external_id": "TOPUP-ABC123",
  "status": "PAID",
  "amount": 13000,
  "paid_at": "2024-01-15T10:31:00.000Z",
  "payment_method": "EWALLET",
  "payment_channel": "GOPAY"
}
```

**Response:**
```json
{ "status": "ok" }
```

---

## Admin APIs

*All admin APIs require ADMIN/SUPER_ADMIN role*

### Stats

#### GET `/api/admin/stats`
**Get dashboard statistics**

**Response:**
```json
{
  "stats": {
    "totalOrders": 1250,
    "totalRevenue": 125000000,
    "revenueToday": 5000000,
    "revenueMonth": 45000000,
    "totalUsers": 850,
    "totalGames": 7,
    "totalProducts": 45,
    "pendingOrders": 12,
    "statusCounts": {
      "PENDING": 5,
      "WAITING_PAYMENT": 3,
      "PAID": 2,
      "PROCESSING": 2,
      "SUCCESS": 1200,
      "FAILED": 30,
      "REFUNDED": 5,
      "CANCELLED": 3
    }
  },
  "recentOrders": [
    { "id": "...", "orderNumber": "TOPUP-XXX", "status": "SUCCESS", ... }
  ]
}
```

### Games

#### GET `/api/admin/games`
**List games with pagination**

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional)
- `isActive` (optional: true/false)

**Response:**
```json
{
  "games": [
    {
      "id": "clx...",
      "name": "Mobile Legends",
      "slug": "mobile-legends",
      "logo": "https://...",
      "isActive": true,
      "sortOrder": 1,
      "_count": { "products": 9 },
      "supplierMappings": [
        { "supplierGameCode": "ML", "supplier": { "code": "DIGIFLAZZ" } }
      ]
    }
  ],
  "total": 7,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

#### POST `/api/admin/games`
**Create game**

**Body:**
```json
{
  "name": "New Game",
  "slug": "new-game",
  "logo": "https://example.com/logo.png",
  "banner": "https://example.com/banner.jpg",
  "description": "Game description",
  "isActive": true,
  "sortOrder": 10
}
```

#### PUT `/api/admin/games/:id`
**Update game**

**Body:** (partial)
```json
{
  "name": "Updated Name",
  "isActive": false
}
```

#### DELETE `/api/admin/games/:id`
**Delete game**

### Products

#### GET `/api/admin/products`
**List products with pagination**

**Query Params:**
- `page`, `limit`, `search`, `gameId`, `isActive`

**Response:** Includes game info & supplier mappings

#### POST `/api/admin/products`
**Create product**

**Body:**
```json
{
  "gameId": "clx...",
  "name": "86 Diamonds",
  "sku": "MLBB_86_DIA",
  "denomination": 86,
  "costPrice": 10000,
  "sellPrice": 13000,
  "margin": 30,
  "isActive": true,
  "requiresZone": true,
  "zoneLabel": "Zone ID",
  "sortOrder": 1
}
```

#### PUT `/api/admin/products/:id`
**Update product**

#### DELETE `/api/admin/products/:id`
**Delete product**

### Orders

#### GET `/api/admin/orders`
**List all orders with filters**

**Query Params:**
- `page`, `limit`, `search`
- `status`: PENDING, WAITING_PAYMENT, PAID, PROCESSING, SUCCESS, FAILED, REFUNDED, CANCELLED
- `gameId`, `userId`
- `dateFrom`, `dateTo` (ISO date)

#### PUT `/api/admin/orders`
**Update order status**

**Body:**
```json
{
  "id": "clx...",
  "status": "SUCCESS",
  "supplierOrderId": "SUP-12345",
  "failedReason": "Optional for FAILED status"
}
```

### Suppliers

#### GET `/api/admin/suppliers`
**List suppliers**

#### POST `/api/admin/suppliers`
**Create supplier**

**Body:**
```json
{
  "name": "Digiflazz",
  "code": "DIGIFLAZZ",
  "baseUrl": "https://api.digiflazz.com/v1",
  "apiKey": "your_key",
  "apiSecret": "your_secret",
  "username": "your_user",
  "password": "your_pass",
  "callbackUrl": "https://yourdomain.com/api/supplier/callback/digiflazz",
  "status": "ACTIVE",
  "config": { "description": "Main supplier" },
  "isManual": false
}
```

#### GET/PUT/DELETE `/api/admin/suppliers/:id`

### Users

#### GET `/api/admin/users`
**List users with pagination**

**Query Params:**
- `page`, `limit`, `search`, `isActive`, `role`

#### POST `/api/admin/users`
**Create admin user**

**Body:**
```json
{
  "email": "newadmin@nexatopup.com",
  "password": "securepassword123",
  "fullName": "New Admin",
  "role": "ADMIN"
}
```

### Settings

#### GET `/api/admin/settings`
**Get all settings**

**Response:**
```json
{
  "settings": [
    { "key": "site.name", "value": "NEXATOPUP", "description": "Site name", "isPublic": true },
    { "key": "payment.midtrans.serverKey", "value": "Mid-server-xxx", "description": "...", "isPublic": false }
  ],
  "keys": { "SITE_NAME": "site.name", ... }
}
```

#### POST `/api/admin/settings`
**Update setting**

**Body:**
```json
{
  "key": "site.name",
  "value": "New Site Name",
  "description": "Site name",
  "isPublic": true
}
```

#### DELETE `/api/admin/settings?key=site.name`

### Logs

#### GET `/api/admin/logs`
**Get activity logs with filters**

**Query Params:**
- `page`, `limit`
- `userId`, `adminId`, `action`, `entityType`, `entityId`
- `dateFrom`, `dateTo` (ISO date)

**Response:**
```json
{
  "logs": [
    {
      "id": "clx...",
      "action": "create_order",
      "entityType": "order",
      "entityId": "clx...",
      "oldData": null,
      "newData": { "orderNumber": "TOPUP-ABC123", ... },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "user": { "id": "clx...", "email": "user@email.com", "fullName": "John" },
      "admin": null
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 50,
  "totalPages": 20
}
```

---

## Supplier Callback API (Future)

### POST `/api/supplier/callback/digiflazz`
**Digiflazz Status Callback**

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "ref_id": "TOPUP-ABC123",
  "status": "Success",
  "message": "Transaksi berhasil",
  "data": { ... }
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/*` | 10 req | 15 min |
| `/api/customer/payment/*` | 30 req | 1 min |
| `/api/customer/orders` | 60 req | 1 min |
| `/api/admin/*` | 100 req | 1 min |
| Webhooks | 100 req | 1 min |

**Headers:**
- `X-RateLimit-Limit`: Max requests
- `X-RateLimit-Remaining`: Remaining
- `X-RateLimit-Reset`: Unix timestamp

**Exceeded Response (429):**
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## Webhook Security

### Midtrans
- Signature verification menggunakan `MIDTRANS_SERVER_KEY`
- Algorithm: SHA512
- Input: `order_id + status_code + gross_amount + server_key`

### Xendit
- Callback token verification
- Header: `x-callback-token`

### General
- Semua webhook logged ke `PaymentLog`
- Idempotency: `order_id` / `external_id` unik
- Timeout: 30 detik
- Retry: Exponential backoff (Midtrans default)

---

## Data Types

### OrderStatus
```
PENDING | WAITING_PAYMENT | PAID | PROCESSING | SUCCESS | FAILED | REFUNDED | CANCELLED
```

### PaymentStatus
```
PENDING | SETTLEMENT | CAPTURE | DENY | CANCEL | EXPIRE | FAILURE | REFUND | PARTIAL_REFUND
```

### PaymentMethod
```
QRIS | GOPAY | DANA | OVO | SHOPEEPAY | VIRTUAL_ACCOUNT | BANK_TRANSFER | CREDIT_CARD | ALFAMART | INDOMARET
```

### UserRole
```
USER | ADMIN | SUPER_ADMIN
```

### SupplierStatus
```
ACTIVE | INACTIVE | MAINTENANCE
```

---

## Example: Complete Order Flow

```bash
# 1. Get games
curl https://api.nexatopup.com/api/customer/games

# 2. Get products for ML
curl "https://api.nexatopup.com/api/customer/products?gameId=clx_game_ml"

# 3. Create order (need session cookie)
curl -X POST https://api.nexatopup.com/api/customer/orders \
  -H "Content-Type: application/json" \
  -b "session=..." \
  -d '{"productId":"clx_prod_ml_86","userGameId":"12345678","userZoneId":"1234"}'

# 4. Create payment
curl -X POST "https://api.nexatopup.com/api/customer/payment/create?orderId=clx_order_123" \
  -H "Content-Type: application/json" \
  -b "session=..." \
  -d '{"paymentMethod":"GOPAY"}'

# 5. Customer pays via paymentUrl

# 6. Webhook received (auto)

# 7. Check order status
curl "https://api.nexatopup.com/api/customer/orders/clx_order_123" \
  -b "session=..."
```

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Customer & Admin endpoints
- Midtrans & Xendit webhooks
- Supplier integration framework