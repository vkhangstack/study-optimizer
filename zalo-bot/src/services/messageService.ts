import { Assignment, PrismaClient } from "@prisma/client"
import { Direction as PrismaDirection } from "@prisma/client"
import { UserService } from "./userService"
import { MessageType, MessageDirection, commandList, Command, AssignmentStatus } from "../types/enums"
import { logger } from "../utils/logger"
import { ZaloBotWebhookMessage, ZaloBotWebhookMessagePhoto, ZaloBotWebhookMessageSticker, ZaloBotWebhookMessageText } from "../types"
import { BotUtils } from "../utils/bot"
import { ZaloBotService } from "./zaloBotService"
import BOT_RESPONSES from "../types/message"
import { ClassService } from "./classService"
import { DateUtils } from "../utils/date"
import { AssignmentService } from "./assignmentService"
import { sleep } from "bun"

const prisma = new PrismaClient()

export interface CreateMessageData {
  zaloId: string
  content?: string
  type: MessageType
  direction: MessageDirection
  timestamp: Date
  chatId?: string
}

export class MessageService {
  private userService: UserService
  private zaloBotService: ZaloBotService
  private classService: ClassService
  private assignmentService: AssignmentService

  constructor() {
    this.userService = UserService.getInstance()
    this.zaloBotService = ZaloBotService.getInstance()
    this.classService = ClassService.getInstance()
    this.assignmentService = AssignmentService.getInstance()
  }

