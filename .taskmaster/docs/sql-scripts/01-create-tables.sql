-- =====================================================
-- Propaganda Dashboard Database Schema
-- PostgreSQL Multi-Tenant Schema Creation Script
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CLIENTS TABLE
-- =====================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ceo', 'admin', 'sales')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, email)
);

-- =====================================================
-- 3. LOSS REASONS TABLE
-- =====================================================
CREATE TABLE loss_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, name)
);

-- =====================================================
-- 4. CALLS TABLE
-- =====================================================
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prospect_name VARCHAR(255) NOT NULL,
    prospect_email VARCHAR(255),
    prospect_phone VARCHAR(50),
    call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('inbound', 'outbound')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'no-show', 'rescheduled')),
    outcome VARCHAR(20) CHECK (outcome IN ('won', 'lost', 'tbd')),
    loss_reason_id UUID REFERENCES loss_reasons(id) ON DELETE SET NULL,
    notes TEXT,
    call_duration INTEGER, -- in seconds
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- COMMENTS ON TABLES
-- =====================================================
COMMENT ON TABLE clients IS 'Agency clients (tenants) in the multi-tenant system';
COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE loss_reasons IS 'Categorized reasons for unsuccessful call conversions';
COMMENT ON TABLE calls IS 'Call logging records with prospect and outcome information';
COMMENT ON TABLE audit_logs IS 'Audit trail for all data changes and access events';

-- =====================================================
-- COMMENTS ON KEY COLUMNS
-- =====================================================
COMMENT ON COLUMN clients.id IS 'Primary key for client records';
COMMENT ON COLUMN clients.name IS 'Client company name';
COMMENT ON COLUMN clients.email IS 'Client contact email (unique across system)';

COMMENT ON COLUMN users.client_id IS 'Foreign key to clients table for multi-tenant isolation';
COMMENT ON COLUMN users.role IS 'User role: ceo (read-only all), admin (full access), sales (own data only)';
COMMENT ON COLUMN users.email IS 'User email (unique within client)';

COMMENT ON COLUMN loss_reasons.client_id IS 'Foreign key to clients table for multi-tenant isolation';
COMMENT ON COLUMN loss_reasons.name IS 'Loss reason name (unique within client)';

COMMENT ON COLUMN calls.client_id IS 'Foreign key to clients table for multi-tenant isolation';
COMMENT ON COLUMN calls.user_id IS 'Foreign key to users table (call owner)';
COMMENT ON COLUMN calls.loss_reason_id IS 'Foreign key to loss_reasons table (optional)';
COMMENT ON COLUMN calls.call_duration IS 'Call duration in seconds';

COMMENT ON COLUMN audit_logs.client_id IS 'Foreign key to clients table for multi-tenant isolation';
COMMENT ON COLUMN audit_logs.user_id IS 'Foreign key to users table (who performed the action)';
COMMENT ON COLUMN audit_logs.table_name IS 'Name of the table being audited';
COMMENT ON COLUMN audit_logs.record_id IS 'ID of the record being audited';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: INSERT, UPDATE, DELETE, SELECT';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous values (for UPDATE/DELETE actions)';
COMMENT ON COLUMN audit_logs.new_values IS 'New values (for INSERT/UPDATE actions)';
