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
CREATE INDEX "idx_sale_user_id" ON "sale" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sale_client_id" ON "sale" ("client_id");--> statement-breakpoint
CREATE INDEX "idx_sale_status" ON "sale" ("status");--> statement-breakpoint
CREATE INDEX "idx_sale_store_created_at" ON "sale" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_sale_store_payment_created_at" ON "sale" ("store_id","payment_method","created_at");--> statement-breakpoint
CREATE INDEX "idx_sale_store_prescription_id" ON "sale" ("store_id","prescription_id");--> statement-breakpoint
CREATE INDEX "idx_sale_item_sale_id" ON "sale_item" ("sale_id");--> statement-breakpoint
CREATE INDEX "idx_sale_item_medicine_id" ON "sale_item" ("medicine_id");--> statement-breakpoint
CREATE INDEX "idx_sale_item_batch_id" ON "sale_item" ("batch_id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_client_id_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_prescription_id_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescription"("id");--> statement-breakpoint
ALTER TABLE "sale" ADD CONSTRAINT "sale_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_sale_id_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");--> statement-breakpoint
ALTER TABLE "sale_item" ADD CONSTRAINT "sale_item_batch_id_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("id");