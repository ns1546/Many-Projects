"use client";

import { useState } from "react";
import {
  ShieldAlert, UserX, UserCheck, AlertTriangle,
  Laptop, Camera, Code2, Clock, Search, RefreshCw, Smartphone
} from "lucide-react";
import { toast } from "sonner";

interface SecurityClientProps {
  initialIncidents: any[];
  initialBannedUsers: any[];
  totalIncidents: number;
  bannedCount: number;
}

export default function SecurityClient({
  initialIncidents,
  initialBannedUsers,
  totalIncidents,
  bannedCount,
}: SecurityClientProps) {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [bannedUsers, setBannedUsers] = useState(initialBannedUsers);
  const [filterType, setFilterType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"incidents" | "banned">("incidents");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  // Ban Modal State
  const [banModalUser, setBanModalUser] = useState<any | null>(null);
  const [banReason, setBanReason] = useState("");

  const handleBanToggle = async (userId: string, shouldBan: boolean, reason?: string) => {
    setLoadingUserId(userId);
    try {
      const res = await fetch("/api/admin/security/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          isBanned: shouldBan,
          reason: reason || "পাইরেসি ও সিকিউরিটি নীতি লঙ্ঘনের দায়ে ব্যান করা হয়েছে।",
        }),
      });

      if (res.ok) {
        toast.success(shouldBan ? "শিক্ষার্থীকে সফলভাবে ব্যান করা হয়েছে!" : "শিক্ষার্থীকে আনব্যান করা হয়েছে!");
        // Update local state
        setIncidents((prev) =>
          prev.map((inc) => {
            if (inc.user?.id === userId) {
              return {
                ...inc,
                user: { ...inc.user, isBanned: shouldBan, banReason: reason },
              };
            }
            return inc;
          })
        );

        if (!shouldBan) {
          setBannedUsers((prev) => prev.filter((u) => u.id !== userId));
        } else {
          // Re-fetch or add to banned list
          window.location.reload();
        }
      } else {
        toast.error("ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      }
    } catch (e) {
      toast.error("সার্ভার সমস্যা হয়েছে।");
    } finally {
      setLoadingUserId(null);
      setBanModalUser(null);
      setBanReason("");
    }
  };

  const getBadgeInfo = (type: string) => {
    switch (type) {
      case "DEVTOOLS_OPENED":
        return {
          label: "DevTools ওপেন",
          color: "bg-red-500/20 text-red-300 border-red-500/30",
          icon: Code2,
        };
      case "SCREENSHOT_ATTEMPT":
        return {
          label: "স্ক্রিনশট / রেকর্ড",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: Camera,
        };
      case "MULTIPLE_DEVICE_CONFLICT":
        return {
          label: "একাধিক ডিভাইস লগইন",
          color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          icon: Smartphone,
        };
      case "TAMPER_ATTEMPT":
        return {
          label: "DOM টেম্পারিং",
          color: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          icon: AlertTriangle,
        };
      default:
        return {
          label: type,
          color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          icon: ShieldAlert,
        };
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesFilter = filterType === "ALL" || inc.type === filterType;
    const matchesSearch =
      !searchQuery ||
      inc.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.ipAddress?.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Summary Stats ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#12160A] border border-[#2A3319] p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">মোট সিকিউরিটি ইনসিডেন্ট</span>
            <ShieldAlert size={20} className="text-[#C8900A]" />
          </div>
          <div className="text-3xl font-black text-white">{totalIncidents}</div>
          <p className="text-white/40 text-[11px] mt-1 font-medium">DevTools, স্ক্রিনশট ও মাল্টি-ডিভাইস প্রচেষ্টা</p>
        </div>

        <div className="bg-[#12160A] border border-[#2A3319] p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">ব্যানকৃত অ্যাকাউন্ট</span>
            <UserX size={20} className="text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">{bannedCount}</div>
          <p className="text-white/40 text-[11px] mt-1 font-medium">নিরাপত্তা ভায়োলেশনে ব্লক করা ব্যবহারকারী</p>
        </div>

        <div className="bg-[#12160A] border border-[#2A3319] p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">ডিভাইস লক স্ট্যাটাস</span>
            <Smartphone size={20} className="text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">সক্রিয় (১ ডিভাইস লক)</div>
          <p className="text-white/40 text-[11px] mt-1 font-medium">একাউন্টে একাধিক ডিভাইস নিষিদ্ধ</p>
        </div>
      </div>

      {/* ── Tabs & Filters ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#2A3319] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("incidents")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "incidents"
                ? "bg-[#C8900A] text-black shadow-md font-black"
                : "bg-[#12160A] text-white/70 hover:text-white border border-[#2A3319]"
            }`}
          >
            লাইভ সিকিউরিটি লগ ({incidents.length})
          </button>
          <button
            onClick={() => setActiveTab("banned")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "banned"
                ? "bg-red-500 text-white shadow-md font-black"
                : "bg-[#12160A] text-white/70 hover:text-white border border-[#2A3319]"
            }`}
          >
            ব্যানকৃত শিক্ষার্থী ({bannedUsers.length})
          </button>
        </div>

        {activeTab === "incidents" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="ইমেইল বা আইপি দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#12160A] border border-[#2A3319] text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#C8900A]"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#12160A] border border-[#2A3319] text-xs font-bold text-white focus:outline-none"
            >
              <option value="ALL">সব ভায়োলেশন</option>
              <option value="DEVTOOLS_OPENED">DevTools ওপেন</option>
              <option value="SCREENSHOT_ATTEMPT">স্ক্রিনশট / রেকর্ড</option>
              <option value="MULTIPLE_DEVICE_CONFLICT">মাল্টি-ডিভাইস কনফ্লিক্ট</option>
              <option value="TAMPER_ATTEMPT">DOM টেম্পারিং</option>
            </select>
          </div>
        )}
      </div>

      {/* ── Table Content ───────────────────────────────────────── */}
      {activeTab === "incidents" ? (
        <div className="bg-[#12160A] border border-[#2A3319] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A2210] text-white/70 uppercase tracking-wider font-bold border-b border-[#2A3319]">
                <tr>
                  <th className="py-3.5 px-4">শিক্ষার্থীর তথ্য</th>
                  <th className="py-3.5 px-4">ইনসিডেন্ট টাইপ</th>
                  <th className="py-3.5 px-4">আইপি ও ডিভাইস</th>
                  <th className="py-3.5 px-4">সময়</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3319] text-white/90 font-medium">
                {filteredIncidents.length > 0 ? (
                  filteredIncidents.map((inc: any) => {
                    const badge = getBadgeInfo(inc.type);
                    const isUserBanned = inc.user?.isBanned;

                    return (
                      <tr key={inc.id} className="hover:bg-[#1A2210]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{inc.user?.name || "Unknown"}</div>
                          <div className="text-[11px] text-[#C8900A] font-mono">{inc.userEmail}</div>
                          {isUserBanned && (
                            <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              ব্যানড
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.color}`}
                          >
                            <badge.icon size={13} />
                            {badge.label}
                          </span>
                          {inc.details && (
                            <div className="text-[10px] text-white/50 mt-1 truncate max-w-xs">{inc.details}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[11px] text-white/80">{inc.ipAddress}</div>
                          <div className="text-[10px] text-white/40 truncate max-w-xs">{inc.userAgent}</div>
                        </td>
                        <td className="py-3.5 px-4 text-white/60 font-mono text-[11px]">
                          {new Date(inc.createdAt).toLocaleString("bn-BD")}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {inc.user?.id && (
                            isUserBanned ? (
                              <button
                                onClick={() => handleBanToggle(inc.user.id, false)}
                                disabled={loadingUserId === inc.user.id}
                                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-lg border border-emerald-500/30 transition-all text-xs"
                              >
                                {loadingUserId === inc.user.id ? "..." : "আনব্যান"}
                              </button>
                            ) : (
                              <button
                                onClick={() => setBanModalUser(inc.user)}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-lg border border-red-500/30 transition-all text-xs"
                              >
                                ব্যান করুন
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/50">
                      কোনো সিকিউরিটি ইনসিডেন্ট পাওয়া যায়নি।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── Banned Users Table ─────────────────────────────────── */
        <div className="bg-[#12160A] border border-[#2A3319] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A2210] text-white/70 uppercase tracking-wider font-bold border-b border-[#2A3319]">
                <tr>
                  <th className="py-3.5 px-4">শিক্ষার্থীর নাম</th>
                  <th className="py-3.5 px-4">ইমেইল ও ফোন</th>
                  <th className="py-3.5 px-4">ব্যানের কারণ</th>
                  <th className="py-3.5 px-4">তারিখ</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3319] text-white/90 font-medium">
                {bannedUsers.length > 0 ? (
                  bannedUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-[#1A2210]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{u.name || "N/A"}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-[#C8900A]">{u.email}</div>
                        {u.phone && <div className="text-[11px] text-white/60">{u.phone}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-red-300 font-medium">{u.banReason || "পাইরেসি সতর্কতা"}</td>
                      <td className="py-3.5 px-4 text-white/60 font-mono text-[11px]">
                        {new Date(u.updatedAt).toLocaleString("bn-BD")}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleBanToggle(u.id, false)}
                          disabled={loadingUserId === u.id}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-lg border border-emerald-500/30 transition-all text-xs"
                        >
                          {loadingUserId === u.id ? "..." : "আনব্যান করুন"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-white/50">
                      বর্তমানে কোনো ব্যানকৃত শিক্ষার্থী নেই।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── BAN CONFIRMATION MODAL ─────────────────────────────── */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12160A] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <UserX size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">শিক্ষার্থীকে ব্যান করুন</h3>
                <p className="text-xs text-white/60">{banModalUser.email}</p>
              </div>
            </div>

            <p className="text-xs text-white/70 mb-4 leading-relaxed">
              ব্যান করলে এই শিক্ষার্থী তার অ্যাকাউন্ট থেকে আর কোনো কোর্স দেখতে পারবে না এবং সাথে সাথে তার সব ডিভাইসের সেশন লগআউট হয়ে যাবে।
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-white/80 mb-2">ব্যানের কারণ লিখুন:</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="যেমন: DevTools দিয়ে পাইরেসির চেষ্টা..."
                rows={3}
                className="w-full bg-[#1A2210] border border-[#2A3319] rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setBanModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1A2210] text-white/70 hover:text-white"
              >
                বাতিল
              </button>
              <button
                onClick={() => handleBanToggle(banModalUser.id, true, banReason)}
                disabled={loadingUserId === banModalUser.id}
                className="px-5 py-2 rounded-xl text-xs font-black bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all"
              >
                {loadingUserId === banModalUser.id ? "ব্যান হচ্ছে..." : "নিশ্চিত ব্যান করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
