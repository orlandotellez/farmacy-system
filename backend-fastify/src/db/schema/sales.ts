import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  numeric,
  index
} from "drizzle-orm/pg-core";
import { users, store } from "./auth";
import { client } from "./clients";
import { prescription } from "./prescriptions";
import { medicine } from "./catalog";
import { batch } from "./inventory";

export const sale = pgTable("sale", {
  id: uuid("id").primaryKey(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  amountReceived: numeric("amount_received", { precision: 10, scale: 2 }),
  changeGiven: numeric("change_given", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("completada"),
  cancellationReason: text("cancellation_reason"),
  cancelledAt: timestamp("cancelled_at", {
    withTimezone: true
  }),
  cancelledBy: text("cancelled_by"),
  userId: uuid("user_id").references(() => users.id).notNull(),
  userName: text("user_name"),
  clientId: uuid("client_id").references(() => client.id),
  prescriptionId: uuid("prescription_id").references(() => prescription.id),
  storeId: uuid("store_id").references(() => store.id).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull().defaultNow().$onUpdate(() => new Date())
},
  (table) => [
    index("idx_sale_user_id").on(table.userId),
    index("idx_sale_client_id").on(table.clientId),
    index("idx_sale_status").on(table.status),
    index("idx_sale_store_created_at").on(table.storeId, table.createdAt),
    index("idx_sale_store_payment_created_at").on(table.storeId, table.paymentMethod, table.createdAt),
    index("idx_sale_store_prescription_id").on(table.storeId, table.prescriptionId)
  ]
);

export const saleItem = pgTable("sale_item", {
  id: uuid("id").primaryKey(),
  saleId: uuid("sale_id").references(() => sale.id, { onDelete: "cascade" }).notNull(),
  medicineId: uuid("medicine_id").references(() => medicine.id).notNull(),
  medicineName: text("medicine_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
  batchId: uuid("batch_id").references(() => batch.id),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull().defaultNow().$onUpdate(() => new Date())
},
  (table) => [
    index("idx_sale_item_sale_id").on(table.saleId),
    index("idx_sale_item_medicine_id").on(table.medicineId),
    index("idx_sale_item_batch_id").on(table.batchId)
  ]
);
