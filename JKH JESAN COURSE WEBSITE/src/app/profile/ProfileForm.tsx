"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProfileForm({ 
  initialName, 
  email, 
  initialPhone 
}: { 
  initialName: string, 
  email: string, 
  initialPhone: string 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: initialName, phone: initialPhone });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
        router.refresh();
      } else {
        toast.error(data.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      toast.error("সার্ভার ত্রুটি! কিছুক্ষণ পর আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-surface/5 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-border pb-6 mb-6 bg-surface">
        <CardTitle className="text-xl text-foreground font-black">ব্যক্তিগত তথ্য</CardTitle>
      </CardHeader>
      <CardContent>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground/80 font-bold">সম্পূর্ণ নাম</Label>
            <Input 
              id="name" 
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="h-12 border-border bg-surface focus-visible:ring-primary text-foreground font-medium"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground/80 font-bold">ইমেইল অ্যাড্রেস</Label>
            <Input 
              id="email" 
              value={email} 
              disabled
              className="h-12 border-border bg-surface/5 text-foreground/80 cursor-not-allowed font-medium"
            />
            <p className="text-xs text-foreground/80 font-bold">ইমেইল অ্যাড্রেস পরিবর্তন করা যাবে না।</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground/80 font-bold">মোবাইল নম্বর</Label>
            <Input 
              id="phone" 
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="h-12 border-border bg-surface focus-visible:ring-primary text-foreground font-medium placeholder:text-foreground/80"
              placeholder="01XXXXXXXXX"
            />
          </div>
          
          <Button type="submit" disabled={loading} className="h-12 px-8 font-bold bg-primary text-primary-foreground hover:bg-primary-dark shadow-md transition-all">
            {loading ? "অপেক্ষা করুন..." : "সেভ করুন"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
