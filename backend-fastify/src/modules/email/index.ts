import { NodemailerEmailSender } from "./infrastructure/nodemailer.sender"
import type { IEmailSender } from "./domain/email.types"

export const emailSender: IEmailSender = new NodemailerEmailSender()