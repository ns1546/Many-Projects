import { prisma as db } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, PlusCircle, BookOpen, ExternalLink, Users, Layers, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    where: { isDeleted: false },
    include: {
      _count: {
        select: {
          enrollments: true,
          modules: true,
        }
      },
      modules: {
        include: {
          _count: {
            select: { lessons: true }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <BookOpen className="text-primary" size={32} />
            কোর্স ম্যানেজমেন্ট
          </h1>
          <p className="text-foreground/75 mt-1 font-medium text-sm">
            সকল কোর্স, সিলেবাস, ভিডিও লেসন এবং মূল্য নির্ধারণ করুন।
          </p>
        </div>
        <Link href="/admin/courses/create">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-black h-11 px-5 shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <PlusCircle size={18} />
            নতুন কোর্স যোগ করুন
          </Button>
        </Link>
      </div>

      <Card className="border-border bg-surface/5 backdrop-blur-md shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground/80">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-black text-foreground">কোর্স</th>
                  <th className="px-6 py-4 font-black text-foreground">মূল্য</th>
                  <th className="px-6 py-4 font-black text-foreground">এনরোলমেন্ট</th>
                  <th className="px-6 py-4 font-black text-foreground">কন্টেন্ট</th>
                  <th className="px-6 py-4 font-black text-foreground">স্ট্যাটাস</th>
                  <th className="px-6 py-4 font-black text-foreground text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {courses.map((course: any) => {
                  const totalLessons = course.modules.reduce(
                    (acc: number, m: any) => acc + (m._count?.lessons || 0),
                    0
                  );

                  return (
                    <tr key={course.id} className="hover:bg-surface/5 transition-colors">
                      {/* Course Info & Thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-10 rounded-lg overflow-hidden border border-border bg-black/40 shrink-0 relative">
                            {course.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-foreground/40 font-mono text-xs">
                                No Poster
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/courses/${course.id}`}
                              className="font-bold text-foreground hover:text-primary transition-colors block truncate max-w-xs text-base"
                            >
                              {course.title}
                            </Link>
                            <span className="text-xs text-foreground/50 font-mono">
                              /courses/{course.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-6 py-4">
                        <div className="font-mono font-black text-primary text-base">
                          ৳{course.discountPrice || course.price}
                        </div>
                        {course.discountPrice && (
                          <div className="text-xs text-foreground/40 line-through font-mono">
                            ৳{course.price}
                          </div>
                        )}
                      </td>

                      {/* Students Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Users size={14} className="text-primary" />
                          <span>{course._count.enrollments} জন শিক্ষার্থী</span>
                        </div>
                      </td>

                      {/* Content Structure */}
                      <td className="px-6 py-4">
                        <div className="text-xs text-foreground/80 space-y-0.5">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Layers size={13} className="text-primary/70" />
                            <span>{course._count.modules} টি মডিউল</span>
                          </div>
                          <div className="text-[11px] text-foreground/50 font-medium">
                            মোট {totalLessons} টি ক্লাস / লেসন
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {course.published ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/25">
                            <CheckCircle2 size={13} /> প্রকাশিত
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface/20 text-foreground/70 text-xs font-bold border border-border">
                            <XCircle size={13} /> ড্রাফট
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/courses/${course.slug}`} target="_blank">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-bold border-border text-foreground/70 hover:text-foreground"
                              title="পাবলিক পেজ দেখুন"
                            >
                              <ExternalLink size={13} />
                            </Button>
                          </Link>
                          <Link href={`/admin/courses/${course.id}`}>
                            <Button
                              size="sm"
                              className="h-8 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Edit size={13} className="mr-1" />
                              সিলেবাস ও ক্লাস
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {courses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-foreground/70 font-medium">
                      এখনো কোনো কোর্স তৈরি করা হয়নি।
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