  async saveMessage(data: CreateMessageData) {
    try {
      // Ensure user exists
      const user = await this.userService.findOrCreateUser(data.zaloId)

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          content: data.content,
          chatId: data.chatId, // Using chatId from the input data
          type: data.type as MessageType,
          direction: data.direction as MessageDirection,
          timestamp: data.timestamp,
        },
        include: {
          user: true,
        },
      })

      return message
    } catch (error) {
      console.error("Error saving message:", error)
      throw error
    }
  }

  async getMessagesByUser(zaloId: string, page: number = 1, limit: number = 50) {
    try {
      const user = await this.userService.findUserByZaloId(zaloId)
      if (!user) {
        return { messages: [], total: 0, page, limit }
      }

      const skip = (page - 1) * limit

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: { userId: user.id },
          orderBy: { timestamp: "desc" },
          skip,
          take: limit,
          include: {
            user: true,
          },
        }),
        prisma.message.count({
          where: { userId: user.id },
        }),
      ])

      return {
        messages,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      console.error("Error getting messages by user:", error)
      throw error
    }
  }

  async getMessagesByConversation(conversationId: string, page: number = 1, limit: number = 50) {
    try {
      // For now, we'll use conversationId as zaloId
      // In a more complex setup, you'd have a proper conversation mapping
      return this.getMessagesByUser(conversationId, page, limit)
    } catch (error) {
      console.error("Error getting messages by conversation:", error)
      throw error
    }
  }

  async getRecentMessages(limit: number = 100) {
    try {
      const messages = await prisma.message.findMany({
        orderBy: { timestamp: "desc" },
        take: limit,
        include: {
          user: true,
        },
      })

      return messages
    } catch (error) {
      console.error("Error getting recent messages:", error)
      throw error
    }
  }

  async getMessageStats(zaloId?: string) {
    try {
      const whereClause = zaloId ? { user: { zaloId } } : {}

      const [totalMessages, incomingCount, outgoingCount] = await Promise.all([
        prisma.message.count({ where: whereClause }),
        prisma.message.count({
          where: {
            ...whereClause,
            direction: MessageDirection.INCOMING as PrismaDirection,
          },
        }),
        prisma.message.count({
          where: {
            ...whereClause,
            direction: MessageDirection.OUTGOING as PrismaDirection,
          },
        }),
      ])

      return {
        total: totalMessages,
        incoming: incomingCount,
        outgoing: outgoingCount,
      }
    } catch (error) {
      console.error("Error getting message stats:", error)
      throw error
    }
  }

  async deleteOldMessages(daysOld: number = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const result = await prisma.message.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      })

      return result.count
    } catch (error) {
      console.error("Error deleting old messages:", error)
      throw error
    }
  }

  async processMessage(msg: ZaloBotWebhookMessage): Promise<{
    response: boolean
    message: string
    chatId: string
  }> {
    try {
      logger.info("Received message:", msg)
      const chatId = msg.chat.id
      const userId = msg.from.id
      const userName = ""
      let response = ""

      logger.info("Received message:", {
        ...msg,
      })

      const result = {
        response: false,
        message: "",
        chatId: chatId,
      }

      switch (msg.message_type) {
        case MessageType.CHAT_STICKER:
          const webhookDataSticker = msg as ZaloBotWebhookMessageSticker
          const arrayMessageSticker = [
            "😘 Sticker dễ thương quá!",
            "😘 Cảm ơn bạn đã gửi sticker!",
            "😘 Sticker này thật vui nhộn!",
            "😘 Mình rất thích sticker bạn gửi!",
            "😘 Sticker siêu dễ thương luôn!",
            "😘 Cảm ơn bạn đã làm cho ngày của mình thêm vui với sticker này!",
            "😘 Sticker này thật sự rất đặc biệt!",
            "😘 Mình không thể ngừng cười với sticker bạn gửi!",
            "😘 Sticker này làm mình nhớ đến một kỷ niệm vui!",
            "😘 Bạn có thể gửi thêm sticker nữa không? Mình rất thích chúng!",
            "😘 Sticker này thật sự làm mình cảm thấy tuyệt vời!",
            "😘 Cảm ơn bạn đã chia sẻ sticker này với mình!",
          ]

          await this.saveMessage({
            zaloId: userId,
            content: `Sticker ID: ${webhookDataSticker.sticker}`,
            type: MessageType.CHAT_STICKER,
            chatId: chatId,
            direction: MessageDirection.INCOMING,
            timestamp: new Date(),
          })

          // Simple response like your example
          // response = `Chào bạn ${userName}, bạn vừa gửi một sticker dễ thương! 😊`;
          response = arrayMessageSticker[Math.floor(Math.random() * arrayMessageSticker.length)]

          // Save outgoing message
          await this.saveMessage({
            zaloId: userId,
            content: response,
            chatId: chatId,
            type: MessageType.CHAT_STICKER,
            direction: MessageDirection.OUTGOING,
            timestamp: new Date(),
          })

          result.response = true
          result.message = response
          break

        case MessageType.CHAT_PHOTO:
          const webhookDataPhoto = msg as ZaloBotWebhookMessagePhoto
          await this.saveMessage({
            zaloId: userId,
            content: `Photo URL: ${webhookDataPhoto.photo_url}`,
            type: MessageType.CHAT_PHOTO,
            chatId: chatId,
            direction: MessageDirection.INCOMING,
            timestamp: new Date(),
          })

          // Simple response like your example
          response = `Chào bạn ${userName}, bạn vừa gửi một bức ảnh dễ thương! 😊`

          // Save outgoing message
          await this.saveMessage({
            zaloId: userId,
            content: response,
            chatId: chatId,
            type: MessageType.CHAT_PHOTO,
            direction: MessageDirection.OUTGOING,
            timestamp: new Date(),
          })
          result.response = true
          result.message = response
          break

        default:
          const webhookDataText = msg as ZaloBotWebhookMessageText

          await this.zaloBotService.sendTypingAction(userId)

          await sleep(1000) // Simulate typing delay

          await this.saveMessage({
            zaloId: userId,
            content: `Message: ${webhookDataText.text}`,
            type: MessageType.TEXT,
            chatId: chatId,
            direction: MessageDirection.INCOMING,
            timestamp: new Date(),
          })

          const data = await this.processMessageText(webhookDataText)
          result.response = data.response
          result.message = data.message
          result.chatId = data.chatId
          break
      }

      return result
    } catch (error) {
      console.error("Error processing message:", error)
      throw error
    }
  }

  async processMessageText(msg: ZaloBotWebhookMessageText): Promise<{
    response: boolean
    message: string
    chatId: string
  }> {
    try {
      logger.info("Processing message:", msg)
      const { userId, chatId, messageText, userName } = BotUtils.getInstance().parseCommand(msg) || {}

      let messageType = MessageType.TEXT

      logger.info("Received message:", {
        ...msg,
      })

      const result = {
        response: false,
        message: "",
        chatId: chatId,
      }
      const checkUserRegistration = await this.handleMessageUserRegistration(userId)

      switch (true) {
        case messageText.startsWith(Command.HELP):
          logger.info("Processing /help command for user:", userId)
          result.message = this.zaloBotService.getHelpMessage()
          result.response = true
          messageType = MessageType.TEMPLATE
          break

        case messageText.startsWith(Command.MENU):
          logger.info("Processing /menu command for user:", userId)
          logger.debug("Processing /menu after :", msg.text?.split(" ").slice(1).join(" "))
          const menuMessage = BOT_RESPONSES.menu.text + "\n" + BOT_RESPONSES.menu.buttons.map((btn) => `${btn.text} - ${btn.command}`).join("\n")
          result.message = menuMessage
          result.response = true
          messageType = MessageType.TEMPLATE
          break

        case messageText.startsWith(Command.INFO):
          logger.info("Processing /info command for user:", userId)
          result.message = this.zaloBotService.getBotInformation()
          result.response = true
          messageType = MessageType.TEMPLATE
          break

        case messageText.startsWith(Command.CLASS):
          logger.info("Processing /class command for user:", userId)
          if (!checkUserRegistration.ok) {
            result.message = checkUserRegistration.message
            break
          }

          result.response = true
          messageType = MessageType.TEMPLATE

          const classes = await this.classService.getClassByZaloId(userId)
          const classSubject = await this.classService.getClassSubjectMap(userId)
          // Process classes as needed
          logger.info("Classes retrieved:", classes)
          if (classes.length === 0) {
            result.message =
              "Bạn chưa đăng ký lớp học nào. Vui lòng sử dụng lệnh /register để đăng ký lớp học hoặc liên hệ với admin để biết thêm chi tiết. 😊"
            result.response = true
            break
          }

          const classSubjectId: any = messageText.replace(Command.CLASS, "").trim()

          if (classSubjectId) {
            const classInfo = classes.find((cls) => cls.subjectId.startsWith(classSubjectId) || classSubject[cls.id]?.subjectName === classSubjectId)
            if (!classInfo) {
              result.message = "❌ Không tìm thấy lớp học với mã: " + classSubjectId
              break
            } else {
              result.message = `📚 Lớp học của bạn:\n • Mã: ${classInfo?.subjectName}\n• Môn: ${classInfo?.subjectId}\n• Giảng viên: ${classInfo?.teacher
                }\n• Thời gian: ${classInfo?.startTime} đến ${classInfo?.endTime} ${DateUtils.getInstance().getDayOfWeekText(
                  classInfo?.dayOfWeek
                )}\n${Array.from({ length: 50 })
                  .map(() => "-")
                  .join("")}`
            }
          } else {
            let responseMsgClass = `📚 Lớp học của bạn:\n${classes
              .map(
                (cls) =>
                  `• Mã: ${classSubject[cls.id]?.subjectName}\n• Môn: ${cls.subjectId}\n• Giảng viên: ${cls.teacher}\n• Thời gian: ${cls.startTime
                  } đến ${cls.endTime} ${DateUtils.getInstance().getDayOfWeekText(cls.dayOfWeek)}\n${Array.from({ length: 50 })
                    .map(() => "-")
                    .join("")}`
              )
              .join("\n")}`

            result.message = responseMsgClass
          }
          result.message += "\nChúc bạn một tuần học tập hiệu quả! 🎉"

          break

        case messageText.startsWith(Command.TODAY):
          logger.info("Processing /today command for user:", userId)
          messageType = MessageType.TEMPLATE
          result.response = true

          if (!checkUserRegistration.ok) {
            result.message = checkUserRegistration.message
            break
          }

          const calendarSubjectToday = await this.userService.getCalendarSubjectTodayForUser(userId)
          result.message = calendarSubjectToday.message
          break

        case messageText.startsWith(Command.REGISTER):
          logger.info("Processing /register command for user:", userId)

          let responseMsgRegister = ""
          const userExistRegister = await this.userService.findUserByZaloId(userId, true)
          if (!userExistRegister) {
            // Save user and message to database
            const newUser = await this.userService.findOrCreateUser(userId, {
              user_id: userId,
              display_name: userName,
            })
            await this.userService.activateUser(newUser.zaloId)
            await this.userService.toggleUserNotify(newUser.zaloId, true)
            // initialize class registration process
            const mainClasses = await this.classService.getAllMainClasses()
            logger.info("Main classes retrieved for registration:", mainClasses)
            // Here you would normally send the list of classes to the user for selection
            // For simplicity, we will just log them
            logger.info(`User ${userId} can register for the following classes:`, mainClasses)
            await this.classService.setClassForUser(
              userId,
              mainClasses.map((c) => c.id)
            )
            logger.info(
              `User ${userId} has been registered for classes:`,
              mainClasses.map((c) => c.id)
            )
            responseMsgRegister =
              BOT_RESPONSES.register.success +
              "\n\n" +
              `🎊 Bạn đã được đăng ký vào các lớp học. Sử dụng lệnh /class để xem chi tiết lớp học của bạn. Hoặc có thể liên hệ với admin để thay đổi lớp học nhé!`
          } else {
            responseMsgRegister = BOT_RESPONSES.register.alreadyRegistered
          }
          result.message = responseMsgRegister
          result.response = true
          messageType = MessageType.TEMPLATE
          break

        case messageText.startsWith(Command.UNREGISTER):
          logger.info("Processing /unregister command for user:", userId)
          const userExistUnregister = await this.userService.findUserByZaloId(userId, true)
          let responseMsgUnregister = ""
          if (!userExistUnregister) {
            responseMsgUnregister = BOT_RESPONSES.unregister.notRegistered
          } else {
            responseMsgUnregister = BOT_RESPONSES.unregister.success
            await this.userService.updateUser(userId, {
              active: false,
              notify: false,
            })
          }

          result.message = responseMsgUnregister
          result.response = true
          messageType = MessageType.TEMPLATE
          break

        case messageText.startsWith(Command.ASSIGNMENTS):
          logger.info("Processing /assignments command for user:", userId)
          const assignments = await this.assignmentService.getUserAssignments(userId)
          if (assignments.length === 0) {
            result.message = "Bạn chưa có bài tập nào."
          } else {
            const classSubject = await this.classService.getClassSubjectMap(userId)
            result.message =
              "🫣 Danh sách bài tập của bạn:\n\n" +
              assignments
                .map(
                  (a) =>
                    `• Mã: ${a?.id}\n• Bài tập: ${a.assignment?.name}\n• Mô tả: ${a.assignment?.description}\n• Hạn nộp: ${DateUtils.getInstance().formatDate(
                      a.assignment?.deadline
                    )}\n• Môn: ${a.assignment?.classSubjectId ? classSubject[a.assignment?.classSubjectId]?.subjectName : "Không xác định"
                    }\n• Hoàn thành: ${a.status === AssignmentStatus.COMPLETED ? "✅" : "❌"}\n${a.assignment?.description ? "• Mô tả: " + a.assignment?.description + "\n" : ""
                    }${Array.from({ length: 36 })
                      .map(() => "-")
                      .join("")}`
                )
                .join("\n") +
              "\nHãy cố gắng hoàn thành đúng hạn nhé! 😊"
          }
          result.response = true
          messageType = MessageType.TEMPLATE
          break
        case messageText.startsWith(Command.ADD_ASSIGNMENT_CLASS):
          logger.info("Processing /add_assignment_class command for user:", userId)
          // check Khang Pham
          if (userId !== "a0a56bb30efde7a3beec" || userName !== "Khang Pham") {
            result.message = "Bạn không có quyền sử dụng lệnh này."
            result.response = true
            break
          }

          let assignmentDetails: any = messageText.replace(Command.ADD_ASSIGNMENT_CLASS, "").trim()
          assignmentDetails = JSON.parse(assignmentDetails)
          const classSubjectInfo = await this.classService.getClassSubjectBySubjectLikeId(assignmentDetails.classSubjectId)
          if (!classSubjectInfo) {
            result.message = `Không tìm thấy môn học với mã hoặc tên chứa: ${assignmentDetails.classSubjectId}. Vui lòng kiểm tra lại.`
            result.response = true
            break
          }

          if (!assignmentDetails?.classSubjectId || !assignmentDetails?.name || !assignmentDetails?.deadline) {
            result.message =
              "Cú pháp thêm bài tập không đúng. Vui lòng sử dụng: /add_assignment_class {'name': 'Tên bài tập','classSubjectId': 'Mã lớp','deadline': 'YYYY-MM-DD HH:MM'}"
          } else {
            const deadlineDate = new Date(assignmentDetails?.deadline)
            if (isNaN(deadlineDate.getTime())) {
              result.message = "Định dạng ngày tháng không đúng. Vui lòng sử dụng định dạng: YYYY-MM-DD HH:MM"
            } else {
              const subject = await this.classService.getClassSubjectBySubjectId(classSubjectInfo.id)

              const existingAssignments = await this.assignmentService.getAssignmentByClassSubjectId(classSubjectInfo.id)
              const duplicate = existingAssignments.find(
                (a) => a.name === assignmentDetails.name && DateUtils.getInstance().isSameDay(a.deadline, deadlineDate)
              )
              if (duplicate) {
                result.message = `Bài tập với tên "${assignmentDetails.name}" thuộc môn ${classSubjectInfo?.subjectName
                  } và hạn nộp vào ${DateUtils.getInstance().formatDate(deadlineDate)} đã tồn tại. Vui lòng kiểm tra lại.`
                result.response = true
                break
              }
              let newAssignment: Assignment
              try {
                newAssignment = await this.assignmentService.createAssignment({
                  title: assignmentDetails.name,
                  classSubjectId: classSubjectInfo.id,
                  deadline: deadlineDate,
                  description: assignmentDetails.description || "",
                })
                result.message = `Đã thêm bài tập: ${assignmentDetails.name} thuộc môn ${classSubjectInfo?.subjectName
                  } với hạn nộp vào ${DateUtils.getInstance().formatDate(deadlineDate)}`
              } catch (error: any) {
                result.message = `Lỗi khi tạo bài tập: ${error.message as unknown as string}`
                result.response = true
                break
              }

              const users = await this.classService.getUsersRegisteredClass(classSubjectInfo.id)

              for (const user of users) {
                await this.assignmentService.assignAssignmentToUser(newAssignment.id, user, userId)
                result.message += `\nĐã gán bài tập cho người dùng: ${user}`
              }
            }
          }
          result.response = true
          messageType = MessageType.TEMPLATE
          break

        case messageText.startsWith(Command.REMOVE_ASSIGNMENT):
          logger.info("Processing /remove_assignment command for user:", userId)
          result.response = true
          messageType = MessageType.TEMPLATE

          if (!checkUserRegistration.ok) {
            result.message = checkUserRegistration.message
            break
          }

          const assignmentIdToRemove: string = messageText.replace(Command.REMOVE_ASSIGNMENT, "").trim()
          logger.debug("Assignment ID to remove:", assignmentIdToRemove)
          if (!assignmentIdToRemove) {
            result.message = "Cú pháp xóa bài tập không đúng. Vui lòng sử dụng: /remove_assignment Mã Bài Tập"
          } else {
            const assignmentRecord = await this.assignmentService.getUserAssignmentById(assignmentIdToRemove, userId)
            if (!assignmentRecord) {
              result.message = `Không tìm thấy bài tập với mã: ${assignmentIdToRemove}. Vui lòng kiểm tra lại cú pháp.`
            } else {
              await this.assignmentService.removeAssignmentFromUsers(assignmentRecord.id, userId)
              const assignment = await this.assignmentService.getAssignmentById(assignmentRecord.assignmentId)
              result.message = `Đã xóa bài tập "${assignment?.name}" khỏi danh sách của bạn.`
            }
          }
          break
        case messageText.startsWith(Command.STATUS_ASSIGNMENT):
          logger.info("Processing /status_assignment command for user:", userId)
          result.response = true
          messageType = MessageType.TEMPLATE

          if (!checkUserRegistration.ok) {
            result.message = checkUserRegistration.message
            break
          }

          const statusDetails: any = messageText.replace(Command.STATUS_ASSIGNMENT, "").trim()
          const command = statusDetails.split("|").map((s: string) => s.trim())
          const assignmentId = command[0]
          const completed = command[1] === "true" ? true : command[1] === "false" ? false : null

          if (!assignmentId || typeof completed !== "boolean") {
            logger.error("Invalid /status_assignment command format:", statusDetails)
            result.message = "Cú pháp cập nhật trạng thái bài tập không đúng. Vui lòng sử dụng: /status_assignment Mã Bài Tập|completed(true/false)"
          } else {
            const assignmentRecord = await this.assignmentService.getUserAssignmentById(assignmentId, userId)
            if (!assignmentRecord) {
              result.message = `Không tìm thấy bài tập với mã: ${assignmentId}. Vui lòng kiểm tra lại cú pháp.`
            } else {
              await this.assignmentService.updateUserAssignmentStatus(
                assignmentId,
                userId,
                completed ? AssignmentStatus.COMPLETED : AssignmentStatus.PENDING
              )
              const assignment = await this.assignmentService.getAssignmentById(assignmentRecord.assignmentId)
              const classSubject = await this.classService.getClassSubjectById(assignment?.classSubjectId || "")
              result.message = `Đã cập nhật trạng thái bài tập "${assignment?.name}" môn [${classSubject?.subjectName}] thành ${completed ? "hoàn thành ✅" : "chưa hoàn thành ❌"
                }.`
            }
          }

          break

        case messageText.startsWith(Command.NOTIFY):
          logger.info("Processing /notify command for user:", userId)
          let notifyStatus = messageText.replace(Command.NOTIFY, "").trim().toLowerCase()
          let notifyBoolean: boolean | null = null
          if (notifyStatus === "on") notifyBoolean = true
          else if (notifyStatus === "off") notifyBoolean = false

          if (notifyBoolean === null) {
            result.message = "Cú pháp bật/tắt thông báo không đúng. Vui lòng sử dụng: /notify on hoặc /notify off"
          } else {
            await this.userService.toggleUserNotify(userId, notifyBoolean)
            result.message = `Chào ${userName}, Bạn đã ${notifyBoolean ? "bật" : "tắt"} thông báo nhắc nhở lịch học và bài tập.`
            if (!notifyBoolean) {
              result.message += " Bạn sẽ không nhận được thông báo nhắc nhở về bài tập nữa ạ!."
            }
          }
          result.response = true
          messageType = MessageType.TEMPLATE
          break

        case messageText.startsWith(Command.DOCS):
          logger.info("Processing /docs command for user:", userId)
          const linkDocs = {
            IT003: "https://drive.google.com/drive/folders/1yq-UCLLKQ7sCprpgBAr0fyvTyHhAENzz",
            MA004: "https://drive.google.com/drive/folders/1ko2CZQ5Cim3bVmvxTaMp2ppQelyXYz7k?usp=sharing",
            IE105: "https://drive.google.com/drive/folders/19WuX5aageEQ_H_bEZaFIJI3fafV6F101?usp=sharing",
            MA005: "https://drive.google.com/drive/folders/1i3usHbgApzG3iT0Nzi8vV0mmfx_sFNU9?usp=sharing",
          }
          if (!checkUserRegistration.ok) {
            result.message = checkUserRegistration.message
            break
          }

          result.message = BOT_RESPONSES.docs.notFound

          const classCode = messageText.replace(Command.DOCS, "").trim().toUpperCase()
          if (classCode && classCode.startsWith("IT003")) {
            result.message = `📚 Tài liệu cho lớp học ${classCode}:\n${linkDocs.IT003}`
          }
          if (classCode && classCode.startsWith("MA004")) {
            result.message = `📚 Tài liệu cho lớp học ${classCode}:\n${linkDocs.MA004}`
          }
          if (classCode && classCode.startsWith("IE105")) {
            result.message = `📚 Tài liệu cho lớp học ${classCode}:\n${linkDocs.IE105}`
          }
          if (classCode && classCode.startsWith("MA005")) {
            result.message = `📚 Tài liệu cho lớp học ${classCode}:\n${linkDocs.MA005}`
          }
          if (!classCode || classCode === "") {
            result.message =
              "📚 Danh sách tài liệu lớp học:\n" +
              Object.entries(linkDocs)
                .map(([key, value]) => `- ${key}: ${value}`)
                .join("\n")
          }

          result.response = true
          messageType = MessageType.TEMPLATE
          break
        default:
          // Here you would implement command processing logic
          // For now, we just echo back the command
          result.message = `Chào bạn ${userName}, hiện tại tôi chỉ xử lý được tin nhắn theo cú pháp đã định nghĩa. Vui lòng thử lại /help để biết thêm chi tiết ạ! 😊`
          result.response = true
          break
      }

      // Save outgoing message
      await this.saveMessage({
        zaloId: userId,
        content: result.message,
        chatId: chatId,
        type: messageType,
        direction: MessageDirection.OUTGOING,
        timestamp: new Date(),
      })

      return result
    } catch (error) {
      console.error("Error processing command message:", error)
      throw error
    }
  }

  async handleMessageUserRegistration(zaloId: string): Promise<{
    ok: boolean
    message: string
  }> {
    try {
      const user = await this.userService.checkUserRegistration(zaloId)
      if (!user) {
        // Send welcome message
        const welcomeMessage = BOT_RESPONSES.unregister.notRegistered
        return {
          ok: false,
          message: welcomeMessage,
        }
      } else {
        return {
          ok: true,
          message: "",
        }
      }
    } catch (error) {
      console.error("Error handling user registration message:", error)
      throw error
    }
  }
}
