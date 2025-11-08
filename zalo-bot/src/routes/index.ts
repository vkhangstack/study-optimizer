import { Express } from "express"
import adminRoutes from "./admin"
import botRoutes from "./bot"
import { logger } from "../utils/logger"
import { adminAuthentication } from "../middleware/adminAuthenticaiton"

/**
 * Configure all application routes
 * @param app Express application instance
 */
export function configureRoutes(app: Express): void {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      version: process.version,
      information: "Study Optimizer Zalo Bot is running",
    })
  })

  // API Routes
  app.use("/api/admin", adminAuthentication, adminRoutes)
  app.use("/api/bot", botRoutes)
  //   app.use("/webhook", webhookRoutes)

  logger.info("All routes configured successfully")
}

/**
 * Get route information for logging
 * @returns Object containing all registered routes info
 */
export function getRoutesInfo(): object {
  return {
    health: {
      method: "GET",
      path: "/health",
      description: "Health check endpoint",
    },
    admin: {
      method: "Multiple",
      path: "/api/admin",
      description: "Admin management endpoints",
    },
    bot: {
      method: "Multiple",
      path: "/api/bot",
      description: "Bot operation endpoints",
    },
    webhook: {
      method: "GET/POST",
      path: "/webhook",
      description: "Zalo webhook endpoints",
    },
  }
}
