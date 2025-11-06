import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import helmet from "helmet"
import { PrismaClient } from "@prisma/client"

import { errorHandler } from "./middleware/errorHandler"
import { logger } from "./utils/logger"
import { ZaloBotService } from "./services/zaloBotService"
import { BotService } from "./services/botService"
import { config } from "dotenv"
import { CrobService } from "./services/crobService"
import { DateUtils } from "./utils/date"
import { configureRoutes, getRoutesInfo } from "./routes"
config()

if (await Bun.file(".env").exists()) {
  logger.info(".env file loaded successfully")
} else {
  logger.warn(".env file not found. Make sure environment variables are set.")
  throw new Error(".env file not found")
}

const app = express()
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000
const prisma = new PrismaClient()

// Middleware
app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true, limit: "10Mb" }))

// Bot configuration
const zaloBotService = new ZaloBotService()

const token = zaloBotService.getBotToken()
logger.info("Zalo Bot Token loaded:", token ? "Yes" : "No")
const webhook = zaloBotService.getWebHookUrl()
logger.info("Zalo Bot Webhook Info:", await zaloBotService.getWebhookInfo())
logger.info("Zalo Bot Webhook URL:", webhook)

if (!token) {
  throw new Error("Zalo bot token is not set")
}

// Initialize services
const isPolling = zaloBotService.getIsPolling()
logger.info(`Bot isPolling mode: ${isPolling}`)

const botService = new BotService(zaloBotService, prisma)
logger.info("BotService initialized")

// Set webhook
if (isPolling) {
  await zaloBotService.deleteWebHook()
  logger.info("Polling mode enabled, webhook deleted")
} else {
  await zaloBotService.deleteWebHook()
  logger.info("Existing webhook deleted")
  await zaloBotService.setWebHook()
  logger.info(`Webhook set to: ${webhook}`)
}

logger.info("Starting Zalo Bot server...")
// Endpoint webhook (Zalo sẽ gửi POST request vào đây)
app.post("/webhook", (req, res) => {
  try {
    if (req.headers["x-bot-api-secret-token"] !== zaloBotService.getSecretToken()) {
      return res.status(403).json({ message: "Unauthorized", reqId: req.headers["x-request-id"] })
    }
    botService.onText(req.body)
    res.sendStatus(200)
  } catch (error) {
    logger.error("Webhook processing error:", error)
    res.sendStatus(500)
  }
})

// Error handling
app.use(errorHandler)

configureRoutes(app)

logger.info("Registered Routes:", getRoutesInfo())

// Start server
async function startServer() {
  try {
    await prisma.$connect()
    logger.info("Database connected successfully")

    // Initialize database with default configurations
    const { DatabaseUtils } = await import("./utils/database")
    const dbUtils = new DatabaseUtils(prisma)
    await dbUtils.initializeDatabase()
    await CrobService.getInstance().restoreAllJobs()

    app.listen(port, async () => {
      logger.info(`Bot đang chạy trên cổng ${port}`)
      logger.info(`Webhook URL: ${await zaloBotService.getWebhookInfo()}`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...")
  await CrobService.getInstance().saveState()
  CrobService.getInstance().destroyAll()
  await prisma.$disconnect()
  process.exit(0)
})

function initCrobJobs() {
  Promise.all([
    // Daily notification job at 9 AM every day
    CrobService.getInstance().addJob("daily-notification", "0 9 * * *", () => {
      console.log("Running daily notification job...", DateUtils.getInstance().formatDateTime(new Date()))
      void botService.dailyNotificationCalendarSubject()
    }),
    // Daily quote job at 8:30 AM every day
    // CrobService.getInstance().addJob("daily-quote", "30 8 * * *", () => {
    //   console.log("Running daily quote job...", DateUtils.getInstance().formatDateTime(new Date()))
    //   void botService.dailyQuoteToAllUsers()
    // }),
    // Daily reminder job for assignment due at 2:30 PM every day
    CrobService.getInstance().addJob("daily-reminder-assignment-due", "30 14 * * *", () => {
      console.log("Running daily reminder job for assignment due...", DateUtils.getInstance().formatDateTime(new Date()))
      void botService.dailyReminderAssignmentDue()
    }),
  ])
}

startServer().then(() => {
  initCrobJobs()
})
