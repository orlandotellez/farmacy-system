import Fastify from "fastify"
import { logger } from "./config/logger"
import { env } from "./config/env"

const app = Fastify({ loggerInstance: logger })

app.get("/", async () => {
  return {
    status: "ok",
    timeStamp: new Date().toISOString()
  }
})

await app.listen({ port: env.PORT, host: env.HOST })
