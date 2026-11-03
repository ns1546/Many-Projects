import { prisma as db } from "@/lib/prisma";
import { Settings as SettingsIcon } from "lucide-react";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await db.setting.findUnique({ where: { id: "global" } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
          <SettingsIcon className="text-primary" size={32} />
          সিস্টেম ও পেমেন্ট সেটিংস
        </h1>
        <p className="text-foreground/75 mt-2 font-medium max-w-2xl text-sm leading-relaxed">
          বিকাশ ও নগদ পেমেন্ট নম্বর, হেল্পলাইন, নোটিশ এবং ফেসবুক পিক্সেল ট্র্যাকিং কনফিগার করুন।
        </p>
      </div>

      <SettingsForm 
        initialSettings={settings || {}} 
      />
    </div>
  );
}
