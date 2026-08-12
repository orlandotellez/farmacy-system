import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { store } from "./auth";
import { sale } from "./sales";
import { client } from "./clients";

export const invoice = pgTable("invoice", {
  id: uuid("id").primaryKey(),
  number: text("number").notNull(),
  invoiceType: text("invoice_type").notNull().default("ticket"),
  saleId: uuid("sale_id").references(() => sale.id).notNull(),
  clientId: uuid("client_id").references(() => client.id),
  clientName: text("client_name"),
  clientDocument: text("client_document"),
  clientAddress: text("client_address"),
  clientPhone: text("client_phone"),
  clientEmail: text("client_email"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("emitida"),
  cancelledAt: timestamp("cancelled_at", {
    withTimezone: true
  }),
  cancelledBy: text("cancelled_by"),
  issuedBy: text("issued_by"),
  storeId: uuid("store_id").references(() => store.id).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull().defaultNow().$onUpdate(() => new Date())
},
  (table) => [
    uniqueIndex("uq_invoice_store_number").on(table.storeId, table.number),
    index("idx_invoice_sale_id").on(table.saleId),
    index("idx_invoice_client_id").on(table.clientId),
    index("idx_invoice_invoice_type").on(table.invoiceType),
    index("idx_invoice_store_created_at").on(table.storeId, table.createdAt)
  ]
);
