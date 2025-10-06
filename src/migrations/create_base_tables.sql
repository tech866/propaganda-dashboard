-- =====================================================
-- Create Base Tables Migration
-- This script creates the essential base tables for the application
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE CLIENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CREATE USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    clerk_user_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- For non-Clerk users
    role VARCHAR(50) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER', 'PROFESSIONAL', 'ceo', 'admin', 'sales', 'agency_user')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    clerk_metadata JSONB,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. CREATE DEFAULT CLIENT
-- =====================================================

INSERT INTO clients (id, name, email) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Agency', 'admin@default-agency.com')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- =====================================================
-- 5. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to clients table
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ADD COMMENTS
-- =====================================================

COMMENT ON TABLE clients IS 'Client organizations that use the system';
COMMENT ON TABLE users IS 'Users of the system, can be linked to Clerk or have local authentication';
COMMENT ON COLUMN users.clerk_user_id IS 'Clerk user ID for authentication integration';
COMMENT ON COLUMN users.clerk_metadata IS 'Additional metadata from Clerk (roles, custom fields, etc.)';
COMMENT ON COLUMN users.last_sync_at IS 'Last time user data was synced with Clerk';
