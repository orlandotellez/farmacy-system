CREATE TYPE "ROLE" AS ENUM('admin', 'farmaceutico', 'cajero', 'bodeguero');--> statement-breakpoint
CREATE TYPE "UNIT_TYPE" AS ENUM('unidad', 'paquete', 'caja', 'frasco', 'tubo', 'sobre', 'blister', 'ampolleta', 'gotero', 'aerosol', 'crema', 'jarabe', 'tableta', 'capsula', 'botella', 'bolsa');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid,
	"acess_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refres_token_expirest_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY,
	"expires_at" timestamp,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"address" text,
	"phone" text,
	"ruc" text,
	"email" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone" text,
	"image" text,
	"role" "ROLE" DEFAULT 'cajero'::"ROLE" NOT NULL,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "medicine" (
	"id" uuid PRIMARY KEY,
	"barcode" text,
	"internal_code" text,
	"commercial_name" text NOT NULL,
	"generic_name" text,
	"active_ingredient" text,
	"concentration" text,
	"presentation" text,
	"pharmaceutical_form" text,
	"laboratory" text,
	"category_id" uuid,
	"supplier_id" uuid,
	"unit_type" "UNIT_TYPE",
	"unit_quantity" integer,
	"purchase_price" numeric(10,2) DEFAULT '0' NOT NULL,
	"sale_price" numeric(10,2) NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 5 NOT NULL,
	"requires_prescription" boolean DEFAULT false NOT NULL,
	"is_controlled" boolean DEFAULT false NOT NULL,
	"image" text,
	"active" boolean DEFAULT true NOT NULL,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "supplier" (
	"id" uuid PRIMARY KEY,
	"name" text NOT NULL,
	"company" text,
	"ruc" text,
	"contact_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"notes" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "client" (
	"id" uuid PRIMARY KEY,
	"full_name" text NOT NULL,
	"document_type" text DEFAULT 'cedula' NOT NULL,
	"document_number" text,
	"phone" text,
	"email" text,
	"address" text,
	"birth_date" timestamp with time zone,
	"sex" text,
	"allergies" text,
	"chronic_diseases" text,
	"observations" text,
	"is_frequent" boolean DEFAULT false NOT NULL,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prescription" (
	"id" uuid PRIMARY KEY,
	"number" text NOT NULL,
	"doctor_name" text,
	"medical_center" text,
	"issue_date" timestamp with time zone,
	"expiry_date" timestamp with time zone,
	"image" text,
	"notes" text,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"validated_by" text,
	"validated_at" timestamp with time zone,
	"client_id" uuid,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prescription_item" (
	"id" uuid PRIMARY KEY,
	"prescription_id" uuid NOT NULL,
	"medicine_id" uuid NOT NULL,
	"medicine_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"authorized_quantity" integer DEFAULT 0 NOT NULL,
	"authorized_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase" (
	"id" uuid PRIMARY KEY,
	"number" text NOT NULL,
	"status" text DEFAULT 'borrador' NOT NULL,
	"supplier_id" uuid,
	"expected_date" timestamp with time zone,
	"notes" text,
	"total" numeric(10,2) DEFAULT '0' NOT NULL,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"received_by" text,
	"received_at" timestamp with time zone,
	"user_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_item" (
	"id" uuid PRIMARY KEY,
	"purchase_id" uuid NOT NULL,
	"medicine_id" uuid NOT NULL,
	"medicine_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_cost" numeric(10,2) NOT NULL,
	"line_total" numeric(10,2) NOT NULL,
	"received" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "batch" (
	"id" uuid PRIMARY KEY,
	"batch_number" text NOT NULL,
	"medicine_id" uuid NOT NULL,
	"purchase_id" uuid,
	"supplier_id" uuid,
	"manufacture_date" timestamp with time zone,
	"expiry_date" timestamp with time zone NOT NULL,
	"initial_quantity" integer DEFAULT 0 NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"unit_cost" numeric(10,2),
	"notes" text,
	"user_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_movement" (
	"id" uuid PRIMARY KEY,
	"medicine_id" uuid NOT NULL,
	"movement_type" text NOT NULL,
	"quantity" integer NOT NULL,
	"note" text,
	"batch_id" uuid,
	"user_id" uuid NOT NULL,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale" (
	"id" uuid PRIMARY KEY,
	"subtotal" numeric(10,2) NOT NULL,
	"total" numeric(10,2) NOT NULL,
	"payment_method" text NOT NULL,
	"amount_received" numeric(10,2),
	"change_given" numeric(10,2),
	"status" text DEFAULT 'completada' NOT NULL,
	"cancellation_reason" text,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" text,
	"user_id" uuid NOT NULL,
	"user_name" text,
	"client_id" uuid,
	"prescription_id" uuid,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_item" (
	"id" uuid PRIMARY KEY,
	"sale_id" uuid NOT NULL,
	"medicine_id" uuid NOT NULL,
	"medicine_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10,2) NOT NULL,
	"line_total" numeric(10,2) NOT NULL,
	"batch_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_session_token" ON "session" ("token");--> statement-breakpoint
CREATE INDEX "idx_session_user_id" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_store_name" ON "store" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_users_store_email" ON "users" ("store_id","email");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" ("role");--> statement-breakpoint
CREATE INDEX "idx_users_store_id" ON "users" ("store_id");--> statement-breakpoint
CREATE INDEX "idx_users_store_id_deleted_at" ON "users" ("store_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_verification_identifier_expires_at" ON "verification" ("identifier","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_category_store_name" ON "category" ("store_id","name");--> statement-breakpoint
CREATE INDEX "idx_category_name" ON "category" ("name");--> statement-breakpoint
CREATE INDEX "idx_category_deleted_at" ON "category" ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_category_store_id" ON "category" ("store_id");--> statement-breakpoint
CREATE INDEX "idx_medicine_barcode" ON "medicine" ("barcode");--> statement-breakpoint
CREATE INDEX "idx_medicine_commercial_name" ON "medicine" ("commercial_name");--> statement-breakpoint
CREATE INDEX "idx_medicine_generic_name" ON "medicine" ("generic_name");--> statement-breakpoint
CREATE INDEX "idx_medicine_active_ingredient" ON "medicine" ("active_ingredient");--> statement-breakpoint
CREATE INDEX "idx_medicine_category_id" ON "medicine" ("category_id");--> statement-breakpoint
CREATE INDEX "idx_medicine_supplier_id" ON "medicine" ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_medicine_requires_prescription" ON "medicine" ("requires_prescription");--> statement-breakpoint
CREATE INDEX "idx_medicine_is_controlled" ON "medicine" ("is_controlled");--> statement-breakpoint
CREATE INDEX "idx_medicine_active" ON "medicine" ("active");--> statement-breakpoint
CREATE INDEX "idx_medicine_store_id" ON "medicine" ("store_id");--> statement-breakpoint
CREATE INDEX "idx_medicine_store_deleted_at" ON "medicine" ("store_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_medicine_store_commercial_name" ON "medicine" ("store_id","commercial_name");--> statement-breakpoint
CREATE INDEX "idx_supplier_name" ON "supplier" ("name");--> statement-breakpoint
CREATE INDEX "idx_supplier_is_active" ON "supplier" ("is_active");--> statement-breakpoint
CREATE INDEX "idx_supplier_store_name" ON "supplier" ("store_id","name");--> statement-breakpoint
CREATE INDEX "idx_supplier_store_deleted_at" ON "supplier" ("store_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_client_full_name" ON "client" ("full_name");--> statement-breakpoint
CREATE INDEX "idx_client_document_number" ON "client" ("document_number");--> statement-breakpoint
CREATE INDEX "idx_client_phone" ON "client" ("phone");--> statement-breakpoint
CREATE INDEX "idx_client_store_id" ON "client" ("store_id");--> statement-breakpoint
CREATE INDEX "idx_client_store_deleted_at" ON "client" ("store_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_client_store_full_name" ON "client" ("store_id","full_name");--> statement-breakpoint
CREATE INDEX "idx_client_store_is_frequent" ON "client" ("store_id","is_frequent");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_prescription_store_number" ON "prescription" ("store_id","number");--> statement-breakpoint
CREATE INDEX "idx_prescription_status" ON "prescription" ("status");--> statement-breakpoint
CREATE INDEX "idx_prescription_client_id" ON "prescription" ("client_id");--> statement-breakpoint
CREATE INDEX "idx_prescription_store_created_at" ON "prescription" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_prescription_store_status" ON "prescription" ("store_id","status");--> statement-breakpoint
CREATE INDEX "idx_prescription_store_expiry_date" ON "prescription" ("store_id","expiry_date");--> statement-breakpoint
CREATE INDEX "idx_prescription_item_prescription_id" ON "prescription_item" ("prescription_id");--> statement-breakpoint
CREATE INDEX "idx_prescription_item_medicine_id" ON "prescription_item" ("medicine_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_purchase_store_number" ON "purchase" ("store_id","number");--> statement-breakpoint
CREATE INDEX "idx_purchase_status" ON "purchase" ("status");--> statement-breakpoint
CREATE INDEX "idx_purchase_supplier_id" ON "purchase" ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_purchase_store_created_at" ON "purchase" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_purchase_store_status" ON "purchase" ("store_id","status");--> statement-breakpoint
CREATE INDEX "idx_purchase_item_purchase_id" ON "purchase_item" ("purchase_id");--> statement-breakpoint
CREATE INDEX "idx_purchase_item_medicine_id" ON "purchase_item" ("medicine_id");--> statement-breakpoint
CREATE INDEX "idx_batch_medicine_id" ON "batch" ("medicine_id");--> statement-breakpoint
CREATE INDEX "idx_batch_expiry_date" ON "batch" ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_batch_store_expiry_date" ON "batch" ("store_id","expiry_date");--> statement-breakpoint
CREATE INDEX "idx_batch_store_created_at" ON "batch" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_medicine_id" ON "inventory_movement" ("medicine_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_batch_id" ON "inventory_movement" ("batch_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_store_created_at" ON "inventory_movement" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_store_movement_type" ON "inventory_movement" ("store_id","movement_type");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_store_medicine_created_at" ON "inventory_movement" ("store_id","medicine_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_sale_user_id" ON "sale" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sale_client_id" ON "sale" ("client_id");--> statement-breakpoint
CREATE INDEX "idx_sale_status" ON "sale" ("status");--> statement-breakpoint
CREATE INDEX "idx_sale_store_created_at" ON "sale" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_sale_store_payment_created_at" ON "sale" ("store_id","payment_method","created_at");--> statement-breakpoint
CREATE INDEX "idx_sale_store_prescription_id" ON "sale" ("store_id","prescription_id");--> statement-breakpoint
CREATE INDEX "idx_sale_item_sale_id" ON "sale_item" ("sale_id");--> statement-breakpoint
CREATE INDEX "idx_sale_item_medicine_id" ON "sale_item" ("medicine_id");--> statement-breakpoint
CREATE INDEX "idx_sale_item_batch_id" ON "sale_item" ("batch_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_category_id_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id");--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_supplier_id_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id");--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_client_id_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_prescription_id_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescription"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_supplier_id_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id");--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "purchase_item" ADD CONSTRAINT "purchase_item_purchase_id_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchase"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "purchase_item" ADD CONSTRAINT "purchase_item_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_purchase_id_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchase"("id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_supplier_id_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");--> statement-breakpoint
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_batch_id_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id");--> statement-breakpoint
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_client_id_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_prescription_id_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescription"("id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_sale_id_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_batch_id_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id");