import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export class DatabaseUtils {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Initialize database with default configurations and optimizations
     */
    async initializeDatabase(): Promise<void> {
        try {
            logger.info('Initializing database with default configurations...');

            // Insert default bot configurations
            await this.insertDefaultConfigs();

            // Create indexes for better performance
            await this.createOptimizationIndexes();

            // Insert seed data if needed
            await this.insertSeedData();

            logger.info('Database initialization completed successfully');
        } catch (error) {
            logger.error('Database initialization failed:', error);
            throw error;
        }
    }

    /**
     * Insert default bot configurations
     */
    private async insertDefaultConfigs(): Promise<void> {
        const defaultConfigs = [
            {
                key: 'welcome_message',
                value: 'Xin chào! Tôi là bot hỗ trợ. Bạn cần giúp gì?',
                description: 'Default welcome message for new users'
            },
            {
                key: 'default_response',
                value: 'Cảm ơn bạn đã nhắn tin. Tôi đang học cách trả lời tốt hơn!',
                description: 'Default response when bot cannot understand user input'
            },
            {
                key: 'bot_enabled',
                value: 'true',
                description: 'Enable or disable bot responses'
            },
            {
                key: 'max_message_length',
                value: '2000',
                description: 'Maximum length for bot messages'
            }
        ];

        for (const config of defaultConfigs) {
            await this.prisma.botConfig.upsert({
                where: { key: config.key },
                update: {}, // Don't update existing configs
                create: config
            });
        }

        logger.info(`Inserted ${defaultConfigs.length} default configurations`);
    }

    /**
     * Create database indexes for better performance
     */
    private async createOptimizationIndexes(): Promise<void> {
        try {
            // Create indexes directly using Prisma raw queries
            // This approach is more reliable than using functions
            
            const indexQueries = [
                // Users table indexes
                `CREATE INDEX IF NOT EXISTS idx_users_zalo_id ON users(zalo_id)`,
                `CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`,
                
                // Messages table indexes
                `CREATE INDEX IF NOT EXISTS idx_messages_user_timestamp ON messages(user_id, timestamp DESC)`,
                `CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type)`,
                `CREATE INDEX IF NOT EXISTS idx_messages_direction ON messages(direction)`,
                `CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)`,
                
                // Conversations table indexes
                `CREATE INDEX IF NOT EXISTS idx_conversations_zalo_id ON conversations(zalo_id)`,
                `CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status)`,
            ];

            for (const query of indexQueries) {
                try {
                    await this.prisma.$executeRawUnsafe(query);
                } catch (indexError) {
                    // Individual index creation might fail if table doesn't exist yet
                    logger.debug(`Index creation skipped: ${indexError}`);
                }
            }
            
            logger.info('Database indexes created successfully');
        } catch (error) {
            // Indexes might already exist or tables might not be created yet
            logger.warn('Could not create optimization indexes:', error);
        }
    }

    /**
     * Insert seed data for development
     */
    private async insertSeedData(): Promise<void> {
        // Only insert seed data in development
        if (process.env.NODE_ENV === 'development') {
            try {
                // Check if we already have users (avoid duplicate seed data)
                const userCount = await this.prisma.user.count();

                if (userCount === 0) {
                    // Insert a test user for development
                    const testUser = await this.prisma.user.create({
                        data: {
                            zaloId: 'test_user_123',
                            name: 'Test User',
                            avatar: 'https://example.com/avatar.jpg'
                        }
                    });

                    // Insert some test messages
                    await this.prisma.message.createMany({
                        data: [
                            {
                                userId: testUser.id,
                                content: 'Hello bot!',
                                type: 'TEXT',
                                direction: 'INCOMING',
                                timestamp: new Date()
                            },
                            {
                                userId: testUser.id,
                                content: 'Xin chào! Tôi là bot hỗ trợ. Bạn cần giúp gì?',
                                type: 'TEXT',
                                direction: 'OUTGOING',
                                timestamp: new Date()
                            }
                        ]
                    });

                    logger.info('Development seed data inserted');
                }
            } catch (error) {
                logger.warn('Could not insert seed data:', error);
            }
        }
    }

    /**
     * Get database statistics
     */
    async getDatabaseStats(): Promise<any> {
        try {
            const [userCount, messageCount, configCount] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.message.count(),
                this.prisma.botConfig.count()
            ]);

            const stats = {
                users: userCount,
                messages: messageCount,
                configs: configCount,
                timestamp: new Date().toISOString()
            };

            return stats;
        } catch (error) {
            logger.error('Error getting database stats:', error);
            throw error;
        }
    }

    /**
     * Run database maintenance
     */
    async runMaintenance(): Promise<void> {
        try {
            // Execute maintenance function from init scripts
            await this.prisma.$executeRaw`SELECT database_maintenance()`;
            logger.info('Database maintenance completed');
        } catch (error) {
            logger.warn('Database maintenance failed:', error);
        }
    }

    /**
     * Clean up old messages
     */
    async cleanupOldMessages(daysOld: number = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await this.prisma.message.deleteMany({
                where: {
                    timestamp: {
                        lt: cutoffDate
                    }
                }
            });

            logger.info(`Cleaned up ${result.count} old messages (older than ${daysOld} days)`);
            return result.count;
        } catch (error) {
            logger.error('Error cleaning up old messages:', error);
            throw error;
        }
    }
}