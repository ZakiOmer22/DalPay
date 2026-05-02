$BASE = "http://localhost:5000/api/v1"
$PASS = "Test@123456"
$TIMESTAMP = Get-Date -Format "yyyyMMddHHmmss"
$SCRIPT_DIR = $PSScriptRoot
$RESULTS_FILE = Join-Path $SCRIPT_DIR "test-results.json"
$RESULTS = [System.Collections.ArrayList]::new()

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DalPay API - Complete Test Suite" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$global:PASS_COUNT = 0
$global:FAIL_COUNT = 0
$global:SKIP_COUNT = 0

function CallApi($Uri, $Method = "Get", $Headers = @{}, $Body = $null) {
    try {
        $params = @{ Uri = $Uri; Method = $Method; Headers = $Headers; ContentType = "application/json" }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json -Compress) }
        return Invoke-RestMethod @params
    } catch {
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            return $reader.ReadToEnd() | ConvertFrom-Json
        }
        return @{ success = $false; message = $_.Exception.Message }
    }
}

function AddResult($Endpoint, $Method, $Status, $Details) {
    $null = $RESULTS.Add(@{
        timestamp = (Get-Date).ToString("o")
        endpoint  = $Endpoint
        method    = $Method
        status    = $Status
        details   = $Details
    })
    if ($Status -eq "PASS") { $global:PASS_COUNT++ }
    if ($Status -eq "FAIL") { $global:FAIL_COUNT++ }
    if ($Status -eq "SKIP") { $global:SKIP_COUNT++ }
}

