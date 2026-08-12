CREATE TYPE "UNIT_TYPE" AS ENUM('unidad', 'paquete', 'caja', 'frasco', 'tubo', 'sobre', 'blister', 'ampolleta', 'gotero', 'aerosol', 'crema', 'jarabe', 'tableta', 'capsula', 'botella', 'bolsa');--> statement-breakpoint
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
ALTER TABLE "category" ADD CONSTRAINT "category_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_category_id_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id");--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_supplier_id_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id");--> statement-breakpoint
ALTER TABLE "medicine" ADD CONSTRAINT "medicine_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");