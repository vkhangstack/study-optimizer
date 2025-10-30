-- Post-Prisma Index Creation
-- This script creates indexes after Prisma has created the tables
-- Run this manually if needed: psql -d zalo_bot_db -f post-prisma-indexes.sql

\echo 'Creating performance indexes after Prisma schema application...'

-- Users table indexes
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Index on zalo_id for fast user lookups
        CREATE INDEX IF NOT EXISTS idx_users_zalo_id ON users(zalo_id);
        RAISE NOTICE 'Created index: idx_users_zalo_id';
        
        -- Index on created_at for user registration analytics
        CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
        RAISE NOTICE 'Created index: idx_users_created_at';
    ELSE
        RAISE NOTICE 'Users table not found, skipping indexes';
    END IF;
END $$;

-- Messages table indexes
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        -- Composite index for user messages ordered by timestamp
        CREATE INDEX IF NOT EXISTS idx_messages_user_timestamp ON messages(user_id, timestamp DESC);
        RAISE NOTICE 'Created index: idx_messages_user_timestamp';
        
        -- Index on message type for filtering
        CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
        RAISE NOTICE 'Created index: idx_messages_type';
        
        -- Index on direction for filtering incoming/outgoing
        CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction);
        RAISE NOTICE 'Created index: idx_messages_direction';
        
        -- Index on timestamp for time-based queries
        CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
        RAISE NOTICE 'Created index: idx_messages_timestamp';
    ELSE
        RAISE NOTICE 'Messages table not found, skipping indexes';
    END IF;
END $$;

-- Conversations table indexes
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        -- Index on zalo_id for conversation lookups
        CREATE INDEX IF NOT EXISTS idx_conversations_zalo_id ON conversations(zalo_id);
        RAISE NOTICE 'Created index: idx_conversations_zalo_id';
        
        -- Index on status for filtering active conversations
        CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
        RAISE NOTICE 'Created index: idx_conversations_status';
    ELSE
        RAISE NOTICE 'Conversations table not found, skipping indexes';
    END IF;
END $$;

-- Bot configs table indexes
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bot_configs') THEN
        -- The unique index on key should already exist from Prisma schema
        RAISE NOTICE 'Bot configs table found, unique index should exist from Prisma';
    ELSE
        RAISE NOTICE 'Bot configs table not found, skipping indexes';
    END IF;
END $$;

-- Analyze tables for better query planning
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        ANALYZE users;
        RAISE NOTICE 'Analyzed users table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        ANALYZE messages;
        RAISE NOTICE 'Analyzed messages table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
        ANALYZE conversations;
        RAISE NOTICE 'Analyzed conversations table';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bot_configs') THEN
        ANALYZE bot_configs;
        RAISE NOTICE 'Analyzed bot_configs table';
    END IF;
END $$;

\echo 'Post-Prisma index creation completed!'
\echo 'All indexes created successfully with IF NOT EXISTS clause.'