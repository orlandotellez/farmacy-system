export interface EmailMessage {
  to: string
  subject: string
  text: string
}

export interface IEmailSender {
  send(message: EmailMessage): Promise<void>
}
