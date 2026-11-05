"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, Search, Filter, ShoppingBag } from "lucide-react";
import OrderActionButtons from "./OrderActionButtons";

interface OrderItem {
  id: string;
  amount: number;
  status: string;
  paymentMethod?: string | null;
  trxId?: string | null;
  senderPhone?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  user: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  course: {
    title: string;
    slug: string;
  };
}

export default function OrdersTableClient({ initialOrders }: { initialOrders: OrderItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredOrders = initialOrders.filter((order) => {
    // Status Filter
    if (statusFilter !== "ALL" && order.status !== statusFilter) {
      return false;
    }

    // Search Term Filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const studentName = (order.user.name || "").toLowerCase();
    const studentEmail = (order.user.email || "").toLowerCase();
    const courseTitle = (order.course.title || "").toLowerCase();
    const trx = (order.trxId || "").toLowerCase();
    const phone = (order.senderPhone || "").toLowerCase();

    return (
      studentName.includes(term) ||
      studentEmail.includes(term) ||
      courseTitle.includes(term) ||
      trx.includes(term) ||
      phone.includes(term)
    );
  });

  const pendingCount = initialOrders.filter((o) => o.status === "PENDING").length;
  const completedCount = initialOrders.filter((o) => o.status === "COMPLETED").length;
  const failedCount = initialOrders.filter((o) => o.status === "FAILED").length;

  return (
    <div className="space-y-6">
      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 p-1 bg-surface/20 border border-border rounded-xl">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            সব ({initialOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "PENDING"
                ? "bg-amber-500 text-black shadow-sm font-black"
                : "text-amber-400 hover:text-amber-300"
            }`}
          >
            পেন্ডিং ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "COMPLETED"
                ? "bg-emerald-600 text-white shadow-sm font-black"
                : "text-emerald-400 hover:text-emerald-300"
            }`}
          >
            অনুমোদিত ({completedCount})
          </button>
          <button
            onClick={() => setStatusFilter("FAILED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === "FAILED"
                ? "bg-red-600 text-white shadow-sm font-black"
                : "text-red-400 hover:text-red-300"
            }`}
          >
            বাতিল ({failedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-70">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="TrxID, ফোন নম্বর, বা ইমেইল দিয়ে খুঁজুন..."
            className="w-full bg-surface/50 border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-foreground/80">
          <thead className="bg-[#182010] border-b border-[#2A3319]">
            <tr>
              <th className="px-6 py-4 font-black text-white">শিক্ষার্থী</th>
              <th className="px-6 py-4 font-black text-white">কোর্স</th>
              <th className="px-6 py-4 font-black text-white">পেমেন্ট বিবরণ</th>
              <th className="px-6 py-4 font-black text-white">তারিখ</th>
              <th className="px-6 py-4 font-black text-white">স্ট্যাটাস</th>
              <th className="px-6 py-4 font-black text-white text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-surface/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-foreground">{order.user.name || "অজানা ইউজার"}</div>
                  <div className="text-xs text-foreground/60 font-mono">{order.user.email}</div>
                  {order.user.phone && (
                    <div className="text-[11px] text-foreground/50 font-mono">📞 {order.user.phone}</div>
                  )}
                </td>

                <td className="px-6 py-4 font-medium text-foreground">
                  <div className="font-bold truncate max-w-55">{order.course.title}</div>
                </td>

                <td className="px-6 py-4">
                  <div className="font-mono font-black text-primary text-base">৳{order.amount}</div>
                  {order.paymentMethod && (
                    <div className="text-xs text-foreground/70 mt-1 space-y-0.5">
                      <div>
                        মেথড: <span className="uppercase font-bold text-foreground">{order.paymentMethod}</span>
                      </div>
                      {order.trxId && (
                        <div>
                          TrxID: <span className="font-mono text-primary font-bold tracking-wider">{order.trxId}</span>
                        </div>
                      )}
                      {order.senderPhone && (
                        <div className="text-[11px] text-foreground/60 font-mono">
                          From: {order.senderPhone}
                        </div>
                      )}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 text-foreground/70 font-medium text-xs whitespace-nowrap">
                  {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  <div className="text-[10px] text-foreground/40 font-mono">
                    {new Date(order.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>

                <td className="px-6 py-4">
                  {order.status === "COMPLETED" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/25">
                      <CheckCircle2 size={13} /> অনুমোদিত
                    </span>
                  ) : order.status === "PENDING" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/25 animate-pulse">
                      <Clock size={13} /> অপেক্ষমাণ
                    </span>
                  ) : (
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 text-xs font-bold border border-red-500/25">
                        <XCircle size={13} /> বাতিল
                      </span>
                      {order.rejectionReason && (
                        <p className="text-[11px] text-red-400/90 mt-1 max-w-44 leading-tight italic" title={order.rejectionReason}>
                          কারণ: {order.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end">
                    <OrderActionButtons 
                      orderId={order.id} 
                      currentStatus={order.status}
                      existingReason={order.rejectionReason} 
                    />
                  </div>
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-foreground/60 font-medium">
                  কোনো অর্ডার পাওয়া যায়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
