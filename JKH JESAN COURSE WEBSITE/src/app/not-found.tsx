import Link from "next/link";
import { BookOpen, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center select-none font-sans">
      <div className="max-w-md w-full bg-surface/5 border border-border backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto font-black text-2xl font-mono">
          404
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            পেজটি খুঁজে পাওয়া যায়নি
          </h2>
          <p className="text-sm text-foreground/70 font-medium leading-relaxed">
            আপনি যে পেজ বা কোর্সটি খুঁজছেন তা সরানো হয়েছে অথবা লিংকটি ভুল।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/courses">
            <Button className="bg-primary text-primary-foreground font-black text-sm h-11 px-5 hover:bg-primary/90 w-full flex items-center justify-center gap-2">
              <BookOpen size={15} />
              সব কোর্স দেখুন
            </Button>
          </Link>

          <Link href="/">
            <Button
              variant="outline"
              className="border-border text-foreground font-bold text-sm h-11 px-5 hover:bg-surface/10 w-full flex items-center justify-center gap-2"
            >
              <Home size={15} />
              হোমপেজে ফিরুন
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
