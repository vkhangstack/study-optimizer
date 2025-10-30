import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ConfigService {
  async getConfig(key: string) {
    try {
      const config = await prisma.botConfig.findUnique({
        where: { key },
      });
      return config;
    } catch (error) {
      console.error('Error getting config:', error);
      throw error;
    }
  }

  async getAllConfigs() {
    try {
      const configs = await prisma.botConfig.findMany({
        orderBy: { key: 'asc' },
      });
      return configs;
    } catch (error) {
      console.error('Error getting all configs:', error);
      throw error;
    }
  }

  async updateConfig(key: string, value: string, description?: string) {
    try {
      const config = await prisma.botConfig.upsert({
        where: { key },
        update: {
          value,
          description: description || undefined,
          updatedAt: new Date(),
        },
        create: {
          key,
          value,
          description,
        },
      });
      return config;
    } catch (error) {
      console.error('Error updating config:', error);
      throw error;
    }
  }

  async deleteConfig(key: string) {
    try {
      const result = await prisma.botConfig.delete({
        where: { key },
      });
      return result;
    } catch (error) {
      console.error('Error deleting config:', error);
      throw error;
    }
  }

  // Helper methods for common configurations
  async getWelcomeMessage(): Promise<string> {
    const config = await this.getConfig('welcome_message');
    return config?.value || 'Xin chào! Tôi là bot hỗ trợ. Bạn cần giúp gì?';
  }

  async setWelcomeMessage(message: string) {
    return this.updateConfig('welcome_message', message, 'Default welcome message for new users');
  }

  async getDefaultResponse(): Promise<string> {
    const config = await this.getConfig('default_response');
    return config?.value || 'Xin lỗi, tôi không hiểu yêu cầu của bạn. Vui lòng thử lại hoặc gõ "help" để xem hướng dẫn.';
  }

  async setDefaultResponse(message: string) {
    return this.updateConfig('default_response', message, 'Default response when bot cannot understand user input');
  }

  async getBotEnabled(): Promise<boolean> {
    const config = await this.getConfig('bot_enabled');
    return config?.value === 'true';
  }

  async setBotEnabled(enabled: boolean) {
    return this.updateConfig('bot_enabled', enabled.toString(), 'Enable or disable bot responses');
  }

  async getMaxMessageLength(): Promise<number> {
    const config = await this.getConfig('max_message_length');
    return config?.value ? parseInt(config.value) : 2000;
  }

  async setMaxMessageLength(length: number) {
    return this.updateConfig('max_message_length', length.toString(), 'Maximum length for bot messages');
  }
}