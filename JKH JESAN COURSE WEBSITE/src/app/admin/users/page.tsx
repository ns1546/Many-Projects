import { prisma as db } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { User, ShieldCheck, GraduationCap, BookOpen } from "lucide-react";
import UserActionButtons from "./UserActionButtons";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, courses] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        enrollments: {
          include: {
            course: {
              select: { id: true, title: true }
            }
          }
        }
      }
    }),
    db.course.findMany({
      where: { isDeleted: false },
      select: { id: true, title: true, price: true },
      orderBy: { title: "asc" }
    })
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <GraduationCap className="text-primary" size={32} />
            শিক্ষার্থী ও ইউজার ম্যানেজমেন্ট
          </h1>
          <p className="text-foreground/75 mt-1 font-medium text-sm">
            প্ল্যাটফর্মে রেজিস্টার করা সকল শিক্ষার্থী এবং ম্যানুয়াল কোর্স এনরোলমেন্ট নিয়ন্ত্রণ করুন।
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-surface/50 border border-border rounded-xl text-xs font-bold text-foreground">
            মোট ইউজার: <span className="text-primary font-mono text-sm">{users.length}</span>
          </span>
        </div>
      </div>

      <Card className="border-border bg-surface/5 backdrop-blur-md shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground/80">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-black text-foreground">ইউজার বিবরণ</th>
                  <th className="px-6 py-4 font-black text-foreground">ভূমিকা</th>
                  <th className="px-6 py-4 font-black text-foreground">ভর্তিকৃত কোর্সসমূহ</th>
                  <th className="px-6 py-4 font-black text-foreground">যোগদানের তারিখ</th>
                  <th className="px-6 py-4 font-black text-foreground text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-surface/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-black text-xs">
                          {(user.name || user.email || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{user.name || "অজানা ইউজার"}</div>
                          <div className="text-xs text-foreground/60 font-mono">{user.email}</div>
                          {user.phone && (
                            <div className="text-[11px] text-foreground/50 font-mono mt-0.5">📞 {user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">
                          <ShieldCheck size={14} /> অ্যাডমিন
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                          <User size={14} /> শিক্ষার্থী
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {user.enrollments && user.enrollments.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {user.enrollments.map((enr: any) => (
                            <span 
                              key={enr.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[11px] font-bold border border-primary/25"
                              title={enr.course.title}
                            >
                              <BookOpen size={11} />
                              <span className="truncate max-w-35">{enr.course.title}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-foreground/40 italic">কোনো কোর্স নেই</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-foreground/70 font-medium text-xs">
                      {new Date(user.createdAt).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end">
                        <UserActionButtons 
                          userId={user.id} 
                          userName={user.name || user.email}
                          currentRole={user.role}
                          allCourses={courses}
                          enrolledCourseIds={user.enrollments.map((e: any) => e.courseId)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-foreground/70 font-medium">
                      কোনো ইউজার পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
