-- Add Meta tokens table for OAuth token storage
-- This table stores Meta (Facebook/Instagram) OAuth tokens for users

CREATE TABLE IF NOT EXISTS meta_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL, -- Clerk user ID
    access_token TEXT NOT NULL,
    token_type VARCHAR(50) NOT NULL DEFAULT 'long_lived' CHECK (token_type IN ('short_lived', 'long_lived')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    scope TEXT, -- OAuth scopes granted
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_meta_tokens_user_id ON meta_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_tokens_expires_at ON meta_tokens(expires_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE meta_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own tokens
CREATE POLICY "Users can access their own meta tokens" ON meta_tokens
    FOR ALL USING (user_id = auth.jwt() ->> 'sub');

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meta_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meta_tokens_updated_at
    BEFORE UPDATE ON meta_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_meta_tokens_updated_at();
