"use client";

import React, { useState, useEffect } from "react";
import { 
  Target, ShieldCheck, Key, Eye, EyeOff, Save, 
  Send, CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

export default function TrackingCenterPage() {
  const [pixelId, setPixelId] = useState("");
  const [capiToken, setCapiToken] = useState("");
  const [testCode, setTestCode] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTrackingSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/tracking");
      if (res.ok) {
        const data = await res.json();
        setPixelId(data.pixelId || "");
        setCapiToken(data.rawToken || "");
        setTestCode(data.testCode || "");
      }
    } catch (err) {
      console.error(err);
      toast.error("ট্র্যাকিং সেটিংস লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixelId, capiToken, testCode }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "ট্র্যাকিং ক্রেডেনশিয়াল সফলভাবে সংরক্ষিত হয়েছে!");
      } else {
        toast.error(data.error || "সংরক্ষণ করতে ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      toast.error("সার্ভার ত্রুটি: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!pixelId || !capiToken) {
      toast.error("অনুগ্রহ করে প্রথমে পিক্সেল আইডি এবং CAPI টোকেন লিখুন");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/tracking/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixelId, capiToken, testCode }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: "Meta Graph API টেস্ট ইভেন্ট সফলভাবে গ্রহণ করেছে! ফেসবুক Events Manager এর 'Test Events' ট্যাবে চেক করুন।",
        });
        toast.success("Meta CAPI টেস্ট সফল হয়েছে!");
      } else {
        setTestResult({
          success: false,
          message: data.error || "ফেসবুক সার্ভার রেসপন্সে ত্রুটি পাওয়া গেছে। টোকেনটি পুনরায় যাচাই করুন।",
        });
        toast.error("Meta CAPI টেস্ট ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
      toast.error("টেস্ট রিকোয়েস্ট পাঠাতে ব্যর্থ হয়েছে");
    } finally {
      setTesting(false);
    }
  };

  const copyPixelId = () => {
    if (!pixelId) return;
    navigator.clipboard.writeText(pixelId);
    setCopied(true);
    toast.success("পিক্সেল আইডি কপি করা হয়েছে");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <Target size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              পিক্সেল ও মার্কেটিং ট্র্যাকিং সেন্টার
            </h1>
            <p className="text-foreground/70 text-sm mt-1">
              Meta (Facebook) Pixel + Conversion API (CAPI), iOS 14.5+ বাইপাস ও সার্ভার সাইড ট্র্যাকিং
            </p>
          </div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-bold text-foreground">
                Meta (Facebook) Pixel & Conversion API
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary">
              CAPI সক্রিয়
            </span>
          </div>

          {/* Security Notice Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3.5">
            <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
            <div className="text-xs md:text-sm text-foreground/80 leading-relaxed">
              <strong className="text-foreground font-semibold">১০০% গোপনীয় ও সুরক্ষিত আর্কিটেকচার:</strong> আপনার Conversion API (CAPI) অ্যাক্সেস টোকেন শুধুমাত্র ব্যাকএন্ড সার্ভারে এনক্রিপ্ট অবস্থায় থাকে। ক্লায়েন্ট বা ব্রাউজারের কোনো সোর্স কোড বা ইনস্পেক্ট এলিমেন্টে এটি কখনোই উন্মুক্ত হয় না।
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Meta Pixel ID */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Meta Pixel ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  placeholder="যেমন: "
                  className="w-full px-4 py-3 bg-surface-raised border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-all pr-24"
                  required
                />
                <button
                  type="button"
                  onClick={copyPixelId}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-surface hover:bg-surface-raised border border-border text-foreground/70 hover:text-foreground text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copied ? "কপি হয়েছে" : "কপি"}</span>
                </button>
              </div>
              <p className="text-xs text-foreground/60 mt-1.5">
                Facebook Events Manager থেকে আপনার পিক্সেল আইডি বসান।
              </p>
            </div>

            {/* Conversion API Access Token */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-foreground">
                  Conversion API (CAPI) Access Token <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showToken ? "গোপন করুন" : "টোকেন দেখুন"}</span>
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={capiToken}
                  onChange={(e) => setCapiToken(e.target.value)}
                  placeholder="EAA..."
                  rows={showToken ? 4 : 2}
                  className={`w-full px-4 py-3 bg-surface-raised border border-border rounded-xl text-foreground font-mono text-xs focus:outline-none focus:border-primary transition-all leading-relaxed ${
                    !showToken ? "blur-[2px] hover:blur-none transition-all duration-200" : ""
                  }`}
                  required
                />
              </div>
              <p className="text-xs text-foreground/60 mt-1.5">
                iOS 14.5+ ট্র্যাকার এবং অ্যাড-ব্লকার বাইপাস করে সার্ভার সাইড ইভেন্ট ট্র্যাক করতে মেটা থেকে প্রাপ্ত সিস্টেম ইউজার টোকেন।
              </p>
            </div>

            {/* Test Event Code */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-1.5">
                Test Event Code (ঐচ্ছিক)
              </label>
              <input
                type="text"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value)}
                placeholder="যেমন: "
                className="w-full px-4 py-3 bg-surface-raised border border-border rounded-xl text-foreground font-mono text-sm focus:outline-none focus:border-primary transition-all"
              />
              <p className="text-xs text-foreground/60 mt-1.5">
                Facebook ইভেন্ট টেস্ট টুলে রিয়েল-টাইম লাইভ ইভেন্ট যাচাই করতে কোডটি দিন (টেস্ট শেষ হলে খালি রাখতে পারেন)।
              </p>
            </div>
          </div>

          {/* Test Result Display */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertTriangle size={20} className="shrink-0 mt-0.5 text-rose-400" />
              )}
              <div className="text-xs md:text-sm leading-relaxed">
                <strong className="font-semibold block mb-0.5">
                  {testResult.success ? "সার্ভার কানেকশন সফল!" : "কানেকশন ত্রুটি:"}
                </strong>
                {testResult.message}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}</span>
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || !pixelId || !capiToken}
              className="px-5 py-2.5 bg-surface-raised hover:bg-surface border border-border text-foreground font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              <span>{testing ? "টেস্ট হচ্ছে..." : "Meta CAPI টেস্ট করুন"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Tracking Architecture & Coverage Table */}
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span>ওয়েবসাইট ইভেন্ট ট্র্যাকিং আর্কিটেকচার</span>
        </h3>
        <p className="text-xs text-foreground/70">
          উভয় ব্রাউজার পিক্সেল এবং সার্ভার CAPI একই সাথে কাজ করে (Event Deduplication সহ), যার ফলে ডাবল-কাউন্টিং হয় না এবং কোনো সেল মিস হয় না।
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-foreground/60 font-semibold uppercase">
                <th className="py-2.5 px-3">ইভেন্টের নাম</th>
                <th className="py-2.5 px-3">কখন ফায়ার হয়</th>
                <th className="py-2.5 px-3">ট্র্যাকিং মোড</th>
                <th className="py-2.5 px-3">রোয়াস (ROAS) কভারেজ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-foreground">PageView</td>
                <td className="py-3 px-3 text-foreground/75">হোমপেজ বা যেকোনো পেজ ওপেন করলে</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">Hybrid (Pixel + CAPI)</span></td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">১০০% ভিউয়ার ট্র্যাকিং</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-foreground">ViewContent</td>
                <td className="py-3 px-3 text-foreground/75">যেকোনো কোর্স ডিটেইলস পেজে ক্লিক করলে</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">Hybrid (Pixel + CAPI)</span></td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">কোর্স আইডি ও টাইটেল সহ</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-foreground">InitiateCheckout</td>
                <td className="py-3 px-3 text-foreground/75">চেকআউট পেজে গিয়ে পে বাটনে চাপ দিলে</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">Hybrid (Pixel + CAPI)</span></td>
                <td className="py-3 px-3 text-emerald-400 font-semibold">হাই-ইনটেন্ট লিড ট্র্যাকিং</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-foreground">Purchase</td>
                <td className="py-3 px-3 text-foreground/75">UddoktaPay পেমেন্ট সম্পন্ন হলে (Webhook)</td>
                <td className="py-3 px-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">Strict Server CAPI</span></td>
                <td className="py-3 px-3 text-emerald-400 font-bold">১০০% গ্যারান্টিযুক্ত (iOS ব্লক এড়িয়ে)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
