-- Additional indexes and optimizations for Zalo Bot
-- This script creates performance optimizations after schema creation

\echo 'Creating additional database optimizations...'

-- Function to create indexes if tables exist (without CONCURRENTLY)
CREATE OR REPLACE FUNCTION create_indexes_if_exists() RETURNS void AS $$
BEGIN
    -- Check if tables exist before creating indexes
    -- This will be executed after Prisma creates the tables
    -- Note: Using regular CREATE INDEX (not CONCURRENTLY) since we're in a function
    
    -- Create indexes for users table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Index on zalo_id for fast user lookups
        CREATE INDEX IF NOT EXISTS idx_users_zalo_id ON users(zalo_id);
        
        -- Index on created_at for user registration analytics
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
        
        RAISE NOTICE 'Users table indexes created';
    END IF;
    
    -- Create indexes for messages table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        -- Composite index for user messages ordered by timestamp
        CREATE INDEX IF NOT EXISTS idx_messages_user_timestamp ON messages(user_id, timestamp DESC);
        
        -- Index on message type for filtering
        CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
        
        -- Index on direction for filtering incoming/outgoing
        CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
        
        -- Index on timestamp for time-based queries
        CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
        
        RAISE NOTICE 'Messages table indexes created';
    END IF;
    
    -- Create indexes for conversations table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        -- Index on zalo_id for conversation lookups
        CREATE INDEX IF NOT EXISTS idx_conversations_zalo_id ON conversations(zalo_id);
        
        -- Index on status for filtering active conversations
        CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
        
        RAISE NOTICE 'Conversations table indexes created';
    END IF;
    
    -- Create indexes for bot_configs table if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bot_configs') THEN
        -- Unique index on key (should already exist from Prisma schema)
        -- CREATE UNIQUE INDEX IF NOT EXISTS idx_bot_configs_key ON bot_configs(key);
        
        RAISE NOTICE 'Bot configs table indexes verified';
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Note: The function is created but not executed yet
-- It will be called by the application after Prisma schema is applied

\echo 'Index creation function prepared!'
\echo 'Indexes will be created after application starts and schema is applied.'