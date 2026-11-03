"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, PlayCircle, BookOpen, Trash2, FileText, ChevronDown, ChevronUp, Edit, Upload, Link as LinkIcon, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export default function CourseEditor({ course }: { course: any }) {
  const router = useRouter();
  
  const [newModule, setNewModule] = useState({ title: "", description: "" });
  const [addingModule, setAddingModule] = useState(false);
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ title: "", description: "", videoUrl: "", duration: "", resources: "" });
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleData, setEditModuleData] = useState({ title: "", description: "" });
  const [isUpdatingModule, setIsUpdatingModule] = useState(false);

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonData, setEditLessonData] = useState({ title: "", description: "", videoUrl: "", duration: "", resources: "", isFree: false });
  const [isUpdatingLesson, setIsUpdatingLesson] = useState(false);
  
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(course.thumbnail || "");
  const [useThumbnailUrl, setUseThumbnailUrl] = useState(false);
  const [editCourseData, setEditCourseData] = useState({ 
    title: course.title, 
    description: course.description || "",
    price: course.price,
    discountPrice: course.discountPrice ?? "",
    thumbnail: course.thumbnail || "",
    introVideoUrl: course.introVideoUrl || "",
    duration: course.duration || "10+ Hours",
    level: course.level || "All Levels",
    accessType: course.accessType || "Lifetime"
  });
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);
    setUploadingThumbnail(true);
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      if (res.ok) {
        const { url } = await res.json();
        setEditCourseData((prev) => ({ ...prev, thumbnail: url }));
        toast.success("থাম্বনেইল সফলভাবে আপলোড হয়েছে");
      } else {
        toast.error("ইমেজ আপলোড ব্যর্থ হয়েছে। আপনি ইমেজ URL-ও পেস্ট করতে পারেন।");
      }
    } catch {
      toast.error("সার্ভার ত্রুটি");
    } finally {
      setUploadingThumbnail(false);
    }
  };
  
  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !course.published })
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingPublish(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে এই কোর্সটি ডিলিট করতে চান? এর ভিতরের সব মডিউল ও লেসন ডিলিট হয়ে যাবে।")) return;
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, { method: "DELETE" });
      if (res.ok) router.push("/admin/courses");
      else alert("কোর্স ডিলিট করতে সমস্যা হয়েছে।");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModule.title) return;
    setIsSubmittingModule(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newModule)
      });
      if (res.ok) {
        setNewModule({ title: "", description: "" });
        setAddingModule(false);
        router.refresh();
      } else {
        const errData = await res.json();
        alert(errData.message || "মডিউল তৈরি করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setIsSubmittingModule(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!newLesson.title) return;
    setIsSubmittingLesson(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLesson)
      });
      if (res.ok) {
        setNewLesson({ title: "", description: "", videoUrl: "", duration: "", resources: "" });
        setActiveModuleId(null);
        router.refresh();
      } else {
        const errData = await res.json();
        alert(errData.message || "লেসন তৈরি করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই মডিউলটি ডিলিট করতে চান? এর ভিতরের সব লেসন ডিলিট হয়ে যাবে।")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/modules/${moduleId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("মডিউল ডিলিট করতে সমস্যা হয়েছে।");
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে এই লেসনটি ডিলিট করতে চান?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/modules/${moduleId}/lessons/${lessonId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("লেসন ডিলিট করতে সমস্যা হয়েছে।");
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateModule = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!editModuleData.title) return;
    setIsUpdatingModule(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editModuleData)
      });
      if (res.ok) {
        setEditingModuleId(null);
        router.refresh();
      } else {
        const errData = await res.json();
        alert(errData.message || "মডিউল আপডেট করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setIsUpdatingModule(false);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent, moduleId: string, lessonId: string) => {
    e.preventDefault();
    if (!editLessonData.title) return;
    setIsUpdatingLesson(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}/modules/${moduleId}/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editLessonData)
      });
      if (res.ok) {
        setEditingLessonId(null);
        router.refresh();
      } else {
        const errData = await res.json();
        alert(errData.message || "লেসন আপডেট করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভার ত্রুটি।");
    } finally {
      setIsUpdatingLesson(false);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourseData.title) return;
    setIsUpdatingCourse(true);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editCourseData.title,
          description: editCourseData.description,
          price: Number(editCourseData.price),
          discountPrice: editCourseData.discountPrice ? Number(editCourseData.discountPrice) : null,
          thumbnail: editCourseData.thumbnail,
          introVideoUrl: editCourseData.introVideoUrl || null,
          duration: editCourseData.duration,
          level: editCourseData.level,
          accessType: editCourseData.accessType,
        })
      });
      if (res.ok) {
        setIsEditingCourse(false);
        toast.success("কোর্স সফলভাবে আপডেট হয়েছে!");
        router.refresh();
      } else {
        const errData = await res.json();
        toast.error(errData.message || "কোর্স আপডেট করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      toast.error("সার্ভার ত্রুটি।");
    } finally {
      setIsUpdatingCourse(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-accent">{course.title}</h1>
            {course.published ? (
              <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-md border border-primary/30">প্রকাশিত</span>
            ) : (
              <span className="bg-surface/10 text-foreground/80 text-xs font-bold px-2.5 py-1 rounded-md border border-border">ড্রাফট</span>
            )}
          </div>
          <p className="text-foreground/70 font-medium text-sm">কোর্সের বিবরণ, থাম্বনেইল, মডিউল এবং ক্লাসগুলো পরিচালনা করুন।</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleTogglePublish}
            disabled={isTogglingPublish}
            variant={course.published ? "outline" : "default"}
            className={course.published ? "border-border text-foreground/80 font-bold" : "bg-primary text-foreground font-bold hover:bg-primary/90"}
          >
            {isTogglingPublish ? "অপেক্ষা করুন..." : (course.published ? "আনপাবলিশ করুন" : "পাবলিশ করুন")}
          </Button>
          <Button 
            onClick={handleDeleteCourse}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold"
          >
            ডিলিট
          </Button>
        </div>
      </div>

      {/* Course Edit Form */}
      {isEditingCourse ? (
        <Card className="border-border bg-surface/5 backdrop-blur-md shadow-xl mb-8">
          <CardContent className="p-6 md:p-8">
            <h3 className="text-xl font-black mb-6 text-foreground border-b border-border pb-3">কোর্সের সার্বিক তথ্য সম্পাদনা</h3>
            <form onSubmit={handleUpdateCourse} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-foreground font-bold text-sm">কোর্সের নাম</Label>
                  <Input 
                    required 
                    value={editCourseData.title} 
                    onChange={(e) => setEditCourseData({...editCourseData, title: e.target.value})}
                    className="h-11 border-border bg-surface/50 text-foreground font-semibold focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-foreground font-bold text-sm">বিবরণ</Label>
                  <textarea 
                    rows={4}
                    value={editCourseData.description} 
                    onChange={(e) => setEditCourseData({...editCourseData, description: e.target.value})}
                    className="flex w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary leading-relaxed font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-bold text-sm">মূল মূল্য (৳ Regular)</Label>
                  <Input 
                    type="number"
                    required 
                    value={editCourseData.price} 
                    onChange={(e) => setEditCourseData({...editCourseData, price: Number(e.target.value)})}
                    className="h-11 border-border bg-surface/50 text-foreground font-mono font-bold focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-bold text-sm">ছাড় মূল্য (৳ Discount - ঐচ্ছিক)</Label>
                  <Input 
                    type="number"
                    value={editCourseData.discountPrice} 
                    onChange={(e) => setEditCourseData({...editCourseData, discountPrice: e.target.value})}
                    placeholder="e.g. 1000"
                    className="h-11 border-border bg-surface/50 text-foreground font-mono font-bold focus-visible:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-bold text-sm">কোর্সের মোট সময়</Label>
                  <Input 
                    value={editCourseData.duration} 
                    onChange={(e) => setEditCourseData({...editCourseData, duration: e.target.value})}
                    placeholder="e.g. 12+ Hours"
                    className="h-11 border-border bg-surface/50 text-foreground font-medium text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground font-bold text-sm">কোর্স লেভেল</Label>
                  <select
                    value={editCourseData.level}
                    onChange={(e) => setEditCourseData({...editCourseData, level: e.target.value})}
                    className="w-full h-11 border border-border bg-surface/50 rounded-xl px-3 text-sm text-foreground focus:outline-none"
                  >
                    <option value="Beginner" className="bg-surface text-foreground">Beginner</option>
                    <option value="Intermediate" className="bg-surface text-foreground">Intermediate</option>
                    <option value="Advanced" className="bg-surface text-foreground">Advanced</option>
                    <option value="All Levels" className="bg-surface text-foreground">All Levels</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-foreground font-bold text-sm">ইন্ট্রো বা ট্রেলার ভিডিও URL (YouTube/Vimeo/MP4)</Label>
                  <Input 
                    value={editCourseData.introVideoUrl} 
                    onChange={(e) => setEditCourseData({...editCourseData, introVideoUrl: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                    className="h-11 border-border bg-surface/50 text-foreground font-mono text-sm focus-visible:ring-primary"
                  />
                </div>

                {/* Thumbnail upload & URL */}
                <div className="space-y-3 md:col-span-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground font-bold text-sm">কোর্স থাম্বনেইল (Poster)</Label>
                    <button
                      type="button"
                      onClick={() => setUseThumbnailUrl(!useThumbnailUrl)}
                      className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      {useThumbnailUrl ? <Upload size={12} /> : <LinkIcon size={12} />}
                      {useThumbnailUrl ? "ফাইল আপলোড করুন" : "সরাসরি ইমেজ URL ব্যবহার করুন"}
                    </button>
                  </div>

                  {useThumbnailUrl ? (
                    <Input
                      placeholder="https://images.unsplash.com/... বা ইমেজ URL"
                      value={editCourseData.thumbnail}
                      onChange={(e) => {
                        setEditCourseData({...editCourseData, thumbnail: e.target.value});
                        setThumbnailPreview(e.target.value);
                      }}
                      className="h-11 border-border bg-surface/50 text-foreground font-mono text-sm"
                    />
                  ) : (
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="h-11 border-border bg-surface/50 text-foreground file:text-primary file:font-bold file:bg-primary/10 file:border-0 file:mr-4 file:h-full file:px-4 cursor-pointer text-sm"
                    />
                  )}

                  {(thumbnailPreview || editCourseData.thumbnail) && (
                    <div className="relative w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-border shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnailPreview || editCourseData.thumbnail}
                        alt="Course Poster"
                        className="w-full h-full object-cover"
                        onError={() => setThumbnailPreview("")}
                      />
                      {uploadingThumbnail && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsEditingCourse(false)} className="text-foreground/70 font-bold">
                  বাতিল
                </Button>
                <Button type="submit" disabled={isUpdatingCourse || uploadingThumbnail} className="bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                  {isUpdatingCourse ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" /> আপডেট হচ্ছে...
                    </>
                  ) : (
                    "সব তথ্য সংরক্ষণ করুন"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setIsEditingCourse(true)}
            variant="outline"
            className="border-border text-foreground font-bold hover:bg-surface/10"
          >
            <Edit size={16} className="mr-2 text-primary" />
            কোর্সের বিস্তারিত ও থাম্বনেইল সম্পাদনা
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {course.modules.map((module: any, idx: number) => (
          <Card key={module.id} className="border-border bg-surface shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                {editingModuleId === module.id ? (
                  <form onSubmit={(e) => handleUpdateModule(e, module.id)} className="w-full space-y-4">
                    <div className="space-y-2">
                      <Label className="text-foreground/80 font-bold">মডিউলের নাম</Label>
                      <Input 
                        required 
                        value={editModuleData.title} 
                        onChange={(e) => setEditModuleData({...editModuleData, title: e.target.value})}
                        className="h-10 border-border bg-muted/50 text-foreground font-medium focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground/80 font-bold">বিবরণ / বিস্তারিত (ঐচ্ছিক)</Label>
                      <textarea 
                        value={editModuleData.description} 
                        onChange={(e) => setEditModuleData({...editModuleData, description: e.target.value})}
                        className="flex min-h-20 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setEditingModuleId(null)} className="text-foreground/70 font-bold">
                        বাতিল
                      </Button>
                      <Button type="submit" disabled={isUpdatingModule} className="bg-primary font-bold text-foreground hover:bg-primary/90">
                        {isUpdatingModule ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <h3 className="text-xl font-extrabold text-accent flex items-center gap-2">
                        <BookOpen size={20} className="text-primary" />
                        মডিউল {idx + 1}: {module.title}
                      </h3>
                      {module.description && <p className="text-foreground/60 text-sm mt-1 font-medium">{module.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => {
                          setEditModuleData({ title: module.title, description: module.description || "" });
                          setEditingModuleId(module.id);
                        }}
                        variant="outline"
                        className="border-border text-foreground/80 hover:bg-muted h-9 w-9 p-0"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button 
                        onClick={() => setActiveModuleId(activeModuleId === module.id ? null : module.id)}
                        variant="outline"
                        className="border-border text-foreground/80 hover:bg-muted h-9 text-xs font-bold"
                      >
                        <PlusCircle size={14} className="mr-2" /> লেসন যোগ করুন
                      </Button>
                      <Button 
                        onClick={() => handleDeleteModule(module.id)}
                        variant="outline"
                        disabled={isDeleting}
                        className="border-border text-red-600 hover:text-red-700 hover:bg-red-50 h-9 w-9 p-0"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Add Lesson Form */}
              {activeModuleId === module.id && (
                <div className="mb-6 p-4 rounded-xl border border-border bg-muted/30">
                  <form onSubmit={(e) => handleAddLesson(e, module.id)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-foreground/80 font-bold">লেসনের নাম</Label>
                        <Input 
                          required 
                          value={newLesson.title} 
                          onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                          className="h-10 border-border bg-surface text-foreground font-medium focus-visible:ring-primary"
                          placeholder="যেমন: লেকচার ১ - বেসিক ধারণা"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-foreground/80 font-bold">বিস্তারিত বিবরণ (ঐচ্ছিক)</Label>
                        <textarea 
                          value={newLesson.description} 
                          onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                          className="flex min-h-20 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                          placeholder="এই লেসনে কী শেখানো হবে তা বিস্তারিত লিখুন..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground/80 font-bold">ভিডিও URL</Label>
                        <Input 
                          value={newLesson.videoUrl} 
                          onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                          className="h-10 border-border bg-surface text-foreground font-medium focus-visible:ring-primary"
                          placeholder="https://vimeo.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground/80 font-bold">সময়কাল (Duration)</Label>
                        <Input 
                          value={newLesson.duration} 
                          onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                          className="h-10 border-border bg-surface text-foreground font-medium focus-visible:ring-primary"
                          placeholder="10:30"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-foreground/80 font-bold flex items-center gap-2">
                          <FileText size={16} className="text-primary" /> PDF / ডাউনলোড লিংক (ঐচ্ছিক)
                        </Label>
                        <Input 
                          value={newLesson.resources} 
                          onChange={(e) => setNewLesson({...newLesson, resources: e.target.value})}
                          className="h-10 border-border bg-surface text-foreground font-medium focus-visible:ring-primary"
                          placeholder="Google Drive PDF link বা অন্য কোনো লিংক"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="ghost" onClick={() => setActiveModuleId(null)} className="text-foreground/70 hover:text-foreground font-bold">
                        বাতিল
                      </Button>
                      <Button type="submit" disabled={isSubmittingLesson} className="bg-primary font-bold text-foreground hover:bg-primary/90">
                        {isSubmittingLesson ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lessons List */}
              <div className="space-y-2">
                {module.lessons.map((lesson: any, lIdx: number) => (
                    <div key={lesson.id} className="flex items-start justify-between p-4 rounded-xl bg-surface/50 border border-border hover:border-primary/40 transition-all group">
                      <div className="flex items-start gap-3 w-full">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                          <PlayCircle size={16} />
                        </div>
                        <div className="w-full">
                          {editingLessonId === lesson.id ? (
                            <form onSubmit={(e) => handleUpdateLesson(e, module.id, lesson.id)} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-foreground/80 font-bold">লেসনের নাম</Label>
                                  <Input 
                                    required 
                                    value={editLessonData.title} 
                                    onChange={(e) => setEditLessonData({...editLessonData, title: e.target.value})}
                                    className="h-10 border-border bg-surface text-foreground font-medium focus-visible:ring-primary"
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-foreground/80 font-bold">বিস্তারিত বিবরণ (ঐচ্ছিক)</Label>
                                  <textarea 
                                    value={editLessonData.description} 
                                    onChange={(e) => setEditLessonData({...editLessonData, description: e.target.value})}
                                    className="flex min-h-20 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-foreground/80 font-bold">ভিডিও URL</Label>
                                  <Input 
                                    value={editLessonData.videoUrl} 
                                    onChange={(e) => setEditLessonData({...editLessonData, videoUrl: e.target.value})}
                                    className="h-10 border-border bg-surface text-foreground font-medium focus-visible:ring-primary"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-foreground/80 font-bold">সময়কাল (Duration)</Label>
                                  <Input 
                                    value={editLessonData.duration} 
                                    onChange={(e) => setEditLessonData({...editLessonData, duration: e.target.value})}
                                    className="h-10 border-border bg-surface text-foreground font-medium focus-visible:ring-primary"
                                  />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                  <Label className="text-foreground/80 font-bold flex items-center gap-2">
                                    <FileText size={16} className="text-primary" /> PDF / ডাউনলোড লিংক (ঐচ্ছিক)
                                  </Label>
                                  <Input 
                                    value={editLessonData.resources} 
                                    onChange={(e) => setEditLessonData({...editLessonData, resources: e.target.value})}
                                    className="h-10 border-border bg-surface text-foreground font-medium focus-visible:ring-primary"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setEditingLessonId(null)} className="text-foreground/70 font-bold">
                                  বাতিল
                                </Button>
                                <Button type="submit" disabled={isUpdatingLesson} className="bg-primary font-bold text-foreground hover:bg-primary/90">
                                  {isUpdatingLesson ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex justify-between items-start w-full">
                                <div>
                                  <div className="text-sm font-black text-accent">{lIdx + 1}. {lesson.title}</div>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    {lesson.duration && (
                                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted/60 text-foreground/60 border border-border">
                                        {lesson.duration}
                                      </span>
                                    )}
                                    {lesson.resources && (
                                      <span className="flex items-center gap-1 text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                        <FileText size={10} /> PDF/Resource
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setEditLessonData({
                                        title: lesson.title,
                                        description: lesson.description || "",
                                        videoUrl: lesson.videoUrl || "",
                                        duration: lesson.duration || "",
                                        resources: lesson.resources || "",
                                        isFree: lesson.isFree || false
                                      });
                                      setEditingLessonId(lesson.id);
                                    }}
                                    className="text-foreground/40 hover:text-primary transition-colors p-2 shrink-0"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                    disabled={isDeleting}
                                    className="text-foreground/40 hover:text-red-600 transition-colors p-2 shrink-0"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              {lesson.description && (
                                <p className="text-xs text-foreground/70 mt-3 font-medium bg-muted/30 p-2.5 rounded border border-border leading-relaxed">
                                  {lesson.description}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                ))}
                {module.lessons.length === 0 && (
                  <div className="text-center py-6 text-foreground/40 text-sm font-bold">
                    কোনো লেসন যোগ করা হয়নি
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {course.modules.length === 0 && !addingModule && (
          <div className="text-center py-12 bg-surface border border-border rounded-2xl shadow-sm">
            <BookOpen size={40} className="mx-auto mb-4 text-foreground/20" />
            <h4 className="text-xl font-extrabold mb-2 text-accent">কোনো মডিউল নেই</h4>
            <p className="text-foreground/60 mb-6 font-medium">কোর্সের জন্য নতুন মডিউল তৈরি করুন।</p>
          </div>
        )}

        {/* Add Module Form */}
        {addingModule ? (
          <Card className="border-primary/30 bg-surface shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-extrabold text-accent mb-4">নতুন মডিউল</h3>
              <form onSubmit={handleAddModule} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-bold">মডিউলের নাম</Label>
                  <Input 
                    required 
                    value={newModule.title} 
                    onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                    className="h-10 border-border bg-muted/50 text-foreground font-medium focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-bold">বিবরণ / বিস্তারিত (ঐচ্ছিক)</Label>
                  <textarea 
                    value={newModule.description} 
                    onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                    className="flex min-h-25 w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                    placeholder="এই মডিউলে কী কী পড়ানো হবে বা কী কী ফাইল থাকবে তার বিস্তারিত লিখতে পারেন..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setAddingModule(false)} className="text-foreground/70 hover:text-foreground font-bold">
                    বাতিল
                  </Button>
                  <Button type="submit" disabled={isSubmittingModule} className="bg-primary font-bold text-foreground hover:bg-primary/90">
                    {isSubmittingModule ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Button 
            onClick={() => setAddingModule(true)}
            className="w-full py-8 border-2 border-dashed border-border hover:border-primary/50 bg-surface hover:bg-muted text-foreground/70 hover:text-foreground transition-all font-bold rounded-2xl"
          >
            <PlusCircle size={20} className="mr-2" /> নতুন মডিউল যোগ করুন
          </Button>
        )}
      </div>
    </div>
  );
}
