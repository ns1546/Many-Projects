"use client";

import { usePathname } from "next/navigation";
import { IconBrandWhatsapp } from "@tabler/icons-react";

interface WhatsAppSupportButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppSupportButton({
  phoneNumber = "01607084155",
  defaultMessage = "Hello EvoRise Media, I need support regarding your courses.",
}: WhatsAppSupportButtonProps) {
  const pathname = usePathname();

  // Hide in admin dashboard to keep management interface clean
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const cleanNumber = (phoneNumber || "01607084155").replace(/[^0-9]/g, "").replace(/^88/, "");
  const whatsappUrl = `https://wa.me/88${cleanNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-[5.5rem] right-3.5 sm:bottom-6 sm:right-6 z-40 select-none">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Support"
        title="WhatsApp Support"
        className="group relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.4),0_2px_6px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_22px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300"
      >
        {/* Pulsing online indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white border-2 border-[#25D366]" />
        </span>

        {/* Crisp WhatsApp Icon */}
        <IconBrandWhatsapp size={20} strokeWidth={2.2} className="text-white drop-shadow-xs sm:hidden" />
        <IconBrandWhatsapp size={26} strokeWidth={2.2} className="text-white drop-shadow-xs hidden sm:block" />
      </a>
    </aside>
  );
}

export default WhatsAppSupportButton;
