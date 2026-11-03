import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma as db } from "@/lib/prisma";
import SecurityClient from "./SecurityClient";

export default async function AdminSecurityPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch security stats
  const totalIncidents = await db.securityIncident.count();
  const bannedUsersCount = await db.user.count({ where: { isBanned: true } });

  // Fetch recent incidents (last 100)
  const incidents = await db.securityIncident.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isBanned: true,
          banReason: true,
        },
      },
    },
  });

  // Fetch all banned users
  const bannedUsers = await db.user.findMany({
    where: { isBanned: true },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      banReason: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          সিকিউরিটি ও পাইরেসি অডিট প্যানেল
        </h1>
        <p className="text-white/60 text-sm mt-1">
          লাইভ সিকিউরিটি ভায়োলেশন মনিটরিং, সিঙ্গেল-ডিভাইস কনফ্লিক্ট এবং পাইরেসি নিয়ন্ত্রণ
        </p>
      </div>

      <SecurityClient
        initialIncidents={JSON.parse(JSON.stringify(incidents))}
        initialBannedUsers={JSON.parse(JSON.stringify(bannedUsers))}
        totalIncidents={totalIncidents}
        bannedCount={bannedUsersCount}
      />
    </div>
  );
}
