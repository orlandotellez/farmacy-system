import { z } from "zod"

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d)$/

const baseFields = {
  name: z.string().trim().min(1, "Printer name is required").max(60),
  role: z.enum(["receipt", "kitchen", "both"]),
  paper_width: z.union([z.literal(58), z.literal(80)]),
  profile: z.enum(["escpos", "star_line"]).default("escpos"),
  codepage: z.string().min(1).default("ISO-8859-1"),
  auto_cut: z.boolean().default(true),
  cut_type: z.enum(["full", "partial"]).nullable().optional(),
  open_cash_drawer: z.boolean().default(false),
  default_copies: z.number().int().min(1).max(10).default(1),
  is_default: z.boolean().default(false),
  is_active: z.boolean().default(true),
}

const baseObject = z.object(baseFields)

const netVariant = baseObject.extend({
  connection_type: z.literal("net"),
  address: z.string().regex(IPV4_REGEX, "Invalid IP address"),
  port: z.number().int().min(1).max(65535),
})

const usbVariant = baseObject.extend({
  connection_type: z.literal("usb"),
  address: z.string().min(1, "Select a USB device"),
  port: z.null().optional(),
})

const bluetoothVariant = baseObject.extend({
  connection_type: z.literal("bluetooth"),
  address: z.string().min(1, "Select a Bluetooth device"),
  port: z.null().optional(),
})

const crossRules = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .refine(
      (data: any) => data.open_cash_drawer !== true || data.role === "receipt" || data.role === "both",
      { message: "Cash drawer only applies to role 'receipt' or 'both'", path: ["open_cash_drawer"] }
    )
    .refine(
      (data: any) => data.cut_type == null || data.auto_cut === true,
      { message: "Cut type only applies when auto cut is enabled", path: ["cut_type"] }
    )

export const CreatePrinterDtoSchema = crossRules(
  z.discriminatedUnion("connection_type", [netVariant, usbVariant, bluetoothVariant])
)

export type CreatePrinterDto = z.infer<typeof CreatePrinterDtoSchema>

export const UpdatePrinterDtoSchema = crossRules(
  baseObject.extend({
    connection_type: z.enum(["net", "usb", "bluetooth"]).optional(),
    address: z.string().optional(),
    port: z.number().int().min(1).max(65535).optional().nullable(),
  }).partial(),
)

export type UpdatePrinterDto = z.infer<typeof UpdatePrinterDtoSchema>

export const SetDefaultPrinterDtoSchema = z.object({
  role: z.enum(["receipt", "kitchen", "both"]),
})

export type SetDefaultPrinterDto = z.infer<typeof SetDefaultPrinterDtoSchema>

export const TestPrintDtoSchema = z.object({
  copies: z.number().int().min(1).max(5).optional().default(1),
})

export type TestPrintDto = z.infer<typeof TestPrintDtoSchema>

export const PrintReceiptDtoSchema = z.object({
  sale_id: z.string().uuid("Invalid sale ID"),
  copies: z.number().int().min(1).max(5).optional().default(1),
  currency: z.string().optional().default("NIO"),
})

export type PrintReceiptDto = z.infer<typeof PrintReceiptDtoSchema>

export const SendTcpDtoSchema = z.object({
  ticket_base64: z.string().min(1, "Ticket data is required"),
  address: z.string().min(1, "IP address is required"),
  port: z.number().int().min(1).max(65535),
})

export type SendTcpDto = z.infer<typeof SendTcpDtoSchema>

export const PrinterIdParamSchema = z.object({
  id: z.string().uuid("Invalid printer ID"),
})

export type PrinterIdParam = z.infer<typeof PrinterIdParamSchema>
