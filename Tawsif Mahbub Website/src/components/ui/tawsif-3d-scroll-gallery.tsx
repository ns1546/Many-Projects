"use client";

import * as React from "react";
import {
  ContainerScroll,
  ContainerSticky,
  GalleryContainer,
  GalleryCol,
  ContainerAnimated,
} from "./container-scroll";
import { Badge } from "./badge";
import { Sparkles, Film, Award, Eye } from "lucide-react";

interface GalleryCardItem {
  id: string;
  title: string;
  category: string;
  image: string;
  year?: string;
}

const col1Items: GalleryCardItem[] = [
  {
    id: "c1",
    title: "Chuye Dilam Tomay",
    category: "2026 Romantic Release",
    image: "/assets/works/chuye_dilam_tomay.jpg",
    year: "2026",
  },
  {
    id: "c2",
    title: "Aponpor",
    category: "CMV Social Drama",
    image: "/assets/works/aponpor.jpg",
    year: "2026",
  },
  {
    id: "c3",
    title: "Amar Rajje Tumi",
    category: "Capital Drama Telefilm",
    image: "/assets/works/amar_rajje_tumi.jpg",
    year: "2026",
  },
];

const col2Items: GalleryCardItem[] = [
  {
    id: "c4",
    title: "Official Studio Portrait",
    category: "Bespoke Couture Study",
    image: "/assets/gallery/portrait_studio.jpg",
    year: "2024",
  },
  {
    id: "c5",
    title: "Bachelor Point Season 5",
    category: "Cult Television Phenomenon",
    image: "/assets/works/bachelor_point_s5.jpg",
    year: "2024–2026",
  },
  {
    id: "c6",
    title: "Warish",
    category: "Ensemble Drama",
    image: "/assets/works/warish.jpg",
    year: "2026",
  },
];

const col3Items: GalleryCardItem[] = [
  {
    id: "c7",
    title: "Chokro Season 2",
    category: "Psychological Thriller",
    image: "/assets/works/chokro_s2.jpg",
    year: "2025–2026",
  },
  {
    id: "c8",
    title: "Dorodia",
    category: "CMV Hit Romantic Special",
    image: "/assets/works/dorodia.jpg",
    year: "2026",
  },
  {
    id: "c9",
    title: "BIFA Best Actor Trophy",
    category: "National OTT Award Honor",
    image: "/assets/gallery/docx/11_tawsif_bifa_trophy.jpg",
    year: "2024",
  },
];

export interface Tawsif3DScrollGalleryProps {
  onSelectItem?: (item: GalleryCardItem) => void;
}

export default function Tawsif3DScrollGallery({ onSelectItem }: Tawsif3DScrollGalleryProps) {
  return (
    <section className="relative w-full bg-background/50 py-8 overflow-hidden border-b border-border/40">
      <ContainerScroll className="w-full">
        <ContainerSticky className="h-[95vh] flex flex-col justify-center items-center py-6">
          {/* Header Tag & Section Title */}
          <div className="text-center mb-6 z-10 px-4 max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-2 px-3 py-1 text-xs tracking-wider uppercase inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Interactive Visual Reel
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground uppercase">
              CINEMATIC HIGHLIGHTS REEL
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Scroll to explore key production posters, on-set stills, and studio portraits in dynamic motion.
            </p>
          </div>

          {/* 3D Tilted Perspective Canvas */}
          <div className="w-full max-w-5xl px-3 sm:px-6 h-[68vh] overflow-hidden flex items-center justify-center">
            <GalleryContainer className="w-full h-full max-h-[620px] shadow-2xl">
              {/* Column 1 */}
              <GalleryCol yRange={["0%", "-14%"]} className="gap-3">
                {col1Items.map((item) => (
                  <ContainerAnimated key={item.id} className="relative group">
                    <div 
                      onClick={() => onSelectItem?.(item)}
                      className="relative overflow-hidden rounded-xl bg-card border border-border/60 shadow-lg cursor-pointer transform transition-transform duration-300 group-hover:scale-[1.02]"
                    >
                      <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold block">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold truncate">{item.title}</h4>
                      </div>
                    </div>
                  </ContainerAnimated>
                ))}
              </GalleryCol>

              {/* Column 2 */}
              <GalleryCol yRange={["-8%", "8%"]} className="gap-3 pt-4">
                {col2Items.map((item) => (
                  <ContainerAnimated key={item.id} className="relative group">
                    <div 
                      onClick={() => onSelectItem?.(item)}
                      className="relative overflow-hidden rounded-xl bg-card border border-border/60 shadow-lg cursor-pointer transform transition-transform duration-300 group-hover:scale-[1.02]"
                    >
                      <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <span className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold block">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold truncate">{item.title}</h4>
                      </div>
                    </div>
                  </ContainerAnimated>
                ))}
              </GalleryCol>

              {/* Column 3 */}
              <GalleryCol yRange={["-14%", "-2%"]} className="gap-3">
                {col3Items.map((item) => (
                  <ContainerAnimated key={item.id} className="relative group">
                    <div 
                      onClick={() => onSelectItem?.(item)}
                      className="relative overflow-hidden rounded-xl bg-card border border-border/60 shadow-lg cursor-pointer transform transition-transform duration-300 group-hover:scale-[1.02]"
                    >
                      <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold block">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold truncate">{item.title}</h4>
                      </div>
                    </div>
                  </ContainerAnimated>
                ))}
              </GalleryCol>
            </GalleryContainer>
          </div>
        </ContainerSticky>
      </ContainerScroll>
    </section>
  );
}
