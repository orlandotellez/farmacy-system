import { buildApp } from "./app"
import { env } from "./config/env"
import { setupGracefulShutdown } from "./config/gracefulShutdown"

const startServer = async () => {
  try {
    const app = await buildApp()

    setupGracefulShutdown(app)

    await app.listen({ port: env.PORT, host: env.HOST })
  } catch {
    process.exit(1)
  }
}


startServer()
