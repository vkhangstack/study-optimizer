import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export class ZaloService {
  private api: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: Bun.env.ZALO_API_BASE_URL || 'https://openapi.zalo.me',
      timeout: 10000,
    });
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await this.api.post('/v2.0/oa/access_token', {
        app_id: Bun.env.ZALO_APP_ID,
        app_secret: Bun.env.ZALO_APP_SECRET,
        code: Bun.env.ZALO_OA_SECRET,
      });

      this.accessToken = response.data.access_token;
      logger.info('Access token obtained successfully');
      return this.accessToken ?? "";
    } catch (error) {
      logger.error('Failed to get access token:', error);
      throw new Error('Failed to authenticate with Zalo API');
    }
  }

  async sendTextMessage(userId: string, message: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.api.post(
        '/v3.0/oa/message/cs',
        {
          recipient: {
            user_id: userId,
          },
          message: {
            text: message,
          },
        },
        {
          headers: {
            'access_token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Text message sent successfully', { userId, messageId: response.data.message_id });
      return response.data;
    } catch (error) {
      logger.error('Failed to send text message:', error);
      throw error;
    }
  }

  async sendImageMessage(userId: string, imageUrl: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.api.post(
        '/v3.0/oa/message/cs',
        {
          recipient: {
            user_id: userId,
          },
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: imageUrl,
              },
            },
          },
        },
        {
          headers: {
            'access_token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Image message sent successfully', { userId, messageId: response.data.message_id });
      return response.data;
    } catch (error) {
      logger.error('Failed to send image message:', error);
      throw error;
    }
  }

  async sendTemplateMessage(userId: string, template: any): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.api.post(
        '/v3.0/oa/message/cs',
        {
          recipient: {
            user_id: userId,
          },
          message: {
            attachment: {
              type: 'template',
              payload: template,
            },
          },
        },
        {
          headers: {
            'access_token': accessToken,
            'Content-Type': 'application/json',
          },
        }
      );

      logger.info('Template message sent successfully', { userId, messageId: response.data.message_id });
      return response.data;
    } catch (error) {
      logger.error('Failed to send template message:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.api.get(`/v2.0/oa/getprofile`, {
        params: {
          data: JSON.stringify({
            user_id: userId,
          }),
        },
        headers: {
          'access_token': accessToken,
        },
      });

      logger.info('User profile retrieved successfully', { userId });
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }

  async uploadImage(imageBuffer: Buffer, fileName: string): Promise<string> {
    try {
      const accessToken = await this.getAccessToken();

      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer]), fileName);

      const response = await this.api.post('/v2.0/oa/upload/image', formData, {
        headers: {
          'access_token': accessToken,
          'Content-Type': 'multipart/form-data',
        },
      });

      logger.info('Image uploaded successfully', { fileName, attachmentId: response.data.data.attachment_id });
      return response.data.data.attachment_id;
    } catch (error) {
      logger.error('Failed to upload image:', error);
      throw error;
    }
  }
}