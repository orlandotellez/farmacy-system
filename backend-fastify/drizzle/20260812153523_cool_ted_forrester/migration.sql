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
CREATE INDEX "idx_batch_medicine_id" ON "batch" ("medicine_id");--> statement-breakpoint
CREATE INDEX "idx_batch_expiry_date" ON "batch" ("expiry_date");--> statement-breakpoint
CREATE INDEX "idx_batch_store_expiry_date" ON "batch" ("store_id","expiry_date");--> statement-breakpoint
CREATE INDEX "idx_batch_store_created_at" ON "batch" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_medicine_id" ON "inventory_movement" ("medicine_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_batch_id" ON "inventory_movement" ("batch_id");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_store_created_at" ON "inventory_movement" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_inventory_movement_store_movement_type" ON "inventory_movement" ("store_id","movement_type");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_purchase_store_number" ON "purchase" ("store_id","number");--> statement-breakpoint
CREATE INDEX "idx_purchase_status" ON "purchase" ("status");--> statement-breakpoint
CREATE INDEX "idx_purchase_supplier_id" ON "purchase" ("supplier_id");--> statement-breakpoint
CREATE INDEX "idx_purchase_store_created_at" ON "purchase" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_purchase_store_status" ON "purchase" ("store_id","status");--> statement-breakpoint
CREATE INDEX "idx_purchase_item_purchase_id" ON "purchase_item" ("purchase_id");--> statement-breakpoint
CREATE INDEX "idx_purchase_item_medicine_id" ON "purchase_item" ("medicine_id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_purchase_id_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchase"("id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_supplier_id_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "batch" ADD CONSTRAINT "batch_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");--> statement-breakpoint
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_batch_id_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id");--> statement-breakpoint
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_supplier_id_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "supplier"("id");--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "purchase_item" ADD CONSTRAINT "purchase_item_purchase_id_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchase"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "purchase_item" ADD CONSTRAINT "purchase_item_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");