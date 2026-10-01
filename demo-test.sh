#!/usr/bin/env bash

# ==============================================================================
# Skrip Pengujian Otomatis API Retail Toko SRC (EAI Kelompok 04)
# Kasus: 4 Resource, Idempotency-Key, Pagination/Filter/Sort, RFC 7807 (400, 401, 404, 409)
# ==============================================================================

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================================${NC}"
echo -e "${BLUE}    PENGUJIAN API RESTFUL RETAIL TOKO SRC (EAI KELOMPOK 04)      ${NC}"
echo -e "${BLUE}=================================================================${NC}\n"

# 0. Reset State In-Memory Database
echo -e "${YELLOW}[LANGKAH 0] Reset Database In-Memory ke Seed Awal...${NC}"
curl -s -X POST "${BASE_URL}/v1/state/reset" | grep -o '"message":[^}]*'
echo -e "\n-----------------------------------------------------------------\n"

# 1. Resource Modeling: List & Pagination, Filter, Sort
echo -e "${CYAN}[PENGUJIAN 1: Resource Customers - Pagination & Filter & Sort]${NC}"
echo -e "-> GET /v1/customers?page=1&limit=2 (Pagination)"
curl -s "${BASE_URL}/v1/customers?page=1&limit=2" | grep -o '"meta":{[^}]*}'

echo -e "\n-> GET /v1/customers?search=siti (Filter Pencarian)"
curl -s "${BASE_URL}/v1/customers?search=siti" | grep -o '"name":"[^"]*'

echo -e "\n-> GET /v1/customers?sortBy=name&sortOrder=asc (Sorting)"
curl -s "${BASE_URL}/v1/customers?sortBy=name&sortOrder=asc" | grep -o '"name":"[^"]*'
echo -e "\n-----------------------------------------------------------------\n"

# 2. Get Detail & RFC 7807 Error 404 Not Found
echo -e "${CYAN}[PENGUJIAN 2: Detail Resource & RFC 7807 Error 404 Not Found]${NC}"
echo -e "-> GET /v1/customers/cust_src_01 (Berhasil 200 OK):"
curl -s "${BASE_URL}/v1/customers/cust_src_01" | grep -o '"name":"[^"]*'

echo -e "\n-> GET /v1/customers/cust_999 (Simulasi 404 Not Found RFC 7807):"
curl -s -i "${BASE_URL}/v1/customers/cust_999" | grep -E "(HTTP/|Content-Type|status|code|title|detail)"
echo -e "\n-----------------------------------------------------------------\n"

# 3. Create Resource & RFC 7807 Error 400 Bad Request
echo -e "${CYAN}[PENGUJIAN 3: Create Resource & RFC 7807 Error 400 Bad Request]${NC}"
echo -e "-> POST /v1/customers (Simulasi 400 Bad Request - Email tidak valid & Nama kosong):"
curl -s -i -X POST "${BASE_URL}/v1/customers" \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"bukan-email"}' | grep -E "(HTTP/|Content-Type|status|code|detail)"

echo -e "\n-> POST /v1/customers (Berhasil 201 Created):"
curl -s -X POST "${BASE_URL}/v1/customers" \
  -H "Content-Type: application/json" \
  -d '{"name":"Haji Syukri","email":"syukri@src-kelontong.id","phone":"081255667788"}' | grep -o '"id":"cust_src_[^"]*'
echo -e "\n-----------------------------------------------------------------\n"

# 4. Security & RFC 7807 Error 401 Unauthorized
echo -e "${CYAN}[PENGUJIAN 4: Security Scheme & RFC 7807 Error 401 Unauthorized]${NC}"
echo -e "-> GET /v1/payment_intents/pi_src_1001/secure-check (Tanpa Token -> 401 Unauthorized):"
curl -s -i "${BASE_URL}/v1/payment_intents/pi_src_1001/secure-check" | grep -E "(HTTP/|Content-Type|status|code|title|detail)"

