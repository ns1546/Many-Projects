import { NextResponse } from "next/server";
// @ts-ignore
import { runBackup } from "../../../../../scripts/backup.js";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Fail-closed security verification for automated cron
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const token = authHeader?.replace("Bearer ", "") || searchParams.get("key");

    if (!cronSecret && process.env.NODE_ENV === "production") {
      console.error("[CRON SECURITY] CRON_SECRET is not configured in production. Rejecting request.");
      return NextResponse.json({ message: "CRON_SECRET কনফিগার করা হয়নি। নিরাপত্তা স্বার্থে ক্রন বন্ধ রাখা হয়েছে।" }, { status: 401 });
    }

    if (cronSecret && token !== cronSecret) {
      return NextResponse.json({ message: "অননুমোদিত ক্রন রিকোয়েস্ট" }, { status: 401 });
    }

    // 1. Run full database backup
    const result = await runBackup();

    // 2. Automated Retention Policy: Retain last 30 backups, clean up older snapshots
    const backupsDir = path.join(process.cwd(), "backups");
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir)
        .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
        .map((name) => {
          const filePath = path.join(backupsDir, name);
          const stat = fs.statSync(filePath);
          return { name, path: filePath, time: stat.mtimeMs };
        })
        .sort((a, b) => b.time - a.time);

      // Keep newest 30 backups, remove older files to prevent disk bloating
      if (files.length > 30) {
        const toDelete = files.slice(30);
        for (const file of toDelete) {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.warn(`Could not delete old backup ${file.name}:`, e);
          }
        }
      }
    }

    return NextResponse.json({
      status: "success",
      message: "স্বয়ংক্রিয় ব্যাকআপ সফলভাবে সম্পন্ন হয়েছে",
      backup: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Automated Backup Cron Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "স্বয়ংক্রিয় ব্যাকআপ ব্যর্থ হয়েছে",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
