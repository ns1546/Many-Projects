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
    title: "Bachelor Point",
    category: "Pop Culture Phenomenon",
    image: "/assets/works/bachelor_point.jpg",
    year: "2018-2024",
  },
  {
    id: "c2",
    title: "Chokro Thriller",
    category: "Character Study",
    image: "/assets/works/chokro_thriller.jpg",
    year: "2023",
  },
  {
    id: "c3",
    title: "Love Sab",
    category: "Meril-Prothom Alo Winner",
    image: "/assets/works/love_sab.jpg",
    year: "2021",
  },
];

const col2Items: GalleryCardItem[] = [
  {
    id: "c4",
    title: "Official Monograph Portrait",
    category: "Studio Editorial",
    image: "/assets/gallery/portrait_studio.jpg",
    year: "2026",
  },
  {
    id: "c5",
    title: "Dhaka Metro",
    category: "Hoichoi Original Series",
    image: "/assets/works/dhaka_metro.jpg",
    year: "2019",
  },
  {
    id: "c6",
    title: "Mayer Daak",
    category: "Family Drama",
    image: "/assets/works/mayer_daak.jpg",
    year: "2021",
  },
];

const col3Items: GalleryCardItem[] = [
  {
    id: "c7",
    title: "Bicycle Prem",
    category: "Classic Telefilm",
    image: "/assets/works/bicycle_prem.jpg",
    year: "2017",
  },
  {
    id: "c8",
    title: "Batpar Company",
    category: "Youth Comedy",
    image: "/assets/works/batpar_company.jpg",
    year: "2022",
  },
  {
    id: "c9",
    title: "Shukhi Attma",
    category: "Psychological Thriller",
    image: "/assets/works/shukhi_attma.jpg",
    year: "2022",
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
              Interactive 3D Perspective Archive
            </Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground uppercase">
              CINEMATIC VISUAL REPERTOIRE
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
              Scroll down to unfold Tawsif Mahbub’s iconic roles, on-set stills, and studio monographs in fluid 3D spatial motion.
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