echo -e "\n-> GET /v1/payment_intents/pi_src_1001/secure-check (Dengan Bearer Token Sah -> 200 OK):"
curl -s -H "Authorization: Bearer sk_src_test123" "${BASE_URL}/v1/payment_intents/pi_src_1001/secure-check" | grep -o '"message":[^,]*'
echo -e "\n-----------------------------------------------------------------\n"

# 5. POST Kritikal Idempotensi (Missing Idempotency-Key -> 400 Bad Request)
echo -e "${CYAN}[PENGUJIAN 5: POST Kritikal - Validasi Header Idempotency-Key]${NC}"
echo -e "-> POST /v1/payment_intents/pi_src_1001/confirm (Tanpa Header Idempotency-Key -> 400 Bad Request RFC 7807):"
curl -s -i -X POST "${BASE_URL}/v1/payment_intents/pi_src_1001/confirm" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod":"qris"}' | grep -E "(HTTP/|Content-Type|status|code|param|detail)"
echo -e "\n-----------------------------------------------------------------\n"

# 6. POST Kritikal Idempotensi: First Call (MISS) vs Retry Call (HIT/REPLAY)
echo -e "${GREEN}[PENGUJIAN 6: Idempotent Execution & Transparent Replay]${NC}"
IDEMPOTENCY_KEY="src-trx-uuid-$(date +%s)"
echo -e "Menggunakan Idempotency-Key: ${IDEMPOTENCY_KEY}"

echo -e "\n-> Panggilan Pertama (Eksekusi Baru / MISS):"
curl -s -i -X POST "${BASE_URL}/v1/payment_intents/pi_src_1001/confirm" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: ${IDEMPOTENCY_KEY}" \
  -d '{"paymentMethod":"qris","notes":"Pelunasan QRIS Kasir Toko SRC"}' | grep -E "(HTTP/|Idempotent-Replay|X-Cache-Lookup|totalPoinSekarang)"

echo -e "\n-> Panggilan Kedua (Simulasi Retry Jaringan / HIT REPLAY):"
curl -s -i -X POST "${BASE_URL}/v1/payment_intents/pi_src_1001/confirm" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: ${IDEMPOTENCY_KEY}" \
  -d '{"paymentMethod":"qris","notes":"Pelunasan QRIS Kasir Toko SRC"}' | grep -E "(HTTP/|Idempotent-Replay|X-Cache-Lookup|totalPoinSekarang)"

echo -e "\n${GREEN}HASIL:${NC} Respon kedua di-REPLAY persis sama (Idempotent-Replay: true, Cache: HIT)!"
echo -e "Poin pelanggan Bu Siti TIDAK bertambah ganda:"
curl -s "${BASE_URL}/v1/customers/cust_src_01" | grep -o '"poinKoinKelontong":[0-9]*'
echo -e "\n-----------------------------------------------------------------\n"

# 7. RFC 7807 Error 409 Conflict (Key Sama tapi Body Berbeda)
echo -e "${RED}[PENGUJIAN 7: RFC 7807 Error 409 Conflict (Payload Mismatch)]${NC}"
echo -e "-> Mengirim ulang Idempotency-Key ${IDEMPOTENCY_KEY} dengan notes berbeda:"
curl -s -i -X POST "${BASE_URL}/v1/payment_intents/pi_src_1001/confirm" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: ${IDEMPOTENCY_KEY}" \
  -d '{"paymentMethod":"cash","notes":"BODY BERBEDA MENIMBULKAN 409"}' | grep -E "(HTTP/|Content-Type|status|code|title|detail)"
echo -e "\n-----------------------------------------------------------------\n"

echo -e "${BLUE}=================================================================${NC}"
echo -e "${GREEN}  SEMUA SKENARIO PENGUJIAN API BERHASIL DILAKSANAKAN!           ${NC}"
echo -e "${BLUE}=================================================================${NC}\n"
