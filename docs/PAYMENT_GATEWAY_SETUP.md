# NEXATOPUP - Panduan Konfigurasi Payment Gateway

## Midtrans (Primary)

### 1. Daftar Akun Midtrans

1. Kunjungi https://midtrans.com
2. Daftar akun Merchant
3. Verifikasi email & nomor telepon
4. Lengkapi data perusahaan (untuk production)

### 2. Dapatkan API Keys

#### Sandbox (Development)
- Login ke https://dashboard.sandbox.midtrans.com
- Pilih menu **Settings** → **Access Keys**
- Copy **Server Key** & **Client Key**
- Format: `Mid-server-xxxxxxxxx` & `Mid-client-xxxxxxxxx`

#### Production
- Login ke https://dashboard.midtrans.com
- Pilih menu **Settings** → **Access Keys**
- Copy **Server Key** & **Client Key**
- Catat **Merchant ID** (format: `G123456789`)

### 3. Konfigurasi Environment

```env
# .env.production
MIDTRANS_SERVER_KEY=Mid-server-your-production-key
MIDTRANS_CLIENT_KEY=Mid-client-your-production-key
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_MERCHANT_ID=G123456789
```

### 4. Setup Webhook/Notification URL

#### Di Dashboard Midtrans:
1. Settings → **Configuration**
2. **Payment Notification URL**: `https://yourdomain.com/api/customer/payment/webhook/midtrans`
3. Aktifkan **Payment Notification** (✓)
4. Untuk **Finish Redirect URL** (opsional): `https://yourdomain.com/payment/{orderId}?status=finish`

#### Test Webhook:
- Gunakan fitur **Test Notification** di dashboard
- Kirim test ke endpoint Anda
- Pastikan response `200 OK`

### 5. Payment Methods Configuration

Di Dashboard Midtrans → **Payment Methods**, aktifkan:
- ✅ **Credit Card** (Visa, Mastercard, JCB)
- ✅ **Virtual Account** (BCA, BNI, BRI, Mandiri, Permata, CIMB)
- ✅ **Convenience Store** (Alfamart, Indomaret)
- ✅ **E-Wallet** (GoPay, ShopeePay, DANA, OVO)
- ✅ **QRIS**
- ✅ **Bank Transfer** (Permata, BCA, Mandiri, BNI, BRI)

### 6. Test Payment Flow

#### Sandbox Test Cards:
```
Success: 4811 1111 1111 1114 (any future expiry, any CVV)
Failed:  4111 1111 1111 1111
3DS:     4811 1111 1111 1114 (with 3DS challenge)
```

#### Test Scenarios:
1. **Success Payment**: Gunakan kartu success
2. **Failed Payment**: Gunakan kartu failed
3. **Expired Payment**: Tunggu 24 jam tanpa bayar
4. **Webhook Verification**: Cek log `PaymentLog` di database

### 7. Verifikasi Signature Webhook

Sistem otomatis memverifikasi signature Midtrans:
```typescript
// Implementasi di src/lib/payments/midtrans.ts
const input = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`
const expectedSignature = crypto.createHash('sha512').update(input).digest('hex')
```

Jika signature tidak cocok, webhook akan direject (400).

---

## Xendit (Alternative/Fallback)

### 1. Daftar Akun Xendit

1. Kunjungi https://xendit.co
2. Daftar & verifikasi akun
3. Lengkapi KYC untuk production

### 2. Dapatkan API Keys

#### Development
- Dashboard → **Settings** → **API Keys**
- Copy **API Key** & **Callback Token**

#### Production
- Sama seperti development tapi gunakan production keys

### 3. Konfigurasi Environment

```env
XENDIT_API_KEY=xnd_development_xxxxxxxxx
XENDIT_CALLBACK_TOKEN=your_callback_token
XENDIT_IS_PRODUCTION=false
```

### 4. Setup Webhook

Di Dashboard Xendit → **Settings** → **Callbacks**:
- **Invoice Callback URL**: `https://yourdomain.com/api/customer/payment/webhook/xendit`
- Aktifkan **Invoice Paid** & **Invoice Expired**

### 5. Switch Payment Gateway

Untuk berganti ke Xendit:

```env
PAYMENT_GATEWAY=xendit
```

Sistem menggunakan factory pattern, sehingga switch gateway tidak memerlukan perubahan kode.

---

## Troubleshooting Midtrans

### Webhook Tidak Terima

1. **Cek URL accessible**: `curl -X POST https://yourdomain.com/api/customer/payment/webhook/midtrans`
2. **Cek firewall**: Pastikan port 443 terbuka
3. **Cek Nginx**: Pastikan proxy pass benar ke port 3000
4. **Cek log**: `docker logs nexatopup-app | grep webhook`

### Signature Verification Failed

1. Pastikan `MIDTRANS_SERVER_KEY` benar (sandbox vs production)
2. Cek raw payload yang diterima vs yang dikirim Midtrans
3. Pastikan tidak ada modifikasi body oleh proxy/Nginx

### Payment Stuck di "Waiting Payment"

1. Cek status di Dashboard Midtrans
2. Cek apakah webhook terkirim (lihat log Midtrans)
3. Manual trigger: Panggil API `/api/admin/orders` update status

### VA Number Tidak Muncul

1. Pastikan payment method `bank_transfer` aktif di dashboard
2. Cek bank yang didukung: BCA, BNI, BRI, Mandiri, Permata, CIMB
3. VA hanya muncul untuk `bank_transfer` payment type

---

## Checklist Production Go-Live

- [ ] Midtrans production keys configured
- [ ] `MIDTRANS_IS_PRODUCTION=true`
- [ ] Merchant ID diisi
- [ ] Webhook URL production diatur di dashboard
- [ ] Semua payment methods diaktifkan
- [ ] Test transaksi kecil (Rp 1.000) berhasil
- [ ] Webhook terkirim & terverifikasi
- [ ] Order status update ke PAID
- [ ] Supplier processing triggered
- [ ] Email notifikasi terkirim
- [ ] Monitoring alert aktif

---

## Keamanan

### Rate Limiting
- `/api/customer/payment/*`: 30 req/menit per IP
- `/api/auth/*`: 10 req/15 menit per IP

### Signature Verification
- Semua webhook diverifikasi signature
- Payload disimpan di `PaymentLog` untuk audit
- Idempotency key: `order_id` (Midtrans) / `external_id` (Xendit)

### Data Protection
- Tidak menyimpan nomor kartu kredit
- API keys di environment variables
- Database password hashed (bcrypt 12 rounds)