# NEXATOPUP - Panduan Admin Dashboard

## Akses Dashboard

- **URL**: `https://yourdomain.com/admin/login`
- **Login**: Email & Password admin
- **Default**: admin@nexatopup.com / admin123 (ubah segera!)

---

## Dashboard Utama (`/admin/dashboard`)

### Statistik Cards
- **Total Pesanan**: Semua pesanan yang pernah dibuat
- **Total Pendapatan**: Akumulasi dari pesanan SUCCESS
- **Pendapatan Hari Ini**: Pesanan SUCCESS hari ini
- **Pendapatan Bulan Ini**: Pesanan SUCCESS bulan ini
- **Total Pengguna**: User terdaftar
- **Total Game**: Game aktif
- **Total Produk**: Produk aktif
- **Pesanan Pending**: Butuh perhatian (PENDING, WAITING_PAYMENT, PROCESSING)

### Pesanan Terbaru
- 10 pesanan terakhir dengan link ke detail
- Quick view: user, produk, total, status, waktu

---

## Manajemen Pesanan (`/admin/orders`)

### Fitur
- **Filter**: Status, Game, User, Rentang tanggal, Pencarian (no. pesanan, user ID, email)
- **Pagination**: 20 per halaman
- **Sorting**: Klik header kolom
- **Export**: Download CSV (fitur mendatang)

### Kolom Tabel
| Kolom | Deskripsi |
|-------|-----------|
| No. Pesanan | ID unik (TOPUP-XXXXXX) |
| Pelanggan | Nama & Email/Telepon |
| Produk | Game - Nama Produk |
| Total | Harga final |
| Status | Badge warna |
| Pembayaran | Metode (jika sudah bayar) |
| Tanggal | Waktu pesanan dibuat |
| Aksi | Ubah status, Detail |

### Update Status Pesanan
1. Klik tombol "Ubah Status" pada baris pesanan
2. Pilih status baru dari dropdown
3. Opsional: Isi Supplier Order ID, Alasan Gagal
4. Klik "Simpan"

### Validasi Status Transition
```
PENDING → WAITING_PAYMENT → PAID → PROCESSING → SUCCESS
                    ↓              ↓
                 CANCELLED      FAILED
                            ↓
                         REFUNDED
```

### Detail Pesanan (`/admin/orders/[id]`)
- **Info Pesanan**: No. pesanan, status, game, produk, user ID, zone ID, qty, total
- **Timeline Status**: Visual stepper status
- **Info Pelanggan**: Nama, email, telepon
- **Info Pembayaran**: Metode, gateway ref, waktu bayar
- **Proses Supplier**: Status, supplier ref, error message
- **Aksi Cepat**: Ubah status, Proses ulang, Proses manual

---

## Manajemen Game (`/admin/games`)

### CRUD Game
- **Tambah**: Klik "Tambah Game" → Isi form
- **Edit**: Klik icon pensil
- **Hapus**: Klik icon trash (hanya jika tidak ada produk/transaksi)

### Form Fields
| Field | Wajib | Deskripsi |
|-------|-------|-----------|
| Nama Game | ✓ | Tampil ke customer |
| Slug | ✓ | URL friendly (lowercase, strip) |
| URL Logo | ✓ | HTTPS, recommended 200x200px |
| URL Banner | - | HTTPS, recommended 1200x400px |
| Deskripsi | - | Markdown/text, tampil di detail |
| Aktif | ✓ | Toggle tampil/tidak |
| Urutan | - | Sort order (angka kecil di atas) |

### Zona ID
- Centang "Perlu Zone ID" untuk game yang butuh Server/Zone ID
- Custom label: "Zone ID", "Server ID", "User ID", dll

---

## Manajemen Produk (`/admin/products`)

### CRUD Produk
- Filter per Game
- Pencarian nama/SKU
- Bulk actions (coming soon)

