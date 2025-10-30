-- Post-initialization script for Zalo Bot
-- This script runs last and provides final setup

\echo 'Running post-initialization tasks...'

-- Create a view for message analytics (will be created after tables exist)
-- This is commented out until Prisma creates the actual tables

/*
CREATE OR REPLACE VIEW message_analytics AS
SELECT 
    DATE(timestamp) as message_date,
    type as message_type,
    direction,
    COUNT(*) as message_count
FROM messages
GROUP BY DATE(timestamp), type, direction
ORDER BY message_date DESC, message_type, direction;
*/

-- Create a view for user activity (will be created after tables exist)
/*
CREATE OR REPLACE VIEW user_activity AS
SELECT 
    u.zalo_id,
    u.name,
    COUNT(m.id) as total_messages,
    MAX(m.timestamp) as last_message_at,
    MIN(m.timestamp) as first_message_at
FROM users u
LEFT JOIN messages m ON u.id = m.user_id
GROUP BY u.id, u.zalo_id, u.name
ORDER BY total_messages DESC;
*/

-- Set up database maintenance
-- Create a function to be called periodically for maintenance
CREATE OR REPLACE FUNCTION database_maintenance()
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- Analyze tables for better query performance
    ANALYZE;
    
    -- Update statistics
    result := 'Database maintenance completed at ' || NOW();
    
    RAISE NOTICE '%', result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Zalo Bot Database Initialization Complete!';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Database: zalo_bot_db';
    RAISE NOTICE 'User: zalo_user';
    RAISE NOTICE 'Extensions: uuid-ossp, pgcrypto';
    RAISE NOTICE 'Utility functions: created';
    RAISE NOTICE 'Ready for Prisma schema application';
    RAISE NOTICE '=================================================';
END $$;

\echo 'Post-initialization completed successfully!'