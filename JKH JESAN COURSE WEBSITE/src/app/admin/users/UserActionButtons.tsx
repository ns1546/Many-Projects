"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, ShieldCheck, Trash2, Loader2, 
  GraduationCap, Plus, X, Check, BookOpen 
} from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  price: number;
}

export default function UserActionButtons({
  userId,
  userName,
  currentRole,
  allCourses = [],
  enrolledCourseIds = [],
}: {
  userId: string;
  userName: string;
  currentRole: string;
  allCourses?: Course[];
  enrolledCourseIds?: string[];
}) {
  const router = useRouter();
  const [roleLoading, setRoleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [confirm, setConfirm] = useState<null | "role" | "delete">(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.includes(c.id));

  const toggleRole = async () => {
    const newRole = currentRole === "ADMIN" ? "STUDENT" : "ADMIN";
    setConfirm(null);
    setRoleLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success(`ভূমিকা পরিবর্তিত হয়েছে: ${newRole}`);
        router.refresh();
      } else {
        toast.error("ইউজারের ভূমিকা আপডেট করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      toast.error("ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setRoleLoading(false);
    }
  };

  const deleteUser = async () => {
    setConfirm(null);
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("ইউজার সফলভাবে মোছা হয়েছে।");
        router.refresh();
      } else {
        toast.error("ইউজার মুছতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      toast.error("ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEnrollCourse = async () => {
    if (!selectedCourseId) {
      toast.error("দয়া করে একটি কোর্স নির্বাচন করুন।");
      return;
    }

    setEnrollLoading(true);
    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId: selectedCourseId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "কোর্সে সফলভাবে এনরোল করা হয়েছে!");
        setShowEnrollModal(false);
        setSelectedCourseId("");
        router.refresh();
      } else {
        toast.error(data.message || "এনরোল করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      toast.error("সার্ভার ত্রুটি।");
    } finally {
      setEnrollLoading(false);
    }
  };

  // Inline confirmation
  if (confirm) {
    const isDanger = confirm === "delete";
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground/80 whitespace-nowrap">
          {isDanger ? "মুছে ফেলবেন?" : "ভূমিকা বদলাবেন?"}
        </span>
        <Button
          size="sm"
          className={`h-7 text-xs font-bold px-3 ${isDanger ? "bg-red-600 hover:bg-red-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}`}
          onClick={isDanger ? deleteUser : toggleRole}
        >
          হ্যাঁ
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs font-bold px-3 border-border"
          onClick={() => setConfirm(null)}
        >
          না
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Manual Enroll Button */}
        <Button
          size="sm"
          onClick={() => setShowEnrollModal(true)}
          className="h-8 text-xs font-bold bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
          title="ম্যানুয়াল কোর্স অ্যাক্সেস দিন"
        >
          <GraduationCap size={14} className="mr-1" />
          এনরোল
        </Button>

        {/* Role Toggle */}
        <Button
          variant="outline"
          size="sm"
          className={`h-8 text-xs font-bold border-border ${
            currentRole === "ADMIN"
              ? "text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
              : "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
          }`}
          disabled={roleLoading || deleteLoading}
          onClick={() => setConfirm("role")}
        >
          {roleLoading ? (
            <Loader2 size={14} className="mr-1 animate-spin" />
          ) : currentRole === "ADMIN" ? (
            <ShieldAlert size={14} className="mr-1" />
          ) : (
            <ShieldCheck size={14} className="mr-1" />
          )}
          {currentRole === "ADMIN" ? "Demote" : "Make Admin"}
        </Button>

        {/* Delete */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 text-red-400 border-border hover:bg-red-500/10 hover:text-red-300"
          disabled={roleLoading || deleteLoading}
          onClick={() => setConfirm("delete")}
          title="ইউজার মুছুন"
        >
          {deleteLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </Button>
      </div>

      {/* Manual Enroll Modal Dialog */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#12160A] text-[#F8F4EC] border border-[#2A3319] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowEnrollModal(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">কোর্সে ম্যানুয়াল এনরোলমেন্ট</h3>
                <p className="text-xs text-[#A8A296] font-medium">শিক্ষার্থী: <strong className="text-white font-bold">{userName}</strong></p>
              </div>
            </div>

            <p className="text-xs text-[#E2DCCE]/85 leading-relaxed mb-4">
              শিক্ষার্থী যদি অফলাইনে বা সরাসরি bKash/Nagad-এ পেমেন্ট করে থাকে, তবে তাকে এখান থেকে সরাসরি কোর্সের লাইফটাইম অ্যাক্সেস প্রদান করতে পারেন।
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  যে কোর্সে যুক্ত করতে চান:
                </label>
                {availableCourses.length === 0 ? (
                  <p className="text-xs text-amber-400 bg-amber-500/15 p-3 rounded-xl border border-amber-500/30 font-medium">
                    এই শিক্ষার্থী ইতিমধ্যে সমস্ত কোর্সে এনরোল্ড আছেন অথবা কোনো সক্রিয় কোর্স নেই।
                  </p>
                ) : (
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full bg-[#1A2210] border border-[#344220] rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                  >
                    <option value="" className="bg-[#1A2210] text-[#A8A296]">-- একটি কোর্স বেছে নিন --</option>
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#1A2210] text-white py-1">
                        {c.title} (৳{c.price})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEnrollModal(false)}
                  className="text-white/70 hover:text-white hover:bg-white/10 text-xs font-bold"
                >
                  বাতিল
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!selectedCourseId || enrollLoading}
                  onClick={handleEnrollCourse}
                  className="bg-primary text-black font-black text-xs px-4 hover:bg-primary-dark shadow-sm"
                >
                  {enrollLoading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Check size={14} className="mr-1" />}
                  {enrollLoading ? "যুক্ত হচ্ছে..." : "কনফার্ম ও এনরোল করুন"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
