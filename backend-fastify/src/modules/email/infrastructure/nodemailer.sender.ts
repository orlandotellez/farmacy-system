import nodemailer, { type Transporter } from "nodemailer"
import type { EmailMessage, IEmailSender } from "../domain/email.types"
import { env } from "@/config/env"
import { logger } from "@/config/logger"

export class NodemailerEmailSender implements IEmailSender {
  private transport: Transporter | null = null

  async send(message: EmailMessage): Promise<void> {
    if (!env.SMTP_HOST) {
      logger.warn("SMTP not configured — skipping email delivery")
      return
    }

    try {
      await this.buildTransport().sendMail({
        from: env.SMTP_FROM,
        to: message.to,
        subject: message.subject,
        text: message.text,
      })
    } catch (error) {
      logger.warn({ error }, "Email delivery failed")
    }
  }

  private buildTransport(): Transporter {
    if (!this.transport) {
      this.transport = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT ?? 587,
        auth:
          env.SMTP_USER && env.SMTP_PASS
            ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
            : undefined,
      })
    }
    return this.transport
  }
}