import { prisma as db } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import OrdersTableClient from "./OrdersTableClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    take: 100,
    include: {
      user: {
        select: { name: true, email: true, phone: true }
      },
      course: {
        select: { title: true, slug: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const formattedOrders = orders.map((o: any) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <ShoppingCart className="text-primary" size={32} />
          অর্ডার ও পেমেন্ট ভেরিফিকেশন
        </h1>
        <p className="text-foreground/75 mt-1 font-medium text-sm">
          শিক্ষার্থীদের বিকাশ ও নগদ ট্রানজেকশন যাচাই করে কোর্স অ্যাক্সেস অনুমোদন বা বাতিল করুন।
        </p>
      </div>

      <Card className="border-border bg-surface/5 backdrop-blur-md shadow-xl overflow-hidden p-6">
        <CardContent className="p-0">
          <OrdersTableClient initialOrders={formattedOrders} />
        </CardContent>
      </Card>
    </div>
  );
}
