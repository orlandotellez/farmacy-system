CREATE UNIQUE INDEX "uq_session_token" ON "session" ("token");--> statement-breakpoint
CREATE INDEX "idx_session_user_id" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "idx_verification_identifier_expires_at" ON "verification" ("identifier","expires_at");