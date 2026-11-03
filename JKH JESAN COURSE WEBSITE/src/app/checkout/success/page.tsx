import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/prisma";
import { CheckCircle2, ArrowRight, Play, BookOpen, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "পেমেন্ট সফল! | EvoRise Media",
  description: "আপনার পেমেন্ট সফলভাবে সম্পন্ন হয়েছে। এখনই আপনার কোর্স শুরু করুন।",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  let order: any = null;
  if (orderId) {
    order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        course: {
          include: {
            modules: {
              where: { isDeleted: false },
              include: { lessons: { where: { isDeleted: false } } },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
  }

  // Find first lesson if available
  let firstLessonId: string | null = null;
  if (order?.course?.modules?.[0]?.lessons?.[0]?.id) {
    firstLessonId = order.course.modules[0].lessons[0].id;
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-card border border-border/80 rounded-3xl p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 size={40} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary mb-4">
            <ShieldCheck size={14} /> ভেরিফাইড পেমেন্ট সম্পন্ন
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3 tracking-tight">
            অভিনন্দন! আপনার ভর্তি সম্পন্ন
          </h1>

          <p className="text-foreground/75 text-sm sm:text-base leading-relaxed mb-8">
            Bingo Pay-এর মাধ্যমে আপনার পেমেন্ট তাৎক্ষণিকভাবে অনুমোদিত হয়েছে এবং আপনার একাউন্টে কোর্সটি অ্যাক্টিভ করা হয়েছে।
          </p>

          {order && (
            <div className="bg-surface/50 border border-border rounded-2xl p-5 mb-8 text-left space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-semibold">অর্ডার আইডি</span>
                <span className="font-mono font-bold text-foreground">{order.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-semibold">কোর্স</span>
                <span className="font-bold text-primary truncate max-w-[240px]">{order.course.title}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-semibold">পেমেন্ট মেথড</span>
                <span className="font-bold text-foreground">Bingo Pay Gateway (অটোমেটিক)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-foreground/60 font-semibold">পরিশোধিত মূল্য</span>
                <span className="font-black text-emerald-400 text-sm">৳{order.amount}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {order?.course?.id && firstLessonId ? (
              <Link
                href={`/learn/${order.course.id}/${firstLessonId}`}
                className="btn-primary py-3 px-6 text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Play size={16} fill="currentColor" /> এখনই ক্লাস শুরু করুন
              </Link>
            ) : (
              <Link
                href="/dashboard/courses"
                className="btn-primary py-3 px-6 text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <BookOpen size={16} /> আমার কোর্সগুলো দেখুন
              </Link>
            )}

            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-surface/5 text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              ড্যাশবোর্ডে যান <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
