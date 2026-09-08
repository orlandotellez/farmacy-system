import { describe, it, expect, vi, beforeEach } from "vitest"
import { NodemailerEmailSender } from "../infrastructure/nodemailer.sender"

const { createTransport, sendMail, warn } = vi.hoisted(() => ({
  createTransport: vi.fn(),
  sendMail: vi.fn(),
  warn: vi.fn(),
}))

vi.mock("nodemailer", () => ({
  default: {
    createTransport: (config: unknown) => {
      createTransport(config)
      return { sendMail }
    },
  },
}))

vi.mock("@/config/env", () => ({
  env: {
    SMTP_HOST: undefined as string | undefined,
    SMTP_PORT: undefined as number | undefined,
    SMTP_USER: undefined as string | undefined,
    SMTP_PASS: undefined as string | undefined,
    SMTP_FROM: "no-reply@localhost",
  },
}))

vi.mock("@/config/logger", () => ({
  logger: { warn },
}))

import { env } from "@/config/env"

describe("NodemailerEmailSender", () => {
  beforeEach(() => {
    createTransport.mockClear()
    sendMail.mockClear()
    warn.mockClear()
    sendMail.mockResolvedValue({ messageId: "test-id" })
    env.SMTP_HOST = "smtp.example.com"
    env.SMTP_PORT = 587
    env.SMTP_USER = "user"
    env.SMTP_PASS = "pass"
    env.SMTP_FROM = "no-reply@localhost"
  })

  it("does not create the transport until the first send", async () => {
    const sender = new NodemailerEmailSender()

    expect(createTransport).not.toHaveBeenCalled()

    await sender.send({ to: "ana@mail.com", subject: "Hi", text: "Hello" })

    expect(createTransport).toHaveBeenCalledTimes(1)
  })

  it("memoizes the transport across sends", async () => {
    const sender = new NodemailerEmailSender()

    await sender.send({ to: "ana@mail.com", subject: "Hi", text: "Hello" })
    await sender.send({ to: "luis@mail.com", subject: "Hi", text: "Hello" })

    expect(createTransport).toHaveBeenCalledTimes(1)
    expect(sendMail).toHaveBeenCalledTimes(2)
  })

  it("skips delivery and resolves when SMTP is not configured", async () => {
    env.SMTP_HOST = undefined

    const sender = new NodemailerEmailSender()

    await expect(
      sender.send({ to: "ana@mail.com", subject: "Hi", text: "Hello" })
    ).resolves.toBeUndefined()

    expect(createTransport).not.toHaveBeenCalled()
    expect(sendMail).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("SMTP not configured"))
  })

  it("sends the correct payload with the SMTP_FROM address", async () => {
    const sender = new NodemailerEmailSender()

    await sender.send({
      to: "ana@mail.com",
      subject: "Verify your email",
      text: "Your verification code is: 123456",
    })

    expect(sendMail).toHaveBeenCalledWith({
      from: "no-reply@localhost",
      to: "ana@mail.com",
      subject: "Verify your email",
      text: "Your verification code is: 123456",
    })
  })

  it("uses port 587 when SMTP_PORT is not configured", async () => {
    env.SMTP_PORT = undefined

    const sender = new NodemailerEmailSender()

    await sender.send({ to: "ana@mail.com", subject: "Hi", text: "Hello" })

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587 })
    )
  })

  it("swallows SMTP failures and resolves", async () => {
    sendMail.mockRejectedValueOnce(new Error("ECONNREFUSED"))

    const sender = new NodemailerEmailSender()

    await expect(
      sender.send({ to: "ana@mail.com", subject: "Hi", text: "Hello" })
    ).resolves.toBeUndefined()

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Error) }),
      "Email delivery failed"
    )
  })
})