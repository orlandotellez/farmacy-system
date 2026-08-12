import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { store } from "./auth";
import { client } from "./clients";
import { medicine } from "./catalog";

export const prescription = pgTable("prescription", {
  id: uuid("id").primaryKey(),
  number: text("number").notNull(),
  doctorName: text("doctor_name"),
  medicalCenter: text("medical_center"),
  issueDate: timestamp("issue_date", {
    withTimezone: true
  }),
  expiryDate: timestamp("expiry_date", {
    withTimezone: true
  }),
  image: text("image"),
  notes: text("notes"),
  status: text("status").notNull().default("pendiente"),
  validatedBy: text("validated_by"),
  validatedAt: timestamp("validated_at", {
    withTimezone: true
  }),
  clientId: uuid("client_id").references(() => client.id, { onDelete: "set null" }),
  storeId: uuid("store_id").references(() => store.id).notNull(),
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
    uniqueIndex("uq_prescription_store_number").on(table.storeId, table.number),
    index("idx_prescription_status").on(table.status),
    index("idx_prescription_client_id").on(table.clientId),
    index("idx_prescription_store_created_at").on(table.storeId, table.createdAt),
    index("idx_prescription_store_status").on(table.storeId, table.status),
    index("idx_prescription_store_expiry_date").on(table.storeId, table.expiryDate)
  ]
);

export const prescriptionItem = pgTable("prescription_item", {
  id: uuid("id").primaryKey(),
  prescriptionId: uuid("prescription_id").references(() => prescription.id, { onDelete: "cascade" }).notNull(),
  medicineId: uuid("medicine_id").references(() => medicine.id).notNull(),
  medicineName: text("medicine_name").notNull(),
  quantity: integer("quantity").notNull(),
  authorizedQuantity: integer("authorized_quantity").notNull().default(0),
  authorizedBy: text("authorized_by"),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow()
},
  (table) => [
    index("idx_prescription_item_prescription_id").on(table.prescriptionId),
    index("idx_prescription_item_medicine_id").on(table.medicineId)
  ]
);
