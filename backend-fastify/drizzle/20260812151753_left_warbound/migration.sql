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
CREATE UNIQUE INDEX "uq_prescription_store_number" ON "prescription" ("store_id","number");--> statement-breakpoint
CREATE INDEX "idx_prescription_status" ON "prescription" ("status");--> statement-breakpoint
CREATE INDEX "idx_prescription_client_id" ON "prescription" ("client_id");--> statement-breakpoint
CREATE INDEX "idx_prescription_store_created_at" ON "prescription" ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_prescription_store_status" ON "prescription" ("store_id","status");--> statement-breakpoint
CREATE INDEX "idx_prescription_store_expiry_date" ON "prescription" ("store_id","expiry_date");--> statement-breakpoint
CREATE INDEX "idx_prescription_item_prescription_id" ON "prescription_item" ("prescription_id");--> statement-breakpoint
CREATE INDEX "idx_prescription_item_medicine_id" ON "prescription_item" ("medicine_id");--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_client_id_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_prescription_id_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescription"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "prescription_item" ADD CONSTRAINT "prescription_item_medicine_id_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicine"("id");