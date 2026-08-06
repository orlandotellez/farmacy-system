import fastify from "fastify"
import helmet from "@fastify/helmet"
import cors from "@fastify/cors"
import compress from "@fastify/compress"
import rateLimit from "@fastify/rate-limit"
import cookie from "@fastify/cookie"
import { logger } from "./config/logger"
import { corsOptions } from "./config/cors"

export const buildApp = async () => {
  const app = fastify({ loggerInstance: logger })

  // Protege header HTTP
  await app.register(helmet)

  await app.register(cors, corsOptions)

  await app.register(compress, { threshold: 1024 })

  await app.register(rateLimit, {
    max: 300,
    timeWindow: "1 minute"
  })

  await app.register(cookie)

  app.get("/api/v1/health", async () => {
    return {
      status: "ok",
      timeStamp: new Date().toISOString()
    }
  })

  return app
}
