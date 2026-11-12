"use client";

import { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit3, Save, X, Image as ImageIcon, Link as LinkIcon,
  ExternalLink, Eye, EyeOff, Loader2, ArrowUpDown, CheckCircle, Upload,
  Layers, Sparkles, RefreshCw, Check, AlertTriangle, ChevronDown, ChevronUp,
  Info, HelpCircle, Copy, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface BannerItem {
  id: string;
  title: string | null;
  imageUrl: string;
  targetUrl: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface SectionMediaConfig {
  key: string;
  title: string;
  sectionBadge: string;
  description: string;
  defaultImage: string;
  aspectClass: string;
  recommendedSize: string;
  exactDimensions: string;
  ratio: string;
}

const SECTION_MEDIA_LIST: SectionMediaConfig[] = [
  {
    key: "section:why-choose-us",
    title: "কেন আমাদের বেছে নেবেন (ফিচার কার্ড ইমেজ)",
    sectionBadge: "হোমপেজ বেন্টো গ্রিড",
    description: "হোমপেজের 'একটি প্ল্যাটফর্ম, অসীম সম্ভাবনা' বেন্টো গ্রিড কার্ডের ব্যাকগ্রাউন্ড ও শোকেস ইমেজ।",
    defaultImage: "/images/why-choose-us.jpg",
    aspectClass: "aspect-4/3",
    recommendedSize: "800 × 600 px",
    exactDimensions: "800 × 600 পিক্সেল",
    ratio: "4:3 (স্ট্যান্ডার্ড)",
  },
  {
    key: "section:hero-mentor",
    title: "হিরো সেকশন মেন্টর ফটো",
    sectionBadge: "মূল হিরো হেডার",
    description: "হোমপেজের একদম উপরে ডানপাশের প্রধান ইন্সট্রাক্টর পোর্ট্রেট ছবি।",
    defaultImage: "/images/mentor-jjesan-mandolin.jpg",
    aspectClass: "aspect-4/5",
    recommendedSize: "800 × 1000 px",
    exactDimensions: "800 × 1000 পিক্সেল",
    ratio: "4:5 (পোর্ট্রেট)",
  },
  {
    key: "section:about-mentor",
    title: "প্রশিক্ষক পরিচিতি ও অ্যাবাউট ফটো",
    sectionBadge: "ইন্সট্রাক্টর পরিচিতি সেকশন",
    description: "হোমপেজের 'চিফ মিউজিক ইন্সট্রাক্টর' সেকশন এবং অ্যাবাউট পেজের মূল ছবি।",
    defaultImage: "/images/mentor-jjesan-accordion.jpg",
    aspectClass: "aspect-4/5",
    recommendedSize: "800 × 1000 px",
    exactDimensions: "800 × 1000 পিক্সেল",
    ratio: "4:5 (পোর্ট্রেট)",
  },
];

const SIZE_MATRIX = [
  {
    title: "হিরো প্রমোশনাল স্লাইডার ব্যানার",
    location: "হোমপেজ টপ স্লাইডার (Hero Carousel)",
    dimensions: "১৯২০ × ৮০০ px",
    minDimensions: "১৬০০ × ৬৫০ px",
    ratio: "১৬:৯ বা ২.৪:১",
    format: "WebP / JPG / PNG (সর্বোচ্চ ২ MB)",
    badge: "স্লাইডার",
    tips: "ব্যানারের গুরুত্বপূর্ণ লেখা বা সাবজেক্ট মাঝখানে বা বামে রাখুন।"
  },
  {
    title: "হিরো মেন্টর ফটো",
    location: "হোমপেজ হেডারে ডানপাশের কার্ড (Hero Mentor)",
    dimensions: "৮০০ × ১০০০ px",
    minDimensions: "৬০০ × ৭৫০ px",
    ratio: "৪:৫ (Portrait)",
    format: "WebP / PNG / JPG",
    badge: "হিরো কার্ড",
    tips: "ইন্সট্রাক্টরের কোমর বা বুক পর্যন্ত পোর্ট্রেট ছবি সবচেয়ে ভালো মানায়।"
  },
  {
    title: "প্রশিক্ষক পরিচিতি ও অ্যাবাউট ফটো",
    location: "হোমপেজ 'চিফ মেন্টর' ও অ্যাবাউট পেজ",
    dimensions: "৮০০ × ১০০০ px",
    minDimensions: "৬০০ × ৭৫০ px",
    ratio: "৪:৫ (Portrait)",
    format: "WebP / PNG / JPG",
    badge: "অ্যাবাউট",
    tips: "স্টুডিও ব্যাকগ্রাউন্ডে ইনস্ট্রুমেন্ট সহ প্রফেশনাল ছবি।"
  },
  {
    title: "কেন আমাদের বেছে নেবেন (ফিচার কার্ড)",
    location: "হোমপেজ বেন্টো গ্রিড (Why Choose Us)",
    dimensions: "৮০০ × ৬০০ px",
    minDimensions: "৬৪০ × ৪৮০ px",
    ratio: "৪:৩ (Standard)",
    format: "WebP / JPG",
    badge: "বেন্টো গ্রিড",
    tips: "স্টুডিও ইকুইপমেন্ট বা মিউজিক ওয়ার্কস্টেশনের অনুভূমিক ছবি।"
  },
  {
    title: "কোর্স থাম্বনেইল / কভার পোস্টার",
    location: "কোর্স ক্যাটালগ কার্ড ও কোর্স ডিটেইলস ব্যানার",
    dimensions: "১২৮০ × ৭২০ px (HD)",
    minDimensions: "৮০০ × ৪৫০ px",
    ratio: "১৬:৯ (Landscape)",
    format: "WebP / JPG / PNG",
    badge: "কোর্স পোস্টার",
    tips: "কোর্সের নাম ও আকর্ষক গ্রাফিক্স সহ ১৬:৯ অনুপাতের পোস্টার।"
  },
];

const TARGET_PRESETS = [
  { label: "সকল কোর্স", url: "/courses" },
  { label: "ভোকাল কোর্স", url: "/courses/vocal-processing-course" },
  { label: "ফ্রি একাউন্ট", url: "/register" },
  { label: "আমাদের সম্পর্কে", url: "/about" },
  { label: "যোগাযোগ", url: "/contact" },
];

export default function AdminBannersPage() {
  const [activeTab, setActiveTab] = useState<"sections" | "sliders">("sections");
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Guide expand/tab states
  const [showGuide, setShowGuide] = useState(true);
  const [guideTab, setGuideTab] = useState<"sizes" | "permanent">("sizes");

  // Section media states
  const [uploadingSectionKey, setUploadingSectionKey] = useState<string | null>(null);
  const [editingUrlKey, setEditingUrlKey] = useState<string | null>(null);
  const [tempUrlInput, setTempUrlInput] = useState<string>("");
  const [sectionSuccessMsg, setSectionSuccessMsg] = useState<string | null>(null);

  // Slider banner states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Slider Form states
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState<number>(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (error) {
      console.error("Fetch banners error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const showSectionSuccess = (msg: string) => {
    setSectionSuccessMsg(msg);
    setTimeout(() => setSectionSuccessMsg(null), 4000);
  };

  // ─── SECTION MEDIA HANDLERS ───────────────────────────────────────────────
  const handleSectionImageUpload = async (sectionKey: string, sectionTitle: string, file: File) => {
    setUploadingSectionKey(sectionKey);
    try {
      const data = new FormData();
      data.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!uploadRes.ok) {
        alert("ইমেজ আপলোডে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        return;
      }

      const { url } = await uploadRes.json();
      await saveSectionMedia(sectionKey, sectionTitle, url);
    } catch (err) {
      console.error("Section upload error:", err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setUploadingSectionKey(null);
    }
  };

  const saveSectionMedia = async (sectionKey: string, sectionTitle: string, newImageUrl: string) => {
    const existing = banners.find((b) => b.targetUrl === sectionKey);
    try {
      if (existing) {
        const res = await fetch(`/api/admin/banners/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: newImageUrl,
            isActive: true,
            title: sectionTitle,
          }),
        });
        if (res.ok) {
          showSectionSuccess(`"${sectionTitle}" সফলভাবে আপডেট হয়েছে!`);
          fetchBanners();
        } else {
          alert("আপডেট করতে ব্যর্থ হয়েছে।");
        }
      } else {
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: sectionTitle,
            imageUrl: newImageUrl,
            targetUrl: sectionKey,
            isActive: true,
            order: 999,
          }),
        });
        if (res.ok) {
          showSectionSuccess(`"${sectionTitle}" সফলভাবে সেভ হয়েছে!`);
          fetchBanners();
        } else {
          alert("সেভ করতে ব্যর্থ হয়েছে।");
        }
      }
    } catch (err) {
      console.error(err);
      alert("সংরক্ষণে সমস্যা হয়েছে।");
    }
  };

  const handleToggleSectionActive = async (bannerId: string, currentActive: boolean, sectionTitle: string) => {
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b.id === bannerId ? { ...b, isActive: !currentActive } : b))
        );
        showSectionSuccess(`"${sectionTitle}" স্ট্যাটাস পরিবর্তন হয়েছে।`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSectionMedia = async (bannerId: string, sectionTitle: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${sectionTitle}"-এর কাস্টম ইমেজ মুছে ডিফল্ট ছবিতে ফিরে যেতে চান?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== bannerId));
        showSectionSuccess(`কাস্টম ইমেজ মুছে ডিফল্ট ছবিতে রিসেট করা হয়েছে!`);
      } else {
        alert("মুছে ফেলতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── SLIDER BANNER HANDLERS ───────────────────────────────────────────────
  const handleSliderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        const { url } = await res.json();
        setImageUrl(url);
      } else {
        alert("ইমেজ আপলোডে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setUploadingImage(false);
    }
  };

  const resetSliderForm = () => {
    setTitle("");
    setImageUrl("");
    setTargetUrl("");
    setIsActive(true);
    setOrder(0);
    setIsAdding(false);
    setEditingId(null);
    setSubmitting(false);
  };

  const handleEditSlider = (banner: BannerItem) => {
    setTitle(banner.title || "");
    setImageUrl(banner.imageUrl);
    setTargetUrl(banner.targetUrl || "");
    setIsActive(banner.isActive);
    setOrder(banner.order ?? 0);
    setEditingId(banner.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveSlider = async () => {
    if (!imageUrl.trim()) {
      alert("ব্যানার ইমেজ প্রদান করুন (ফাইল আপলোড অথবা ইমেজ লিংক)।");
      return;
    }

    setSubmitting(true);
    const payload = {
      title: title.trim() || undefined,
      imageUrl: imageUrl.trim(),
      targetUrl: targetUrl.trim() || undefined,
      isActive,
      order: Number(order) || 0,
    };

    try {
      const url = editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetSliderForm();
        fetchBanners();
      } else {
        const errData = await res.json();
        alert(`সংরক্ষণে সমস্যা হয়েছে: ${errData.message || JSON.stringify(errData.errors)}`);
      }
    } catch (error) {
      console.error(error);
      alert("সার্ভার সংযোগে ত্রুটি।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleSliderStatus = async (banner: BannerItem) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই ব্যানারটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert("মুছে ফেলতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sliderBanners = banners.filter((b) => !b.targetUrl?.startsWith("section:"));
  const activeSliderCount = sliderBanners.filter((b) => b.isActive).length;

  return (
    <div className="space-y-8">
      {/* ─── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30 mb-2">
            <Sparkles size={13} /> ওয়েবসাইট মিডিয়া সেন্টার
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            ব্যানার ও সেকশন ইমেজ ম্যানেজমেন্ট
          </h1>
          <p className="text-foreground/70 text-sm mt-1">
            হোমপেজের বিভিন্ন সেকশন ইমেজ আপলোড, এডিট ও ডিলিট করুন এবং হিরো স্লাইডার ব্যানার পরিচালনা করুন।
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center p-1.5 rounded-2xl bg-surface border border-border shadow-xs shrink-0">
          <button
            onClick={() => {
              setActiveTab("sections");
              resetSliderForm();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "sections"
                ? "bg-primary text-foreground shadow-sm"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Layers size={14} /> সেকশন ইমেজসমূহ ({SECTION_MEDIA_LIST.length})
          </button>
          <button
            onClick={() => setActiveTab("sliders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "sliders"
                ? "bg-primary text-foreground shadow-sm"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <ImageIcon size={14} /> হিরো স্লাইডার ({sliderBanners.length})
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {sectionSuccessMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-sm font-bold shadow-md animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={18} className="shrink-0 text-emerald-400" />
          <span>{sectionSuccessMsg}</span>
        </div>
      )}

      {/* ─── Image Dimensions & Permanent Upload Guidelines Card ─── */}
      <Card className="rounded-2xl border-primary/30 bg-surface/80 backdrop-blur-md shadow-xl overflow-hidden transition-all">
        <div className="p-4 md:p-5 border-b border-border bg-primary/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">
              <ImageIcon size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">
                  ইমেজ সাইজ ও স্থায়ী আপলোড গাইডলাইন
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  জরুরি নির্দেশিকা
                </span>
              </div>
              <p className="text-xs text-foreground/70 mt-0.5">
                কোন সেকশনে কত সাইজের ছবি প্রয়োজন এবং কীভাবে আজীবন স্থায়ী ইমেজ লিঙ্ক ব্যবহার করবেন তা জানুন।
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs font-bold gap-1.5 border-border shrink-0"
          >
            {showGuide ? (
              <>
                সংক্ষেপ করুন <ChevronUp size={14} />
              </>
            ) : (
              <>
                গাইডলাইন দেখুন <ChevronDown size={14} />
              </>
            )}
          </Button>
        </div>

        {showGuide && (
          <div className="p-4 md:p-6 space-y-5 animate-in fade-in duration-300">
            {/* Guide Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <button
                type="button"
                onClick={() => setGuideTab("sizes")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  guideTab === "sizes"
                    ? "bg-primary text-foreground shadow-sm"
                    : "bg-surface hover:bg-surface-raised text-foreground/70"
                }`}
              >
                <BookOpen size={13} /> সকল সেকশনের সাইজ ও অনুপাত ({SIZE_MATRIX.length})
              </button>
              <button
                type="button"
                onClick={() => setGuideTab("permanent")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  guideTab === "permanent"
                    ? "bg-primary text-foreground shadow-sm"
                    : "bg-surface hover:bg-surface-raised text-foreground/70"
                }`}
              >
                <AlertTriangle size={13} className={guideTab === "permanent" ? "" : "text-amber-400"} /> স্থায়ী লিঙ্ক (ImgBB) পাওয়ার উপায়
              </button>
            </div>

            {/* Sub-Tab 1: Sizes Table & Cards */}
            {guideTab === "sizes" && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {SIZE_MATRIX.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-border bg-background/50 hover:border-primary/40 transition-all flex flex-col justify-between space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30">
                            {item.badge}
                          </span>
                          <span className="text-[10px] font-semibold text-foreground/50 font-mono">
                            {item.ratio}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-foreground mt-2">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-foreground/60 mt-0.5">
                          {item.location}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/60 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground/70 font-medium">সুপারিশকৃত সাইজ:</span>
                          <span className="font-black text-primary font-mono">{item.dimensions}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground/50">সর্বনিম্ন সাইজ:</span>
                          <span className="font-semibold text-foreground/70 font-mono">{item.minDimensions}</span>
                        </div>
                        <p className="text-[11px] text-foreground/60 italic pt-1 leading-snug">
                          💡 {item.tips}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Permanent URL Guide */}
            {guideTab === "permanent" && (
              <div className="space-y-4">
                {/* Warning Alert */}
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-foreground/85 leading-relaxed">
                    <p className="font-bold text-red-400">
                      ⚠️ ফেসবুক ও হোয়াটসঅ্যাপের ইমেজ লিঙ্ক ব্যবহারের ঝুঁকি:
                    </p>
                    <p className="mt-0.5">
                      ফেসবুক বা ইনস্টাগ্রাম সিডিএন (<code className="text-red-300 font-mono">scontent.fbcdn.net</code>)-এর লিংকে <code className="text-red-300 font-mono">?oe=...</code> সিকিউরিটি টোকেন যুক্ত থাকে, যা ২-৩ দিন পর স্বয়ংক্রিয়ভাবে অকেজো বা এক্সপায়ার হয়ে যায়। ফলে ওয়েবসাইট বা নেটলিফাইতে ছবি কালো/অদৃশ্য হয়ে যায়।
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* ImgBB Method */}
                  <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary text-black">
                        ১০০% রিকমেন্ডেড ও ফ্রি
                      </span>
                      <a
                        href="https://imgbb.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline"
                      >
                        ImgBB খুলুন <ExternalLink size={12} />
                      </a>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">
                      পদ্ধতি ১: ImgBB থেকে চিরস্থায়ী ডিরেক্ট লিঙ্ক
                    </h4>
                    <ol className="text-xs text-foreground/80 space-y-2 list-decimal list-inside leading-relaxed">
                      <li>
                        <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-primary underline font-bold">imgbb.com</a>-এ প্রবেশ করে <strong>&quot;Start Uploading&quot;</strong> ক্লিক করুন।
                      </li>
                      <li>
                        Auto-delete ড্রপডাউনে <strong>&quot;Don&apos;t autodelete&quot;</strong> নির্বাচন করে <strong>Upload</strong> বাটনে চাপ দিন।
                      </li>
                      <li>
                        আপলোড সম্পন্ন হলে <em>Embed codes</em> ড্রপডাউন থেকে <strong>&quot;Direct links&quot;</strong> সিলেক্ট করুন।
                      </li>
                      <li>
                        প্রাপ্ত লিঙ্কটি (যেমন: <code className="text-primary font-mono text-[11px]">https://i.ibb.co/xyz/image.jpg</code>) কপি করে অ্যাডমিন প্যানেলে পেস্ট করুন।
                      </li>
                    </ol>
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
                      ✅ এটি ক্লাউডফ্লেয়ার গ্লোবাল সিডিএনে চিরদিনের জন্য সংরক্ষিত থাকে এবং দ্রুততম গতিতে লোড হয়।
                    </div>
                  </div>

                  {/* Postimages & Direct Upload Method */}
                  <div className="p-4 rounded-xl border border-border bg-surface/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-foreground/10 text-foreground/80 border border-border">
                        বিকল্প পদ্ধতিসমূহ
                      </span>
                      <a
                        href="https://postimages.org"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-foreground/70 font-bold inline-flex items-center gap-1 hover:underline"
                      >
                        Postimages খুলুন <ExternalLink size={12} />
                      </a>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">
                      পদ্ধতি ২: পোস্ট-ইমেজেস বা সরাসরি লোকাল আপলোড
                    </h4>
                    <ul className="text-xs text-foreground/80 space-y-2 list-disc list-inside leading-relaxed">
                      <li>
                        <strong>Postimages.org:</strong> <a href="https://postimages.org" target="_blank" rel="noreferrer" className="text-primary underline">postimages.org</a>-এ গিয়ে &quot;No expiration&quot; দিয়ে ছবি আপলোড করুন এবং <strong>&quot;Direct link&quot;</strong> কপি করুন।
                      </li>
                      <li>
                        <strong>সরাসরি ফাইল আপলোড:</strong> প্রতিটি সেকশনে থাকা <strong>&quot;আপলোড&quot;</strong> বাটনে ক্লিক করে ফাইল দিলে তা সরাসরি সার্ভারে জমা হবে।
                      </li>
                      <li>
                        <strong>ফাইল ফরম্যাট:</strong> উন্নত মানের জন্য <span className="text-primary font-mono font-bold">.webp</span>, <span className="text-primary font-mono font-bold">.jpg</span> অথবা <span className="text-primary font-mono font-bold">.png</span> ফরম্যাট ব্যবহার করুন।
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ─── TAB 1: SECTION IMAGES ─────────────────────────────── */}
      {activeTab === "sections" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-surface/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground">সেকশন মিডিয়া কন্ট্রোল প্যানেল</h2>
              <p className="text-xs text-foreground/60 mt-0.5">
                যেকোনো সেকশনের জন্য নিজস্ব ছবি আপলোড করুন অথবা রিসেট করে ডিফল্ট ছবিতে ফিরে যান।
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBanners}
              disabled={loading}
              className="text-xs gap-1.5 self-start sm:self-auto border-border"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> রিফ্রেশ
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTION_MEDIA_LIST.map((cfg) => {
              const customBanner = banners.find((b) => b.targetUrl === cfg.key);
              const hasCustom = !!customBanner;
              const isCustomActive = hasCustom && customBanner.isActive;
              const currentDisplayUrl = isCustomActive
                ? customBanner.imageUrl
                : cfg.defaultImage;
              const isUploading = uploadingSectionKey === cfg.key;
              const isEditingUrl = editingUrlKey === cfg.key;

              return (
                <Card
                  key={cfg.key}
                  className="rounded-2xl border-border bg-surface/70 backdrop-blur-md overflow-hidden shadow-lg hover:border-primary/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header bar */}
                    <div className="p-4 border-b border-border/80 flex items-center justify-between bg-black/10">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30">
                            {cfg.sectionBadge}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/25 font-mono">
                            {cfg.recommendedSize}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-foreground mt-1.5 line-clamp-1">
                          {cfg.title}
                        </h3>
                      </div>
                      <div>
                        {hasCustom ? (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCustomActive
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCustomActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                              }`}
                            />
                            {isCustomActive ? "কাস্টম সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            ডিফল্ট সক্রিয়
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Image Preview Box */}
                    <div className="p-4">
                      <div
                        className={`relative rounded-xl overflow-hidden border border-border/80 bg-black/30 group shadow-inner ${cfg.aspectClass}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentDisplayUrl}
                          alt={cfg.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Hover Overlay with Quick Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-foreground text-xs font-bold hover:opacity-90 shadow-lg">
                            <Upload size={14} /> নতুন ছবি আপলোড
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              disabled={isUploading}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleSectionImageUpload(cfg.key, cfg.title, f);
                              }}
                            />
                          </label>
                          <span className="text-[11px] text-white font-bold bg-black/60 px-2 py-0.5 rounded-md border border-white/20">
                            সাইজ: {cfg.recommendedSize}
                          </span>
                        </div>

                        {isUploading && (
                          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2">
                            <Loader2 size={28} className="animate-spin text-primary" />
                            <p className="text-xs font-bold text-white">ছবি আপলোড হচ্ছে...</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2.5">
                        <span className="text-[11px] font-semibold text-foreground/75 flex items-center gap-1">
                          📐 অনুপাত: <strong className="text-foreground">{cfg.ratio}</strong>
                        </span>
                        <span className="text-[11px] font-bold text-primary font-mono">
                          {cfg.exactDimensions}
                        </span>
                      </div>

                      <p className="text-xs text-foreground/70 mt-2 leading-relaxed">
                        {cfg.description}
                      </p>
                    </div>

                    {/* URL Input Form (if toggled) */}
                    {isEditingUrl && (
                      <div className="px-4 pb-3 space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-foreground">ইমেজ ইউআরএল (Permanent URL):</Label>
                          <span className="text-[10px] text-primary font-bold">{cfg.recommendedSize}</span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={tempUrlInput}
                            onChange={(e) => setTempUrlInput(e.target.value)}
                            placeholder="https://i.ibb.co/... বা ডিরেক্ট ইমেজ URL"
                            className="text-xs h-8 bg-background border-border font-mono"
                          />
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-primary text-foreground font-bold shrink-0"
                            onClick={() => {
                              if (tempUrlInput.trim()) {
                                saveSectionMedia(cfg.key, cfg.title, tempUrlInput.trim());
                                setEditingUrlKey(null);
                              }
                            }}
                          >
                            সেভ
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs shrink-0"
                            onClick={() => setEditingUrlKey(null)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                        <p className="text-[11px] text-amber-400/90 flex items-center gap-1 pt-0.5">
                          <AlertTriangle size={12} className="shrink-0" />
                          ফেসবুক লিংক মেয়াদোত্তীর্ণ হয়ে যায়। চিরস্থায়ী লিঙ্কের জন্য ImgBB ডিরেক্ট লিঙ্ক দিন।
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Controls */}
                  <div className="p-4 border-t border-border/80 bg-background/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-border text-xs font-bold text-foreground transition-all">
                        <Upload size={13} className="text-primary" /> আপলোড
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleSectionImageUpload(cfg.key, cfg.title, f);
                          }}
                        />
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-foreground/70 hover:text-foreground"
                        onClick={() => {
                          setEditingUrlKey(isEditingUrl ? null : cfg.key);
                          setTempUrlInput(customBanner?.imageUrl || "");
                        }}
                      >
                        <LinkIcon size={12} className="mr-1" /> লিঙ্ক
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasCustom && (
                        <>
                          <button
                            type="button"
                            title={customBanner.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                            onClick={() =>
                              handleToggleSectionActive(
                                customBanner.id,
                                customBanner.isActive,
                                cfg.title
                              )
                            }
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              customBanner.isActive
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                            }`}
                          >
                            {customBanner.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                          </button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs font-bold px-2.5"
                            title="কাস্টম ছবি মুছে ডিফল্ট ছবিতে রিসেট করুন"
                            onClick={() =>
                              handleDeleteSectionMedia(customBanner.id, cfg.title)
                            }
                          >
                            <Trash2 size={13} className="mr-1" /> রিসেট
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 2: HERO SLIDER BANNERS ─────────────────────────── */}
      {activeTab === "sliders" && (
        <div className="space-y-6">
          {/* Header Action Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface/40 border border-border">
            <div>
              <h2 className="text-base font-bold text-foreground">হিরো প্রমোশনাল স্লাইডার ব্যানারসমূহ</h2>
              <p className="text-xs text-foreground/60 mt-0.5">
                হোমপেজের স্লাইডারে প্রদর্শিত প্রমোশনাল ব্যানার তৈরি, অর্ডার ও নিয়ন্ত্রণ করুন।
              </p>
            </div>
            {!isAdding && (
              <Button
                onClick={() => {
                  resetSliderForm();
                  setOrder(sliderBanners.length + 1);
                  setIsAdding(true);
                }}
                className="gap-2 bg-primary text-foreground font-bold hover:opacity-90 shrink-0 self-start sm:self-auto"
              >
                <Plus size={18} /> নতুন ব্যানার যোগ করুন
              </Button>
            )}
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-surface/40">
              <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">মোট ব্যানার</p>
              <p className="text-2xl font-black text-foreground mt-1">{sliderBanners.length}</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-surface/40">
              <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">সক্রিয় ব্যানার</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{activeSliderCount}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-border bg-surface/40">
              <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">স্লাইডার স্ট্যাটাস</p>
              <p className="text-sm font-bold text-foreground mt-2 flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    activeSliderCount > 0 ? "bg-emerald-400 animate-pulse" : "bg-yellow-500"
                  }`}
                />
                {activeSliderCount > 0 ? "হোমপেজে লাইভ চালু আছে" : "কোনো সক্রিয় ব্যানার নেই"}
              </p>
            </div>
          </div>

          {/* Add / Edit Banner Form */}
          {isAdding && (
            <Card className="border-border bg-surface/80 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-3">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground">
                      {editingId ? "ব্যানার এডিট করুন" : "নতুন ব্যানার যোগ করুন"}
                    </h3>
                    <p className="text-xs text-foreground/60 mt-0.5">
                      ব্যানার ইমেজ, ক্লিকযোগ্য লিংক এবং ক্রম নির্ধারণ করুন
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetSliderForm}
                    className="text-foreground/60 hover:text-foreground rounded-full"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                  {/* Left Column: Form Fields */}
                  <div className="lg:col-span-6 space-y-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-foreground">
                        ব্যানার শিরোনাম (ঐচ্ছিক)
                      </Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="যেমন: ঈদুল ফিতর স্পেশাল — ৩০% ছাড়!"
                        className="bg-background border-border text-foreground"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-foreground flex items-center justify-between">
                        <span>টার্গেট লিংক / ইউআরএল (ঐচ্ছিক)</span>
                        <span className="text-[11px] font-normal text-foreground/50">ক্লিক করলে এই পেজে যাবে</span>
                      </Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={16} />
                        <Input
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          placeholder="/courses/vocal-processing-course"
                          className="pl-9 bg-background border-border text-foreground font-mono text-sm"
                        />
                      </div>

                      {/* Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-foreground/50">দ্রুত নির্বাচন:</span>
                        {TARGET_PRESETS.map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setTargetUrl(preset.url)}
                            className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                              targetUrl === preset.url
                                ? "bg-primary text-foreground border-primary font-bold"
                                : "border-border bg-background hover:bg-surface text-foreground/80"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <ArrowUpDown size={14} className="text-primary" /> প্রদর্শন ক্রম (Order)
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          value={order}
                          onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                          className="bg-background border-border text-foreground font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-foreground">ব্যানার স্ট্যাটাস</Label>
                        <div className="flex items-center justify-between p-2.5 bg-background border border-border rounded-xl h-10">
                          <span className="text-xs font-semibold text-foreground">
                            {isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={isActive}
                              onChange={(e) => setIsActive(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Image Input */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <ImageIcon size={15} className="text-primary" /> ব্যানার ইমেজ <span className="text-red-500">*</span>
                      </Label>
                      <div className="inline-flex p-0.5 rounded-lg bg-background border border-border text-xs">
                        <button
                          type="button"
                          onClick={() => setImageInputMode("upload")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                            imageInputMode === "upload" ? "bg-surface text-foreground shadow-sm" : "text-foreground/60"
                          }`}
                        >
                          আপলোড করুন
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageInputMode("url")}
                          className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                            imageInputMode === "url" ? "bg-surface text-foreground shadow-sm" : "text-foreground/60"
                          }`}
                        >
                          ইমেজ লিংক (URL)
                        </button>
                      </div>
                    </div>

                    {imageInputMode === "upload" ? (
                      imageUrl ? (
                        <div className="space-y-3">
                          <div className="relative rounded-xl overflow-hidden border border-border aspect-21/9 bg-background group shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/90 text-foreground text-xs font-bold hover:bg-background">
                                <Upload size={14} /> পরিবর্তন
                                <input type="file" className="hidden" accept="image/*" onChange={handleSliderImageUpload} />
                              </label>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="text-xs font-bold h-8"
                                onClick={() => setImageUrl("")}
                              >
                                <Trash2 size={14} className="mr-1" /> রিমুভ
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-21/9 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-surface/30 transition-all bg-background/50">
                          <div className="flex flex-col items-center justify-center p-6 text-center">
                            {uploadingImage ? (
                              <>
                                <Loader2 size={32} className="animate-spin text-primary mb-2" />
                                <p className="text-sm font-bold text-foreground">ইমেজ আপলোড হচ্ছে...</p>
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                                  <Upload size={22} />
                                </div>
                                <p className="text-sm font-bold text-foreground">
                                  ক্লিক করে ব্যানার আপলোড করুন
                                </p>
                                <p className="text-xs text-primary font-bold mt-1">
                                  সুপারিশকৃত সাইজ: ১৯২০ × ৮০০ px বা ১৬:৯ অনুপাত (সর্বোচ্চ ৫ MB)
                                </p>
                                <p className="text-[11px] text-foreground/50 mt-0.5">
                                  অনুমোদিত ফরম্যাট: WebP, PNG, JPG
                                </p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleSliderImageUpload}
                            disabled={uploadingImage}
                          />
                        </label>
                      )
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">স্থায়ী ইমেজ ইউআরএল (Permanent URL):</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/20 text-primary border border-primary/30">
                            সাইজ: ১৯২০ × ৮০০ px (১৬:৯)
                          </span>
                        </div>
                        <Input
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://i.ibb.co/.../banner.jpg বা ডিরেক্ট ক্লাউড লিংক"
                          className="bg-background border-border text-foreground font-mono text-sm"
                        />
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 space-y-1.5">
                          <p className="font-bold flex items-center gap-1.5">
                            <AlertTriangle size={13} className="shrink-0" /> চিরস্থায়ী ইমেজ ব্যবহারের সতর্কতা:
                          </p>
                          <p className="text-[11px] text-foreground/80 leading-relaxed">
                            ফেসবুক বা সোশ্যাল মিডিয়া লিঙ্ক ব্যবহার করবেন না (কয়েকদিন পর মেয়াদ শেষ হয়ে নষ্ট হয়ে যায়)। চিরস্থায়ী ফ্রি লিঙ্কের জন্য <a href="https://imgbb.com" target="_blank" rel="noreferrer" className="text-primary underline font-bold inline-flex items-center gap-0.5">ImgBB.com <ExternalLink size={10} /></a>-এ ছবি আপলোড করে <strong>&quot;Direct links&quot;</strong> কপি করে এখানে পেস্ট করুন।
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={resetSliderForm} disabled={submitting}>
                    বাতিল
                  </Button>
                  <Button
                    onClick={handleSaveSlider}
                    disabled={submitting || !imageUrl.trim()}
                    className="gap-2 bg-primary text-foreground font-bold hover:opacity-90 min-w-32"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> সংরক্ষণ হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> সংরক্ষণ করুন
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slider Banners Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
              বর্তমান ব্যানার তালিকা ({sliderBanners.length}টি)
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-16 space-y-3">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p className="text-sm text-foreground/60">ব্যানার লোড হচ্ছে...</p>
              </div>
            ) : sliderBanners.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-surface/30 space-y-3">
                <ImageIcon size={40} className="mx-auto text-foreground/30" />
                <h4 className="text-base font-bold text-foreground">এখনো কোনো ব্যানার যোগ করা হয়নি</h4>
                <p className="text-xs text-foreground/60 max-w-sm mx-auto">
                  হোমপেজের স্লাইডারে প্রদর্শনের জন্য একটি আকর্ষণীয় ব্যানার ইমেজ আপলোড করুন।
                </p>
                <Button
                  onClick={() => setIsAdding(true)}
                  className="bg-primary text-foreground font-bold text-xs gap-1.5 mt-2"
                >
                  <Plus size={14} /> প্রথম ব্যানার যোগ করুন
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sliderBanners.map((banner) => (
                  <Card
                    key={banner.id}
                    className="rounded-2xl border-border bg-surface/60 overflow-hidden shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-21/9 bg-background overflow-hidden border-b border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={banner.imageUrl}
                          alt={banner.title || "Banner"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold border border-white/20">
                            #{banner.order}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              banner.isActive
                                ? "bg-emerald-500/80 text-white border-emerald-400"
                                : "bg-black/70 text-white/60 border-white/20"
                            }`}
                          >
                            {banner.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="font-bold text-sm text-foreground line-clamp-1">
                          {banner.title || "(কোনো শিরোনাম নেই)"}
                        </h4>
                        {banner.targetUrl && (
                          <p className="text-xs text-primary font-mono truncate flex items-center gap-1">
                            <LinkIcon size={12} className="shrink-0" /> {banner.targetUrl}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 border-t border-border bg-background/40 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 text-foreground/70 hover:text-foreground"
                        onClick={() => handleToggleSliderStatus(banner)}
                      >
                        {banner.isActive ? (
                          <>
                            <EyeOff size={13} className="mr-1 text-yellow-500" /> অফ করুন
                          </>
                        ) : (
                          <>
                            <Eye size={13} className="mr-1 text-emerald-400" /> অন করুন
                          </>
                        )}
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-foreground/70 hover:text-foreground"
                          onClick={() => handleEditSlider(banner)}
                          title="এডিট"
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => handleDeleteSlider(banner.id)}
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
