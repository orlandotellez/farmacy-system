CREATE TABLE "invoice" (
	"id" uuid PRIMARY KEY,
	"number" text NOT NULL,
	"invoice_type" text DEFAULT 'ticket' NOT NULL,
	"sale_id" uuid NOT NULL,
	"client_id" uuid,
	"client_name" text,
	"client_document" text,
	"client_address" text,
	"client_phone" text,
	"client_email" text,
	"subtotal" numeric(10,2) NOT NULL,
	"total" numeric(10,2) NOT NULL,
	"status" text DEFAULT 'emitida' NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" text,
	"issued_by" text,
	"store_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uq_invoice_store_number" ON "invoice" ("store_id","number");--> statement-breakpoint
CREATE INDEX "idx_invoice_sale_id" ON "invoice" ("sale_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_client_id" ON "invoice" ("client_id");--> statement-breakpoint
CREATE INDEX "idx_invoice_invoice_type" ON "invoice" ("invoice_type");--> statement-breakpoint
CREATE INDEX "idx_invoice_store_created_at" ON "invoice" ("store_id","created_at");--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_sale_id_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id");--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_client_id_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id");--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");