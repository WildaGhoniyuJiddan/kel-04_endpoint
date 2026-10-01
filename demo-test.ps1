# ==============================================================================
# Skrip Pengujian Otomatis PowerShell - API Retail Toko SRC (EAI Kelompok 04)
# ==============================================================================

$BaseUrl = "http://localhost:3000"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "    PENGUJIAN API RESTFUL RETAIL TOKO SRC (EAI KELOMPOK 04)      " -ForegroundColor Cyan
Write-Host "=================================================================`n" -ForegroundColor Cyan

# 0. Reset State
Write-Host "[LANGKAH 0] Reset Database In-Memory ke Seed Awal..." -ForegroundColor Yellow
Invoke-RestMethod -Uri "$BaseUrl/v1/state/reset" -Method POST | ConvertTo-Json -Depth 2
Write-Host "`n-----------------------------------------------------------------`n"

# 1. Pagination, Filter, Sort
Write-Host "[PENGUJIAN 1: Customers - Pagination, Filter, & Sort]" -ForegroundColor Green
Write-Host "-> GET /v1/customers?page=1&limit=2"
(Invoke-RestMethod -Uri "$BaseUrl/v1/customers?page=1&limit=2").meta | ConvertTo-Json

Write-Host "`n-> GET /v1/customers?search=siti"
(Invoke-RestMethod -Uri "$BaseUrl/v1/customers?search=siti").data | Select-Object id, name, email | Format-Table

Write-Host "`n-> GET /v1/customers?sortBy=name&sortOrder=asc"
(Invoke-RestMethod -Uri "$BaseUrl/v1/customers?sortBy=name&sortOrder=asc").data | Select-Object id, name | Format-Table
Write-Host "-----------------------------------------------------------------`n"

# 2. Get by ID & RFC 7807 404 Not Found
Write-Host "[PENGUJIAN 2: Detail Resource & RFC 7807 404 Not Found]" -ForegroundColor Green
Write-Host "-> GET /v1/customers/cust_src_01 (200 OK)"
Invoke-RestMethod -Uri "$BaseUrl/v1/customers/cust_src_01" | Select-Object id, name, poinKoinKelontong | Format-Table

Write-Host "-> GET /v1/customers/cust_999 (404 Not Found)"
try {
    Invoke-WebRequest -Uri "$BaseUrl/v1/customers/cust_999" -ErrorAction Stop
} catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $_.ErrorDetails.Message
}
Write-Host "`n-----------------------------------------------------------------`n"

# 3. Create & RFC 7807 400 Bad Request
Write-Host "[PENGUJIAN 3: Create Resource & RFC 7807 400 Bad Request]" -ForegroundColor Green
Write-Host "-> POST /v1/customers dengan data tidak valid (400 Bad Request)"
try {
    Invoke-WebRequest -Uri "$BaseUrl/v1/customers" -Method POST -ContentType "application/json" -Body '{"name":"","email":"salah"}' -ErrorAction Stop
} catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $_.ErrorDetails.Message
}
Write-Host "`n-----------------------------------------------------------------`n"

# 4. Security & RFC 7807 401 Unauthorized
Write-Host "[PENGUJIAN 4: Security Scheme & RFC 7807 401 Unauthorized]" -ForegroundColor Green
Write-Host "-> GET /v1/payment_intents/pi_src_1001/secure-check tanpa Token (401 Unauthorized)"
try {
    Invoke-WebRequest -Uri "$BaseUrl/v1/payment_intents/pi_src_1001/secure-check" -ErrorAction Stop
} catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $_.ErrorDetails.Message
}

Write-Host "`n-> GET /v1/payment_intents/pi_src_1001/secure-check dengan Bearer sk_src_test123 (200 OK)"
Invoke-RestMethod -Uri "$BaseUrl/v1/payment_intents/pi_src_1001/secure-check" -Headers @{ Authorization = "Bearer sk_src_test123" } | ConvertTo-Json -Depth 2
Write-Host "-----------------------------------------------------------------`n"

# 5. POST Kritikal Tanpa Idempotency-Key
Write-Host "[PENGUJIAN 5: POST Kritikal - Header Idempotency-Key Hilang]" -ForegroundColor Green
try {
    Invoke-WebRequest -Uri "$BaseUrl/v1/payment_intents/pi_src_1001/confirm" -Method POST -ContentType "application/json" -Body '{"paymentMethod":"qris"}' -ErrorAction Stop
} catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $_.ErrorDetails.Message
}
Write-Host "`n-----------------------------------------------------------------`n"

# 6. POST Kritikal Idempotensi (First Call MISS vs Retry HIT)
Write-Host "[PENGUJIAN 6: Idempotent Execution & Transparent Replay]" -ForegroundColor Green
$IdempotencyKey = "src-uuid-" + [guid]::NewGuid().ToString()
Write-Host "Menggunakan Idempotency-Key: $IdempotencyKey"

Write-Host "-> Eksekusi Pertama (MISS):"
$resp1 = Invoke-WebRequest -Uri "$BaseUrl/v1/payment_intents/pi_src_1001/confirm" -Method POST -ContentType "application/json" -Headers @{ "Idempotency-Key" = $IdempotencyKey } -Body '{"paymentMethod":"qris","notes":"Pelunasan QRIS Toko SRC"}'
Write-Host "Header Idempotent-Replay: $($resp1.Headers['Idempotent-Replay'])" -ForegroundColor Yellow
Write-Host "Header X-Cache-Lookup: $($resp1.Headers['X-Cache-Lookup'])" -ForegroundColor Yellow

Write-Host "`n-> Eksekusi Kedua (Retry / HIT REPLAY):"
$resp2 = Invoke-WebRequest -Uri "$BaseUrl/v1/payment_intents/pi_src_1001/confirm" -Method POST -ContentType "application/json" -Headers @{ "Idempotency-Key" = $IdempotencyKey } -Body '{"paymentMethod":"qris","notes":"Pelunasan QRIS Toko SRC"}'
Write-Host "Header Idempotent-Replay: $($resp2.Headers['Idempotent-Replay'])" -ForegroundColor Yellow
Write-Host "Header X-Cache-Lookup: $($resp2.Headers['X-Cache-Lookup'])" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------`n"

# 7. RFC 7807 409 Conflict
Write-Host "[PENGUJIAN 7: RFC 7807 409 Conflict (Payload Berbeda)]" -ForegroundColor Red
try {
    Invoke-WebRequest -Uri "$BaseUrl/v1/payment_intents/pi_src_1001/confirm" -Method POST -ContentType "application/json" -Headers @{ "Idempotency-Key" = $IdempotencyKey } -Body '{"paymentMethod":"cash","notes":"BODY BERBEDA"}' -ErrorAction Stop
} catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $_.ErrorDetails.Message
}

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "       SELURUH SKENARIO PENGUJIAN SELESAI DENGAN SUKSES!        " -ForegroundColor Cyan
Write-Host "=================================================================`n" -ForegroundColor Cyan
