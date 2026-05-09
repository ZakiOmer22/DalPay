$BASE = "http://localhost:5000/api/v1"
$PHONE = "+252634567890"
$PASSWORD = "SecureP@ss123"
$USER_ID = "cb4b1d15-3fe3-4f70-b853-1d31353157d6"
$DATABASE_URL = $env:DATABASE_URL   # must be set in your environment, or replace with your connection string

Write-Host "DalPay API Test - Using user $PHONE" -ForegroundColor Cyan

# Helper – call an API endpoint
function CallApi($Uri, $Method = "Get", $Headers = @{}, $Body = $null) {
    try {
        $params = @{ Uri = $Uri; Method = $Method; Headers = $Headers; ContentType = "application/json" }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json -Compress) }
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            return $reader.ReadToEnd() | ConvertFrom-Json
        }
        return @{ success = $false; message = $_.Exception.Message; statusCode = 0 }
    }
}

# 1. LOGIN
Write-Host "1. LOGIN" -ForegroundColor Yellow
$login = CallApi -Uri "$BASE/auth/login" -Method Post -Body @{ phoneNumber = $PHONE; password = $PASSWORD }
if (-not $login.success) {
    Write-Host "Login failed: $($login.message)" -ForegroundColor Red
    exit
}
$TOKEN = $login.data.accessToken
Write-Host "  Role: $($login.data.user.role)" -ForegroundColor Green
if ($login.data.user.role -ne "admin") {
    Write-Host "  WARNING: User is not admin. Run: UPDATE users SET role='admin' WHERE id='$USER_ID';" -ForegroundColor Yellow
    Write-Host "  Then re‑login to get an admin token." -ForegroundColor Yellow
    exit
}

# 2. SEND OTP
Write-Host "2. SEND OTP" -ForegroundColor Yellow
$otp = CallApi -Uri "$BASE/auth/send-otp" -Method Post -Headers @{ Authorization = "Bearer $TOKEN" } -Body @{ type = "email" }
if (-not $otp.success) {
    Write-Host "  OTP send failed: $($otp.message)" -ForegroundColor Red
    exit
}
Write-Host "  OTP sent" -ForegroundColor Green

# 3. FETCH OTP CODE FROM DATABASE
Write-Host "3. FETCH OTP CODE" -ForegroundColor Yellow
if (-not $DATABASE_URL) {
    Write-Host "  DATABASE_URL environment variable not set. Cannot auto‑fetch OTP." -ForegroundColor Red
    Write-Host "  Please run the following SQL manually and then use the verification command below:" -ForegroundColor Yellow
    Write-Host "  SELECT code FROM otp_codes WHERE user_id = '$USER_ID' ORDER BY created_at DESC LIMIT 1;" -ForegroundColor Yellow
    exit
}
# Use psql to get the latest OTP code (requires psql installed and in PATH)
$otpCode = & psql $DATABASE_URL -t -c "SELECT code FROM otp_codes WHERE user_id = '$USER_ID' AND used = FALSE ORDER BY created_at DESC LIMIT 1;" 2>$null
$otpCode = $otpCode.Trim()
if (-not $otpCode) {
    Write-Host "  Could not fetch OTP code from database." -ForegroundColor Red
    exit
}
Write-Host "  OTP code: $otpCode" -ForegroundColor Green

# 4. VERIFY OTP (same token, so fingerprint matches)
Write-Host "4. VERIFY OTP" -ForegroundColor Yellow
$verify = CallApi -Uri "$BASE/auth/verify-otp" -Method Post -Headers @{ Authorization = "Bearer $TOKEN" } -Body @{ code = $otpCode }
if (-not $verify.success) {
    Write-Host "  OTP verification failed: $($verify.message)" -ForegroundColor Red
    exit
}
Write-Host "  OTP verified successfully" -ForegroundColor Green

