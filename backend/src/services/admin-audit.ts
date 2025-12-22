import { prisma } from "../lib/prisma";

type AuditParams = {
  adminId?: number;
  action: string;
  entity: string;
  entityId?: string | number;
  before?: any;
  after?: any;
  ip?: string;
};

export async function logAdminAudit({
  adminId,
  action,
  entity,
  entityId,
  before,
  after,
  ip,
}: AuditParams) {
  try {
    await prisma.admin_audit_log.create({
      data: {
        adminId,
        action,
        entity,
        entityId: entityId ? String(entityId) : undefined,
        before,
        after,
        ip,
      },
    });
  } catch (err) {
    console.error("Erro audit log:", err);
  }
}