function Pass($msg) { Write-Host "  [PASS] $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red }
function Skip($msg) { Write-Host "  [SKIP] $msg" -ForegroundColor Yellow }

# ===== 1. HEALTH =====
Write-Host "1. HEALTH CHECK" -ForegroundColor Yellow
$r = CallApi -Uri "http://localhost:5000/health"
if ($r.status -eq "ok") { Pass "Alive"; AddResult "/health" "GET" "PASS" "OK" }
else { Fail "Down"; AddResult "/health" "GET" "FAIL" "Down" }

# ===== 2. REGISTER =====
Write-Host "2. REGISTER" -ForegroundColor Yellow
$body = @{ nationalId = "SL-TEST-$TIMESTAMP"; firstName = "Zacki"; lastName = "Omer"; phoneNumber = "+25263$($TIMESTAMP.Substring(8))"; password = $PASS }
$r = CallApi -Uri "$BASE/auth/register" -Method Post -Body $body
if ($r.success) {
    Pass $r.data.user.national_id
    AddResult "/auth/register" "POST" "PASS" $r.data.user.national_id
    $USER_TOKEN  = $r.data.accessToken
    $TAXPAYER_ID = $r.data.user.taxpayer_id
    $REFRESH_TKN = $r.data.refreshToken
} else {
    Fail $r.message
    AddResult "/auth/register" "POST" "FAIL" $r.message
}

# ===== 3. ADMIN LOGIN =====
Write-Host "3. ADMIN LOGIN" -ForegroundColor Yellow
$r = CallApi -Uri "$BASE/auth/login" -Method Post -Body @{ nationalId = "SL-2024-001"; password = "Test@123456" }
if ($r.success -and $r.data.user.role -match "admin") {
    Pass $r.data.user.role
    AddResult "/auth/login" "POST" "PASS" $r.data.user.role
    $ADMIN_TOKEN = $r.data.accessToken
} else {
    Skip "No admin user in DB"
    AddResult "/auth/login" "POST" "SKIP" "No admin"
    $ADMIN_TOKEN = $null
}

# ===== 4. TAX TYPES =====
Write-Host "4. TAX ASSESSMENT TYPES" -ForegroundColor Yellow
$r = CallApi -Uri "$BASE/tax/assessment-types" -Headers @{ Authorization = "Bearer $USER_TOKEN" }
if ($r.success) {
    Pass "$($r.data.Count) types"
    AddResult "/tax/assessment-types" "GET" "PASS" $r.data.Count
    $TYPE_ID = $r.data[0].type_id
} else { Fail $r.message; AddResult "/tax/assessment-types" "GET" "FAIL" $r.message }

# ===== 5. PROVIDERS =====
Write-Host "5. MOBILE MONEY PROVIDERS" -ForegroundColor Yellow
$r = CallApi -Uri "$BASE/payment/providers" -Headers @{ Authorization = "Bearer $USER_TOKEN" }
if ($r.success) {
    Pass "$($r.data.Count) providers"
    AddResult "/payment/providers" "GET" "PASS" $r.data.Count
    $PROVIDER_ID = $r.data[0].provider_id
} else { Fail $r.message; AddResult "/payment/providers" "GET" "FAIL" $r.message }

# ===== 6. CREATE ASSESSMENT =====
Write-Host "6. CREATE ASSESSMENT" -ForegroundColor Yellow
if ($ADMIN_TOKEN -and $TYPE_ID -and $TAXPAYER_ID) {
    $r = CallApi -Uri "$BASE/tax/assessments" -Method Post -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -Body @{
        taxpayerId = $TAXPAYER_ID; assessmentTypeId = $TYPE_ID; assessmentYear = 2026
        assessedAmount = 500.00; assessmentDate = "2026-04-29"; paymentDueDate = "2026-06-30"
        assessmentBasis = "Monthly income USD 1,000"
    }
    if ($r.success) { Pass $r.data.assessment_id; AddResult "/tax/assessments" "POST" "PASS" $r.data.assessment_id; $ASSESSMENT_ID = $r.data.assessment_id }
    else { Fail $r.message; AddResult "/tax/assessments" "POST" "FAIL" $r.message; $ASSESSMENT_ID = $null }
} else { Skip "No admin"; AddResult "/tax/assessments" "POST" "SKIP" "No admin"; $ASSESSMENT_ID = $null }

# ===== 7. MY ASSESSMENTS =====
Write-Host "7. MY ASSESSMENTS" -ForegroundColor Yellow
$r = CallApi -Uri "$BASE/tax/assessments" -Headers @{ Authorization = "Bearer $USER_TOKEN" }
if ($r.success) { Pass "Count: $($r.data.Count)"; AddResult "/tax/assessments" "GET" "PASS" $r.data.Count }
else { Fail $r.message; AddResult "/tax/assessments" "GET" "FAIL" $r.message }

# ===== 8. ASSESSMENT DETAIL =====
Write-Host "8. ASSESSMENT DETAIL" -ForegroundColor Yellow
if ($ASSESSMENT_ID) {
    $r = CallApi -Uri "$BASE/tax/assessments/$ASSESSMENT_ID" -Headers @{ Authorization = "Bearer $USER_TOKEN" }
    if ($r.success) { Pass $r.data.status; AddResult "/tax/assessments/:id" "GET" "PASS" $r.data.status }
    else { Fail $r.message; AddResult "/tax/assessments/:id" "GET" "FAIL" $r.message }
} else { Skip "No assessment"; AddResult "/tax/assessments/:id" "GET" "SKIP" "No assessment" }

# ===== 9. SUMMARY =====
Write-Host "9. TAX SUMMARY" -ForegroundColor Yellow
$r = CallApi -Uri "$BASE/tax/summary" -Headers @{ Authorization = "Bearer $USER_TOKEN" }
if ($r.success) { Pass "Due: $($r.data.assessments.total_due)"; AddResult "/tax/summary" "GET" "PASS" $r.data.assessments.total_due }
else { Fail $r.message; AddResult "/tax/summary" "GET" "FAIL" $r.message }

# ===== 10. INITIATE PAYMENT =====
Write-Host "10. INITIATE PAYMENT" -ForegroundColor Yellow
if ($ASSESSMENT_ID -and $PROVIDER_ID) {
    $r = CallApi -Uri "$BASE/payment/initiate" -Method Post -Headers @{ Authorization = "Bearer $USER_TOKEN" } -Body @{
        assessmentId = $ASSESSMENT_ID; amount = 250.00; providerId = $PROVIDER_ID; phoneNumber = "+252631111111"
    }
    if ($r.success) { Pass $r.data.payment_status; AddResult "/payment/initiate" "POST" "PASS" $r.data.payment_status; $PAYMENT_ID = $r.data.payment_id; $TXN_REF = $r.data.transaction_reference }
    else { Fail $r.message; AddResult "/payment/initiate" "POST" "FAIL" $r.message; $PAYMENT_ID = $null; $TXN_REF = $null }
} else { Skip "No assessment/provider"; AddResult "/payment/initiate" "POST" "SKIP" "No data"; $PAYMENT_ID = $null; $TXN_REF = $null }

# ===== 11. PAYMENT STATUS =====
Write-Host "11. PAYMENT STATUS" -ForegroundColor Yellow
if ($PAYMENT_ID) {
    $r = CallApi -Uri "$BASE/payment/status/$PAYMENT_ID" -Headers @{ Authorization = "Bearer $USER_TOKEN" }
    if ($r.success) { Pass $r.data.payment_status; AddResult "/payment/status/:id" "GET" "PASS" $r.data.payment_status }
    else { Fail $r.message; AddResult "/payment/status/:id" "GET" "FAIL" $r.message }
} else { Skip "No payment"; AddResult "/payment/status/:id" "GET" "SKIP" "No payment" }

# ===== 12. CONFIRM PAYMENT =====
Write-Host "12. CONFIRM PAYMENT" -ForegroundColor Yellow
if ($PAYMENT_ID -and $TXN_REF) {
    $r = CallApi -Uri "$BASE/payment/confirm" -Method Post -Headers @{ Authorization = "Bearer $USER_TOKEN" } -Body @{ paymentId = $PAYMENT_ID; transactionRef = $TXN_REF; status = "confirmed" }
    if ($r.success) { Pass "Confirmed"; AddResult "/payment/confirm" "POST" "PASS" "OK" }
    else { Fail $r.message; AddResult "/payment/confirm" "POST" "FAIL" $r.message }
} else { Skip "No payment"; AddResult "/payment/confirm" "POST" "SKIP" "No payment" }

# ===== 13. PAYMENT HISTORY =====
Write-Host "13. PAYMENT HISTORY" -ForegroundColor Yellow
$url = $BASE + "/payment/history?page=1&limit=10"
$r = CallApi -Uri $url -Headers @{ Authorization = "Bearer $USER_TOKEN" }
if ($r.success) { Pass "Total: $($r.data.total)"; AddResult "/payment/history" "GET" "PASS" $r.data.total }
else { Fail $r.message; AddResult "/payment/history" "GET" "FAIL" $r.message }

# ===== 14. RUN RECONCILIATION =====
Write-Host "14. RUN RECONCILIATION" -ForegroundColor Yellow
if ($ADMIN_TOKEN) {
    $r = CallApi -Uri "$BASE/reconciliation/run" -Method Post -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" } -Body @{ date = "2026-04-29" }
    if ($r.success) { Pass $r.data.date; AddResult "/reconciliation/run" "POST" "PASS" "OK" }
    else { Fail $r.message; AddResult "/reconciliation/run" "POST" "FAIL" $r.message }
} else { Skip "No admin"; AddResult "/reconciliation/run" "POST" "SKIP" "No admin" }

# ===== 15. RECONCILIATION REPORT =====
Write-Host "15. RECONCILIATION REPORT" -ForegroundColor Yellow
if ($ADMIN_TOKEN) {
    $r = CallApi -Uri "$BASE/reconciliation/report/2026-04-29" -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
    if ($r.success) { Pass "Records: $($r.data.Count)"; AddResult "/reconciliation/report/:date" "GET" "PASS" $r.data.Count }
    else { Fail $r.message; AddResult "/reconciliation/report/:date" "GET" "FAIL" $r.message }
} else { Skip "No admin"; AddResult "/reconciliation/report/:date" "GET" "SKIP" "No admin" }

# ===== 16. RECONCILIATION SUMMARY =====
Write-Host "16. RECONCILIATION SUMMARY" -ForegroundColor Yellow
if ($ADMIN_TOKEN) {
    $url = $BASE + "/reconciliation/summary?days=30"
    $r = CallApi -Uri $url -Headers @{ Authorization = "Bearer $ADMIN_TOKEN" }
    if ($r.success) { Pass "Days: $($r.data.Count)"; AddResult "/reconciliation/summary" "GET" "PASS" $r.data.Count }
    else { Fail $r.message; AddResult "/reconciliation/summary" "GET" "FAIL" $r.message }
} else { Skip "No admin"; AddResult "/reconciliation/summary" "GET" "SKIP" "No admin" }

# ===== 17. REFRESH TOKEN =====
Write-Host "17. REFRESH TOKEN" -ForegroundColor Yellow
if ($REFRESH_TKN) {
    $r = CallApi -Uri "$BASE/auth/refresh-token" -Method Post -Body @{ refreshToken = $REFRESH_TKN }
    if ($r.success) { Pass "OK"; AddResult "/auth/refresh-token" "POST" "PASS" "OK" }
    else { Fail $r.message; AddResult "/auth/refresh-token" "POST" "FAIL" $r.message }
} else { Skip "No token"; AddResult "/auth/refresh-token" "POST" "SKIP" "No token" }

# ===== 18. LOGOUT =====
Write-Host "18. LOGOUT" -ForegroundColor Yellow
$r = CallApi -Uri "$BASE/auth/logout" -Method Post -Headers @{ Authorization = "Bearer $USER_TOKEN" }
if ($r.success) { Pass "OK"; AddResult "/auth/logout" "POST" "PASS" "OK" }
else { Fail $r.message; AddResult "/auth/logout" "POST" "FAIL" $r.message }

# ===== SAVE =====
$RESULTS | ConvertTo-Json -Depth 3 | Out-File -FilePath $RESULTS_FILE -Encoding UTF8

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "  PASS: $PASS_COUNT | FAIL: $FAIL_COUNT | SKIP: $SKIP_COUNT" -ForegroundColor Cyan
Write-Host "  Report: $RESULTS_FILE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan