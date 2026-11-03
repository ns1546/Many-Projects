"use client";

import { motion } from "motion/react";
import MagneticButton from "./MagneticButton";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference text-white"
    >
      <MagneticButton>
        <div className="font-sans font-bold text-xl tracking-tighter uppercase group flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full group-hover:scale-150 transition-transform duration-500" />
          VISION
        </div>
      </MagneticButton>

      <div className="hidden md:flex gap-12 font-mono text-[10px] tracking-widest uppercase">
        <MagneticButton><span className="hover:text-white/50 transition-colors">Manifesto</span></MagneticButton>
        <MagneticButton><span className="hover:text-white/50 transition-colors">Engineering</span></MagneticButton>
        <MagneticButton><span className="hover:text-white/50 transition-colors">Design</span></MagneticButton>
      </div>

      <MagneticButton>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-widest uppercase hidden sm:block">Menu</span>
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-500">
            <Menu size={16} />
          </div>
        </div>
      </MagneticButton>
    </motion.nav>
  );
}
