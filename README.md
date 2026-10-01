# Modul Praktikum EAI: RESTful API Kasus Retail Toko SRC (Kelompok 04)

Modul ini adalah implementasi backend RESTful API untuk pemenuhan tugas **Integrasi Aplikasi Korporasi (Enterprise Application Integration / EAI)** dengan studi kasus **Sistem Ritel Kasir Toko Kelontong Modern SRC (Sampoerna Retail Community / Ekosistem AYO SRC)**.

Aplikasi dibangun menggunakan **NestJS 11**, **TypeScript**, **Node.js v22**, dan **pnpm**, mengadopsi standar industri **Stripe & Midtrans** untuk pola idempotensi transaksi finansial serta standar error **RFC 7807 / RFC 9457**.

---

## 1. Pemodelan 4 Resource Utama

| No | Resource | Endpoint | Method | Keterangan & Sifat |
|---|---|---|---|---|
| 1 | **Customers** | `/v1/customers` | `GET` | List pelanggan dengan Pagination, Filter pencarian (`?search=siti`), dan Sorting (`?sortBy=name&sortOrder=asc`). |
| | | `/v1/customers` | `POST` | Registrasi member Toko SRC baru (`201 Created`). |
| | | `/v1/customers/:id` | `GET` | Detail data member pelanggan (`200 OK` atau `404 Not Found`). |
| 2 | **Products** | `/v1/products` | `GET` | Katalog sembako fisik toko (Beras, Minyak, Gula) beserta stok fisik. |
| | | `/v1/products/:id` | `GET` | Detail produk sembako Toko SRC. |
| 3 | **Invoices** | `/v1/invoices` | `GET` | Daftar nota belanja kasir dengan filter status (`?status=UNPAID`/`PAID`). |
| | | `/v1/invoices` | `POST` | Pembuatan nota belanja baru di kasir Toko SRC. |
| | | `/v1/invoices/:id` | `GET` | Detail nota belanja kasir. |
| 4 | **Payment Intents** | `/v1/payment_intents` | `GET` | List transaksi niat bayar dengan filter status (`?status=requires_confirmation`). |
| | | `/v1/payment_intents` | `POST` | Pembuatan payment intent dari invoice belanja. |
| | | `/v1/payment_intents/:id/confirm` | `POST` | **POST Kritikal (IDEMPOTEN)**: Konfirmasi pelunasan dengan header wajib `Idempotency-Key: <UUID>`. |

---

## 2. Pola Idempotensi pada POST Kritikal

Diterapkan pada operasi konfirmasi pelunasan pembayaran kasir:
👉 **`POST /v1/payment_intents/:id/confirm`**

### Alur & Mekanisme:
1. **Header Wajib**: Klien kasir wajib menyertakan `Idempotency-Key: <UUID>`.
2. **Fingerprint Request**: Server menghitung hash SHA-256 dari `METHOD + URL + BODY`.
3. **Panggilan Pertama (MISS)**:
   * Status transaksi berubah menjadi `succeeded`.
   * Invoice ditandai `PAID`.
   * Stok sembako di toko terpotong sesuai kuantitas pembelian.
   * Member pelanggan menerima bonus loyalitas (+200 Koin Poin SRC).
   * Respon dikembalikan dengan header `Idempotent-Replay: false` dan `X-Cache-Lookup: MISS`.
4. **Panggilan Retry dengan Key Sama (HIT / Replay)**:
   * Mengembalikan respon cache eksekusi pertama secara transparan dengan header `Idempotent-Replay: true` dan `X-Cache-Lookup: HIT`.
   * **Stok beras TIDAK terpotong lagi dan Koin Pelanggan TIDAK bertambah ganda.**
5. **Key Sama dengan Payload Berbeda (Fraud / Collision)**:
   * Ditolak dengan HTTP status **`409 Conflict`** sesuai standar RFC 7807 & Slide 14.

---

## 3. Fitur Pagination, Filtering, dan Sorting

Seluruh endpoint pembacaan list (`/v1/customers`, `/v1/products`, `/v1/invoices`, `/v1/payment_intents`) mendukung query parameter:
* **Pagination**:
  * `page` (default: 1)
  * `limit` (default: 10)
  * Format respons:
    ```json
    {
      "data": [...],
      "meta": {
        "page": 1,
        "limit": 10,
        "total": 3,
        "totalPages": 1
      }
    }
    ```
* **Filter**:
  * `search`: Pencarian nama/email/ID (contoh: `?search=siti`).
  * `status`: Filter status pesanan/pembayaran (contoh: `?status=requires_confirmation` atau `?status=UNPAID`).
* **Sort**:
  * `sortBy`: Atribut pengurutan (contoh: `?sortBy=name` atau `?sortBy=createdAt`).
  * `sortOrder`: `asc` atau `desc`.

---

## 4. Standar Error RFC 7807 (Minimal 4 Skenario)

Format error seragam dengan header `Content-Type: application/problem+json`:

```json
{
  "type": "https://api.example.com/errors/resource-missing",
  "title": "Not Found",
  "status": 404,
  "detail": "Pelanggan Toko SRC dengan ID \"cust_999\" tidak ditemukan.",
  "instance": "/v1/customers/cust_999",
  "code": "resource_missing",
  "param": "id",
  "timestamp": "2026-09-25T07:15:00.000Z"
}
```

