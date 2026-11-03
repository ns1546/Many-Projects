"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Upload, Link as LinkIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateCoursePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    discountPrice: "",
    duration: "10+ Hours",
    level: "All Levels",
    accessType: "Lifetime",
    thumbnail: "",
    introVideoUrl: "",
    published: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [useUrlForImage, setUseUrlForImage] = useState(false);

  const generateSlug = (title: string) => {
    const latin = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (latin.length >= 3) return latin;
    // Fallback if title is Bangla or non-latin
    return `course-${Date.now().toString().slice(-6)}`;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const currentSlug = formData.slug;
    // Auto-fill slug only if user hasn't typed a custom slug or it's empty
    if (!currentSlug || currentSlug.startsWith("course-")) {
      setFormData((prev) => ({ ...prev, title, slug: generateSlug(title) }));
    } else {
      setFormData((prev) => ({ ...prev, title }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
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
        setFormData((prev) => ({ ...prev, thumbnail: url }));
        toast.success("থাম্বনেইল সফলভাবে আপলোড হয়েছে");
      } else {
        toast.error("ইমেজ আপলোডে সমস্যা হয়েছে। সরাসরি ইমেজ লিঙ্কও দিতে পারেন।");
      }
    } catch (err) {
      console.error(err);
      toast.error("সার্ভার ত্রুটি ইমেজ আপলোডে।");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || formData.slug.trim().length < 3) {
      toast.error("স্লাগ কমপক্ষে ৩ অক্ষরের হতে হবে (যেমন: vocal-mixing)");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("কোর্স সফলভাবে তৈরি হয়েছে!");
        router.push(`/admin/courses/${data.course.id}`);
        router.refresh();
      } else {
        toast.error(data.message || "কোর্স তৈরিতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      toast.error("সার্ভার ত্রুটি।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <BookOpen className="text-primary" size={32} />
          নতুন কোর্স তৈরি করুন
        </h1>
        <p className="text-foreground/75 mt-1 font-medium text-sm">
          কোর্সের প্রাথমিক তথ্য, মূল্য এবং থাম্বনেইল সেট করে সংরক্ষণ করুন। পরবর্তীতে মডিউল ও ক্লাস যুক্ত করা যাবে।
        </p>
      </div>

      <Card className="border-border bg-surface/5 backdrop-blur-md shadow-xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground font-bold text-sm">
                কোর্সের নাম <span className="text-primary">*</span>
              </Label>
              <Input
                id="title"
                required
                placeholder="যেমন: Vocal Processing Masterclass"
                value={formData.title}
                onChange={handleTitleChange}
                className="h-12 border-border bg-surface/50 text-foreground font-semibold focus-visible:ring-primary"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug" className="text-foreground font-bold text-sm">
                  কোর্স স্লাগ (URL Path) <span className="text-primary">*</span>
                </Label>
                <span className="text-xs text-foreground/60 font-mono">
                  URL: /courses/{formData.slug || "slug-here"}
                </span>
              </div>
              <Input
                id="slug"
                required
                placeholder="যেমন: vocal-processing-masterclass"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
                  })
                }
                className="h-12 border-border bg-surface/50 text-foreground font-mono focus-visible:ring-primary text-sm"
              />
              <p className="text-[11px] text-foreground/60">
                ইংরেজি ছোট হাতের অক্ষর এবং হাইফেন (-) ব্যবহার করুন। বাংলায় টাইটেল দিলে এটি অটো-ফিল হবে, যা আপনি ইচ্ছেমতো এডিট করতে পারবেন।
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-bold text-sm">
                কোর্সের বিবরণ ও উদ্দেশ্য
              </Label>
              <textarea
                id="description"
                rows={4}
                className="w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary placeholder:text-foreground/40 font-medium leading-relaxed"
                placeholder="এই কোর্সে শিক্ষার্থীরা কী কী শিখবে..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-foreground font-bold text-sm">
                  মূল মূল্য (৳ Regular Price) <span className="text-primary">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  required
                  placeholder="2000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-12 border-border bg-surface/50 text-foreground font-mono font-bold focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice" className="text-foreground font-bold text-sm">
                  ছাড় মূল্য (৳ Discount Price - ঐচ্ছিক)
                </Label>
                <Input
                  id="discountPrice"
                  type="number"
                  placeholder="1000"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  className="h-12 border-border bg-surface/50 text-foreground font-mono font-bold focus-visible:ring-primary"
                />
              </div>
            </div>

            {/* Duration & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-foreground font-bold text-sm">
                  কোর্সের দৈর্ঘ্য
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g. 15+ Hours"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="h-11 border-border bg-surface/50 text-foreground font-medium text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level" className="text-foreground font-bold text-sm">
                  লেভেল
                </Label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full h-11 border border-border bg-surface/50 rounded-md px-3 text-sm text-foreground focus:outline-none"
                >
                  <option value="Beginner" className="bg-surface text-foreground">Beginner</option>
                  <option value="Intermediate" className="bg-surface text-foreground">Intermediate</option>
                  <option value="Advanced" className="bg-surface text-foreground">Advanced</option>
                  <option value="All Levels" className="bg-surface text-foreground">All Levels</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessType" className="text-foreground font-bold text-sm">
                  অ্যাক্সেস মেয়াদ
                </Label>
                <select
                  id="accessType"
                  value={formData.accessType}
                  onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                  className="w-full h-11 border border-border bg-surface/50 rounded-md px-3 text-sm text-foreground focus:outline-none"
                >
                  <option value="Lifetime" className="bg-surface text-foreground">Lifetime</option>
                  <option value="1 Year" className="bg-surface text-foreground">1 Year</option>
                  <option value="6 Months" className="bg-surface text-foreground">6 Months</option>
                </select>
              </div>
            </div>

            {/* Thumbnail Upload or URL */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-bold text-sm">
                  কোর্স থাম্বনেইল (Poster / Cover)
                </Label>
                <button
                  type="button"
                  onClick={() => setUseUrlForImage(!useUrlForImage)}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  {useUrlForImage ? <Upload size={12} /> : <LinkIcon size={12} />}
                  {useUrlForImage ? "ফাইল আপলোড করুন" : "ইমেজ URL ব্যবহার করুন"}
                </button>
              </div>

              {useUrlForImage ? (
                <Input
                  placeholder="https://images.unsplash.com/... বা ক্লাউড ইমেজ URL"
                  value={formData.thumbnail}
                  onChange={(e) => {
                    setFormData({ ...formData, thumbnail: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className="h-11 border-border bg-surface/50 text-foreground font-mono text-sm"
                />
              ) : (
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="h-11 border-border bg-surface/50 text-foreground file:text-primary file:font-bold file:bg-primary/10 file:border-0 file:mr-4 file:h-full file:px-4 cursor-pointer text-sm"
                />
              )}

              {/* Preview */}
              {(imagePreview || formData.thumbnail) && (
                <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden border border-border shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview || formData.thumbnail}
                    alt="Course Preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview("")}
                  />
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Intro Video URL */}
            <div className="space-y-2">
              <Label htmlFor="introVideoUrl" className="text-foreground font-bold text-sm">
                ট্রেলার বা ইন্ট্রো ভিডিও URL (ঐচ্ছিক)
              </Label>
              <Input
                id="introVideoUrl"
                placeholder="https://youtube.com/watch?v=... বা Vimeo / MP4"
                value={formData.introVideoUrl}
                onChange={(e) => setFormData({ ...formData, introVideoUrl: e.target.value })}
                className="h-11 border-border bg-surface/50 text-foreground font-medium text-sm"
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-3 p-4 bg-surface/30 border border-border rounded-xl">
              <input
                type="checkbox"
                id="published"
                className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary cursor-pointer"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              <Label htmlFor="published" className="text-foreground font-bold text-sm cursor-pointer">
                সরাসরি পাবলিশ করুন (পাবলিকলি দৃশ্যমান হবে)
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="w-full h-12 bg-primary text-primary-foreground font-black text-base shadow-lg hover:bg-primary/90 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" /> তৈরি হচ্ছে...
                </>
              ) : (
                "কোর্স তৈরি করুন ও কন্টেন্ট সাজান"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
