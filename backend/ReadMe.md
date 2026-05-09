<p align="center">
  <img src="public/logo.png" alt="DalPay Logo" width="249" />
</p>

# DalPay – Digital Tax Payment System for Somaliland
**Government& Military grade tax platform**  
Pay taxes via mobile money (Zaad / eDahab / Nomad) | Real-time fraud detection | Double-entry ledger | USSD support | AI-powered risk scoring

---
## Table of Contents

- [DalPay – Digital Tax Payment System for Somaliland](#dalpay--digital-tax-payment-system-for-somaliland)
  - [Table of Contents](#table-of-contents)
  - [1.0 - Overview](#10---overview)
  - [1.2 - Tech Stack](#12---tech-stack)
  - [1.3 - Project Structure](#13---project-structure)
  - [1.4 - Database Schema](#14---database-schema)
    - [1.4.1 - Users and Authentication](#141---users-and-authentication)
    - [Taxpayer Data](#taxpayer-data)
    - [Documents](#documents)
    - [Tax Assessments](#tax-assessments)
    - [Payments](#payments)
    - [Fraud Analysis](#fraud-analysis)
    - [Idempotency Keys (Payment Duplication Prevention)](#idempotency-keys-payment-duplication-prevention)
    - [Disputes](#disputes)
    - [Double-Entry Ledger](#double-entry-ledger)
    - [Audit Logs (Hash-Chained)](#audit-logs-hash-chained)
    - [Notifications](#notifications)
    - [1.4.2 - Views](#142---views)
  - [1.5 - API Endpoints](#15---api-endpoints)
    - [1.5.1 - Auth (`/auth`)](#151---auth-auth)
    - [1.5.2 - Tax (`/tax`)](#152---tax-tax)
    - [1.5.3 - Payments (`/payment`)](#153---payments-payment)
    - [1.5.4 - Dashboard (`/dashboard`)](#154---dashboard-dashboard)
    - [1.5.4 - Fraud \& AI (`/fraud`)](#154---fraud--ai-fraud)
    - [1.5.5 - Documents (`/documents`)](#155---documents-documents)
    - [1.5.6 - Reconciliation (`/reconciliation`)](#156---reconciliation-reconciliation)
    - [1.5.7 - USSD (`/ussd`)](#157---ussd-ussd)
  - [1.6 - Security Features](#16---security-features)
    - [1.6.1 - Data Encryption (AES-256-GCM)](#161---data-encryption-aes-256-gcm)
    - [1.6.2 - Encryption Key Rotation (Versioned AES‑256‑GCM)](#162---encryption-key-rotation-versioned-aes256gcm)
    - [1.6.3 - Password Storage (bcrypt with 12 rounds)](#163---password-storage-bcrypt-with-12-rounds)
    - [1.6.4 - Token Management](#164---token-management)
      - [Access \& Refresh Tokens](#access--refresh-tokens)
      - [Refresh Token Rotation \& Reuse Detection](#refresh-token-rotation--reuse-detection)
      - [Token Versioning (Global Logout)](#token-versioning-global-logout)
      - [Token Fingerprinting (Session Binding)](#token-fingerprinting-session-binding)
      - [JWT Secret Rotation (Key Versioning)](#jwt-secret-rotation-key-versioning)
      - [JTI Blacklisting (Instant Access Token Revocation)](#jti-blacklisting-instant-access-token-revocation)
    - [1.6.5 - Brute‑Force Protection (Database‑Level Account Lock)](#165---bruteforce-protection-databaselevel-account-lock)
    - [Step‑Up Authentication (OTP‑Gated Sensitive Actions)](#stepup-authentication-otpgated-sensitive-actions)
    - [1.6.6 - HTTP Security Headers (Helmet + Customization)](#166---http-security-headers-helmet--customization)
    - [API Request Signing (External Callbacks)](#api-request-signing-external-callbacks)
    - [1.6.7 - DDoS Mitigation (Rate Limiting + Slow‑Down)](#167---ddos-mitigation-rate-limiting--slowdown)
    - [1.6.8 - Role‑Based Access Control (RBAC)](#168---rolebased-access-control-rbac)
    - [1.6.9 - Idempotency Protection (Payment Integrity)](#169---idempotency-protection-payment-integrity)
    - [1.6.10 - Immutable Audit Trail (Hash‑Chained)](#1610---immutable-audit-trail-hashchained)
    - [1.6.11 - Parameter Pollution Prevention (HPP)](#1611---parameter-pollution-prevention-hpp)
    - [1.6.12 - File Upload Security](#1612---file-upload-security)
    - [1.6.13 - Transaction Isolation (SERIALIZABLE)](#1613---transaction-isolation-serializable)
    - [Outbox Pattern for Guaranteed Event Delivery](#outbox-pattern-for-guaranteed-event-delivery)
    - [1.6.14 - Ledger Integrity Verification](#1614---ledger-integrity-verification)
    - [1.6.14 - Row‑Level Security (RLS) with Role Awareness](#1614---rowlevel-security-rls-with-role-awareness)
    - [1.6.15 - USSD Session Persistence (Redis)](#1615---ussd-session-persistence-redis)
    - [Additional Security Measures](#additional-security-measures)
  - [1.7 - USSD System](#17---ussd-system)
    - [1.7.1 - Architecture](#171---architecture)
    - [1.7.2 - Request Format](#172---request-format)
    - [1.7.3 - Flow Details](#173---flow-details)
    - [1.7.4 - Implementation Files](#174---implementation-files)
    - [1.7.5 - Integration with Core Modules](#175---integration-with-core-modules)
  - [1.8 - AI Fraud Detection](#18---ai-fraud-detection)
    - [1.8.1 - Rule‑Based Engine](#181---rulebased-engine)
    - [1.8.2 - AI‑Powered Analysis (Gemini)](#182---aipowered-analysis-gemini)
    - [1.8.3 - Manual Trigger \& User Risk Profiling](#183---manual-trigger--user-risk-profiling)
    - [1.8.4 - Implementation Files](#184---implementation-files)
    - [1.8.5 - Automation \& Manual Trigger](#185---automation--manual-trigger)
    - [1.8.6 - Data Flow](#186---data-flow)
    - [1.8.7 - Files](#187---files)
    - [1.8.8 - Model \& Configuration](#188---model--configuration)
  - [1.9 - Deployment](#19---deployment)
    - [1.9.1 - Backend](#191---backend)
    - [1.9.2 - Frontend](#192---frontend)
  - [2.0 Testing](#20-testing)
    - [2.1 Prerequisites](#21-prerequisites)
    - [2.2 Environment Setup](#22-environment-setup)
    - [2.3 Test Flow](#23-test-flow)
      - [2.3.1 Register a Taxpayer](#231-register-a-taxpayer)
      - [2.3.2 Login (Optional, for a fresh token)](#232-login-optional-for-a-fresh-token)
      - [2.3.3 Verify OTP (Required for Step‑Up Auth)](#233-verify-otp-required-for-stepup-auth)
      - [2.3.4 Create Taxpayer Profile (Admin Step)](#234-create-taxpayer-profile-admin-step)
      - [2.3.5 Generate Tax Assessments (Admin)](#235-generate-tax-assessments-admin)
      - [2.3.6 View Assessments (Taxpayer)](#236-view-assessments-taxpayer)
      - [2.3.7 Initiate Payment (Step‑Up Test)](#237-initiate-payment-stepup-test)
      - [2.3.8 Idempotency Test on Initiate](#238-idempotency-test-on-initiate)
      - [2.3.9 Confirm Payment](#239-confirm-payment)
      - [2.3.10 Confirm Idempotency Test](#2310-confirm-idempotency-test)
      - [2.3.11 Verify Ledger Integrity](#2311-verify-ledger-integrity)
      - [2.3.12 Check Admin Dashboard](#2312-check-admin-dashboard)
      - [2.3.13 USSD Simulation](#2313-ussd-simulation)
      - [2.3.14 Token Reuse Detection Test](#2314-token-reuse-detection-test)
      - [2.3.15 Brute‑Force Lockout Test](#2315-bruteforce-lockout-test)
      - [2.3.16 Outbox \& Worker Verification](#2316-outbox--worker-verification)
      - [2.3.17 RLS Verification](#2317-rls-verification)
    - [2.4 Automated Testing (Future)](#24-automated-testing-future)
  - [2.5 - Team](#25---team)
  - [2.6 - License](#26---license)
  - [Project Information](#project-information)

---
## 1.0 - Overview

DalPay is a production-ready digital tax collection platform developed for the Somaliland Ministry of Finance. It replaces manual, cash-based tax collection with a secure, automated system accessible from any mobile phone – smartphones via the web portal or feature phones via USSD (*888#). Taxpayers can view their obligations, pay instantly through mobile money, upload identity documents, and dispute assessments. Government officials can auto-generate tax assessments, monitor revenue in real time, detect fraudulent activity with AI assistance, run daily reconciliations, and maintain an immutable audit trail.

The system is built with enterprise-grade security, complying with PCI-DSS, OWASP Top 10, and NIST SP 800-52 standards.

---

## 1.2 - Tech Stack

| Layer          | Technology                                               |
| -------------- | -------------------------------------------------------- |
| Frontend       | React 18, Vite, Tailwind CSS, Lucide Icons, Stripe.js    |
| Backend        | Node.js, Express, TypeScript, PostgreSQL                 |
| Authentication | JWT (access + refresh), bcrypt, token rotation, OTP, Stripe Identity |
| Encryption     | AES-256-GCM (data at rest)                               |
| AI             | Google Gemini 1.5 Flash (fraud analysis)                 |
| Payments       | Simulated mobile money (Zaad/eDahab) with idempotency    |
| Accounting     | Double-entry ledger (debit/credit)                       |
| Security       | Helmet, CSP, HPP, rate limiting, slow-down, RBAC, hash-chained audit logs |
| File Storage   | Local disk (documents)                                   |
| Deployment     | Frontend: Vercel  /  Backend: Render / Railway           |

---

## 1.3 - Project Structure

```
DalPay/
├── app/
│   ├── backend/                  # Express API server
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/         # Authentication + Stripe Identity
│   │   │   │   ├── tax/          # Tax assessments, disputes, rules, ledger
│   │   │   │   ├── payment/      # Payment initiation, confirmation, history
│   │   │   │   ├── reconciliation/
│   │   │   │   ├── documents/    # Upload & admin verification
│   │   │   │   ├── dashboard/    # Admin statistics
│   │   │   │   ├── fraud/        # Rule-based + Gemini AI fraud analysis
│   │   │   │   ├── ussd/         # USSD session engine
│   │   │   │   ├── notification/ # Email/SMS notifications
│   │   │   │   └── ledger/       # Double-entry accounting
│   │   │   ├── middleware/       # auth, RBAC, idempotency, validation, file upload
│   │   │   ├── utils/            # errors, response, encryption, audit, logger
│   │   │   ├── config/           # env, database
│   │   │   ├── database/         # migrations, schema
│   │   │   └── app.ts            # Entry point
│   │   ├── .env
│   │   └── package.json
│   └── web/                      # Vite React frontend
│       ├── public/
│       │   └── logo.png          # Application logo
│       ├── src/
│       │   ├── pages/            # Login, Register, Dashboard, USSD Simulator, etc.
│       │   ├── components/
│       │   ├── services/         # API client (authApi, paymentApi, etc.)
│       │   └── App.tsx
│       ├── .env
│       └── package.json
├── README.md
└── .gitignore
```

The application logo is located at `app/web/public/logo.png` and is used throughout the frontend.

---

## 1.4 - Database Schema

The PostgreSQL database contains the following tables and views.

### 1.4.1 - Users and Authentication

**users**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Unique user identifier               |
| full_name           | TEXT                     | Full name (e.g., "Ahmed Ali")        |
| phone               | TEXT (encrypted)         | Mobile number (AES-256-GCM encrypted)|
| email               | TEXT (encrypted)         | Email (encrypted)                    |
| national_id         | TEXT (encrypted)         | National ID number (encrypted)       |
| password_hash       | TEXT                     | bcrypt hashed password               |
| role                | ENUM ('taxpayer','admin','auditor') | User role               |
| token_version       | INTEGER                  | Incremented on global logout         |
| failed_attempts     | INTEGER                  | Consecutive failed login attempts    |
| lock_until          | TIMESTAMPTZ              | Account locked until this time       |
| refresh_token_hash  | TEXT                     | Hashed latest refresh token          |
| phone_hash          | TEXT                     | SHA-256 hash for lookup              |
| national_id_hash    | TEXT                     | SHA-256 hash for lookup              |
| email_hash          | TEXT                     | SHA-256 hash for lookup              |
| email_verified      | BOOLEAN                  | Email verification status            |
| phone_verified      | BOOLEAN                  | Phone verification status            |
| created_at          | TIMESTAMP                | Registration timestamp               |
| updated_at          | TIMESTAMP                | Last update timestamp                |

**user_sessions**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Session ID                           |
| user_id             | UUID (FK -> users)       | User reference                       |
| refresh_token_hash  | TEXT                     | Hashed refresh token for this session|
| ip                  | TEXT                     | IP address at login                  |
| user_agent           | TEXT                     | User-Agent string                    |
| is_revoked          | BOOLEAN                  | Whether session has been revoked     |
| created_at          | TIMESTAMPTZ              | Session start time                   |

**otp_codes**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | OTP ID                               |
| user_id             | UUID (FK -> users)       | User reference                       |
| code                | VARCHAR(6)               | 6-digit OTP                          |
| type                | TEXT ('email' or 'phone')| Verification target                  |
| expires_at          | TIMESTAMPTZ              | Expiry time                          |
| used                | BOOLEAN                  | Whether already used                 |
| created_at          | TIMESTAMPTZ              | Creation timestamp                   |

**revoked_tokens**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| jti                 | TEXT (PK)                | JWT ID of the revoked token          |
| expires_at          | TIMESTAMPTZ              | When the token would have expired    |

### Taxpayer Data

**taxpayer_profiles**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Profile ID                           |
| user_id             | UUID (FK -> users)       | User reference                       |
| occupation          | TEXT                     | Occupation                           |
| monthly_income      | NUMERIC                  | Declared monthly income              |
| region              | TEXT                     | Region of residence                  |
| district            | TEXT                     | District                             |
| business_name       | TEXT                     | Business name (if applicable)        |
| business_type       | TEXT                     | Business type                        |
| property_value      | NUMERIC                  | Value of property owned              |
| verified            | BOOLEAN                  | Admin verification flag              |
| created_at          | TIMESTAMP                | Creation timestamp                   |

### Documents

**documents**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Document ID                          |
| user_id             | UUID (FK -> users)       | User reference                       |
| document_type       | TEXT                     | Type (e.g., "id_card")               |
| file_url            | TEXT                     | Path to uploaded file                |
| verified            | BOOLEAN                  | Admin verification status            |
| reviewed_by         | UUID (FK -> users)       | Admin who reviewed                   |
| created_at          | TIMESTAMP                | Upload timestamp                     |

### Tax Assessments

**tax_assessments**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Assessment ID                        |
| user_id             | UUID (FK -> users)       | Taxpayer                             |
| tax_type            | ENUM ('income_tax','business_tax','property_tax','sales_tax','customs_tax') |
| amount              | NUMERIC                  | Tax amount                           |
| year                | INTEGER                  | Tax year                             |
| due_date            | DATE                     | Payment deadline                     |
| status              | ENUM ('unpaid','partially_paid','paid','overdue') |
| auto_generated      | BOOLEAN                  | Whether generated by rule engine     |
| generated_by        | UUID (FK -> users)       | Admin who triggered generation       |
| created_at          | TIMESTAMP                | Creation timestamp                   |

### Payments

**payments**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Payment ID                           |
| user_id             | UUID (FK -> users)       | Taxpayer                             |
| assessment_id       | UUID (FK -> tax_assessments) | Related assessment               |
| amount              | NUMERIC                  | Amount paid                          |
| provider            | TEXT                     | Mobile money provider (Zaad, etc.)   |
| transaction_ref     | TEXT                     | External transaction reference       |
| status              | ENUM ('pending','processing','confirmed','failed','reversed') |
| fraud_status        | ENUM ('none','suspicious','high_risk') |
| created_at          | TIMESTAMP                | Payment timestamp                    |

### Fraud Analysis

**fraud_analysis**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Analysis ID                          |
| payment_id          | UUID (FK -> payments)    | Payment reference                    |
| risk_score          | NUMERIC                  | 0-1 risk score                       |
| reason              | TEXT                     | Explanation of score                 |
| flagged             | BOOLEAN                  | Whether flagged as suspicious        |
| created_at          | TIMESTAMP                | Analysis timestamp                   |

### Idempotency Keys (Payment Duplication Prevention)

**idempotency_keys**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| key                 | TEXT (PK)                | Client-supplied key                  |
| response            | JSONB                    | Stored response body                 |
| created_at          | TIMESTAMPTZ              | Creation timestamp                   |

### Disputes

**tax_disputes**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Dispute ID                           |
| assessment_id       | UUID (FK -> tax_assessments) | Assessment being disputed        |
| user_id             | UUID (FK -> users)       | Taxpayer                             |
| reason              | TEXT                     | Reason for dispute                   |
| proposed_amount     | NUMERIC                  | Suggested corrected amount           |
| evidence            | TEXT                     | Supporting evidence                  |
| status              | TEXT ('pending','approved','rejected') |
| resolved_by         | UUID (FK -> users)       | Admin who resolved                   |
| adjusted_amount     | NUMERIC                  | Final amount after resolution        |
| resolution_comment  | TEXT                     | Admin comment                        |
| resolved_at         | TIMESTAMPTZ              | Resolution timestamp                 |
| created_at          | TIMESTAMPTZ              | Filing timestamp                     |

### Double-Entry Ledger

**ledger_entries**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Entry ID                             |
| user_id             | UUID (FK -> users)       | Taxpayer                             |
| amount              | NUMERIC                  | Transaction amount                   |
| type                | TEXT ('debit' or 'credit') | Debit or credit                    |
| account             | TEXT                     | Chart-of-accounts name               |
| reference           | TEXT                     | Payment or assessment ID             |
| description         | TEXT                     | Narrative                            |
| created_at          | TIMESTAMPTZ              | Entry timestamp                      |

### Audit Logs (Hash-Chained)

**audit_logs**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Log ID                               |
| user_id             | UUID                      | Actor                                |
| action              | TEXT                     | Action description                   |
| entity              | TEXT                     | Entity type (e.g., 'users')          |
| entity_id           | UUID                     | Entity ID                            |
| metadata            | JSONB                    | Additional details                   |
| hash_chain          | TEXT                     | SHA-256 chain (tamper-proof)         |
| created_at          | TIMESTAMP                | Action timestamp                     |

### Notifications

**notifications**  
| Column              | Type                     | Description                          |
|---------------------|--------------------------|--------------------------------------|
| id                  | UUID (PK)                | Notification ID                      |
| user_id             | UUID (FK -> users)       | Recipient                            |
| title               | TEXT                     | Notification title                   |
| message             | TEXT                     | Notification body                    |
| read                | BOOLEAN                  | Read status                          |
| created_at          | TIMESTAMP                | Timestamp                            |

### 1.4.2 - Views

**user_tax_history**  
A view joining `users`, `tax_assessments`, and `payments` to provide a consolidated history.

---

## 1.5 - API Endpoints

Base URL: `http://localhost:5173/api/v1` (development) or `https://<backend-host>/api/v1` (production).  
All authenticated endpoints require `Authorization: Bearer <accessToken>`.

### 1.5.1 - Auth (`/auth`)

| Method | Endpoint                        | Auth   | Role          | Description                              |
|--------|---------------------------------|--------|---------------|------------------------------------------|
| POST   | /register                       | Public | -             | Register a new taxpayer                  |
| POST   | /login                          | Public | -             | Login with email/phone/national ID       |
| POST   | /refresh-token                  | Public | -             | Obtain new token pair using refresh token|
| POST   | /logout                         | Bearer | Any           | Logout (revoke session + blacklist JTI)  |
| POST   | /send-otp                       | Bearer | Any           | Send OTP to email or phone               |
| POST   | /verify-otp                     | Bearer | Any           | Verify OTP and mark contact verified     |
| POST   | /verification/create            | Bearer | Any           | Create Stripe Identity verification session|
| GET    | /verification/status/:sessionId | Bearer | Any           | Check Stripe verification status         |

### 1.5.2 - Tax (`/tax`)

| Method | Endpoint                           | Auth   | Role         | Description                                   |
|--------|------------------------------------|--------|--------------|-----------------------------------------------|
| GET    | /assessments                       | Bearer | Any          | Get own tax assessments                       |
| GET    | /assessments/:assessmentId         | Bearer | Any          | Get a specific assessment                     |
| POST   | /assessments                       | Bearer | Admin        | Manually create an assessment                 |
| POST   | /assessments/generate              | Bearer | Admin        | Auto-generate assessments for all taxpayers   |
| GET    | /assessment-types                  | Bearer | Any          | List tax types                                |
| GET    | /summary                           | Bearer | Any          | Get taxpayer summary (due, paid, overdue)     |
| POST   | /disputes                          | Bearer | Any          | File a dispute against an assessment          |
| GET    | /disputes                          | Bearer | Any          | Get own disputes                              |
| GET    | /disputes/all                      | Bearer | Admin        | Get all disputes (optional ?status filter)    |
| PATCH  | /disputes/:disputeId               | Bearer | Admin        | Resolve a dispute (approve/reject)            |
| GET    | /ledger                            | Bearer | Admin/Auditor| View double-entry ledger entries              |

### 1.5.3 - Payments (`/payment`)

| Method | Endpoint                    | Auth   | Role | Description                                   |
|--------|-----------------------------|--------|------|-----------------------------------------------|
| POST   | /initiate                   | Bearer | Any  | Start a payment (idempotency enforced)        |
| POST   | /confirm                    | Bearer | Any  | Confirm a payment (webhook simulation)        |
| GET    | /history                    | Bearer | Any  | Get own payment history (paginated)           |
| GET    | /status/:paymentId          | Bearer | Any  | Get status of a single payment                |
| GET    | /providers                  | Bearer | Any  | List available mobile money providers         |

### 1.5.4 - Dashboard (`/dashboard`)

| Method | Endpoint              | Auth   | Role  | Description                                    |
|--------|-----------------------|--------|-------|------------------------------------------------|
| GET    | /overview             | Bearer | Admin | Total revenue, outstanding, user counts, fraud/dispute stats |
| GET    | /monthly-revenue      | Bearer | Admin | Monthly revenue trend (query: months)          |
| GET    | /recent-payments      | Bearer | Admin | Latest confirmed payments                      |
| GET    | /fraud-flags          | Bearer | Admin | Recent high-risk payments                      |
| POST   | /notify               | Bearer | Admin | Send custom notification to a user             |

### 1.5.4 - Fraud & AI (`/fraud`)

| Method | Endpoint                            | Auth   | Role          | Description                                   |
|--------|-------------------------------------|--------|---------------|-----------------------------------------------|
| GET    | /analyze-user/:userId               | Bearer | Admin/Auditor | Run Gemini AI risk assessment on a taxpayer   |
| POST   | /analyze-payment/:paymentId         | Bearer | Admin/Auditor | Re-run AI analysis on a specific payment      |

### 1.5.5 - Documents (`/documents`)

| Method | Endpoint                    | Auth   | Role  | Description                                   |
|--------|-----------------------------|--------|-------|-----------------------------------------------|
| POST   | /upload                     | Bearer | Any   | Upload an identity/address document (multipart)|
| GET    | /                           | Bearer | Any   | List own documents                            |
| GET    | /:documentId                | Bearer | Any   | Get a single document metadata                |
| PATCH  | /:documentId/verify         | Bearer | Admin | Approve or reject a document                  |

### 1.5.6 - Reconciliation (`/reconciliation`)

| Method | Endpoint              | Auth   | Role  | Description                                    |
|--------|-----------------------|--------|-------|------------------------------------------------|
| POST   | /run                  | Bearer | Admin | Run daily reconciliation for all providers    |
| GET    | /report/:date         | Bearer | Admin | Get reconciliation report for a date          |
| GET    | /summary               | Bearer | Admin | Last 30 days reconciliation summary           |

### 1.5.7 - USSD (`/ussd`)

| Method | Endpoint | Auth   | Description                                         |
|--------|----------|--------|-----------------------------------------------------|
| POST   | /        | Public | Process USSD session (send phoneNumber, text, sessionId) |

---

## 1.6 - Security Features

### 1.6.1 - Data Encryption (AES-256-GCM)

All personally identifiable information (PII) — national ID, phone number, and email address — is encrypted at rest using the Advanced Encryption Standard in Galois/Counter Mode (AES‑256‑GCM).

- **Implementation**
  - A 32‑byte (256‑bit) encryption key is loaded from the `ENCRYPTION_KEY` environment variable.
  - For each field, a random 16‑byte initialization vector (IV) is generated.
  - The plaintext is encrypted using `crypto.createCipheriv('aes-256-gcm', key, iv)`.
  - The resulting ciphertext, IV, and authentication tag are stored as a single colon‑delimited string (`iv:authTag:encrypted`).

- **Searching encrypted data**
  - To allow login by phone or national ID without decrypting every row, a SHA‑256 hash (with a unique salt from `HASH_SALT` env variable) of each identifier is stored in separate columns (`phone_hash`, `national_id_hash`, `email_hash`).
  - Lookups are performed against these hash columns, ensuring no plaintext or decryption is needed during authentication.

- **Decryption**
  - When a user’s data needs to be returned (e.g., profile view), the fields are decrypted using `crypto.createDecipheriv` with the same key, IV, and authentication tag.

**Files:**
- `src/utils/encryption.ts` – `encrypt()`, `decrypt()`, `hashField()`
- `src/modules/auth/auth.service.ts` – used in `register()` and `login()`

### 1.6.2 - Encryption Key Rotation (Versioned AES‑256‑GCM)

Encryption keys can be rotated without breaking existing data. Ciphertext is stored with a version prefix (`v2:...`). Multiple keys are configured via `ENCRYPTION_KEY_V1`, `ENCRYPTION_KEY_V2`, etc. New data is encrypted with the active version (`ACTIVE_ENCRYPTION_KEY_VERSION`). Decryption automatically selects the correct key based on the prefix. This allows gradual migration and key expiration.

**Files:**
- `src/utils/encryption.ts`

### 1.6.3 - Password Storage (bcrypt with 12 rounds)

User passwords are never stored in plaintext.

- **Hashing**
  - `bcrypt.hash(password, 12)` is called with a cost factor of 12 (2^12 iterations).
  - The resulting hash (which includes a random salt) is stored in the `password_hash` column.

- **Verification**
  - `bcrypt.compare(plaintext, hash)` is used during login.

**Files:**
- `src/modules/auth/auth.service.ts` – register & login methods

---

### 1.6.4 - Token Management

#### Access & Refresh Tokens

- Access tokens (short‑lived, 15 minutes) and refresh tokens (long‑lived, 1 day) are JWTs.
- Each token contains:
  - `userId`
  - `tokenVersion` (for global logout)
  - `jti` (unique token ID, for blacklisting)

**Files:**
- `src/modules/auth/auth.service.ts` – `generateTokens()`

#### Refresh Token Rotation & Reuse Detection

- Every login or refresh creates a **new** pair of tokens.
- The refresh token is hashed (bcrypt) and stored in the `user_sessions` table, along with IP and User‑Agent.
- On refresh, the incoming refresh token is hashed and compared with the stored hash of the session.
- If it matches, the session is revoked (is_revoked = true) and a new session is created.
- If the token does NOT match any active session, it indicates **reuse** (a stolen token used after a legitimate refresh). All sessions for that user are immediately revoked, and the `token_version` is incremented, forcing a global logout.

**Files:**
- `src/modules/auth/auth.service.ts` – `refreshToken()`
- Database table: `user_sessions`

#### Token Versioning (Global Logout)

- Each user has a `token_version` integer in the `users` table.
- This version is embedded in every access and refresh token.
- When a user logs out globally (or an admin forces logout), the `token_version` is incremented.
- Any subsequent request with a token containing the old version is rejected (401).

**Files:**
- `src/modules/auth/auth.service.ts` – `logout()`
- Database: `users.token_version`

#### Token Fingerprinting (Session Binding)

Access tokens are cryptographically bound to the device that obtained them. The token payload includes a SHA‑256 hash of the client's IP address and User‑Agent string. The `authenticate` middleware recomputes this fingerprint on every request and rejects the token if the current device does not match the original one. This prevents stolen tokens from being used on a different device.

**Files:**
- `src/middleware/auth.ts` – fingerprint verification
- `src/modules/auth/auth.service.ts` – `generateTokens()`

#### JWT Secret Rotation (Key Versioning)

JWT access tokens include a `keyVersion` claim. The authentication middleware decodes the token to read the version, then verifies the signature with the corresponding secret (`JWT_SECRET_V1` or `JWT_SECRET_V2`). The active signing version is controlled by `ACTIVE_JWT_VERSION`. This allows rolling out new secrets without logging out all users.

**Files:**
- `src/middleware/auth.ts`
- `src/modules/auth/auth.service.ts` – `generateTokens()`

#### JTI Blacklisting (Instant Access Token Revocation)

- When a user logs out, the unique ID (`jti`) of the access token is stored in the `revoked_tokens` table with its original expiration time.
- The `authenticate` middleware checks every access token against this table. If the token’s JTI is blacklisted, the request is rejected.
- This ensures that even a stolen access token cannot be used after logout.

**Files:**
- `src/middleware/auth.ts` – `authenticate()`
- `src/modules/auth/auth.service.ts` – `logout()`
- Database: `revoked_tokens`

---

### 1.6.5 - Brute‑Force Protection (Database‑Level Account Lock)

- Consecutive failed login attempts are tracked in the `users` table via `failed_attempts`.
- After 5 failed attempts, the `lock_until` column is set to 15 minutes in the future.
- While `lock_until > NOW()`, login is forbidden (403 Forbidden).
- On a successful login, `failed_attempts` is reset to 0 and `lock_until` set to NULL.

**Files:**
- `src/modules/auth/auth.service.ts` – `login()`
- Database: `users.failed_attempts`, `users.lock_until`

### Step‑Up Authentication (OTP‑Gated Sensitive Actions)

High‑risk operations, such as initiating a payment, require the user to have recently verified their identity via OTP. After a successful OTP verification, the `last_sensitive_auth_at` timestamp on the user record is updated. A dedicated middleware (`enforceStepUpAuth`) checks that this timestamp is within the last 5 minutes. If not, the request is denied with a `STEP_UP_REQUIRED` error, forcing the client to call the verify‑OTP endpoint before retrying.

**Files:**
- `src/middleware/step-up.ts`
- `src/modules/auth/auth.controller.ts` – `verifyOtp`
- `src/modules/payment/payment.routes.ts` – applied to `POST /initiate`

---

### 1.6.6 - HTTP Security Headers (Helmet + Customization)

Helmet is used with a comprehensive set of sub‑middlewares to harden HTTP responses.

- **Strict‑Transport‑Security (HSTS)**: Forces browsers to always use HTTPS, with a max age of one year, including subdomains and preload.
- **Content Security Policy (CSP)**: Restricts resources to `'self'` and specific sources (inline scripts/styles allowed for now).
- **X‑Frame‑Options**: Set to `DENY` to prevent clickjacking.
- **X‑Content‑Type‑Options**: `nosniff` to stop MIME‑type sniffing.
- **X‑XSS‑Protection**: Enables the browser’s built‑in XSS filter.
- **Referrer‑Policy**: `strict‑origin‑when‑cross‑origin` to limit referrer information leakage.
- **Cross‑Origin Opener Policy**, **Embedder Policy**, **Resource Policy** are set to same‑origin.
- **DNS Prefetch Control**, **Expect‑CT**, **X‑Powered‑By**, and others are also configured.

**Files:**
- `src/app.ts` – all Helmet middleware calls

### API Request Signing (External Callbacks)

External services (e.g., mobile money operators) must sign their callbacks with an HMAC‑SHA256 signature. The `X-Signature` header is verified against a shared secret (`MOBILE_MONEY_CALLBACK_SECRET`). This prevents forged payment confirmations.

**Files:**
- `src/middleware/signature.ts`
- `src/utils/signature.ts`
- `src/modules/payment/payment.routes.ts` – applied to `POST /confirm`

---

### 1.6.7 - DDoS Mitigation (Rate Limiting + Slow‑Down)

A multi‑layered approach protects against volumetric attacks and brute‑force attempts.

**Global Rate Limiting**
- `express-rate-limit` is applied to all `/api/` routes.
- Default: 100 requests per 15 minutes (configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`).
- Standard headers are sent so clients know their remaining quota.

**Progressive Slow‑Down**
- `express-slow-down` is also applied globally. After 50% of the rate limit is reached, it starts delaying responses linearly (200ms per request over the threshold). This avoids an abrupt block while penalizing excessive callers.

**Strict Auth & Payment Limits**
- Login and register endpoints are limited to 10 requests per 15 minutes.
- Payment initiation is limited to 5 requests per minute.

**User‑Based Rate Limiting**
In addition to IP‑based rate limiting, the global limiter uses the authenticated user's ID as the rate‑limit key when available. This prevents a single attacker from bypassing limits by switching IPs, while still allowing shared IPs (e.g., corporate NAT) to function normally.

**Files:**
- `src/app.ts` – rate limit and slow‑down middleware

---

### 1.6.8 - Role‑Based Access Control (RBAC)

- Users have a `role` column (taxpayer, admin, auditor).
- The `authorize(...roles)` middleware restricts endpoints to specific roles.
- For example:
  - `POST /api/v1/tax/assessments` requires `admin` or `super_admin`.
  - `GET /api/v1/tax/ledger` requires `admin` or `auditor`.
  - Most tax/payment routes are available to any authenticated user (default).

**Files:**
- `src/middleware/auth.ts` – `authorize()`
- Applied in all route files (e.g., `src/modules/tax/tax.routes.ts`)

---

### 1.6.9 - Idempotency Protection (Payment Integrity)

- The payment initiation endpoint requires an `X-Idempotency-Key` header.
- Before processing, the backend checks if that key already exists in the `idempotency_keys` table.
- If it exists, the previously stored response is returned immediately, preventing duplicate charges.
- If the payment succeeds, the response is saved under that key.

**Files:**
- `src/middleware/idempotency.ts`
- `src/modules/payment/payment.routes.ts` (applied to `POST /initiate`)
- Database: `idempotency_keys`

---

### 1.6.10 - Immutable Audit Trail (Hash‑Chained)

- Every entry in `audit_logs` contains a `hash_chain` column.
- When a new log entry is inserted:
  1. The previous entry’s `hash_chain` value is retrieved (or a zero‑hash if it’s the first).
  2. A SHA‑256 hash is computed over: the current entry’s data (user, action, entity, metadata, timestamp) + the previous hash.
- This forms a cryptographically linked chain. Any modification to a past entry would break all subsequent hashes, making tampering detectable.

**Files:**
- `src/utils/audit.ts` – `insertAuditLog()`
- Used across all services (auth, tax, payment, reconciliation)

---

### 1.6.11 - Parameter Pollution Prevention (HPP)

- The `hpp` middleware strips duplicate query parameters, preventing HTTP Parameter Pollution attacks.
- This is applied globally before any route handlers.

**Files:**
- `src/app.ts` – `app.use(hpp());`

---

### 1.6.12 - File Upload Security

- File uploads are handled by `multer`.
- **Validation**:
  - Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`.
  - Maximum file size: 10 MB.
- Files are stored on the local disk under the `uploads/` directory with randomly generated filenames (using UUID).
- The original filename is discarded to prevent overwrite and path traversal.

**Files:**
- `src/modules/documents/upload.middleware.ts`
- `src/modules/documents/documents.controller.ts`

---

### 1.6.13 - Transaction Isolation (SERIALIZABLE)

Financial transactions (payment initiation, confirmation) run under the `SERIALIZABLE` isolation level with `SELECT … FOR UPDATE` row locking. This prevents race conditions such as double spending or inconsistent ledger entries.

**Files:**
- `src/modules/payment/payment.service.ts`

### Outbox Pattern for Guaranteed Event Delivery

Events that must be processed asynchronously (fraud AI analysis, email notifications) are first written to the `outbox_events` table inside the same database transaction as the business operation. A dedicated worker (`outbox.worker.ts`) polls the outbox and dispatches the events to BullMQ queues. This guarantees that no event is lost even if Redis or the queue is temporarily unavailable.

**Files:**
- `src/workers/outbox.worker.ts`
- `src/modules/payment/payment.service.ts` – inserts into outbox
- Database: `outbox_events`

### 1.6.14 - Ledger Integrity Verification

A dedicated endpoint (`GET /api/v1/ledger/verify`) checks that the total debits equal total credits across all ledger entries. This can be monitored to detect accounting anomalies.

**Files:**
- `src/modules/ledger/ledger.service.ts` – `verifyBalance()`
- `src/modules/ledger/ledger.routes.ts`

### 1.6.14 - Row‑Level Security (RLS) with Role Awareness

PostgreSQL Row‑Level Security is forced on all sensitive tables. Policies are split by action (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) and incorporate role checks: admins and auditors see all rows; regular users see only their own. The authentication middleware sets `app.user_id` and `app.user_role` session variables inside a request‑scoped transaction, which the RLS policies use.

**Files:**
- Database migration (RLS policies)
- `src/middleware/auth.ts`

### 1.6.15 - USSD Session Persistence (Redis)

USSD sessions are stored in Redis with a 5‑minute TTL, ensuring that sessions survive server restarts and can be shared across multiple instances. The previous in‑memory store is replaced by a Redis‑backed session store.

**Files:**
- `src/utils/session-store.ts`
- `src/modules/ussd/ussd.service.ts`

### Additional Security Measures

- **Production error handling**: In production, generic 500 messages are returned; detailed stack traces are only shown in development.
- **Environment variables**: All secrets are stored in environment variables, never in code.
- **Request size limits**: JSON and URL‑encoded bodies are limited to 10 MB.
- **Disable `x-powered-by`**: Express signature hidden to avoid fingerprinting.
- **CORS**: Strictly whitelisted origins with credentials support.
- **Audit log integrity**: The hash‑chain ensures logs are append‑only and cannot be silently altered.

## 1.7 - USSD System

The USSD module allows citizens without internet access – or those using basic feature phones – to interact with the DalPay tax platform by dialing short codes like `*888#`. All communication is text‑based and stateless from the network perspective, but the backend maintains a session to remember the user’s progress.

### 1.7.1 - Architecture

- **Frontend Simulator**: A React‑based phone mockup (`USSDSimulatorPage.tsx`) sends HTTP POST requests to `/api/v1/ussd`, mimicking a real USSD gateway. This same endpoint can be directly integrated with a mobile network operator’s USSD gateway in production (after adjusting the request format).
- **Backend Module** (`modules/ussd/`): Contains the service, controller, and routes. Sessions are persisted in **Redis** (5‑minute TTL) using a dedicated session store (`src/utils/session-store.ts`). This allows sessions to survive server restarts and makes the USSD engine horizontally scalable.
- **Session Lifecycle**: Each new dial generates a unique `sessionId`. The client must include this ID in subsequent requests. Sessions expire automatically after 5 minutes of inactivity, or immediately when the user selects "Exit" or an error forces termination.

### 1.7.2 - Request Format

- **Endpoint**: `POST /api/v1/ussd`
- **Body**:
  ```json
  {
    "phoneNumber": "+252631234567",
    "text": "1",
    "sessionId": "abc123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "sessionId": "abc123",
      "response": "Welcome to DalPay USSD Service\n1. Check Balance\n2. Pay Tax\n3. Statement\n4. Exit",
      "end": false
    }
  }
  ```
  `end: true` means the session has terminated; the phone would close the USSD dialog.

### 1.7.3 - Flow Details

1. **Initial Contact** (`*888#`)
   - The backend receives `text = "*888#"` with no `sessionId`.
   - It hashes the phone number (using the same SHA‑256 + salt as login) and queries the `users` table via `phone_hash`.
   - If the user is unknown, a prompt to register on the web portal is returned and the session ends.
   - If found, a new session is stored in Redis with `state = "MAIN"` and the main menu is returned.

2. **Main Menu**
   - The user replies with `1` (Check Balance), `2` (Pay Tax), `3` (Statement), or `4` (Exit).
   - `1` – The service queries `tax_assessments` where `status IN ('unpaid','partially_paid','overdue')` and returns a formatted balance message.
   - `2` – Moves to tax type selection.
   - `3` – Calls `TaxService.getTaxpayerSummary()` and returns a summary.
   - `4` – Deletes the Redis session and ends with a goodbye message.

3. **Pay Tax Flow**
   - **Step 1 (Select Type)**: Options `1` (Income Tax), `2` (Business Tax), `3` (Property Tax). The backend maps these to enum values and fetches the earliest unpaid assessment of that type.
   - **Step 2 (Enter Amount)**: The user enters an amount in SOS. The service validates it’s positive and does not exceed the total due amount. The state is updated with `assessmentId` and `amount`.
   - **Step 3 (Confirmation)**: The user replies `1` to confirm. The backend calls `PaymentService.initiatePayment()` with the stored details and provider `'zaad'` (default; could be made selectable). A real payment record is created, fraud analysis runs, and a transaction reference is returned.
   - On success, the Redis session is deleted and a success message with the reference is shown. On failure, an error message is returned and the session ends.
   - At any point, `0` cancels the operation and returns to the main menu.

4. **Check Balance & Statement**
   - Balance shows a list of outstanding tax amounts per type and a total.
   - Statement shows pending, paid, and overdue counts plus total due.

### 1.7.4 - Implementation Files

| File | Purpose |
|------|---------|
| `src/modules/ussd/ussd.service.ts` | Session management, menu logic, calls Tax/Payment services |
| `src/modules/ussd/ussd.controller.ts` | Handles HTTP request, delegates to service |
| `src/modules/ussd/ussd.routes.ts` | Registers `POST /` route |
| `src/utils/session-store.ts` | Redis‑backed session store with TTL |
| `src/app.ts` | Mounts `ussdRoutes` at `/api/v1/ussd` |

The session store is now a Redis wrapper that automatically expires keys after 5 minutes:

```typescript
class SessionStore {
  async get(sessionId: string): Promise<USSDState | null> { … }
  async set(sessionId: string, state: USSDState, ttl: number): Promise<void> { … }
  async delete(sessionId: string): Promise<void> { … }
}
```

A state object contains `sessionId`, `userId`, `phoneNumber`, current `state` (e.g., `"PAY_TAX_ENTER_AMOUNT"`), and optional `data` (assessment details).

### 1.7.5 - Integration with Core Modules

- **User lookup**: Uses `hashField(phoneNumber)` against `users.phone_hash`.
- **Balance & Statement**: Direct SQL queries to `tax_assessments` and `payments`.
- **Payment**: `PaymentService.initiatePayment()` – includes fraud analysis, audit logging, and mobile money simulation.
- **All operations are real**: No mock data; the USSD flow creates actual database entries, so a payment made via USSD will appear on the taxpayer’s dashboard and ledger.



## 1.8 - AI Fraud Detection 

Fraud detection in DalPay operates on two layers: a deterministic rule engine and an AI‑powered analysis using Google Gemini 1.5 Flash. Every payment is automatically evaluated at the time of initiation.

### 1.8.1 - Rule‑Based Engine

The `FraudService.analyzePayment()` method (`src/modules/fraud/fraud.service.ts`) performs immediate checks against the taxpayer's profile and transaction characteristics:

- **Income mismatch** – If the payment amount exceeds twice the user's declared monthly income, the risk score increases (0.7).
- **High‑value transaction** – Payments above 10,000 SOS add additional risk.
- **Flagging** – When the cumulative risk score reaches 0.6, the payment is flagged and its `fraud_status` is set to `suspicious` (or `high_risk` if ≥ 0.8).
- Results are stored in the `fraud_analysis` table with the risk score and reasons.

### 1.8.2 - AI‑Powered Analysis (Gemini)

Heavier, contextual analysis is offloaded to **Google Gemini 1.5 Flash** via the outbox pattern.  

1. During payment initiation, a `FRAUD_ANALYSIS` event is inserted into the `outbox_events` table **in the same database transaction** as the payment.  
2. The `outbox.worker.ts` polls the outbox table and dispatches the event to a BullMQ queue (`fraud-analysis`).  
3. The `fraud-analysis.worker.ts` calls `GeminiFraudService.analyzeWithAI()`, which sends a structured prompt containing the payment details, user profile, and payment history to the AI model.  
4. The AI returns a risk score, reasons, a flag, and a recommendation. The analysis is upserted into `fraud_analysis` alongside the rule‑based result.  

This design guarantees that AI analysis is never lost—even if Redis or the queue is temporarily down—and keeps the payment endpoint fast by running the AI call asynchronously.

### 1.8.3 - Manual Trigger & User Risk Profiling

Admins can manually invoke AI analysis:

- `GET /api/v1/fraud/analyze-user/:userId` – Runs a comprehensive risk assessment across recent payments and profile data.
- `POST /api/v1/fraud/analyze-payment/:paymentId` – Re‑runs the AI analysis for a specific payment.

### 1.8.4 - Implementation Files

| File | Purpose |
|------|---------|
| `src/modules/fraud/fraud.service.ts` | Rule‑based risk calculation, DB insertion |
| `src/modules/fraud/gemini-fraud.service.ts` | Gemini API integration, AI risk assessment |
| `src/modules/fraud/fraud.routes.ts` | Admin endpoints for manual AI analysis |
| `src/workers/fraud-analysis.worker.ts` | BullMQ worker that processes AI jobs |
| `src/workers/outbox.worker.ts` | Polls `outbox_events` and dispatches to queues |
| `src/modules/payment/payment.service.ts` | Inserts outbox event during payment initiation |

### 1.8.5 - Automation & Manual Trigger

- **Automatic**: The `PaymentService.initiatePayment()` calls `fraudService.analyzePayment()` immediately after inserting the payment. It also calls `geminiFraud.analyzeWithAI()` (non‑blocking) to enhance the analysis.
- **On‑Demand**: Admin endpoints allow triggering AI analysis again:
  - `GET /api/v1/fraud/analyze-user/:userId`
  - `POST /api/v1/fraud/analyze-payment/:paymentId`

### 1.8.6 - Data Flow

1. Payment initiated → `PaymentService`.
2. `FraudService.analyzePayment()` runs deterministic rules, inserts a row into `fraud_analysis`, and returns.
3. If flagged, the payment's `fraud_status` is updated.
4. `GeminiFraudService.analyzeWithAI()` is called asynchronously. On completion, it updates/inserts the analysis.
5. Security alerts are sent via the `AlertService` if the payment is flagged (both from rule‑based and AI).

### 1.8.7 - Files

| File | Purpose |
|------|---------|
| `src/modules/fraud/fraud.service.ts` | Rule‑based risk calculation, DB insertion |
| `src/modules/fraud/gemini-fraud.service.ts` | Gemini API integration, AI risk assessment |
| `src/modules/fraud/fraud.routes.ts` | Admin endpoints for manual AI analysis |
| `src/modules/payment/payment.service.ts` | Triggers fraud analysis during payment |
| `src/modules/security/alert.service.ts` | Sends security alerts for flagged payments |

### 1.8.8 - Model & Configuration

- **Model**: `gemini-1.5-flash-latest` (configurable via `VITE_GEMINI_MODEL`)
- **API Key**: Loaded from `VITE_GEMINI_API_KEY` (same as frontend).
- In development, the AI call is fire‑and‑forget with error logging; it never blocks the payment flow.

This dual‑layer approach ensures that simple, high‑confidence rules catch obvious anomalies instantly, while the AI provides nuanced, context‑aware analysis with natural‑language explanations suitable for audit trails.


## 1.9 - Deployment

### 1.9.1 - Backend

1. Deploy to Render, Railway, or any Node.js host.
2. Set all required environment variables.
3. Run database migrations.
4. Ensure the CORS origin list includes the frontend domain.

### 1.9.2 - Frontend

1. Deploy to Vercel (or static host).
2. Set environment variable `VITE_API_URL` to the backend's full base URL (including `/api/v1`).
3. Ensure assets (logo, etc.) are in the `public/` folder.

The logo is served from the root path (e.g., `/logo.png`) and is used in the login/register pages.

---

## 2.0 Testing

This guide walks through a complete end‑to‑end test of the DalPay backend using Postman or any HTTP client.

### 2.1 Prerequisites

- Backend is running (`npm run dev`)
- Redis is running (for background jobs and USSD sessions)
- Workers are started (`npm run worker`)
- Postman or equivalent HTTP client

### 2.2 Environment Setup

Set these Postman environment variables:

- `baseUrl` = `http://localhost:5000/api/v1`
- `accessToken` (auto‑populated after login)
- `refreshToken` (auto‑populated after login)
- `userId` (auto‑populated after registration/login)
- `assessmentId` (auto‑populated after assessment generation)
- `paymentId` (auto‑populated after payment initiation)
- `transactionRef` (auto‑populated after payment initiation)

### 2.3 Test Flow

#### 2.3.1 Register a Taxpayer

**Request:** `POST {{baseUrl}}/auth/register`

**Body (JSON):**
```json
{
  "nationalId": "SL-2026-001",
  "firstName": "Ahmed",
  "lastName": "Ali",
  "phoneNumber": "+252634567890",
  "password": "SecureP@ss123",
  "email": "ahmed@example.com",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "occupation": "trader",
  "region": "maroodi_jeex",
  "district": "hargeisa",
  "address": "123 Main Street"
}
```

**Expected Response:** Status `201 Created`. Body contains `user` object and `accessToken`, `refreshToken`.

**Post‑test Script:**
```js
pm.environment.set("accessToken", pm.response.json().data.accessToken);
pm.environment.set("refreshToken", pm.response.json().data.refreshToken);
pm.environment.set("userId", pm.response.json().data.user.id);
```

#### 2.3.2 Login (Optional, for a fresh token)

**Request:** `POST {{baseUrl}}/auth/login`

**Body:**
```json
{
  "phoneNumber": "+252634567890",
  "password": "SecureP@ss123"
}
```

**Expected:** Status `200`, returns tokens. Update environment variables as above.

#### 2.3.3 Verify OTP (Required for Step‑Up Auth)

**Send OTP:** `POST {{baseUrl}}/auth/send-otp`  
Headers: `Authorization: Bearer {{accessToken}}`  
Body: `{ "type": "email" }`

**Expected:** Status `200`, message `"OTP sent"`.

**Retrieve OTP:** Check the console for a dev log like `[DEV OTP] email: ahmed@example.com → 123456`, or query the `otp_codes` table.

**Verify OTP:** `POST {{baseUrl}}/auth/verify-otp`  
Headers: `Authorization: Bearer {{accessToken}}`  
Body: `{ "code": "123456" }`

**Expected:** Status `200`, message `"OTP verified successfully"`. This sets `last_sensitive_auth_at` enabling step‑up for 5 minutes.

#### 2.3.4 Create Taxpayer Profile (Admin Step)

To generate assessments, a `taxpayer_profiles` row is needed. Execute the following SQL directly:

```sql
INSERT INTO taxpayer_profiles (user_id, monthly_income, business_type, property_value)
VALUES ('<your-user-id>', 1500, 'retail', 50000);
```

Optionally promote the user to admin for the next step:

```sql
UPDATE users SET role = 'admin' WHERE id = '<your-user-id>';
```

#### 2.3.5 Generate Tax Assessments (Admin)

Make sure you are logged in with the admin token.

**Request:** `POST {{baseUrl}}/tax/assessments/generate`  
Headers: `Authorization: Bearer {{accessToken}}`  
Body: `{ "taxYear": 2026 }`

**Expected:** Status `201`, response contains `count` (≥ 1).

#### 2.3.6 View Assessments (Taxpayer)

**Request:** `GET {{baseUrl}}/tax/assessments`  
Headers: `Authorization: Bearer {{accessToken}}`

**Expected:** Array of assessments. Save an unpaid assessment's ID:

```js
const data = pm.response.json().data;
const unpaid = data.find(a => a.status === "unpaid");
pm.environment.set("assessmentId", unpaid.assessment_id);
```

#### 2.3.7 Initiate Payment (Step‑Up Test)

If more than 5 minutes passed since OTP verification, repeat step 2.3.3.

**Request:** `POST {{baseUrl}}/payment/initiate`  
Headers:  
- `Authorization: Bearer {{accessToken}}`
- `X-Idempotency-Key: test-key-001`
- `Content-Type: application/json`

**Body:**
```json
{
  "assessmentId": "{{assessmentId}}",
  "amount": 500,
  "providerId": "zaad",
  "phoneNumber": "+252634567890"
}
```

**Expected:** Status `201`, contains `payment_id` and `transaction_reference`. If step‑up expired, you'll get `403` with `code: "STEP_UP_REQUIRED"`. Verify OTP and retry.

Save payment data:
```js
pm.environment.set("paymentId", pm.response.json().data.id);
pm.environment.set("transactionRef", pm.response.json().data.transaction_reference);
```

#### 2.3.8 Idempotency Test on Initiate

Repeat the exact same request (same `X-Idempotency-Key`).

**Expected:** Same response, no duplicate payment created.

#### 2.3.9 Confirm Payment

(If signature middleware is active, compute HMAC or disable temporarily for testing.)

**Request:** `POST {{baseUrl}}/payment/confirm`  
Headers: `Authorization: Bearer {{accessToken}}`  
Body:
```json
{
  "paymentId": "{{paymentId}}",
  "transactionRef": "{{transactionRef}}",
  "status": "confirmed"
}
```

**Expected:** Status `200`, payment status now `confirmed`.

#### 2.3.10 Confirm Idempotency Test

Repeat the same confirmation request.

**Expected:** Status `200`, no duplicate ledger entries.

#### 2.3.11 Verify Ledger Integrity

**Request:** `GET {{baseUrl}}/ledger/verify`  
Headers: `Authorization: Bearer {{accessToken}}` (admin/auditor role required)

**Expected:** `{ "balanced": true }`

#### 2.3.12 Check Admin Dashboard

**Request:** `GET {{baseUrl}}/dashboard/overview`  
Headers: `Authorization: Bearer {{accessToken}}` (admin)

**Expected:** Revenue > 0, outstanding > 0, user counts correct.

#### 2.3.13 USSD Simulation

**Request:** `POST {{baseUrl}}/ussd` (no auth)  
**Body:** `{ "phoneNumber": "+252634567890", "text": "*888#" }`

**Expected:** Main menu with `sessionId`. Use subsequent requests (text: `1`, `2`, `3`) with that `sessionId` to navigate and even make a payment.

#### 2.3.14 Token Reuse Detection Test

1. Capture `refreshToken` after login.
2. Call `POST /auth/refresh-token` with it to get a new pair.
3. Immediately use the **old** refresh token again.

**Expected:** Status `403`, message "Token reuse detected – all sessions have been invalidated". All sessions are revoked.

#### 2.3.15 Brute‑Force Lockout Test

Send 6 consecutive failed login attempts with wrong password.

**Expected:** 6th attempt returns `403` with account locked message. Security alert logged.

#### 2.3.16 Outbox & Worker Verification

- After payment initiation, check the `outbox_events` table – one row for `FRAUD_ANALYSIS` exists.
- After payment confirmation, another row for `EMAIL_NOTIFICATION` appears.
- Worker logs (terminal running `npm run worker`) should show the events being processed and dispatched to BullMQ.

#### 2.3.17 RLS Verification

Connect to the database with a different user than the application and run:

```sql
SELECT * FROM payments WHERE user_id != '<your-user-id>';
```

**Expected:** Zero rows because RLS restricts cross‑user access.

### 2.4 Automated Testing (Future)

For regression testing, convert the manual requests into a Postman Collection Runner or a Bruno collection. A pre‑built collection can be provided upon request.

---

## 2.5 - Team

**Zacki A. Omer**  
Lead Developer & System Architect  
Owns the entire system direction and critical backend logic. Defines system architecture, API contracts, and development standards.

**Abdulkadir I. Abdi**  
Backend & Database Engineer & Lead Quality Assurance
Designs and manages the database, writes optimized queries, leads system testing, and ensures project quality assurance.

**Abdulmajid A. Ahmed**  
Frontend Lead Developer  
Builds the complete user interface – Citizen Dashboard, Admin Dashboard, and all UI components.

**Arafat Osman Aden**  
Documentation Lead  
Writes the entire proposal letter, ensures it meets university standards, and coordinates the writing team.

**Abdiqadir Ismacil**  
Methodology & System Design Writer  
Owns the methodology chapter and system design documentation, ensuring academic rigour and clarity.

**Abdiraxem Khadar**  
Testing, Evaluation & Results Writer  
Writes testing methodology, evaluation criteria, and the results analysis chapter.

**Supervisor:** Mohamed Ahmed Ali  
**Institution:** University of Hargeisa

> "We have built the secure financial backbone of a government tax system – ready to serve millions of citizens whether they own a smartphone or a simple feature phone."

## 2.6 - License

This project is proprietary software developed for the Somaliland Ministry of  & Ministry Of Communication and ICT.  
All rights reserved. Unauthorized copying, distribution, or use of this software, in whole or in part, is strictly prohibited.

For licensing inquiries, contact the project team.

---

## Project Information

**Project Title:** Design of a Digital Tax Payment System Using Mobile Money  

**Degree Program:** Bachelor of Science in Information Technology  
**Institution:** University of Hargeisa  
**Faculty:** Faculty of Engineering & Computing of IT 

**Supervisor:** Mohamed Ahmed Ali  

**Academic Year:** 2025 – 2026  

**Abstract:**  
DalPay is a production‑ready digital tax platform that replaces manual, cash‑based tax collection in Somaliland with a secure, automated system accessible via web portal and USSD (*888#). It integrates mobile money operators (Zaad, eDahab, Nomad), AI‑powered fraud detection, double‑entry accounting, and enterprise‑grade security to provide a transparent, efficient, and inclusive tax payment ecosystem for all citizens.

**Keywords:** Digital Tax, Mobile Money, USSD, Fraud Detection, Double‑Entry Ledger, Somaliland, Fintech
