import "dotenv/config";
import { db } from "../src/lib/db";
import { deleteR2Images, r2KeyFromPublicUrl } from "../src/lib/r2-storage";

const RECOVERY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

async function main() {
  const cutoff = new Date(Date.now() - RECOVERY_WINDOW_MS);
  const documents = await db.document.findMany({
    where: { deletedAt: { lt: cutoff } },
    select: { id: true, fileUrl: true, title: true },
  });
  const keys = documents.map((document) => r2KeyFromPublicUrl(document.fileUrl)).filter((key): key is string => Boolean(key));
  await deleteR2Images(keys);
  if (documents.length) await db.document.deleteMany({ where: { id: { in: documents.map((document) => document.id) } } });
  console.log(`[cleanup-deleted-documents] Removed ${documents.length} document(s) deleted before ${cutoff.toISOString()}.`);
}

main().catch((error) => {
  console.error("[cleanup-deleted-documents] Failed", error);
  process.exitCode = 1;
}).finally(() => db.$disconnect());