### Form Fields
| Field | Wajib | Deskripsi |
|-------|-------|-----------|
| Game | ✓ | Pilih dari dropdown |
| Nama Produk | ✓ | Contoh: "86 Diamonds" |
| SKU | ✓ | Unique code: `MLBB_86_DIA` |
| Nominal | ✓ | Angka: 86, 100, 1000 |
| Harga Modal | ✓ | Beli dari supplier |
| Harga Jual | ✓ | Jual ke customer (auto hitung dari margin) |
| Margin % | - | Otomatis hitung harga jual |
| Aktif | ✓ | Toggle |
| Perlu Zone | ✓ | Centang jika game butuh zone |
| Label Zone | - | Custom label untuk zone |
| Urutan | - | Sort order dalam game |

### Auto Calculate Harga Jual
1. Isi **Harga Modal**
2. Isi **Margin %** (contoh: 30)
3. **Harga Jual** otomatis terisi: `Modal × (1 + Margin/100)`
4. Bisa override manual jika perlu

---

## Manajemen Supplier (`/admin/suppliers`)

### Tipe Supplier

#### API Supplier (Otomatis)
- Konfigurasi: Base URL, API Key, Secret, Username, Password
- Proses order otomatis via API
- Polling status otomatis

#### Manual Supplier (Admin Proses)
- Tidak perlu konfigurasi API
- Admin proses manual via dashboard
- Cocok untuk: testing, supplier belum API, volume kecil

### Form Supplier
| Field | Deskripsi |
|-------|-----------|
| Nama | Tampil di admin |
| Kode | Unique: `DIGIFLAZZ`, `MANUAL`, `CUSTOM_API` |
| Base URL | Endpoint API supplier |
| API Key / Secret | Credentials API |
| Username / Password | Basic auth jika perlu |
| Callback URL | Webhook URL supplier |
| Status | AKTIF / NONAKTIF / MAINTENANCE |
| Manual | Centang untuk manual processing |

### Mapping Game & Produk (Setelah Supplier Dibuat)
1. Klik supplier → Tab "Game Mapping"
2. Tambah mapping: Game Internal → Supplier Game Code
3. Tab "Produk Mapping" → Produk Internal → Supplier Product Code + Harga Supplier

---

## Manajemen Pengguna (`/admin/users`)

### User Management
- **Pelanggan**: User biasa (role: USER)
- **Admin**: Staff (role: ADMIN/SUPER_ADMIN)

### Fitur
- Toggle Active/Nonaktif
- Reset password (coming soon)
- Lihat riwayat pesanan
- Filter: Status, Role, Pencarian

### Tambah Admin Baru
1. Klik "Tambah Admin"
2. Isi: Email, Password, Nama, Peran (ADMIN/SUPER_ADMIN)
3. Email unik, password min 8 karakter

### Peran (Role)
| Role | Akses |
|------|-------|
| USER | Customer area only |
| ADMIN | Semua admin features kecuali manage admin |
| SUPER_ADMIN | Full access + manage admin |

---

## Pengaturan (`/admin/settings`)

### Kategori Pengaturan

#### Website (`site.*`)
| Key | Contoh | Public |
|-----|--------|--------|
| site.name | NEXATOPUP | ✓ |
| site.description | Top Up Game Murah | ✓ |
| site.logo | https://.../logo.png | ✓ |
| site.contactEmail | support@nexatopup.com | ✓ |
| site.maintenanceMode | false | ✓ |
| site.registrationEnabled | true | ✓ |

#### Payment Gateway (`payment.*`)
| Key | Contoh | Public |
|-----|--------|--------|
| payment.gateway | midtrans | - |
| payment.midtrans.serverKey | Mid-server-xxx | - |
| payment.midtrans.clientKey | Mid-client-xxx | ✓ |
| payment.midtrans.isProduction | true | - |

#### Supplier (`supplier.*`)
| Key | Contoh | Public |
|-----|--------|--------|
| supplier.default | DIGIFLAZZ | - |

#### Email (`email.*`)
| Key | Contoh | Public |
|-----|--------|--------|
| email.from | noreply@nexatopup.com | - |
| email.replyTo | support@nexatopup.com | - |

