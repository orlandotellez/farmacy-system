CREATE TYPE "PRINTER_CONN_TYPE" AS ENUM('net', 'usb', 'bluetooth');--> statement-breakpoint
CREATE TYPE "PRINTER_PROFILE" AS ENUM('escpos', 'star_line');--> statement-breakpoint
CREATE TYPE "PRINTER_STATUS" AS ENUM('unknown', 'online', 'offline', 'error', 'out_of_paper');--> statement-breakpoint
CREATE TABLE "print_job" (
	"id" uuid PRIMARY KEY,
	"printer_id" uuid NOT NULL,
	"sale_id" uuid,
	"payload" bytea NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"error_msg" text,
	"enqueued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "printer" (
	"id" uuid PRIMARY KEY,
	"store_id" uuid NOT NULL,
	"name" text NOT NULL,
	"connection_type" "PRINTER_CONN_TYPE" NOT NULL,
	"address" text NOT NULL,
	"port" integer,
	"paper_width" integer NOT NULL,
	"profile" "PRINTER_PROFILE" DEFAULT 'escpos'::"PRINTER_PROFILE" NOT NULL,
	"codepage" text DEFAULT 'PC850' NOT NULL,
	"auto_cut" boolean DEFAULT true NOT NULL,
	"cut_type" text,
	"open_cash_drawer" boolean DEFAULT false NOT NULL,
	"default_copies" integer DEFAULT 1 NOT NULL,
	"role" text DEFAULT 'receipt' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_status" "PRINTER_STATUS" DEFAULT 'unknown'::"PRINTER_STATUS" NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "printer_assignment" (
	"id" uuid PRIMARY KEY,
	"printer_id" uuid NOT NULL,
	"category_id" uuid,
	"role" text DEFAULT 'receipt' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_print_job_printer_status" ON "print_job" ("printer_id","status");--> statement-breakpoint
CREATE INDEX "idx_print_job_status_enqueued_at" ON "print_job" ("status","enqueued_at");--> statement-breakpoint
CREATE INDEX "idx_print_job_sale_id" ON "print_job" ("sale_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_printer_store_name" ON "printer" ("store_id","name");--> statement-breakpoint
CREATE INDEX "idx_printer_store_is_active" ON "printer" ("store_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_printer_store_is_default" ON "printer" ("store_id","is_default");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_printer_assignment_printer_category" ON "printer_assignment" ("printer_id","category_id");--> statement-breakpoint
CREATE INDEX "idx_printer_assignment_printer_id" ON "printer_assignment" ("printer_id");--> statement-breakpoint
CREATE INDEX "idx_printer_assignment_category_id" ON "printer_assignment" ("category_id");--> statement-breakpoint
ALTER TABLE "print_job" ADD CONSTRAINT "print_job_printer_id_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printer"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "print_job" ADD CONSTRAINT "print_job_sale_id_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sale"("id");--> statement-breakpoint
ALTER TABLE "printer" ADD CONSTRAINT "printer_store_id_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("id");--> statement-breakpoint
ALTER TABLE "printer_assignment" ADD CONSTRAINT "printer_assignment_printer_id_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printer"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "printer_assignment" ADD CONSTRAINT "printer_assignment_category_id_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id");