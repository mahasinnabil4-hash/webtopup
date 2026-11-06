# NEXATOPUP - Panduan Konfigurasi Supplier API

## Overview

Sistem supplier menggunakan **Adapter Pattern** yang memungkinkan integrasi dengan multiple supplier API. Setiap supplier implement interface `SupplierAdapter`.

## Supplier Built-in

### 1. Manual Supplier (Default)

Supplier fallback ketika tidak ada API supplier eksternal.

**Karakteristik:**
- Pesanan masuk ke status `PROCESSING`
- Admin memproses manual via dashboard
- Admin klik "Mark as Success" atau "Mark as Failed"
- Cocok untuk: testing, supplier belum tersedia, volume rendah

**Konfigurasi:**
```env
# Tidak perlu environment variables khusus
# Supplier dibuat via Admin Dashboard
```

**Admin Workflow:**
1. Pesanan masuk → Status `PROCESSING`
2. Admin buka `/admin/orders` → Filter status `PROCESSING`
3. Klik pesanan → Detail → Tombol "Proses Manual"
4. Pilih: "Berhasil" / "Gagal" + catatan
5. Sistem update status order & kirim notifikasi

---

### 2. Digiflazz (Example Implementation)

Supplier pulsa & game voucher populer di Indonesia.

**Prasyarat:**
- Akun Digiflazz Reseller
- Saldo deposit di Digiflazz
- IP Whitelist (opsional tapi direkomendasikan)

**Daftar & Setup:**
1. Daftar di https://digiflazz.com
2. Upgrade ke Reseller
3. Dapatkan: `username` & `api_key`
4. Set callback URL di panel Digiflazz

**Konfigurasi Environment:**
```env
DIGIFLAZZ_USERNAME=your_username
DIGIFLAZZ_API_KEY=your_api_key
DIGIFLAZZ_BASE_URL=https://api.digiflazz.com/v1
DIGIFLAZZ_CALLBACK_URL=https://yourdomain.com/api/supplier/callback/digiflazz
```

**Setup di Admin Dashboard:**
1. Buat Supplier baru:
   - Nama: "Digiflazz"
   - Kode: "DIGIFLAZZ"
   - Base URL: `https://api.digiflazz.com/v1`
   - Username & API Key dari env
   - Status: AKTIF
   - isManual: false

2. Mapping Game:
   - Game: Mobile Legends → Supplier Code: `ML`
   - Game: Free Fire → Supplier Code: `FF`
   - Game: PUBG Mobile → Supplier Code: `PUBG`
   - (Sesuai kode produk Digiflazz)

3. Mapping Produk:
   - Produk: 86 Diamonds ML → Supplier Product Code: `ML_86`
   - Produk: 100 Diamonds FF → Supplier Product Code: `FF_100`
   - Harga Supplier: sesuai pricelist Digiflazz

**Flow Otomatis:**
```
Payment PAID → Order PROCESSING → Submit ke Digiflazz API
    ↓
Digiflazz Response (Pending/Success/Failed)
    ↓
Polling status setiap 30 detik (max 3x retry)
    ↓
Success → Order SUCCESS + Notifikasi
Failed  → Order FAILED + Notifikasi Admin
```

---

## Menambah Supplier Baru

### 1. Buat Adapter Class

Buat file baru di `src/lib/suppliers/your-supplier.ts`:

```typescript
import { BaseSupplierAdapter } from './base'
import { SupplierAdapter, OrderRequest, OrderResponse, StatusCheckResponse } from './types'

export class YourSupplierAdapter extends BaseSupplierAdapter {
  name = 'Your Supplier'
  code = 'YOUR_CODE'

  async submitOrder(request: OrderRequest): Promise<OrderResponse> {
    // Implementasi submit order ke API supplier
    const payload = {
      // format sesuai dokumen API supplier
    }

    const result = await this.makeRequest(url, { method: 'POST', body: JSON.stringify(payload) })
    
    if (!result.success) {
      return { success: false, status: 'FAILED', message: result.error }
    }

    return {
      success: true,
      supplierOrderId: result.data.ref_id,
      status: this.mapStatus(result.data.status),
      data: result.data,
    }
  }

  async checkStatus(supplierOrderId: string): Promise<StatusCheckResponse> {
    // Implementasi cek status
  }

  private mapStatus(status: string): 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' {
    // Mapping status supplier ke status internal
  }
}
```

### 2. Register di Factory

Edit `src/lib/suppliers/factory.ts`:

```typescript
import { YourSupplierAdapter } from './your-supplier'

export function getSupplierAdapter(code: string): SupplierAdapter | null {
  // ... existing code
  switch (code.toUpperCase()) {
    // ... existing cases
    case 'YOUR_CODE':
      adapter = new YourSupplierAdapter()
      break
  }
  // ...
}
```

### 3. Tambah ke Available Adapters

```typescript
export function getAvailableAdapters(): string[] {
  return ['DIGIFLAZZ', 'MANUAL', 'YOUR_CODE']
}
```

### 4. Setup di Database

Via Admin Dashboard → Suppliers → Tambah Supplier:
- Kode: `YOUR_CODE` (harus sama dengan factory)
- Konfigurasi API credentials
- Mapping game & produk

