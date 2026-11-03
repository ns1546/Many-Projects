import { prisma as db } from "@/lib/prisma";
import { Users, ShoppingCart, BookOpen, DollarSign, TrendingUp, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import AdminAnalytics from "@/components/AdminAnalytics";

export default async function AdminDashboard() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalCourses,
    totalOrders,
    completedOrders,
    pendingOrders,
    revenueAggregation,
    recentOrders,
  ] = await Promise.all([
    db.user.count({ where: { role: "STUDENT" } }).catch(() => 0),
    db.course.count().catch(() => 0),
    db.order.count().catch(() => 0),
    db.order.findMany({
      where: { status: "COMPLETED" },
      include: { course: { select: { title: true } }, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
    db.order.findMany({
      where: { status: "PENDING" },
      include: { course: { select: { title: true } }, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
    db.order.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }).catch(() => ({ _sum: { amount: 0 } })),
    db.order.findMany({
      where: { 
        status: "COMPLETED",
        createdAt: { gte: sevenDaysAgo },
      },
      select: { amount: true, createdAt: true },
    }).catch(() => []),
  ]);

  const revenue = revenueAggregation._sum.amount || 0;

  // Group by day name
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartDataMap = new Map();
  
  // Initialize last 7 days with 0
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = days[d.getDay()];
    // Handle duplicate day names if we overlap a week by adding date
    const key = `${dayName} ${d.getDate()}`;
    chartDataMap.set(key, 0);
  }

  recentOrders.forEach(o => {
    const dayName = days[o.createdAt.getDay()];
    const key = `${dayName} ${o.createdAt.getDate()}`;
    if (chartDataMap.has(key)) {
      chartDataMap.set(key, chartDataMap.get(key) + o.amount);
    }
  });

  const chartData = Array.from(chartDataMap.entries()).map(([name, revenue]) => ({
    name,
    revenue
  }));

  const stats = [
    { icon: Users, label: "মোট শিক্ষার্থী", value: totalUsers, color: "bg-blue-50 text-blue-600", trend: "+12%" },
    { icon: DollarSign, label: "মোট আয়", value: `৳${revenue.toLocaleString()}`, color: "bg-[#e0e3d3] text-primary", trend: "+8%" },
    { icon: ShoppingCart, label: "মোট অর্ডার", value: totalOrders, color: "bg-amber-50 text-amber-600", trend: "+5%" },
    { icon: BookOpen, label: "মোট কোর্স", value: totalCourses, color: "bg-purple-50 text-purple-600", trend: "" },
  ];

  const statusLabel = (s: string) => {
    if (s === "COMPLETED") return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">অনুমোদিত</span>;
    if (s === "PENDING") return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">অপেক্ষমাণ</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">বাতিল</span>;
  };

  return (
    <div className="space-y-8">

      {/* Page title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">ড্যাশবোর্ড</h1>
          <p className="text-foreground/80 text-sm font-medium mt-0.5">আপনার প্ল্যাটফর্মের সার্বিক অবস্থা</p>
        </div>
        <Link href="/admin/courses/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors shadow-[0_0_15px_rgba(200,144,10,0.35)]">
          + নতুন কোর্স
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface/5 border border-border backdrop-blur-md rounded-xl p-5 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-surface/5 border border-border text-foreground flex items-center justify-center`}>
                <stat.icon size={22} className={stat.color.includes('text-primary') ? 'text-primary' : stat.color.includes('blue') ? 'text-blue-400' : stat.color.includes('amber') ? 'text-amber-400' : 'text-purple-400'} />
              </div>
              {stat.trend && (
                <span className="flex items-center gap-1 text-xs font-bold text-primary">
                  <TrendingUp size={12} /> {stat.trend}
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
            <p className="text-sm font-semibold text-foreground/80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-surface/5 border border-border backdrop-blur-md rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-primary" size={24} />
            <h3 className="font-extrabold text-foreground text-lg">রাজস্ব বিশ্লেষণ (গত ৭ দিন)</h3>
          </div>
        </div>
        <div className="w-full h-72">
          <AdminAnalytics data={chartData} />
        </div>
      </div>

      {/* Tables */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Pending Orders */}
        <div className="bg-surface/5 border border-border backdrop-blur-md rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base">অপেক্ষমাণ অর্ডার</h3>
            <Link href="/admin/orders" className="text-xs font-bold text-primary flex items-center gap-1 hover:text-primary-dark transition-colors">
              সব দেখুন <ArrowRight size={13} />
            </Link>
          </div>
          {pendingOrders.length > 0 ? (
            <div className="divide-y divide-white/10">
              {pendingOrders.map((order: any) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface/5 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{order.user?.name}</p>
                    <p className="text-xs text-foreground/80 font-medium truncate mt-0.5">{order.course?.title}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-foreground">৳{order.amount}</span>
                    {statusLabel(order.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-sm text-foreground/80 font-medium">কোনো অপেক্ষমাণ অর্ডার নেই</div>
          )}
        </div>

        {/* Recent Completed */}
        <div className="bg-surface/5 border border-border backdrop-blur-md rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-border bg-surface flex items-center justify-between">
            <h3 className="font-bold text-foreground text-base">সাম্প্রতিক লেনদেন</h3>
            <Link href="/admin/orders" className="text-xs font-bold text-primary flex items-center gap-1 hover:text-primary-dark transition-colors">
              সব দেখুন <ArrowRight size={13} />
            </Link>
          </div>
          {completedOrders.length > 0 ? (
            <div className="divide-y divide-white/10">
              {completedOrders.map((order: any) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-surface/5 transition-colors">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{order.user?.name}</p>
                    <p className="text-xs text-foreground/80 font-medium truncate mt-0.5">{order.course?.title}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-foreground">৳{order.amount}</span>
                    {statusLabel(order.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-sm text-foreground/80 font-medium">কোনো সম্পন্ন অর্ডার নেই</div>
          )}
        </div>

      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "কোর্স যোগ করুন", href: "/admin/courses/create", desc: "নতুন কোর্স তৈরি করুন" },
          { label: "অর্ডার ম্যানেজ করুন", href: "/admin/orders", desc: "অনুমোদন বা বাতিল করুন" },
          { label: "ইউজার দেখুন", href: "/admin/users", desc: "সব শিক্ষার্থীর তালিকা" },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="bg-surface/5 border border-border backdrop-blur-md rounded-xl p-5 hover:border-primary/40 hover:bg-surface/5 hover:shadow-[0_0_15px_rgba(200,144,10,0.2)] transition-all group">
            <h4 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{item.label}</h4>
            <p className="text-xs text-foreground/80 font-medium">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
