"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, RotateCcw, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

const PRESET_REASONS = [
  "ভুল বা অস্তিত্বহীন TrxID প্রদান করা হয়েছে।",
  "আমাদের অ্যাকাউন্টে কোনো টাকা জমা হয়নি।",
  "কোর্সের নির্ধারিত ফির চেয়ে কম টাকা পাঠানো হয়েছে।",
  "এই TrxID টি দিয়ে পূর্বে অন্য শিক্ষার্থী এনরোল করেছে।"
];

export default function OrderActionButtons({ 
  orderId, 
  currentStatus,
  existingReason,
}: { 
  orderId: string;
  currentStatus: string;
  existingReason?: string | null;
}) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  const handleApprove = async () => {
    setApproving(true);
    setConfirmApprove(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        toast.success("অর্ডার অনুমোদিত এবং কোর্স অ্যাক্সেস নিশ্চিত করা হয়েছে!");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message || "অনুমোদন করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      toast.error("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setApproving(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() ? customReason.trim() : selectedReason;
    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "FAILED",
          rejectionReason: finalReason
        }),
      });
      if (res.ok) {
        toast.success("অর্ডার বাতিল করা হয়েছে এবং শিক্ষার্থীকে কারণ দেখানো হবে।");
        setRejectModalOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message || "বাতিল করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      toast.error("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        {confirmApprove ? (
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg">
            <span className="text-[11px] font-bold text-green-400">অনুমোদন নিশ্চিত?</span>
            <Button
              size="sm"
              className="h-6 text-[11px] font-bold px-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? <Loader2 size={11} className="animate-spin" /> : "হ্যাঁ"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[11px] font-bold px-1.5 border-border"
              onClick={() => setConfirmApprove(false)}
            >
              না
            </Button>
          </div>
        ) : (
          <>
            {currentStatus !== "COMPLETED" && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs font-bold px-2.5 shadow-sm"
                disabled={approving || rejecting}
                onClick={() => setConfirmApprove(true)}
              >
                {approving ? (
                  <Loader2 size={13} className="mr-1 animate-spin" />
                ) : (
                  <CheckCircle size={13} className="mr-1" />
                )}
                অনুমোদন
              </Button>
            )}

            {currentStatus !== "FAILED" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-bold px-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                disabled={approving || rejecting}
                onClick={() => setRejectModalOpen(true)}
              >
                {rejecting ? (
                  <Loader2 size={13} className="mr-1 animate-spin" />
                ) : (
                  <XCircle size={13} className="mr-1" />
                )}
                বাতিল করুন
              </Button>
            )}

            {currentStatus === "FAILED" && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] font-bold px-2 border-green-500/30 text-green-400 hover:bg-green-500/10"
                disabled={approving || rejecting}
                onClick={() => setConfirmApprove(true)}
                title="পুনরায় অনুমোদন করুন"
              >
                <RotateCcw size={12} className="mr-1" />
                পুনরায় অনুমোদন
              </Button>
            )}
          </>
        )}
      </div>

      {/* Rejection Modal with Preset Reasons & Custom Text */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-2 text-red-500">
                <AlertTriangle size={18} />
                <h3 className="font-black text-foreground text-base">পেমেন্ট বাতিল করার কারণ</h3>
              </div>
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="text-foreground/50 hover:text-foreground p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs text-foreground/75 leading-relaxed">
                পেমেন্ট বাতিল করলে শিক্ষার্থীর কোর্স অ্যাক্সেস তৎক্ষণাৎ বন্ধ হয়ে যাবে এবং এই কারণটি শিক্ষার্থী তার ড্যাশবোর্ডে দেখতে পাবে।
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  কারণ নির্বাচন করুন:
                </label>
                <div className="space-y-1.5">
                  {PRESET_REASONS.map((reason, idx) => (
                    <label 
                      key={idx}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        selectedReason === reason && !customReason
                          ? "bg-red-500/10 border-red-500/30 text-foreground font-bold"
                          : "border-border hover:bg-muted/30 text-foreground/80"
                      }`}
                      onClick={() => {
                        setSelectedReason(reason);
                        setCustomReason("");
                      }}
                    >
                      <input 
                        type="radio" 
                        name="reason" 
                        checked={selectedReason === reason && !customReason} 
                        onChange={() => {
                          setSelectedReason(reason);
                          setCustomReason("");
                        }}
                        className="mt-0.5 accent-red-500" 
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  অথবা কাস্টম কারণ লিখুন:
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="যেমন: টাকার পরিমাণ কম হয়েছে অথবা অন্য নম্বর থেকে পাঠান..."
                  rows={2}
                  className="w-full bg-surface border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectModalOpen(false)}
                  disabled={rejecting}
                  className="text-xs"
                >
                  ফিরে যান
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={rejecting}
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs gap-1.5"
                >
                  {rejecting ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                  বাতিল নিশ্চিত করুন
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
