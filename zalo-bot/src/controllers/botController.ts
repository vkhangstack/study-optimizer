import { Request, Response } from "express";
import { ZaloService } from "../services/zaloService";
import { MessageService } from "../services/messageService";
import { UserService } from "../services/userService";
import { ConfigService } from "../services/configService";
import { logger } from "../utils/logger";
import { MessageDirection, MessageType } from "../types/enums";

export class BotController {
  private zaloService: ZaloService;
  private messageService: MessageService;
  private userService: UserService;
  private configService: ConfigService;

  constructor() {
    this.zaloService = new ZaloService();
    this.messageService = new MessageService();
    this.userService = new UserService();
    this.configService = new ConfigService();
  }

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { userId, message, type = "text" } = req.body;

      if (!userId || !message) {
        return res
          .status(400)
          .json({ error: "userId and message are required" });
      }

      let result;
      switch (type) {
        case "text":
          result = await this.zaloService.sendTextMessage(userId, message);
          break;
        case "image":
          result = await this.zaloService.sendImageMessage(userId, message);
          break;
        default:
          return res.status(400).json({ error: "Unsupported message type" });
      }

      // Save outgoing message
      await this.messageService.saveMessage({
        zaloId: userId,
        content: message,
        type: MessageType.TEXT,
        direction:MessageDirection.OUTGOING,
        timestamp: new Date(),
      });

      res.json({ success: true, result });
    } catch (error) {
      logger.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  };

  getUserProfile = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const profile = await this.zaloService.getUserProfile(userId);
      const user = await this.userService.findOrCreateUser(userId, profile);

      res.json({ profile, user });
    } catch (error) {
      logger.error("Error getting user profile:", error);
      res.status(500).json({ error: "Failed to get user profile" });
    }
  };

  getMessages = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const messages = await this.messageService.getMessagesByConversation(
        conversationId,
        Number(page),
        Number(limit)
      );

      res.json(messages);
    } catch (error) {
      logger.error("Error getting messages:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  };

  getConfig = async (req: Request, res: Response) => {
    try {
      const configs = await this.configService.getAllConfigs();
      res.json(configs);
    } catch (error) {
      logger.error("Error getting config:", error);
      res.status(500).json({ error: "Failed to get config" });
    }
  };

  updateConfig = async (req: Request, res: Response) => {
    try {
      const { key, value, description } = req.body;

      if (!key || !value) {
        return res.status(400).json({ error: "key and value are required" });
      }

      const config = await this.configService.updateConfig(
        key,
        value,
        description
      );
      res.json(config);
    } catch (error) {
      logger.error("Error updating config:", error);
      res.status(500).json({ error: "Failed to update config" });
    }
  };
}
