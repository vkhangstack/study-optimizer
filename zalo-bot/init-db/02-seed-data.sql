-- Seed data for Zalo Bot development environment
-- This script runs after the main initialization

\echo 'Starting seed data insertion...'

-- Wait for Prisma schema to be applied (this will be handled by the app)
-- The actual table creation is handled by Prisma migrations/db push

-- Insert default bot configuration
-- Note: These will be inserted by the application after Prisma creates the tables
-- This is just a template for reference

/*
-- Default bot configurations (will be inserted by app after tables exist)
INSERT INTO bot_configs (id, key, value, description, created_at, updated_at) VALUES
    (gen_random_uuid(), 'welcome_message', 'Xin chào! Tôi là bot hỗ trợ. Bạn cần giúp gì?', 'Default welcome message for new users', NOW(), NOW()),
    (gen_random_uuid(), 'default_response', 'Cảm ơn bạn đã nhắn tin. Tôi đang học cách trả lời tốt hơn!', 'Default response when bot cannot understand user input', NOW(), NOW()),
    (gen_random_uuid(), 'bot_enabled', 'true', 'Enable or disable bot responses', NOW(), NOW()),
    (gen_random_uuid(), 'max_message_length', '2000', 'Maximum length for bot messages', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
*/

\echo 'Seed data preparation completed!'
\echo 'Note: Actual data will be inserted after Prisma schema is applied by the application.'