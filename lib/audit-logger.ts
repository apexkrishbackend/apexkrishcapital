import { dbConnect } from "@/lib/dbConnect";
import AuditLog, { IAuditLog } from "@/models/audit-log.model";

/**
 * Records an immutable administrative action to the AuditLog collection.
 * Catches errors silently so logging never breaks primary business workflows.
 */
export async function logAdminAction(entry: IAuditLog): Promise<void> {
  try {
    await dbConnect();
    await AuditLog.create(entry);
  } catch (error) {
    console.error("[AuditLog] Failed to record admin audit entry:", error);
  }
}
