import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
  integer,
  bytea
} from "drizzle-orm/pg-core";
import { store } from "./auth";
import { sale } from "./sales";
import { category } from "./catalog";

export const printerConnTypeEnum = pgEnum("PRINTER_CONN_TYPE", [
  "net",
  "usb",
  "bluetooth",
]);

export const printerProfileEnum = pgEnum("PRINTER_PROFILE", [
  "escpos",
  "star_line",
]);

export const printerStatusEnum = pgEnum("PRINTER_STATUS", [
  "unknown",
  "online",
  "offline",
  "error",
  "out_of_paper",
]);

export const printer = pgTable("printer", {
  id: uuid("id").primaryKey(),
  storeId: uuid("store_id").references(() => store.id).notNull(),
  name: text("name").notNull(),
  connectionType: printerConnTypeEnum("connection_type").notNull(),
  address: text("address").notNull(),
  port: integer("port"),
  paperWidth: integer("paper_width").notNull(),
  profile: printerProfileEnum("profile").notNull().default("escpos"),
  codepage: text("codepage").notNull().default("PC850"),
  autoCut: boolean("auto_cut").notNull().default(true),
  cutType: text("cut_type"),
  openCashDrawer: boolean("open_cash_drawer").notNull().default(false),
  defaultCopies: integer("default_copies").notNull().default(1),
  role: text("role").notNull().default("receipt"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  lastStatus: printerStatusEnum("last_status").notNull().default("unknown"),
  lastSeenAt: timestamp("last_seen_at", {
    withTimezone: true
  }),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", {
    withTimezone: true
  })
},
  (table) => [
    uniqueIndex("uq_printer_store_name").on(table.storeId, table.name),
    index("idx_printer_store_is_active").on(table.storeId, table.isActive),
    index("idx_printer_store_is_default").on(table.storeId, table.isDefault)
  ]
);

export const printerAssignment = pgTable("printer_assignment", {
  id: uuid("id").primaryKey(),
  printerId: uuid("printer_id").references(() => printer.id, { onDelete: "cascade" }).notNull(),
  categoryId: uuid("category_id").references(() => category.id),
  role: text("role").notNull().default("receipt"),
  priority: integer("priority").notNull().default(0)
},
  (table) => [
    uniqueIndex("uq_printer_assignment_printer_category").on(table.printerId, table.categoryId),
    index("idx_printer_assignment_printer_id").on(table.printerId),
    index("idx_printer_assignment_category_id").on(table.categoryId)
  ]
);

export const printJob = pgTable("print_job", {
  id: uuid("id").primaryKey(),
  printerId: uuid("printer_id").references(() => printer.id, { onDelete: "cascade" }).notNull(),
  saleId: uuid("sale_id").references(() => sale.id),
  payload: bytea("payload").notNull(),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(3),
  errorMsg: text("error_msg"),
  enqueuedAt: timestamp("enqueued_at", {
    withTimezone: true
  }).notNull().defaultNow(),
  sentAt: timestamp("sent_at", {
    withTimezone: true
  }),
  finishedAt: timestamp("finished_at", {
    withTimezone: true
  })
},
  (table) => [
    index("idx_print_job_printer_status").on(table.printerId, table.status),
    index("idx_print_job_status_enqueued_at").on(table.status, table.enqueuedAt),
    index("idx_print_job_sale_id").on(table.saleId)
  ]
);
