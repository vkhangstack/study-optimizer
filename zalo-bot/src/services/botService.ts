import { PrismaClient } from "@prisma/client"
import { ConfigService } from "./configService"
import { logger } from "../utils/logger"
import { MessageType, MessageDirection } from "../types/enums"
import ZaloBot from "node-zalo-bot"
import { MessageService } from "./messageService"
import { BotUtils } from "../utils/bot"
import { GenerateUtils } from "../utils/generatre"
import BOT_RESPONSES from "../types/message"
import { ClassService } from "./classService"
import { DateUtils } from "../utils/date"
import { UserService } from "./userService"
import { CrobService } from "./crobService"
import { ZaloBotService } from "./zaloBotService"
import { ZaloBotWebhookMessage, ZaloMessageType } from "../types"
import { QuoteService } from "./quoteService"
import { AssignmentService } from "./assignmentService"

export class BotService {
  private zaloService: any
  private prisma: PrismaClient
  private configService: ConfigService
  private messageService: MessageService
  private classService: ClassService

  constructor(zaloService: any, prisma: PrismaClient) {
    this.zaloService = zaloService
    this.prisma = prisma
    this.configService = new ConfigService()
    this.messageService = new MessageService()
    this.classService = new ClassService()
  }

  async onText(msg: { event_name: string; message: ZaloBotWebhookMessage; message_type?: MessageType }): Promise<void> {
    try {
      // Bot xử lý khi có message gửi đến
      switch (msg.event_name) {
        case ZaloMessageType.TEXT:
          try {
            logger.info("Received message:", msg)
            msg.message_type = MessageType.TEXT
            // Send response
            const response = await this.messageService.processMessage(msg.message)
            ZaloBotService.getInstance().sendMessage(response.chatId, response.message)
          } catch (error) {
            logger.error("Error processing message:", error)
          }
          break
        case ZaloMessageType.IMAGE:
          try {
            logger.info("Received image message:", msg)
            msg.message_type = MessageType.IMAGE
            // Send response
            const response = await this.messageService.processMessage(msg.message)
            ZaloBotService.getInstance().sendMessage(response.chatId, response.message)
          } catch (error) {
            logger.error("Error processing image message:", error)
          }
          break
        case ZaloMessageType.STICKER:
          try {
            logger.info("Received sticker message:", msg)
            msg.message_type = MessageType.STICKER
            // Send response
            const response = await this.messageService.processMessage(msg.message)
            ZaloBotService.getInstance().sendMessage(response.chatId, response.message)
          } catch (error) {
            logger.error("Error processing sticker message:", error)
          }
          break
        default:
          break
      }

      // Handle photo messages
      // botInstance.on("photo", async (msg: any) => {
      //   try {
      //     const chatId = msg.chat.id;
      //     const userId = msg.from.id;

      //     await this.messageService.saveMessage({
      //       zaloId: userId,
      //       content: msg.photo?.[0]?.file_id || "Photo received",
      //       type: MessageType.IMAGE,
      //       direction: MessageDirection.INCOMING,
      //       timestamp: new Date(),
      //     });

      //     botInstance.sendMessage(chatId, "Đã nhận được hình ảnh của bạn! 📸");
      //   } catch (error) {
      //     logger.error("Error processing photo:", error);
      //   }
      // });

      // // Handle sticker messages
      // botInstance.on("sticker", async (msg: any) => {
      //   try {
      //     const chatId = msg.chat.id;
      //     const userId = msg.from.id;

      //     await this.messageService.saveMessage({
      //       zaloId: userId,
      //       content: msg.sticker?.file_id || "Sticker received",
      //       type: MessageType.STICKER,
      //       chatId: chatId,
      //       direction: MessageDirection.INCOMING,
      //       timestamp: new Date(),
      //     });

      //     botInstance.sendMessage(chatId, "Sticker rất đẹp! 😊");
      //   } catch (error) {
      //     logger.error("Error processing sticker:", error);
      //   }
      // });
    } catch (error) {
      logger.error("Error in onText handler:", error)
    }
  }

