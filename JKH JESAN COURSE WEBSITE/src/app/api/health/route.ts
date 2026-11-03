import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { autoHealSystemState, withSelfHealing } from "@/lib/self-healing";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    // 1. Lightweight raw SQL query wrapped with self-healing auto-retry
    await withSelfHealing(async () => {
      await db.$queryRawUnsafe("SELECT 1 AS alive");
    });
    const latencyMs = Date.now() - startTime;

    // 2. Perform background self-healing audit
    const healingResult = await autoHealSystemState();

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        selfHealing: healingResult,
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Health Check Database Error:", error);
    return NextResponse.json(
      {
        status: "degraded",
        database: "error",
        error: error?.message || "Unknown database connection failure",
        timestamp: new Date().toISOString(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
