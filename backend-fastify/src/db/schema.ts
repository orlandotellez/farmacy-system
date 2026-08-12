import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
  index,
  uniqueIndex
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