---

## Mapping Produk

### Konsep Mapping

| Internal Product | Supplier Product Code | Supplier Price |
|------------------|----------------------|----------------|
| ML 86 Diamonds   | `ML_86`              | 10.000         |
| FF 100 Diamonds  | `FF_100`             | 2.000          |

**Penting:**
- `supplierProductCode` harus **persis** sesuai dokumentasi API supplier
- `supplierPrice` untuk referensi margin (opsional)
- Satu produk internal = satu mapping ke supplier
- Jika multiple supplier untuk satu game, pilih supplier default

---

## Flow Transaksi Supplier

```
1. Payment Webhook → Status PAID
         ↓
2. Create SupplierTransaction (PENDING)
         ↓
3. Update Order → PROCESSING
         ↓
4. Submit ke Supplier API (async)
         ↓
5. Supplier Response
   ├─ SUCCESS → Update Order → SUCCESS + Notifikasi
   ├─ FAILED  → Retry (max 3x, exponential backoff)
   └─ PENDING → Polling status (setiap 30 detik)
         ↓
6. Max Retry → FAILED + Notifikasi Admin
```

---

## Retry Mechanism

```typescript
const MAX_RETRIES = 3
const RETRY_DELAYS = [5000, 30000, 120000] // 5s, 30s, 2min

// Exponential backoff dengan max delay 2 menit
```

**Konfigurasi via Database (opsional):**
Tambah setting:
```json
{
  "supplier.maxRetries": 3,
  "supplier.retryDelays": [5000, 30000, 120000],
  "supplier.pollingInterval": 30000
}
```

---

## Monitoring & Debugging

### SupplierTransaction Log

Semua request/response disimpan di `SupplierTransaction`:
- `requestPayload`: Payload yang dikirim
- `responsePayload`: Response dari supplier
- `retryCount`: Jumlah percobaan
- `errorMessage`: Error terakhir

### Query Debug

```sql
-- Lihat transaksi supplier gagal
SELECT * FROM supplier_transactions 
WHERE status = 'FAILED' 
ORDER BY created_at DESC;

-- Lihat retry count
SELECT supplier_order_id, retry_count, error_message 
FROM supplier_transactions 
WHERE retry_count > 0;

-- Rata-rata waktu proses
SELECT 
  s.name as supplier,
  AVG(EXTRACT(EPOCH FROM (st.updated_at - st.created_at))) as avg_seconds
FROM supplier_transactions st
JOIN suppliers s ON st.supplier_id = s.id
WHERE st.status = 'SUCCESS'
GROUP BY s.name;
```

### Admin Dashboard

Akses `/admin/suppliers` → Klik supplier → Tab "Transaksi" untuk melihat:
- Status real-time
- Request/response detail
- Error messages
- Manual retry button

---

## Troubleshooting

### Supplier Selalu FAILED

1. **Cek credentials**: Username/API key benar?
2. **Cek saldo**: Deposit Digiflazz cukup?
3. **Cek mapping**: Product code sesuai pricelist?
4. **Cek IP Whitelist**: IP server diizinkan supplier?
5. **Cek log**: `SupplierTransaction.responsePayload` untuk error detail

### Timeout / No Response

1. **Timeout setting**: Perbaiki `fetch` timeout di `BaseSupplierAdapter`
2. **Network**: Test `curl` ke endpoint supplier dari server
3. **Firewall**: Pastikan outbound HTTPS (443) terbuka

### Status Tidak Update

1. **Cek polling**: Cron job `processPendingSupplierOrders` jalan?
2. **Manual trigger**: Panggil `checkSupplierOrderStatus` via admin
3. **Callback URL**: Supplier support webhook? Setup di `Supplier.callbackUrl`

### Mapping Error

```
Error: "Product code not found"
```
→ Cek `supplierProductCode` di mapping produk, harus exact match dengan pricelist supplier

---

## Best Practices

1. **Test di Sandbox** dulu sebelum production
2. **Monitor saldo supplier** rutin (setup alert saldo < threshold)
3. **Backup mapping** sebelum update massal
4. **Idempotency**: Gunakan `orderNumber` sebagai `ref_id` unik
5. **Logging**: Selalu log request/response untuk audit
6. **Fallback**: Selalu siapkan Manual Supplier sebagai backup
7. **Rate Limit**: Hormati rate limit API supplier (biasanya 10-30 req/detik)

---

## Contoh Supplier Lainnya

### Tri / Telkomsel (Pulsa)
- API: HTTP POST JSON
- Auth: Basic Auth / API Key
- Produk: Pulsa, Paket Data, Voucher Game

### M-Pay / Doku
- API: REST + Signature
- Produk: E-Wallet, Virtual Account, QRIS

### Custom Internal API
- Jika punya sistem sendiri untuk generate voucher/kode
- Implement adapter yang call internal service

---

## Migrasi dari Manual ke API

1. Setup supplier API di Admin (status: `MAINTENANCE`)
2. Mapping semua produk
3. Test beberapa order manual → cek logs
4. Ubah status supplier ke `ACTIVE`
5. Monitor 24 jam pertama
6. Setelah stabil, nonaktifkan manual processing untuk game tersebut