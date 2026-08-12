import { z } from "zod"

const validDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date")

export const FinancialReportQuerySchema = z.object({
  from: validDate.optional(),
  to: validDate.optional(),
}).superRefine((value, ctx) => {
  if (value.from && value.to && new Date(value.from) > new Date(value.to)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["to"], message: "End date must be after or equal to start date" })
  }
})
