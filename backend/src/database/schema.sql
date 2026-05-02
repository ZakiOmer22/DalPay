CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== TABLES ====================

CREATE TABLE IF NOT EXISTS occupations (
    occupation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_assessment_types (
    type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taxpayers (
    taxpayer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    national_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    occupation_id UUID REFERENCES occupations(occupation_id) ON DELETE SET NULL,
    income_level_annual DECIMAL(12,2),
    address TEXT,
    region VARCHAR(100),
    district VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending',
    role VARCHAR(20) DEFAULT 'taxpayer',
    refresh_token TEXT,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mobile_money_providers (
    provider_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name VARCHAR(100) NOT NULL UNIQUE,
    api_endpoint_url TEXT,
    api_key_encrypted TEXT,
    settlement_frequency VARCHAR(20) DEFAULT 'daily',
    settlement_account VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taxpayer_id UUID NOT NULL REFERENCES taxpayers(taxpayer_id) ON DELETE CASCADE,
    assessment_type_id UUID REFERENCES tax_assessment_types(type_id) ON DELETE SET NULL,
    assessment_year INT NOT NULL,
    assessed_amount DECIMAL(12,2) NOT NULL,
    assessment_date DATE NOT NULL,
    assessment_basis TEXT,
    payment_due_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES tax_assessments(assessment_id) ON DELETE CASCADE,
    taxpayer_id UUID NOT NULL REFERENCES taxpayers(taxpayer_id) ON DELETE CASCADE,
    provider_id UUID REFERENCES mobile_money_providers(provider_id) ON DELETE SET NULL,
    payment_amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    transaction_reference VARCHAR(255) UNIQUE,
    payment_status VARCHAR(30) DEFAULT 'initiated',
    reconciliation_date DATE,
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_reconciliations (
    reconciliation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES mobile_money_providers(provider_id) ON DELETE CASCADE,
    reconciliation_date DATE NOT NULL,
    expected_amount DECIMAL(12,2) NOT NULL,
    actual_amount DECIMAL(12,2) NOT NULL,
    variance_amount DECIMAL(12,2) DEFAULT 0,
    variance_reason TEXT,
    status VARCHAR(30) DEFAULT 'pending_review',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES taxpayers(taxpayer_id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    affected_entity VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    action_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taxpayer_accounts (
    account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taxpayer_id UUID NOT NULL REFERENCES taxpayers(taxpayer_id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES mobile_money_providers(provider_id) ON DELETE CASCADE,
    provider_account_reference VARCHAR(255),
    account_status VARCHAR(20) DEFAULT 'active',
    last_payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revoked_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SEED DATA ====================

-- Occupations
INSERT INTO occupations (name) VALUES
    ('Salaried Employment'),
    ('Business Owner'),
    ('Trader'),
    ('Farmer'),
    ('Professional'),
    ('Informal Sector')
ON CONFLICT (name) DO NOTHING;

-- Tax assessment types
INSERT INTO tax_assessment_types (name, description) VALUES
    ('income_tax', 'Tax on salaried income and professional earnings'),
    ('business_tax', 'Tax on registered business revenue'),
    ('property_tax', 'Tax on land and property ownership'),
    ('consumption_tax', 'Indirect tax on goods and services')
ON CONFLICT (name) DO NOTHING;

-- Mobile money providers
INSERT INTO mobile_money_providers (provider_name, api_endpoint_url, settlement_frequency, settlement_account, status) VALUES
    ('Zaad', 'https://api.zaad.com/v1', 'daily', 'GOVT-TAX-ZAAD-001', 'active'),
    ('eDahab', 'https://api.edahab.com/v1', 'daily', 'GOVT-TAX-EDAHAB-001', 'active'),
    ('Nomad', 'https://api.nomad.com/v1', 'daily', 'GOVT-TAX-NOMAD-001', 'active'),
    ('Hormuud', 'https://api.hormuud.com/v1', 'daily', 'GOVT-TAX-HORMUUD-001', 'active')
ON CONFLICT (provider_name) DO NOTHING;

-- Test admin user (password: Admin@123456)
INSERT INTO taxpayers (national_id, first_name, last_name, email, phone_number, password_hash, role, verification_status) VALUES
    ('ADMIN-001', 'Zacki', 'Omer', 'zacki@dalpay.gov.so', '+252631234567', '$2a$12$LJ3m4ys3Lk0TSwHCpNqrNe9HPx4vHKZFgNRx1whGfPFq3kMCzLMLe', 'super_admin', 'verified')
ON CONFLICT (national_id) DO NOTHING;

-- Test taxpayer (password: Test@123456)
INSERT INTO taxpayers (national_id, first_name, last_name, email, phone_number, password_hash, role, verification_status) VALUES
    ('SL-2024-001', 'Ahmed', 'Ismail', 'ahmed@example.com', '+252633650001', '$2a$12$8jUqQmZ0b5vJrY0wR9TqOeC0yFhNH0VHwz9dGXJc5Uyq3g5T0Wq1m', 'taxpayer', 'verified')
ON CONFLICT (national_id) DO NOTHING;