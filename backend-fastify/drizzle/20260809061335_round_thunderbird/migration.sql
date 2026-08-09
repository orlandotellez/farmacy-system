CREATE INDEX "idx_store_name" ON "store" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_users_store_email" ON "users" ("store_id","email");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" ("role");--> statement-breakpoint
CREATE INDEX "idx_users_store_id" ON "users" ("store_id");--> statement-breakpoint
CREATE INDEX "idx_users_store_id_deleted_at" ON "users" ("store_id","deleted_at");