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
  numeric
} from "drizzle-orm/pg-core";
import { store } from "./auth";

export const unitTypeEnum = pgEnum("UNIT_TYPE", [
  "unidad",
  "paquete",
  "caja",
  "frasco",
  "tubo",
  "sobre",
  "blister",
  "ampolleta",
  "gotero",
  "aerosol",
  "crema",
  "jarabe",
  "tableta",
  "capsula",
  "botella",
  "bolsa",
]);

export const category = pgTable("category", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
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
    uniqueIndex("uq_category_store_name").on(table.storeId, table.name),
    index("idx_category_name").on(table.name),
    index("idx_category_deleted_at").on(table.deletedAt),
    index("idx_category_store_id").on(table.storeId)
  ]
);

export const supplier = pgTable("supplier", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  ruc: text("ruc"),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
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
    index("idx_supplier_name").on(table.name),
    index("idx_supplier_is_active").on(table.isActive),
    index("idx_supplier_store_name").on(table.storeId, table.name),
    index("idx_supplier_store_deleted_at").on(table.storeId, table.deletedAt)
  ]
);

export const medicine = pgTable("medicine", {
  id: uuid("id").primaryKey(),
  barcode: text("barcode"),
  internalCode: text("internal_code"),
  commercialName: text("commercial_name").notNull(),
  genericName: text("generic_name"),
  activeIngredient: text("active_ingredient"),
  concentration: text("concentration"),
  presentation: text("presentation"),
  pharmaceuticalForm: text("pharmaceutical_form"),
  laboratory: text("laboratory"),
  categoryId: uuid("category_id").references(() => category.id),
  supplierId: uuid("supplier_id").references(() => supplier.id),
  unitType: unitTypeEnum("unit_type"),
  unitQuantity: integer("unit_quantity"),
  purchasePrice: numeric("purchase_price", { precision: 10, scale: 2 }).notNull().default("0"),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  requiresPrescription: boolean("requires_prescription").notNull().default(false),
  isControlled: boolean("is_controlled").notNull().default(false),
  image: text("image"),
  active: boolean("active").notNull().default(true),
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
    index("idx_medicine_barcode").on(table.barcode),
    index("idx_medicine_commercial_name").on(table.commercialName),
    index("idx_medicine_generic_name").on(table.genericName),
    index("idx_medicine_active_ingredient").on(table.activeIngredient),
    index("idx_medicine_category_id").on(table.categoryId),
    index("idx_medicine_supplier_id").on(table.supplierId),
    index("idx_medicine_requires_prescription").on(table.requiresPrescription),
    index("idx_medicine_is_controlled").on(table.isControlled),
    index("idx_medicine_active").on(table.active),
    index("idx_medicine_store_id").on(table.storeId),
    index("idx_medicine_store_deleted_at").on(table.storeId, table.deletedAt),
    index("idx_medicine_store_commercial_name").on(table.storeId, table.commercialName)
  ]
);
