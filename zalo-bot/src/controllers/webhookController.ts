import { Request, Response } from "express";
import escapeHtml from "escape-html";
import { ZaloService } from "../services/zaloService";
import { MessageService } from "../services/messageService";
import { logger } from "../utils/logger";
import {
  MessageType,
  MessageDirection,
  ZaloEventType,
} from "../types/enums";

export class WebhookController {
  private zaloService: ZaloService;
  private messageService: MessageService;

  constructor() {
    this.zaloService = new ZaloService();
    this.messageService = new MessageService();
  }

  verify = (req: Request, res: Response) => {
    try {
      const challenge = req.query["hub.challenge"] as string;
      const verifyToken = req.query["hub.verify_token"] as string;

      if (verifyToken === Bun.env.WEBHOOK_SECRET) {
        logger.info("Webhook verified successfully");
        res.status(200).send(escapeHtml(challenge));
      } else {
        logger.warn("Invalid webhook verification token");
        res.status(403).send("Forbidden");
      }
    } catch (error) {
      logger.error("Webhook verification error:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  handleEvent = async (req: Request, res: Response) => {
    try {
      const { event, sender, message, timestamp } = req.body;

      logger.info("Received webhook event:", { event, sender: sender?.id });

      switch (event) {
        case ZaloEventType.USER_SEND_TEXT:
          await this.handleTextMessage(sender, message, timestamp);
          break;
        case ZaloEventType.USER_SEND_IMAGE:
          await this.handleImageMessage(sender, message, timestamp);
          break;
        case ZaloEventType.USER_SEND_FILE:
          await this.handleFileMessage(sender, message, timestamp);
          break;
        case ZaloEventType.USER_SEND_STICKER:
          await this.handleStickerMessage(sender, message, timestamp);
          break;
        case ZaloEventType.USER_SEND_LOCATION:
          await this.handleLocationMessage(sender, message, timestamp);
          break;
        default:
          logger.warn("Unhandled event type:", event);
      }

      res.status(200).send("OK");
    } catch (error) {
      logger.error("Webhook event handling error:", error);
      res.status(500).send("Internal Server Error");
    }
  };

  private async handleTextMessage(
    sender: any,
    message: any,
    timestamp: number
  ) {
    try {
      // Save incoming message
      await this.messageService.saveMessage({
        zaloId: sender.id,
        content: message.text,
        type: MessageType.TEXT,
        direction: MessageDirection.INCOMING,
        timestamp: new Date(timestamp),
      });

      // Process message and generate response
      const response = await this.processTextMessage(message.text, sender);

      if (response) {
        await this.zaloService.sendTextMessage(sender.id, response);

        // Save outgoing message
        await this.messageService.saveMessage({
          zaloId: sender.id,
          content: response,
          type: MessageType.TEXT,
          direction: MessageDirection.OUTGOING,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      logger.error("Error handling text message:", error);
    }
  }

  private async handleImageMessage(
    sender: any,
    message: any,
    timestamp: number
  ) {
    try {
      await this.messageService.saveMessage({
        zaloId: sender.id,
        content: message.url || "Image received",
        type: MessageType.IMAGE,
        direction: MessageDirection.INCOMING,
        timestamp: new Date(timestamp),
      });

      // Send acknowledgment
      await this.zaloService.sendTextMessage(
        sender.id,
        "Đã nhận được hình ảnh của bạn!"
      );
    } catch (error) {
      logger.error("Error handling image message:", error);
    }
  }

  private async handleFileMessage(
    sender: any,
    message: any,
    timestamp: number
  ) {
    try {
      await this.messageService.saveMessage({
        zaloId: sender.id,
        content: message.url || "File received",
        type: MessageType.FILE,
        direction: MessageDirection.INCOMING,
        timestamp: new Date(timestamp),
      });

      await this.zaloService.sendTextMessage(
        sender.id,
        "Đã nhận được file của bạn!"
      );
    } catch (error) {
      logger.error("Error handling file message:", error);
    }
  }

  private async handleStickerMessage(
    sender: any,
    message: any,
    timestamp: number
  ) {
    try {
      await this.messageService.saveMessage({
        zaloId: sender.id,
        content: message.id || "Sticker received",
        type: MessageType.STICKER,
        direction: MessageDirection.INCOMING,
        timestamp: new Date(timestamp),
      });

      await this.zaloService.sendTextMessage(sender.id, "Sticker rất đẹp! 😊");
    } catch (error) {
      logger.error("Error handling sticker message:", error);
    }
  }

  private async handleLocationMessage(
    sender: any,
    message: any,
    timestamp: number
  ) {
    try {
      const locationData = `${message.latitude},${message.longitude}`;

      await this.messageService.saveMessage({
        zaloId: sender.id,
        content: locationData,
        type: MessageType.LOCATION,
        direction: MessageDirection.INCOMING,
        timestamp: new Date(timestamp),
      });

      await this.zaloService.sendTextMessage(
        sender.id,
        "Đã nhận được vị trí của bạn!"
      );
    } catch (error) {
      logger.error("Error handling location message:", error);
    }
  }

  private async processTextMessage(
    text: string,
    sender: any
  ): Promise<string | null> {
    const lowerText = text.toLowerCase().trim();

    // Simple command processing
    if (
      lowerText === "hello" ||
      lowerText === "hi" ||
      lowerText === "xin chào"
    ) {
      return "Xin chào! Tôi là bot hỗ trợ. Bạn cần giúp gì?";
    }

    if (lowerText === "help" || lowerText === "giúp đỡ") {
      return "Các lệnh có sẵn:\n- hello: Chào hỏi\n- help: Hiển thị trợ giúp\n- info: Thông tin bot";
    }

    if (lowerText === "info" || lowerText === "thông tin") {
      return "Tôi là Zalo Bot được phát triển với Node.js và TypeScript. Tôi có thể giúp bạn với nhiều tác vụ khác nhau.";
    }

    // Default response
    return "Cảm ơn bạn đã nhắn tin. Tôi đang học cách trả lời tốt hơn!";
  }
}
