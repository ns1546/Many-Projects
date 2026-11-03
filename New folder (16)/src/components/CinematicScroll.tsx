"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";
import CustomCursor from "./CustomCursor";

const TOTAL_FRAMES = 1440;
const FRAME_PREFIX = "frame_";

export default function CinematicScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const isLoaded = loadedCount >= TOTAL_FRAMES;
  const hasStartedLoading = useRef(false);

  useEffect(() => {
    if (hasStartedLoading.current) return;
    hasStartedLoading.current = true;

    let count = 0;
    const imgArray: HTMLImageElement[] = [];

    const preloadAll = () => {
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameNumber = i.toString().padStart(4, "0");
        img.src = `/frames/${FRAME_PREFIX}${frameNumber}.jpg`;
        img.onload = () => setLoadedCount((prev) => prev + 1);
        img.onerror = () => setLoadedCount((prev) => prev + 1); // Skip broken frames gracefully
        imgArray.push(img);
      }
      setImages(imgArray);
    }
    
    preloadAll();
  }, []);

  useEffect(() => {
    if (!isLoaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderFrame = (index: number) => {
      if (!images[index]) return;
      const img = images[index];
      
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
    };

    renderFrame(0);

    const handleResize = () => {
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(scrollYProgress.get() * TOTAL_FRAMES));
      renderFrame(frameIndex);
    };
    
    window.addEventListener("resize", handleResize);

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.floor(latest * TOTAL_FRAMES));
      requestAnimationFrame(() => renderFrame(frameIndex));
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      unsubscribe();
    };
  }, [isLoaded, images, scrollYProgress]);

  // Transform Values for dynamic UI
  const progressPercent = useTransform(scrollYProgress, (v) => (v * 100).toFixed(1));
  const technicalReadout = useMotionTemplate`SYS.VER // 2.0.4 | POS: [${progressPercent}%] | TGT: LOCK`;

  // Overlay Animations
  const heroOpacity = useTransform(scrollYProgress, [0, 0.05, 0.15], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  const feature1Opacity = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]);
  const feature1Y = useTransform(scrollYProgress, [0.2, 0.25], [50, 0]);

  const feature2Opacity = useTransform(scrollYProgress, [0.5, 0.55, 0.65, 0.7], [0, 1, 1, 0]);
  const feature2Y = useTransform(scrollYProgress, [0.5, 0.55], [50, 0]);

  const ctaOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.85, 0.95], [50, 0]);

  return (
    <div ref={containerRef} className="relative w-full h-[600vh] bg-[#050505] cursor-none">
      <CustomCursor />
      
      {/* Preloader */}
      {!isLoaded && (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-[#050505] text-white">
          <div className="w-12 h-12 border-t-2 border-white/80 rounded-full animate-spin mb-8" />
          <p className="text-xs tracking-[0.3em] text-white/50 uppercase font-mono">
            ASSEMBLING SCENE... {Math.min(100, Math.floor((loadedCount / TOTAL_FRAMES) * 100))}%
          </p>
          <div className="w-64 h-[1px] bg-white/10 mt-6 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-white transition-all duration-300" 
              style={{ width: `${Math.min(100, (loadedCount / TOTAL_FRAMES) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Sticky Canvas Container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#050505]">
        
        {/* The Frame Sequence */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
        
        {/* Technical Blueprint Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '100px 100px' }} 
        />
        
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* --- UI LAYER --- */}
        <div className="absolute inset-0 z-50 flex flex-col justify-between pointer-events-none p-6 md:p-12">
          
          {/* Top Header */}
          <header className="w-full flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-white font-semibold tracking-widest text-lg">VISION</span>
              <span className="text-white/40 text-[10px] font-mono tracking-widest mt-1">ARCHITECTURAL PREVIEW</span>
            </div>
            
            <nav className="hidden md:flex gap-8 pointer-events-auto">
              <button className="text-white/60 hover:text-white text-xs tracking-[0.2em] uppercase transition-colors">Design</button>
              <button className="text-white/60 hover:text-white text-xs tracking-[0.2em] uppercase transition-colors">Engineering</button>
              <button className="text-white/60 hover:text-white text-xs tracking-[0.2em] uppercase transition-colors">Materials</button>
            </nav>
            
            <button className="pointer-events-auto border border-white/20 px-6 py-2 rounded-full text-white text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all">
              Initiate
            </button>
          </header>

          {/* Bottom Footer / Status Bar */}
          <footer className="w-full flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-white/40 text-[10px] font-mono tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE STREAM
              </span>
              <motion.span className="text-white/70 text-[10px] font-mono tracking-widest uppercase">
                {technicalReadout}
              </motion.span>
            </div>
            
            <div className="text-right flex flex-col gap-1">
              <span className="text-white/40 text-[10px] font-mono tracking-widest">COORDINATES</span>
              <span className="text-white/70 text-[10px] font-mono tracking-widest">34°03'08.2"N 118°15'11.1"W</span>
            </div>
          </footer>
        </div>

        {/* --- SCROLL-SYNCED NARRATIVE OVERLAYS --- */}
        <div className="absolute inset-0 p-8 md:p-24 pointer-events-none flex flex-col justify-center">
          
          {/* 0% Scroll: Hero */}
          <motion.div style={{ opacity: heroOpacity, y: heroY }} className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-white/90 text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-center max-w-5xl leading-[1.1]">
              A masterpiece of <br /> <span className="text-white/40">architecture.</span>
            </h1>
            <p className="mt-8 text-white/50 max-w-lg text-center text-sm md:text-base font-light leading-relaxed">
              Scroll down to deconstruct the geometry. Every layer reveals an uncompromising dedication to material and form.
            </p>
          </motion.div>

          {/* 30% Scroll: Feature 1 */}
          <motion.div style={{ opacity: feature1Opacity, y: feature1Y }} className="absolute left-[8%] md:left-[12%] top-[40%] max-w-lg">
            <h2 className="text-white/90 text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6 leading-tight">
              Precision in every component.
            </h2>
            <p className="text-white/50 text-base font-light leading-relaxed mb-10">
              Watch as the intricate geometry separates, revealing the flawless logic beneath the surface. Each element is calculated to exact tolerances.
            </p>
            
            <div className="flex gap-10">
              <div className="flex flex-col">
                <span className="text-white/80 font-mono text-lg">0.001mm</span>
                <span className="text-white/40 font-mono text-[10px] tracking-widest mt-2 uppercase">Tolerance</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/80 font-mono text-lg">450Nm</span>
                <span className="text-white/40 font-mono text-[10px] tracking-widest mt-2 uppercase">Torque Rating</span>
              </div>
            </div>
          </motion.div>

          {/* 60% Scroll: Feature 2 */}
          <motion.div style={{ opacity: feature2Opacity, y: feature2Y }} className="absolute right-[8%] md:right-[12%] top-[40%] max-w-lg text-right">
            <h2 className="text-white/90 text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight mb-6 leading-tight">
              Uncompromising materials.
            </h2>
            <p className="text-white/50 text-base font-light leading-relaxed mb-10 ml-auto">
              Glass, steel, and light woven into an unprecedented structural equilibrium. We bypassed industry standards to engineer custom alloys.
            </p>

            <div className="flex gap-10 justify-end">
              <div className="flex flex-col items-end">
                <span className="text-white/80 font-mono text-lg">TITANIUM</span>
                <span className="text-white/40 font-mono text-[10px] tracking-widest mt-2 uppercase">Core Chassis</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white/80 font-mono text-lg">4000K</span>
                <span className="text-white/40 font-mono text-[10px] tracking-widest mt-2 uppercase">Thermal Limit</span>
              </div>
            </div>
          </motion.div>

          {/* 90% Scroll: CTA */}
          <motion.div style={{ opacity: ctaOpacity, y: ctaY }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
            <h2 className="text-white/90 text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-12 text-center leading-tight">
              The vision <span className="text-white/40">realized.</span>
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <button className="px-12 py-4 bg-white text-black rounded-full font-medium uppercase tracking-widest text-xs hover:scale-105 hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                Pre-order Now
              </button>
              <button className="px-12 py-4 border border-white/20 text-white/80 rounded-full font-medium uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all">
                View Full Specs
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
