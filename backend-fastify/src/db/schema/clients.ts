import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  index
} from "drizzle-orm/pg-core";
import { store } from "./auth";

export const client = pgTable("client", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name").notNull(),
  documentType: text("document_type").notNull().default("cedula"),
  documentNumber: text("document_number"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  birthDate: timestamp("birth_date", {
    withTimezone: true
  }),
  sex: text("sex"),
  allergies: text("allergies"),
  chronicDiseases: text("chronic_diseases"),
  observations: text("observations"),
  isFrequent: boolean("is_frequent").notNull().default(false),
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
    index("idx_client_full_name").on(table.fullName),
    index("idx_client_document_number").on(table.documentNumber),
    index("idx_client_phone").on(table.phone),
    index("idx_client_store_id").on(table.storeId),
    index("idx_client_store_deleted_at").on(table.storeId, table.deletedAt),
    index("idx_client_store_full_name").on(table.storeId, table.fullName),
    index("idx_client_store_is_frequent").on(table.storeId, table.isFrequent)
  ]
);
