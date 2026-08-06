import { logger } from "../config/logger"
import { buildApp } from "@/app"

export const setupGracefulShutdown = (app: Awaited<ReturnType<typeof buildApp>>) => {
  const gracefulShutdown = async (signal: string) => {
    try {
      logger.info(`Received ${signal}, shutting down gracefully...`)

      await app.close()

      logger.info("Server closed successfully")

      process.exit(0)
    } catch (error) {
      logger.error(error, "Error during shutdown")
      process.exit(1)
    }
  }

  process.on("SIGINT", () => gracefulShutdown("SIGINT"))
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
}
