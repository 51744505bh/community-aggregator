import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface AuditEventParams {
  actorUserId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAdminEvent(params: AuditEventParams) {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      null;
    const userAgent = headersList.get("user-agent") || null;

    await prisma.adminAuditLog.create({
      data: {
        actorUserId: params.actorUserId || null,
        action: params.action,
        targetType: params.targetType || null,
        targetId: params.targetId || null,
        ipAddress,
        userAgent,
        metadata: params.metadata as Record<string, string | number | boolean | null> | undefined,
      },
    });
  } catch (error) {
    console.error("[AuditLog] 감사 로그 저장 실패:", error);
  }
}
