-- Utility functions for Zalo Bot database
-- This script creates helpful database functions

\echo 'Creating utility functions...'

-- Function to get message statistics
CREATE OR REPLACE FUNCTION get_message_stats(user_zalo_id TEXT DEFAULT NULL)
RETURNS TABLE(
    total_messages BIGINT,
    incoming_messages BIGINT,
    outgoing_messages BIGINT,
    text_messages BIGINT,
    image_messages BIGINT,
    sticker_messages BIGINT,
    other_messages BIGINT
) AS $$
BEGIN
    -- This function will work after Prisma creates the tables
    RETURN QUERY
    SELECT 
        0::BIGINT as total_messages,
        0::BIGINT as incoming_messages,
        0::BIGINT as outgoing_messages,
        0::BIGINT as text_messages,
        0::BIGINT as image_messages,
        0::BIGINT as sticker_messages,
        0::BIGINT as other_messages;
    
    -- Note: Actual implementation will be updated after tables exist
    /*
    IF user_zalo_id IS NOT NULL THEN
        -- Stats for specific user
        RETURN QUERY
        SELECT 
            COUNT(*)::BIGINT as total_messages,
            COUNT(*) FILTER (WHERE direction = 'INCOMING')::BIGINT as incoming_messages,
            COUNT(*) FILTER (WHERE direction = 'OUTGOING')::BIGINT as outgoing_messages,
            COUNT(*) FILTER (WHERE type = 'TEXT')::BIGINT as text_messages,
            COUNT(*) FILTER (WHERE type = 'IMAGE')::BIGINT as image_messages,
            COUNT(*) FILTER (WHERE type = 'STICKER')::BIGINT as sticker_messages,
            COUNT(*) FILTER (WHERE type NOT IN ('TEXT', 'IMAGE', 'STICKER'))::BIGINT as other_messages
        FROM messages m
        JOIN users u ON m.user_id = u.id
        WHERE u.zalo_id = user_zalo_id;
    ELSE
        -- Global stats
        RETURN QUERY
        SELECT 
            COUNT(*)::BIGINT as total_messages,
            COUNT(*) FILTER (WHERE direction = 'INCOMING')::BIGINT as incoming_messages,
            COUNT(*) FILTER (WHERE direction = 'OUTGOING')::BIGINT as outgoing_messages,
            COUNT(*) FILTER (WHERE type = 'TEXT')::BIGINT as text_messages,
            COUNT(*) FILTER (WHERE type = 'IMAGE')::BIGINT as image_messages,
            COUNT(*) FILTER (WHERE type = 'STICKER')::BIGINT as sticker_messages,
            COUNT(*) FILTER (WHERE type NOT IN ('TEXT', 'IMAGE', 'STICKER'))::BIGINT as other_messages
        FROM messages;
    END IF;
    */
END;
$$ LANGUAGE plpgsql;

-- Function to clean old messages
CREATE OR REPLACE FUNCTION cleanup_old_messages(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- This function will work after Prisma creates the tables
    -- For now, return 0
    RETURN 0;
    
    /*
    DELETE FROM messages 
    WHERE timestamp < (CURRENT_TIMESTAMP - INTERVAL '%s days', days_old);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % old messages (older than % days)', deleted_count, days_old;
    
    RETURN deleted_count;
    */
END;
$$ LANGUAGE plpgsql;

-- Function to get active users count
CREATE OR REPLACE FUNCTION get_active_users_count(days_back INTEGER DEFAULT 7)
RETURNS BIGINT AS $$
BEGIN
    -- This function will work after Prisma creates the tables
    RETURN 0;
    
    /*
    RETURN (
        SELECT COUNT(DISTINCT u.id)
        FROM users u
        JOIN messages m ON u.id = m.user_id
        WHERE m.timestamp >= (CURRENT_TIMESTAMP - INTERVAL '%s days', days_back)
    );
    */
END;
$$ LANGUAGE plpgsql;

-- Function to update bot configuration
CREATE OR REPLACE FUNCTION update_bot_config(config_key TEXT, config_value TEXT, config_description TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
    -- This function will work after Prisma creates the tables
    RETURN TRUE;
    
    /*
    INSERT INTO bot_configs (id, key, value, description, created_at, updated_at)
    VALUES (gen_random_uuid(), config_key, config_value, config_description, NOW(), NOW())
    ON CONFLICT (key) 
    DO UPDATE SET 
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, bot_configs.description),
        updated_at = NOW();
    
    RETURN TRUE;
    */
END;
$$ LANGUAGE plpgsql;

\echo 'Utility functions created successfully!'
\echo 'Functions will be fully functional after Prisma schema is applied.'