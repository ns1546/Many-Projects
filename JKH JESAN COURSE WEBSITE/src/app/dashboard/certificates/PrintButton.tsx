"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PrintButton() {
  return (
    <Button 
      onClick={() => window.print()} 
      className="font-bold bg-primary text-foreground hover:bg-primary/90 h-12 px-8 rounded-xl shadow-md"
    >
      <Download className="mr-2" size={18} />
      সার্টিফিকেট ডাউনলোড করুন
    </Button>
  );
}
