"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

export default function TrashClient({ courses, modules, lessons }: { courses: any[], modules: any[], lessons: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (type: "course" | "module" | "lesson", id: string, action: "restore" | "delete") => {
    if (action === "delete") {
      if (!confirm("আপনি কি নিশ্চিত যে এটি স্থায়ীভাবে ডিলিট করতে চান? এই কাজ আর ফেরানো যাবে না।")) return;
    }

    setLoadingId(id);
    try {
      const res = await fetch("/api/admin/trash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, action })
      });

      if (res.ok) {
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "কোনো সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setLoadingId(null);
    }
  };

  const renderItem = (type: "course" | "module" | "lesson", item: any, titlePrefix: string = "") => (
    <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-surface/50 border border-border rounded-xl gap-4">
      <div>
        <h4 className="font-bold text-foreground text-base">
          <span className="text-primary/70 mr-2 text-sm">{titlePrefix}</span>
          {item.title}
        </h4>
        <p className="text-xs text-foreground/50 mt-1">
          ডিলিট করার সময়: {item.deletedAt ? format(new Date(item.deletedAt), "dd MMM, yyyy - hh:mm a") : "অজানা"}
        </p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button 
          variant="outline"
          size="sm"
          disabled={loadingId === item.id}
          onClick={() => handleAction(type, item.id, "restore")}
          className="border-border text-foreground hover:bg-primary/20 hover:text-primary flex-1 sm:flex-none font-bold"
        >
          <RefreshCcw size={14} className="mr-2" />
          রিস্টোর
        </Button>
        <Button 
          variant="outline"
          size="sm"
          disabled={loadingId === item.id}
          onClick={() => handleAction(type, item.id, "delete")}
          className="border-border text-red-600 hover:bg-red-600/10 hover:border-red-600/30 flex-1 sm:flex-none font-bold"
        >
          <Trash2 size={14} className="mr-2" />
          স্থায়ী ডিলিট
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
          <Trash2 size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-accent">রিসাইকেল বিন</h1>
          <p className="text-foreground/60 font-bold mt-1">ডিলিট হওয়া কোর্স, মডিউল এবং লেসন রিস্টোর করুন অথবা চিরতরে মুছে ফেলুন।</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-border bg-surface shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-extrabold mb-4 text-accent border-b border-border pb-3">ডিলিট হওয়া কোর্সসমূহ ({courses.length})</h3>
            <div className="space-y-3">
              {courses.length > 0 ? (
                courses.map(course => renderItem("course", course))
              ) : (
                <p className="text-foreground/40 text-sm font-bold py-4 text-center">কোনো ডিলিট হওয়া কোর্স নেই</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-extrabold mb-4 text-accent border-b border-border pb-3">ডিলিট হওয়া মডিউলসমূহ ({modules.length})</h3>
            <div className="space-y-3">
              {modules.length > 0 ? (
                modules.map(module => renderItem("module", module, `কোর্স: ${module.course?.title} | `))
              ) : (
                <p className="text-foreground/40 text-sm font-bold py-4 text-center">কোনো ডিলিট হওয়া মডিউল নেই</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xl font-extrabold mb-4 text-accent border-b border-border pb-3">ডিলিট হওয়া লেসনসমূহ ({lessons.length})</h3>
            <div className="space-y-3">
              {lessons.length > 0 ? (
                lessons.map(lesson => renderItem("lesson", lesson, `মডিউল: ${lesson.module?.title} | `))
              ) : (
                <p className="text-foreground/40 text-sm font-bold py-4 text-center">কোনো ডিলিট হওয়া লেসন নেই</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
