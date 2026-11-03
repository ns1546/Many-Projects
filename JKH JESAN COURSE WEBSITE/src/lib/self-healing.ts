import { prisma as db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";

/**
 * Transient error identifiers that warrant automatic retry
 */
const TRANSIENT_ERROR_PATTERNS = [
  "P1001", // Can't reach database server
  "P2024", // Timed out fetching a connection from the pool
  "Connection terminated unexpectedly",
  "Connection refused",
  "ECONNRESET",
  "ETIMEDOUT",
  "socket hang up",
  "Supavisor",
  "prepared statement",
];

/**
 * Self-Healing Query Wrapper
 * Automatically catches temporary database drops or network hiccups,
 * pauses with exponential backoff, reconnects Prisma, and retries the operation.
 */
export async function withSelfHealing<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 400
): Promise<T> {
  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      const errorMessage = error?.message || String(error);
      const isTransient = TRANSIENT_ERROR_PATTERNS.some((p) =>
        errorMessage.includes(p)
      );

      if (!isTransient || attempt >= maxRetries) {
        throw error;
      }

      console.warn(
        `⚠️ [Self-Healing DB] Transient error detected (Attempt ${attempt}/${maxRetries}): ${errorMessage}. Reconnecting in ${delay}ms...`
      );

      // Attempt to heal database connection
      try {
        await db.$disconnect();
        await new Promise((resolve) => setTimeout(resolve, delay));
        await db.$connect();
      } catch (connErr) {
        console.error("⚠️ [Self-Healing DB] Reconnection attempt warning:", connErr);
      }

      delay *= 2; // Exponential backoff (400ms -> 800ms -> 1600ms)
    }
  }

  throw new Error("Self-healing operation failed after maximum retries.");
}

/**
 * Auto-Heal System State & Integrity Bootstrap
 * Automatically verifies core requirements:
 * 1. Global Settings row exists (auto-created if missing)
 * 2. Admin account exists (auto-created if database was wiped)
 * 3. Backups folder exists
 */
export async function autoHealSystemState() {
  const healingReport: string[] = [];

  try {
    // 1. Ensure Backups Directory exists
    const backupsDir = path.join(process.cwd(), "backups");
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
      healingReport.push("Backups directory automatically created.");
    }

    // 2. Ensure Global Setting Row exists
    const existingSetting = await db.setting.findUnique({
      where: { id: "global" },
    });

    if (!existingSetting) {
      await db.setting.create({
        data: {
          id: "global",
          bkashNumber: "01700000000",
          nagadNumber: "01700000000",
          rocketNumber: "01700000000",
          whatsappNumber: "01754220135",
          supportEmail: "support@evorisemedia.com",
          noticeText: "আমাদের সকল কোর্সে বিশেষ ছাড় চলছে!",
        },
      });
      healingReport.push("Global system and payment settings auto-healed.");
    }

    // 3. Ensure at least one Admin account exists
    const adminCount = await db.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount === 0) {
      const initialAdminEmail = process.env.ADMIN_INITIAL_EMAIL || "admin@evorisemedia.com";
      const initialAdminPassword = process.env.ADMIN_INITIAL_PASSWORD || (
        process.env.NODE_ENV === "production" ? crypto.randomBytes(16).toString("hex") : "AdminSecure#2026"
      );
      const defaultPassword = await bcrypt.hash(initialAdminPassword, 10);
      await db.user.create({
        data: {
          id: "admin-root-healed",
          name: "Admin EvoRise Media",
          email: initialAdminEmail,
          password: defaultPassword,
          role: "ADMIN",
        },
      });
      if (!process.env.ADMIN_INITIAL_PASSWORD && process.env.NODE_ENV === "production") {
        console.warn(`[SECURITY WARNING] No ADMIN_INITIAL_PASSWORD set. Generated one-time admin credentials: Email: ${initialAdminEmail} | Password: ${initialAdminPassword}`);
      }
      healingReport.push(`Root Admin account auto-restored (${initialAdminEmail}).`);
    }

    return {
      status: "healthy",
      autoHealed: healingReport.length > 0,
      report: healingReport,
    };
  } catch (err: any) {
    console.error("Auto-Healing check error:", err);
    return {
      status: "degraded",
      error: err.message,
    };
  }
}
