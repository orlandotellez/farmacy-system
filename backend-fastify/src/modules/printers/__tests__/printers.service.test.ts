import { describe, it, expect, vi, beforeEach } from "vitest"
import { createPrintersService } from "../application/printers.service"
import { BadRequestError, ConflictError, NotFoundError } from "@/core/errors/AppError"
import { sendBytesViaTCP } from "../infrastructure/escpos/transport.tcp"
import type { IPrinterRepository } from "../domain/printers.interface"
import type { IPrinterEntity } from "../domain/printers.entities"

vi.mock("../infrastructure/escpos/transport.tcp", () => ({
  sendBytesViaTCP: vi.fn(),
}))

function makePrinter(overrides?: Partial<IPrinterEntity>): IPrinterEntity {
  return {
    id: "printer-1",
    store_id: "store-1",
    name: "Caja Principal",
    connection_type: "net",
    address: "192.168.1.50",
    port: 9100,
    paper_width: 80,
    profile: "escpos",
    codepage: "ISO-8859-1",
    auto_cut: true,
    cut_type: "full",
    open_cash_drawer: false,
    default_copies: 1,
    role: "receipt",
    is_default: false,
    is_active: true,
    last_status: "unknown",
    last_seen_at: null,
    created_at: new Date("2026-01-15T10:00:00Z"),
    updated_at: new Date("2026-01-15T10:00:00Z"),
    ...overrides,
  }
}

function mockPrinterRepository(overrides?: Partial<IPrinterRepository>): IPrinterRepository {
  return {
    findByStore: vi.fn().mockResolvedValue([makePrinter()]),
    findById: vi.fn().mockResolvedValue(makePrinter()),
    findDefault: vi.fn().mockResolvedValue(makePrinter()),
    create: vi.fn().mockResolvedValue(makePrinter()),
    update: vi.fn().mockResolvedValue(makePrinter()),
    setDefault: vi.fn().mockResolvedValue(makePrinter({ is_default: true })),
    softDelete: vi.fn().mockResolvedValue(makePrinter({ is_active: false })),
    existsByName: vi.fn().mockResolvedValue(false),
    updateStatus: vi.fn().mockResolvedValue(undefined),
    createJob: vi.fn().mockResolvedValue("job-1"),
    updateJobStatus: vi.fn().mockResolvedValue(undefined),
    findSaleWithItems: vi.fn().mockResolvedValue({
      id: "sale-1",
      user_name: "Ana",
      created_at: new Date(),
      subtotal: 100,
      total: 100,
      payment_method: "efectivo",
      amount_received: 100,
      change_given: 0,
      items: [{ medicine_name: "Paracetamol", quantity: 2, line_total: 10 }],
    }),
    ...overrides,
  }
}

const printerDto = {
  name: "Caja Principal",
  connection_type: "net" as const,
  address: "192.168.1.50",
  port: 9100,
  paper_width: 80,
  role: "receipt" as const,
  profile: "escpos",
}