# 5. GENERATE TAX ASSESSMENTS
Write-Host "5. GENERATE ASSESSMENTS" -ForegroundColor Yellow
$gen = CallApi -Uri "$BASE/tax/assessments/generate" -Method Post -Headers @{ Authorization = "Bearer $TOKEN" } -Body @{ taxYear = 2026 }
if ($gen.success) {
    Write-Host "  Assessments generated for $($gen.data.count) user(s)" -ForegroundColor Green
} else {
    Write-Host "  Generation failed: $($gen.message)" -ForegroundColor Red
    exit
}

# 6. VIEW ASSESSMENTS (pick the first unpaid)
Write-Host "6. VIEW ASSESSMENTS" -ForegroundColor Yellow
$list = CallApi -Uri "$BASE/tax/assessments" -Headers @{ Authorization = "Bearer $TOKEN" }
if (-not $list.success -or $list.data.Count -eq 0) {
    Write-Host "  No assessments found." -ForegroundColor Red
    exit
}
$unpaid = $list.data | Where-Object { $_.status -eq "unpaid" } | Select-Object -First 1
if (-not $unpaid) {
    Write-Host "  No unpaid assessment (all already paid)." -ForegroundColor Yellow
    exit
}
$ASSESSMENT_ID = $unpaid.assessment_id
Write-Host "  Using assessment: $ASSESSMENT_ID ($($unpaid.tax_type))" -ForegroundColor Green

# 7. INITIATE PAYMENT (step‑up is now satisfied)
Write-Host "7. INITIATE PAYMENT" -ForegroundColor Yellow
$init = CallApi -Uri "$BASE/payment/initiate" -Method Post `
    -Headers @{ Authorization = "Bearer $TOKEN"; "X-Idempotency-Key" = "ps-test-001" } `
    -Body @{
        assessmentId = $ASSESSMENT_ID
        amount       = 250
        providerId   = "zaad"
        phoneNumber  = $PHONE
    }

if ($init.success) {
    $PAYMENT_ID = $init.data.id
    $TXN_REF    = $init.data.transaction_reference
    Write-Host "  Payment initiated: $PAYMENT_ID (ref: $TXN_REF)" -ForegroundColor Green
} else {
    Write-Host "  Initiation failed: $($init.code) - $($init.message)" -ForegroundColor Red
    exit
}

# 8. CONFIRM PAYMENT
Write-Host "8. CONFIRM PAYMENT" -ForegroundColor Yellow
$confirm = CallApi -Uri "$BASE/payment/confirm" -Method Post `
    -Headers @{ Authorization = "Bearer $TOKEN" } `
    -Body @{
        paymentId      = $PAYMENT_ID
        transactionRef = $TXN_REF
        status         = "confirmed"
    }
if ($confirm.success) {
    Write-Host "  Payment confirmed" -ForegroundColor Green
} else {
    Write-Host "  Confirmation failed: $($confirm.message)" -ForegroundColor Red
}

# 9. LEDGER INTEGRITY
Write-Host "9. LEDGER VERIFY" -ForegroundColor Yellow
$ledger = CallApi -Uri "$BASE/ledger/verify" -Headers @{ Authorization = "Bearer $TOKEN" }
if ($ledger.success -and $ledger.data.balanced) {
    Write-Host "  Ledger balanced" -ForegroundColor Green
} else {
    Write-Host "  Ledger check failed" -ForegroundColor Red
}

# 10. DASHBOARD OVERVIEW
Write-Host "10. DASHBOARD" -ForegroundColor Yellow
$dash = CallApi -Uri "$BASE/dashboard/overview" -Headers @{ Authorization = "Bearer $TOKEN" }
if ($dash.success) {
    Write-Host "  Revenue: $($dash.data.revenue)  |  Outstanding: $($dash.data.outstanding)" -ForegroundColor Green
} else {
    Write-Host "  Dashboard failed: $($dash.message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "All core tests completed." -ForegroundColor Cyan
Write-Host "Next: manually test USSD, token reuse, brute-force using Postman." -ForegroundColor Cyan