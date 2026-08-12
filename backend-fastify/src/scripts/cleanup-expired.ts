import "dotenv/config";
import { lt } from "drizzle-orm";
import { db } from "@/index";
import { session, verificacion } from "@/db/schema";

async function cleanupExpired() {
  const now = new Date();

  const expiredSessions = await db
    .delete(session)
    .where(lt(session.expiresAt, now))
    .returning({ id: session.id });

  const expiredVerifications = await db
    .delete(verificacion)
    .where(lt(verificacion.expiresAt, now))
    .returning({ id: verificacion.id });

  console.log(`Sesiones expiradas eliminadas: ${expiredSessions.length}`);
  console.log(`Verificaciones expiradas eliminadas: ${expiredVerifications.length}`);
}

cleanupExpired()
  .catch((error) => {
    console.error("Cleanup fallido:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$client.end();
  });
