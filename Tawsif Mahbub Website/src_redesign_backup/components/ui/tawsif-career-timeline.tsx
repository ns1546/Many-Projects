"use client";

import React from "react";
import TimeLine_01, { TimeLine_01Entry } from "./release-time-line";
import { Music, Zap, Heart, Award, Film, Sparkles } from "lucide-react";

export const tawsifCareerEntries: TimeLine_01Entry[] = [
  {
    icon: Music,
    title: "Roots, Circuits & Bass Guitar",
    subtitle: "1988 — 2011 • Formative Years & Engineering",
    description:
      "Born in Daulatkhan, Bhola district, Tawsif spent his formative years in southern riverine heritage before earning an electrical engineering degree at AIUB and performing as bassist in Dhaka's underground rock scene.",
    items: [
      "Completed O Levels at Oxford International School, Dhaka",
      "Graduated with B.Sc. in Electrical & Electronic Engineering (EEE) from AIUB (2011)",
      "Bassist for underground rock outfits 'The Manager' and 'Divine Sanity'",
      "Developed commanding live stage rhythm and emotional presence",
    ],
    image: "/assets/gallery/portrait_studio.jpg",
    button: {
      url: "https://en.wikipedia.org/wiki/Tawsif_Mahbub",
      text: "Read Wikipedia Archive",
    },
  },
  {
    icon: Zap,
    title: "The Sudden Spark: Imran on the Run",
    subtitle: "2012 — 2013 • Discovery by Redoan Rony",
    description:
      "Transitioning from ramp modeling and television commercials, Tawsif was discovered by filmmaker Redoan Rony and cast as Imran in the cult youth telefilm '@18 - All Time Dourer Upor'.",
    items: [
      "Starred in '@18 - All Time Dourer Upor' (2013) directed by Redoan Rony",
      "Telefilm went viral nationwide, earning millions of organic views",
      "Established as the dynamic voice of a new generation of Bangladeshi TV talent",
      "Nominated for emerging talent accolades across broadcast media",
    ],
    image: "/assets/works/all_time_dourer_upor.jpg",
    button: {
      url: "https://www.youtube.com/results?search_query=All+Time+Dourer+Upor+Tawsif+Mahbub",
      text: "Watch On YouTube",
    },
  },
  {
    icon: Heart,
    title: "Urban Romance & The Bachelor Point Boom",
    subtitle: "2014 — 2020 • Collaborations & Nehal Phenomenon",
    description:
      "Cemented status as Dhaka's most relatable romantic protagonist, collaborating with Shihab Shaheen and starring as the moral anchor Nehal in Kajal Arefin Ome's monumental 'Bachelor Point'.",
    items: [
      "Collaborated on landmark romantic telefilms like 'Land Phoner Din Gulote Prem'",
      "Cast as Nehal in 'Bachelor Point'—the defining pop-culture series of Bangladesh",
      "Over 80 prime-time telefilm releases with critical and commercial acclaim",
      "Formed iconic screen partnerships with top contemporary leading actresses",
    ],
    image: "/assets/works/bachelor_point.jpg",
    button: {
      url: "https://www.youtube.com/results?search_query=Bachelor+Point+Nehal+Tawsif",
      text: "Explore Bachelor Point",
    },
  },
  {
    icon: Award,
    title: "Psychological Mastery & Meril-Prothom Alo Crown",
    subtitle: "2021 — 2026 • Chokro & National Accolades",
    description:
      "Ventured into psychological and OTT landscapes with Vicky Zahed's 'Chokro' and Amitabh Reza's 'Dhaka Metro', culminating in the national Meril-Prothom Alo Best TV Actor Award for 'Love Sab'.",
    items: [
      "Headlined Vicky Zahed's occult psychological series 'Chokro' on iScreen",
      "Won BIFA Best Actor Award for complex character transformation",
      "Won Meril-Prothom Alo Award for Best TV Actor (2024) for 'Love Sab'",
      "130+ telefilm repertoire representing artistic maturity and creative independence",
    ],
    image: "/assets/works/love_sab.jpg",
    button: {
      url: "https://www.youtube.com/results?search_query=Love+Sab+Tawsif+Mahbub+Totini",
      text: "Watch Love Sab",
    },
  },
];

export default function TawsifCareerTimeline() {
  return (
    <TimeLine_01
      title="ARTISTIC CHRONOLOGY & MILESTONES"
      description="An interactive trajectory through Tawsif Mahbub’s career: from underground bass player and engineering graduate to the Meril-Prothom Alo Best Actor of modern television drama."
      entries={tawsifCareerEntries}
      className="bg-background/40"
    />
  );
}
