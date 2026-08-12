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
import { medicine, supplier } from "./catalog";
import { purchase } from "./purchases";

export const batch = pgTable("batch", {
  id: uuid("id").primaryKey(),
  batchNumber: text("batch_number").notNull(),
  medicineId: uuid("medicine_id").references(() => medicine.id).notNull(),
  purchaseId: uuid("purchase_id").references(() => purchase.id),
  supplierId: uuid("supplier_id").references(() => supplier.id),
  manufactureDate: timestamp("manufacture_date", {
    withTimezone: true
  }),
  expiryDate: timestamp("expiry_date", {
    withTimezone: true
  }).notNull(),
  initialQuantity: integer("initial_quantity").notNull().default(0),
  quantity: integer("quantity").notNull().default(0),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
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
    index("idx_batch_medicine_id").on(table.medicineId),
    index("idx_batch_expiry_date").on(table.expiryDate),
    index("idx_batch_store_expiry_date").on(table.storeId, table.expiryDate),
    index("idx_batch_store_created_at").on(table.storeId, table.createdAt)
  ]
);

export const inventoryMovement = pgTable("inventory_movement", {
  id: uuid("id").primaryKey(),
  medicineId: uuid("medicine_id").references(() => medicine.id).notNull(),
  movementType: text("movement_type").notNull(),
  quantity: integer("quantity").notNull(),
  note: text("note"),
  batchId: uuid("batch_id").references(() => batch.id),
  userId: uuid("user_id").references(() => users.id).notNull(),
  storeId: uuid("store_id").references(() => store.id).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow()
},
  (table) => [
    index("idx_inventory_movement_medicine_id").on(table.medicineId),
    index("idx_inventory_movement_batch_id").on(table.batchId),
    index("idx_inventory_movement_store_created_at").on(table.storeId, table.createdAt),
    index("idx_inventory_movement_store_movement_type").on(table.storeId, table.movementType),
    index("idx_inventory_movement_store_medicine_created_at").on(table.storeId, table.medicineId, table.createdAt)
  ]
);
