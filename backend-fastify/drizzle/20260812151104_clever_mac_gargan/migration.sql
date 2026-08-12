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
CREATE INDEX "idx_client_full_name" ON "client" ("full_name");--> statement-breakpoint
CREATE INDEX "idx_client_document_number" ON "client" ("document_number");--> statement-breakpoint
CREATE INDEX "idx_client_phone" ON "client" ("phone");--> statement-breakpoint
CREATE INDEX "idx_client_store_id" ON "client" ("store_id");--> statement-breakpoint
CREATE INDEX "idx_client_store_deleted_at" ON "client" ("store_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_client_store_full_name" ON "client" ("store_id","full_name");--> statement-breakpoint
CREATE INDEX "idx_client_store_is_frequent" ON "client" ("store_id","is_frequent");--> statement-breakpoint
ALTER TABLE "client" ADD CONSTRAINT "client_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");