### 4 Skenario yang Terpenuhi:
1. **`400 Bad Request`**:
   * Header `Idempotency-Key` tidak disertakan saat konfirmasi pembayaran (`code: parameter_missing`).
   * Validasi DTO gagal (contoh: format email tidak valid).
2. **`401 Unauthorized`**:
   * Header `Authorization: Bearer <API_KEY>` tidak disertakan atau token salah pada endpoint terproteksi (`code: unauthorized`).
3. **`404 Not Found`**:
   * Resource ID tidak terdaftar (contoh: `GET /v1/customers/cust_999`).
4. **`409 Conflict`**:
   * Penggunaan ulang `Idempotency-Key` yang sama dengan body request yang diubah (`code: idempotency_key_reused_with_different_body`).

---

## 5. Dokumentasi OpenAPI 3.0 (Swagger UI) & Security

Saat server berjalan, buka browser dan akses:
👉 **`http://localhost:3000/docs`**

* **Security Scheme**: Mendukung skema `Bearer Auth` (`Authorization: Bearer sk_src_test123`) yang dapat diset via tombol **Authorize**.
* **Reusable Parameters**: Skema query pagination, filter, dan header `Idempotency-Key` terdokumentasi lengkap dengan tipe data dan contoh.
* **Spesifikasi JSON**: Dapat diunduh di `http://localhost:3000/docs-json`.

---

## 6. Cara Menjalankan & Menguji Proyek

### A. Menjalankan Server Backend

1. **Clone repository dan masuk ke direktori**:
   ```bash
   git clone https://github.com/WildaGhoniyuJiddan/kel-04_endpoint.git
   cd kel-04_endpoint
   ```

2. **Instal dependensi (disarankan pnpm, atau npm)**:
   ```bash
   pnpm install
   # atau jika menggunakan npm:
   npm install
   ```

3. **Jalankan server aplikasi (mode development)**:
   ```bash
   pnpm start:dev
   # atau jika menggunakan npm:
   npm run start:dev
   ```
   Aplikasi akan aktif di `http://localhost:3000`.
   Dokumentasi interaktif OpenAPI (Swagger UI) dapat diakses di `http://localhost:3000/docs`.

---

### B. Pengujian Otomatis via Terminal

Buka terminal kedua (saat server menyala), lalu jalankan salah satu skrip pengujian:

* **Menggunakan Git Bash / Terminal Linux**:
  ```bash
  ./demo-test.sh
  ```
* **Menggunakan Windows PowerShell**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File ./demo-test.ps1
  ```

---

### C. Pengujian Manual via cURL (Per Skenario)

#### 1. Uji Pagination, Filter, & Sort:
```bash
# Pagination
curl -s "http://localhost:3000/v1/customers?page=1&limit=2"

# Filter Pencarian
curl -s "http://localhost:3000/v1/customers?search=siti"

# Sorting berdasarkan Nama
curl -s "http://localhost:3000/v1/customers?sortBy=name&sortOrder=asc"
```

#### 2. Uji RFC 7807 Error 404 (Not Found):
```bash
curl -i "http://localhost:3000/v1/customers/cust_999"
```

#### 3. Uji RFC 7807 Error 400 (Bad Request - Input Tidak Valid):
```bash
curl -i -X POST http://localhost:3000/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"bukan-email"}'
```

#### 4. Uji RFC 7807 Error 401 (Unauthorized - Security Scheme):
```bash
# Tanpa Token (Gagal 401)
curl -i http://localhost:3000/v1/payment_intents/pi_src_1001/secure-check

# Dengan Bearer Token Sah (Sukses 200)
curl -i http://localhost:3000/v1/payment_intents/pi_src_1001/secure-check \
  -H "Authorization: Bearer sk_src_test123"
```

#### 5. Uji RFC 7807 Error 400 (Missing Idempotency-Key pada POST Kritikal):
```bash
curl -i -X POST http://localhost:3000/v1/payment_intents/pi_src_1001/confirm \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod":"qris"}'
```

#### 6. Uji Idempotency-Key (Eksekusi Baru vs Retry Replay):
```bash
# Request 1 (Eksekusi Baru - Header Idempotent-Replay: false, X-Cache-Lookup: MISS)
curl -i -X POST http://localhost:3000/v1/payment_intents/pi_src_1001/confirm \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: trx-uuid-kelontong-001" \
  -d '{"paymentMethod":"qris","notes":"Lunas via QRIS Kasir Toko SRC"}'

# Request 2 (Retry dengan Key Sama - Header Idempotent-Replay: true, X-Cache-Lookup: HIT)
curl -i -X POST http://localhost:3000/v1/payment_intents/pi_src_1001/confirm \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: trx-uuid-kelontong-001" \
  -d '{"paymentMethod":"qris","notes":"Lunas via QRIS Kasir Toko SRC"}'
```

#### 7. Uji RFC 7807 Error 409 (Conflict - Key Sama dengan Body Berbeda):
```bash
curl -i -X POST http://localhost:3000/v1/payment_intents/pi_src_1001/confirm \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: trx-uuid-kelontong-001" \
  -d '{"paymentMethod":"cash","notes":"BODY BERBEDA AKAN DITOLAK KODE 409"}'
```

#### 8. Cek & Reset State In-Memory:
```bash
# Cek data saat ini
curl http://localhost:3000/v1/state

# Reset ke kondisi data awal (Seed Data)
curl -X POST http://localhost:3000/v1/state/reset
```