describe("PrinterService", () => {
  let repo: IPrinterRepository
  let service: ReturnType<typeof createPrintersService>

  beforeEach(() => {
    repo = mockPrinterRepository()
    service = createPrintersService(repo)
    vi.mocked(sendBytesViaTCP).mockResolvedValue({ success: true })
  })

  describe("list", () => {
    it("returns printers for the store", async () => {
      const result = await service.list("store-1")

      expect(repo.findByStore).toHaveBeenCalledWith("store-1")
      expect(result).toHaveLength(1)
    })
  })

  describe("getById", () => {
    it("throws NotFoundError when printer does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.getById("printer-x", "store-1")).rejects.toThrow(NotFoundError)
    })

    it("returns the mapped printer", async () => {
      const result = await service.getById("printer-1", "store-1")

      expect(result.name).toBe("Caja Principal")
    })
  })

  describe("create", () => {
    it("throws BadRequestError when name is empty", async () => {
      await expect(
        service.create({ ...printerDto, name: "  " }, "store-1")
      ).rejects.toThrow(BadRequestError)
      expect(repo.create).not.toHaveBeenCalled()
    })

    it("throws ConflictError when name already exists in the store", async () => {
      vi.mocked(repo.existsByName).mockResolvedValue(true)

      await expect(service.create(printerDto, "store-1")).rejects.toThrow(ConflictError)
    })

    it("creates without clearing roles when not default", async () => {
      const result = await service.create({ ...printerDto, is_default: false }, "store-1")

      expect(repo.create).toHaveBeenCalledWith(
        { ...printerDto, store_id: "store-1", is_default: false },
        undefined
      )
      expect(result.name).toBe("Caja Principal")
    })

    it("clears conflicting roles when created as default", async () => {
      await service.create({ ...printerDto, is_default: true }, "store-1")

      expect(repo.create).toHaveBeenCalledWith(
        { ...printerDto, store_id: "store-1", is_default: true },
        ["receipt"]
      )
    })
  })

  describe("update", () => {
    it("throws NotFoundError when printer does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.update("printer-x", "store-1", { name: "X" })).rejects.toThrow(
        NotFoundError
      )
    })

    it("throws ConflictError when renaming to an existing name", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ name: "Actual" }))
      vi.mocked(repo.existsByName).mockResolvedValue(true)

      await expect(
        service.update("printer-1", "store-1", { name: "Otro" })
      ).rejects.toThrow(ConflictError)
    })

    it("updates without clearing roles when not default", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ role: "kitchen" }))

      await service.update("printer-1", "store-1", { name: "Nuevo" })

      expect(repo.update).toHaveBeenCalledWith(
        "printer-1",
        "store-1",
        { name: "Nuevo" },
        undefined
      )
    })

    it("clears roles when updated to default with its role", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ role: "both" }))

      await service.update("printer-1", "store-1", { is_default: true })

      expect(repo.update).toHaveBeenCalledWith(
        "printer-1",
        "store-1",
        { is_default: true },
        ["receipt", "kitchen", "both"]
      )
    })
  })

  describe("delete", () => {
    it("throws NotFoundError when printer does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.delete("printer-x", "store-1")).rejects.toThrow(NotFoundError)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })

    it("throws ConflictError when it is the only active printer for its role", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ role: "kitchen" }))
      vi.mocked(repo.findByStore).mockResolvedValue([makePrinter({ role: "kitchen" })])

      await expect(service.delete("printer-1", "store-1")).rejects.toThrow(ConflictError)
    })

    it("throws ConflictError when it is the default printer", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ is_default: true, role: "kitchen" }))
      vi.mocked(repo.findByStore).mockResolvedValue([
        makePrinter({ id: "printer-1", is_default: true, role: "kitchen" }),
        makePrinter({ id: "printer-2", role: "kitchen" }),
      ])

      await expect(service.delete("printer-1", "store-1")).rejects.toThrow(ConflictError)
      expect(repo.softDelete).not.toHaveBeenCalled()
    })

    it("soft-deletes when another active printer exists and it is not default", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ role: "kitchen" }))
      vi.mocked(repo.findByStore).mockResolvedValue([
        makePrinter({ id: "printer-1", role: "kitchen" }),
        makePrinter({ id: "printer-2", role: "kitchen" }),
      ])

      await service.delete("printer-1", "store-1")

      expect(repo.softDelete).toHaveBeenCalledWith("printer-1", "store-1")
    })
  })

  describe("setAsDefault", () => {
    it("throws NotFoundError when printer does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.setAsDefault("printer-x", "store-1", "receipt")).rejects.toThrow(
        NotFoundError
      )
    })

    it("throws BadRequestError when roles do not match", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ role: "kitchen" }))

      await expect(service.setAsDefault("printer-1", "store-1", "receipt")).rejects.toThrow(
        BadRequestError
      )
      expect(repo.setDefault).not.toHaveBeenCalled()
    })

    it("clears conflicting roles for receipt", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ role: "receipt" }))

      await service.setAsDefault("printer-1", "store-1", "receipt")

      expect(repo.setDefault).toHaveBeenCalledWith("printer-1", "store-1", ["receipt", "both"])
    })

    it("clears all roles for both", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ role: "both" }))

      await service.setAsDefault("printer-1", "store-1", "both")

      expect(repo.setDefault).toHaveBeenCalledWith("printer-1", "store-1", ["receipt", "kitchen", "both"])
    })
  })

  describe("testPrint", () => {
    it("throws NotFoundError when printer does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(null)

      await expect(service.testPrint("printer-x", "store-1", 1)).rejects.toThrow(NotFoundError)
    })

    it("throws BadRequestError for non-net printers", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ connection_type: "usb" }))

      await expect(service.testPrint("printer-1", "store-1", 1)).rejects.toThrow(BadRequestError)
    })

    it("throws BadRequestError when address or port are missing", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ address: "", port: null }))

      await expect(service.testPrint("printer-1", "store-1", 1)).rejects.toThrow(BadRequestError)
    })

    it("renders the test ticket", async () => {
      const result = await service.testPrint("printer-1", "store-1", 2)

      expect(result.success).toBe(true)
      expect(result.ticket_bytes).toBeGreaterThan(0)
      expect(typeof result.ticket_base64).toBe("string")
    })
  })

  describe("probePrint", () => {
    it("throws BadRequestError for non-net printers", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter({ connection_type: "bluetooth" }))

      await expect(service.probePrint("printer-1", "store-1")).rejects.toThrow(BadRequestError)
    })

    it("renders the codepage probe", async () => {
      const result = await service.probePrint("printer-1", "store-1")

      expect(result.success).toBe(true)
      expect(result.indices_tested).toHaveLength(41)
      expect(result.ticket_bytes).toBeGreaterThan(0)
    })
  })

  describe("sendTcp", () => {
    it("forwards base64 bytes to the TCP transport", async () => {
      vi.mocked(sendBytesViaTCP).mockResolvedValue({ success: true })

      const encoded = Buffer.from("ticket-bytes").toString("base64")
      await service.sendTcp(encoded, "192.168.1.50", 9100)

      expect(sendBytesViaTCP).toHaveBeenCalledWith(
        "192.168.1.50",
        9100,
        Buffer.from("ticket-bytes")
      )
    })
  })

  describe("printReceipt", () => {
    it("throws NotFoundError when sale does not exist", async () => {
      vi.mocked(repo.findById).mockResolvedValue(makePrinter())
      vi.mocked(repo.findSaleWithItems).mockResolvedValue(null)

      await expect(service.printReceipt("printer-1", "store-1", "sale-x", 1)).rejects.toThrow(
        NotFoundError
      )
    })

    it("sends the ticket and marks the job as success", async () => {
      const result = await service.printReceipt("printer-1", "store-1", "sale-1", 1)

      expect(repo.createJob).toHaveBeenCalled()
      expect(repo.updateJobStatus).toHaveBeenCalledWith("job-1", "success")
      expect(repo.updateStatus).toHaveBeenCalledWith("printer-1", "store-1", "online")
      expect(result.success).toBe(true)
      expect(result.job_id).toBe("job-1")
    })

    it("marks the job as failed and the printer offline when TCP fails", async () => {
      vi.mocked(sendBytesViaTCP).mockResolvedValue({ success: false, error: "ECONNREFUSED" })

      const result = await service.printReceipt("printer-1", "store-1", "sale-1", 1)

      expect(repo.updateJobStatus).toHaveBeenCalledWith("job-1", "failed", "ECONNREFUSED")
      expect(repo.updateStatus).toHaveBeenCalledWith("printer-1", "store-1", "offline")
      expect(result.success).toBe(false)
    })
  })
})