  async processMessage(text: string, sender: any): Promise<string | null> {
    try {
      const lowerText = text.toLowerCase().trim()

      // Check if bot is enabled
      const botEnabled = await this.configService.getBotEnabled()
      if (!botEnabled) {
        return null
      }

      // Command processing
      if (lowerText === "hello" || lowerText === "hi" || lowerText === "xin chào") {
        const welcomeMessage = await this.configService.getWelcomeMessage()
        return welcomeMessage.replace("{name}", sender.display_name || "bạn")
      }

      if (lowerText === "help" || lowerText === "giúp đỡ") {
        return this.getHelpMessage()
      }

      if (lowerText === "info" || lowerText === "thông tin") {
        return "Tôi là Zalo Bot được phát triển với Bun và node-zalo-bot SDK. Tôi có thể giúp bạn với nhiều tác vụ khác nhau."
      }

      if (lowerText.startsWith("echo ")) {
        const echoText = text.substring(5)
        return `Bạn nói: "${echoText}"`
      }

      if (lowerText === "time" || lowerText === "thời gian") {
        return `Thời gian hiện tại: ${new Date().toLocaleString("vi-VN")}`
      }

      if (lowerText === "stats" || lowerText === "thống kê") {
        return await this.getStats(sender.id)
      }

      // Default response
      const defaultResponse = await this.configService.getDefaultResponse()
      return defaultResponse
    } catch (error) {
      logger.error("Error processing message:", error)
      return "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau."
    }
  }

  private getHelpMessage(): string {
    return BOT_RESPONSES.help.text
  }

