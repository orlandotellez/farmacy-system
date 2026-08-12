import type { FastifyReply, FastifyRequest } from "fastify"
import { createReportService } from "../application/reports.service"
import { ReportRepository } from "../infrastructure/reports.drizzle.repository"
import { FinancialReportQuerySchema } from "./reports.dto"

const service = createReportService(ReportRepository)

export const reportsController = {
  dashboard: async (request: FastifyRequest, reply: FastifyReply) =>
    reply.send(await service.dashboard(request.storeId!)),

  financial: async (request: FastifyRequest, reply: FastifyReply) => {
    const query = FinancialReportQuerySchema.parse(request.query)
    return reply.send(await service.financial({ ...query, storeId: request.storeId! }))
  },
}
