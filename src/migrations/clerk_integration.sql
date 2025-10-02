-- =====================================================
-- Clerk Integration Migration
-- Update users table to support Clerk authentication
-- =====================================================

-- Add Clerk-specific columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS clerk_metadata JSONB,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE;

-- Update role constraints to match Clerk roles
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'USER', 'PROFESSIONAL', 'ceo', 'admin', 'sales'));

-- Create index for Clerk user ID lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);

-- Create function to sync Clerk user data
CREATE OR REPLACE FUNCTION sync_clerk_user(
    p_clerk_user_id VARCHAR(255),
    p_email VARCHAR(255),
    p_name VARCHAR(255),
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    user_id UUID;
    client_id UUID;
BEGIN
    -- Find or create a default client for Clerk users
    -- In a real implementation, you might want to handle client assignment differently
    SELECT id INTO client_id FROM clients WHERE name = 'Default Agency' LIMIT 1;
    
    IF client_id IS NULL THEN
        INSERT INTO clients (name, email) 
        VALUES ('Default Agency', 'admin@default-agency.com')
        RETURNING id INTO client_id;
    END IF;
    
    -- Check if user already exists by Clerk ID
    SELECT id INTO user_id FROM users WHERE clerk_user_id = p_clerk_user_id;
    
    IF user_id IS NOT NULL THEN
        -- Update existing user
        UPDATE users 
        SET 
            email = p_email,
            name = p_name,
            clerk_metadata = p_metadata,
            last_sync_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = user_id;
    ELSE
        -- Create new user
        INSERT INTO users (
            client_id,
            clerk_user_id,
            email,
            name,
            password_hash, -- Will be empty for Clerk users
            role,
            clerk_metadata,
            last_sync_at
        ) VALUES (
            client_id,
            p_clerk_user_id,
            p_email,
            p_name,
            '', -- No password needed for Clerk users
            COALESCE((p_metadata->>'role')::VARCHAR, 'USER'),
            p_metadata,
            CURRENT_TIMESTAMP
        ) RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to users table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_users_updated_at'
    ) THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Add comments for new columns
COMMENT ON COLUMN users.clerk_user_id IS 'Clerk user ID for authentication integration';
COMMENT ON COLUMN users.clerk_metadata IS 'Additional metadata from Clerk (roles, custom fields, etc.)';
COMMENT ON COLUMN users.last_sync_at IS 'Last time user data was synced with Clerk';

-- Create a view for easy user lookup with Clerk data
CREATE OR REPLACE VIEW users_with_clerk AS
SELECT 
    u.id,
    u.client_id,
    u.clerk_user_id,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.last_login,
    u.clerk_metadata,
    u.last_sync_at,
    u.created_at,
    u.updated_at,
    c.name as client_name
FROM users u
LEFT JOIN clients c ON u.client_id = c.id;

COMMENT ON VIEW users_with_clerk IS 'Users with Clerk integration data and client information';