  private async getStats(userId: string): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { zaloId: userId },
        include: {
          _count: {
            select: {
              messages: true,
            },
          },
        },
      })

      if (!user) {
        return "Không tìm thấy thông tin người dùng."
      }

      const totalMessages = user._count.messages
      const joinDate = user.createdAt.toLocaleDateString("vi-VN")

      return `📊 Thống kê của bạn:
• Tổng tin nhắn: ${totalMessages}
• Ngày tham gia: ${joinDate}
• Tên: ${user.name || "Chưa cập nhật"}`
    } catch (error) {
      logger.error("Error getting stats:", error)
      return "Không thể lấy thống kê. Vui lòng thử lại sau."
    }
  }

  async sendBroadcastMessage(message: string, userIds?: string[]): Promise<void> {
    try {
      let users

      if (userIds && userIds.length > 0) {
        users = await this.prisma.user.findMany({
          where: {
            zaloId: {
              in: userIds,
            },
          },
        })
      } else {
        users = await this.prisma.user.findMany()
      }

      for (const user of users) {
        try {
          await this.zaloService.sendTextMessage(user.zaloId, message)

          // Save broadcast message
          await this.prisma.message.create({
            data: {
              userId: user.id,
              content: message,
              type: MessageType.TEXT,
              chatId: GenerateUtils.getInstance().generateId(),
              direction: MessageDirection.OUTGOING,
              timestamp: new Date(),
            },
          })

          // Add delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          logger.error(`Failed to send broadcast to user ${user.zaloId}:`, error)
        }
      }

      logger.info(`Broadcast sent to ${users.length} users`)
    } catch (error) {
      logger.error("Error sending broadcast:", error)
      throw error
    }
  }

  async sendDirectMessage(zaloId: string, message: string): Promise<void> {
    try {
      await this.messageService.saveMessage({
        zaloId: zaloId,
        content: message,
        chatId: zaloId,
        type: MessageType.TEMPLATE,
        direction: MessageDirection.OUTGOING,
        timestamp: new Date(),
      })

      ZaloBotService.getInstance().sendMessage(zaloId, message)
    } catch (error) {
      logger.error("Error sending direct message:", error)
      throw error
    }
  }

  async sendClass(botInstance: ZaloBot, msg: any): Promise<void> {
    try {
      const { chatId, userId } = BotUtils.getInstance().parseCommand(msg) || {}
      const classes = await this.classService.getClassByZaloId(userId)
      // Process classes as needed
      logger.info("Classes retrieved:", classes)
      let responseMsg = `📚 Lớp học của bạn:\n${classes
        .map(
          (cls) =>
            `• Môn: ${cls.subjectName} - Giảng viên: ${cls.teacher} -  Thời gian: ${cls.startTime} đến ${
              cls.endTime
            } ${DateUtils.getInstance().getDayOfWeekText(cls.dayOfWeek)}`
        )
        .join("\n")}\nChúc bạn một tuần học tập hiệu quả! 🎉`

      await this.messageService.saveMessage({
        zaloId: userId,
        content: responseMsg,
        chatId: chatId,
        type: MessageType.TEMPLATE,
        direction: MessageDirection.OUTGOING,
        timestamp: new Date(),
      })
      if (responseMsg.length === 0) {
        responseMsg = "Bạn chưa đăng ký lớp học nào."
      }
      botInstance.sendMessage(chatId, responseMsg)
    } catch (error) {
      logger.error("Error getting classes:", error)
      throw error
    }
  }

  async dailyNotificationCalendarSubject(): Promise<void> {
    try {
      const data = await UserService.getInstance().dailyNotificationCalendarSubject()
      for (const item of data) {
        const { zaloId, message } = item
        await this.sendDirectMessage(zaloId, message)
      }

      const notifyBeforeMinutes = await UserService.getInstance().getSchudulerNotifyBeforeStartSubject()
      await Promise.all([
        notifyBeforeMinutes.map(async (item) => {
          const { zaloId, message } = item
          CrobService.getInstance().removeJob(`notify-before-start-subject-${zaloId}`)

          void CrobService.getInstance().addJob(`notify-before-start-subject-${zaloId}`, item.schedulerExpression, async () => {
            await this.sendDirectMessage(zaloId, message)
          })
        }),
      ])

      // logger.info(`Daily notification calendar subject sent successfully. Notify before minutes: ${notifyBeforeMinutes}`);
    } catch (error) {
      logger.error("Error sending daily notification calendar subject:", error)
    }
  }

  async dailyQuoteToAllUsers(): Promise<void> {
    try {
      const users = await UserService.getInstance().findUsersActiveNotify()
      for (const item of users) {
        const { zaloId } = item
        const quote = QuoteService.getInstance().getRandomQuote()
        const message = `🌟 ${quote}`
        await this.sendDirectMessage(zaloId, message)
        logger.info(`Daily quote sent to user ${zaloId}`)
      }
    } catch (error) {
      logger.error("Error sending daily quote to all users:", error)
    }
  }

  async dailyReminderAssignmentDue(): Promise<void> {
    try {
      const users = await UserService.getInstance().findUsersActiveNotify()
      for (const user of users) {
        const assignmentYetDue = await AssignmentService.getInstance().getAssignmentsYetDueByUser(user.id)
        let message = ""
        if (assignmentYetDue.length === 0) {
          continue
        }
        message += `📌 Nhắc nhở: Bạn có ${assignmentYetDue.length} bài tập sắp đến hạn:\n${assignmentYetDue
          .map((ua) => `📍 ${ua?.name}   ✒️ Hạn nộp: ${DateUtils.getInstance().formatDateTime(ua!.deadline)}`)
          .join("\n")}
        \nHãy hoàn thành chúng đúng hạn nhé! 💪`
        await this.sendDirectMessage(user.zaloId, message)
        logger.info(`Daily assignment due reminder sent to user ${user.id}`)
      }
    } catch (error) {
      logger.error("Error sending daily reminder for assignment due:", error)
    }
  }
}
