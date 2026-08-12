import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  numeric,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { users, store } from "./auth";
import { supplier, medicine } from "./catalog";

export const purchase = pgTable("purchase", {
  id: uuid("id").primaryKey(),
  number: text("number").notNull(),
  status: text("status").notNull().default("borrador"),
  supplierId: uuid("supplier_id").references(() => supplier.id),
  expectedDate: timestamp("expected_date", {
    withTimezone: true
  }),
  notes: text("notes"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", {
    withTimezone: true
  }),
  receivedBy: text("received_by"),
  receivedAt: timestamp("received_at", {
    withTimezone: true
  }),
  userId: uuid("user_id").references(() => users.id).notNull(),
  storeId: uuid("store_id").references(() => store.id).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull().defaultNow().$onUpdate(() => new Date())
},
  (table) => [
    uniqueIndex("uq_purchase_store_number").on(table.storeId, table.number),
    index("idx_purchase_status").on(table.status),
    index("idx_purchase_supplier_id").on(table.supplierId),
    index("idx_purchase_store_created_at").on(table.storeId, table.createdAt),
    index("idx_purchase_store_status").on(table.storeId, table.status)
  ]
);

export const purchaseItem = pgTable("purchase_item", {
  id: uuid("id").primaryKey(),
  purchaseId: uuid("purchase_id").references(() => purchase.id, { onDelete: "cascade" }).notNull(),
  medicineId: uuid("medicine_id").references(() => medicine.id).notNull(),
  medicineName: text("medicine_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
  received: integer("received").notNull().default(0),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow()
},
  (table) => [
    index("idx_purchase_item_purchase_id").on(table.purchaseId),
    index("idx_purchase_item_medicine_id").on(table.medicineId)
  ]
);
