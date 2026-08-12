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

export const userRoleEnum = pgEnum("ROLE", [
  "admin",
  "farmaceutico",
  "cajero",
  "bodeguero",
]);

export const store = pgTable("store", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  ruc: text("ruc"),
  email: text("email"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).notNull().defaultNow().$onUpdate(() => new Date()),
},
  (table) => [
    index("idx_store_name").on(table.name)
  ]
);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  phone: text("phone"),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("cajero"),
  storeId: uuid("store_id").references(() => store.id).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull().defaultNow().$onUpdate(() => new Date()),
  deletedAt: timestamp("deleted_at", {
    withTimezone: true
  })
},
  (table) => [
    uniqueIndex("uq_users_store_email").on(
      table.storeId,
      table.email
    ),
    index("idx_users_email").on(table.email),
    index("idx_users_role").on(table.role),
    index("idx_users_store_id").on(table.storeId),
    index("idx_users_store_id_deleted_at").on(table.storeId, table.deletedAt)
  ]
);

export const session = pgTable("session", {
  id: uuid("id").primaryKey(),
  expiresAt: timestamp("expires_at"),
  token: text("token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: uuid("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull().defaultNow().$onUpdate(() => new Date())
},
  (table) => [
    uniqueIndex("uq_session_token").on(table.token),
    index("idx_session_user_id").on(table.userId)
  ]
)

export const account = pgTable("account", {
  id: uuid("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id").references(() => users.id),
  accessToken: text("acess_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true
  }),
  refreshTokenExpiresAt: timestamp("refres_token_expirest_at", {
    withTimezone: true
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull().defaultNow().$onUpdate(() => new Date())
})


export const verificacion = pgTable("verification", {
  id: uuid("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true
  }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true
  }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).notNull().defaultNow().$onUpdate(() => new Date())
},
  (table) => [
    index("idx_verification_identifier_expires_at").on(table.identifier, table.expiresAt)
  ]
)

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