### Edit Setting
1. Klik nilai setting → Edit inline
2. Tekan Enter atau klik luar untuk save
3. JSON value: gunakan format valid (object/array)

---

## Log Aktivitas (`/admin/logs`)

### Filter Log
- **Aksi**: create_order, update_status, payment_success, dll
- **Entitas**: order, payment, game, product, user, admin, setting
- **User/Admin**: Cari oleh email
- **Rentang Tanggal**: Dari - Sampai

### Detail Log
Klik "Lihat" → Modal dengan:
- Old Data & New Data (JSON formatted)
- IP Address & User Agent
- Timestamp

### Export Log
- Pilih filter → Klik "Export CSV" (coming soon)

---

## Workflow Harian Admin

### Pagi (09:00)
1. Buka Dashboard → Cek statistik
2. Cek "Pesanan Pending" → Proses yang stuck
3. Cek Supplier Dashboard → Saldo & Status

### Siang (13:00)
1. Review pesanan `PROCESSING` > 1 jam
2. Cek pesanan `FAILED` → Hubungi customer/supplier
3. Proses manual untuk supplier manual

### Sore (17:00)
1. Final check semua pesanan hari ini
2. Pastikan tidak ada `WAITING_PAYMENT` > 24 jam (auto cancel)
3. Backup database (otomatis via cron)

### Emergency: Pesanan Stuck di PROCESSING
1. Buka detail pesanan
2. Cek `SupplierTransaction` → Error message
3. Jika supplier API error:
   - Cek log supplier
   - Coba "Proses Ulang" (max 3x)
4. Jika terus gagal → Switch ke Manual:
   - Edit supplier → isManual = true
   - Proses manual via admin
5. Atau refund customer jika tidak bisa diproses

---

## Shortcuts & Tips

### Keyboard Shortcuts
- `Ctrl+K` → Search command (coming soon)
- `Esc` → Tutup modal/dialog

### Quick Actions
- **Dashboard**: Click stat card → filter otomatis ke halaman terkait
- **Orders**: Click status badge → filter by status
- **Products**: Click game name → filter by game

### Bulk Operations (Coming Soon)
- Pilih multiple rows → Update status massal
- Export selected ke CSV
- Delete multiple

---

## Troubleshooting Admin

### Tidak Bisa Login
1. Cek email/password
2. Cek akun aktif
3. Cek role ADMIN/SUPER_ADMIN
4. Clear browser cache/cookies

### Data Tidak Muncul
1. Refresh halaman
2. Cek filter/search
3. Cek console browser (F12) untuk error JS
4. Cek API response di Network tab

### Gagal Update Status
1. Cek validasi transisi status
2. Cek apakah pesanan sudah di proses supplier
3. Cek log aktivitas untuk error detail

### Supplier Tidak Proses
1. Cek status supplier (AKTIF?)
2. Cek mapping produk
3. Cek saldo supplier (Digiflazz dll)
4. Cek log `SupplierTransaction`

---

## Keamanan Admin

### Best Practices
- **Ganti password default** segera setelah deploy
- **Gunakan password unik** 16+ karakter
- **Aktifkan 2FA** (coming soon)
- **Batasi akses IP** via Nginx/Cloudflare (opsional)
- **Audit log** rutin review

### Session Management
- Session expired: 30 hari
- Auto logout saat browser close (opsional)
- Concurrent session limit: 5 per user

---

## Support & Eskalasi

### Level 1: Admin Dashboard
- Cek logs, retry, manual process
- Waktu: < 30 menit

### Level 2: Technical Team
- Cek server logs, database, API supplier
- Waktu: < 2 jam

### Level 3: Vendor/Supplier
- Kontak support Midtrans/Digiflazz/dll
- Waktu: Sesuai SLA vendor

### Emergency Contact
- **Midtrans Support**: support@midtrans.com / Live Chat Dashboard
- **Digiflazz Support**: CS via WhatsApp/Telegram reseller
- **Server Admin**: SSH access ke VPS