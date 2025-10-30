-- Initialize database for Zalo Bot
-- This script runs when the PostgreSQL container starts for the first time

\echo 'Starting Zalo Bot database initialization...'

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON DATABASE zalo_bot_db TO zalo_user;
GRANT CREATE ON SCHEMA public TO zalo_user;
GRANT USAGE ON SCHEMA public TO zalo_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO zalo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO zalo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO zalo_user;

-- Create a function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Log initialization
\echo 'Database extensions and permissions configured successfully!'