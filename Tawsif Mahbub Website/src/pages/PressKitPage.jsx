import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { profileData } from '../data/dossierData';
import { ChevronRight, ArrowLeft, FileText, CheckCircle2, Shield, Mail, Award, Film, User, Camera } from 'lucide-react';

export default function PressKitPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { label: "CAREER SPAN", val: "13+ YEARS" },
    { label: "TELEFILMS & PRODUCTIONS", val: "130+ WORKS" },
    { label: "CUMULATIVE DIGITAL VIEWS", val: "2 BILLION+" },
    { label: "PRIMARY NATIONAL HONOR", val: "MERIL-PROTHOM ALO BEST ACTOR" },
    { label: "SOCIAL REACH", val: "4.75M+ VERIFIED COMMUNITY" },
    { label: "ACADEMIC QUALIFICATION", val: "BSc IN EEE (AIUB)" }
  ];

  const pressImages = [
    {
      title: "Official Bespoke Couture Studio Portrait",
      spec: "2048 x 1365 px • Akib Rahman Studio Bespoke Study",
      path: "/assets/gallery/portrait_studio.jpg"
    },
    {
      title: "Outdoor Daylight Editorial Portrait",
      spec: "2048 x 1462 px • Earthy Linen Garden Editorial",
      path: "/assets/tawsif_bio_portrait.jpg"
    },
    {
      title: "BIFA Best Actor Trophy Award Ceremony",
      spec: "2048 x 1366 px • Best Actor (OTT) for Chokro",
      path: "/assets/gallery/docx/11_tawsif_bifa_trophy.jpg"
    },
    {
      title: "Meril-Prothom Alo National Award Citation",
      spec: "1600 x 1301 px • Best Actor Citation — Khowabnama",
      path: "/assets/gallery/docx/12_tawsif_meril_khowabnama.jpg"
    }
  ];

  return (
    <div className="press-kit-page-root">
      {/* 1. HERO HEADER */}
      <section className="page-header-section">
        <div className="container">
          <div className="wdp-breadcrumbs">
            <Link to="/">HOME</Link>
            <ChevronRight size={12} />
            <Link to="/contact">CONTACT & DESK</Link>
            <ChevronRight size={12} />
            <span>ELECTRONIC PRESS KIT (EPK)</span>
          </div>

          <span className="editorial-kicker"><FileText size={14} /> OFFICIAL MEDIA ASSET DESK</span>
          <h1 className="page-main-title">ELECTRONIC PRESS KIT</h1>
          <p className="page-subtitle-text">
            Verified press biography, career metrics, approved promotional headshots, and representation protocols for film festival directors, media journalists, and production casting heads.
          </p>
        </div>
      </section>

      {/* 2. FAST STATS BAR */}
      <section className="epk-stats-section">
        <div className="container">
          <div className="epk-stats-grid">
            {stats.map((s, idx) => (
              <div key={idx} className="epk-stat-card">
                <span className="esc-val">{s.val}</span>
                <span className="esc-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. APPROVED EXECUTIVE BIOGRAPHY */}
      <section className="epk-bio-section">
        <div className="container">
          <div className="epk-bio-grid">
            <div className="epk-bio-card">
              <span className="editorial-kicker">APPROVED PRESS BIOGRAPHY (ENGLISH)</span>
              <h2 className="epk-card-title">SHORT EXECUTIVE BIO</h2>
              <p className="epk-text">
                Tawsif Mahbub is one of Bangladesh's most celebrated and bankable leading actors across contemporary television, festival telefilms, and digital streaming. Born in Bhola and educated in Dhaka, Tawsif earned his Bachelor of Science in Electrical & Electronic Engineering from AIUB before making his breakout debut in 2013's <em>@18 - All Time Dourer Upor</em>. Over an acclaimed 13-year trajectory spanning more than 130 productions, he has earned the Meril-Prothom Alo Award for Best TV Actor (for <em>Love Sab</em>) and the BAIFA Best Actor Award for OTT (for <em>Chokro</em>). Renowned for psychological realism, subtle humor, and emotional vulnerability, Tawsif stands at the forefront of modern South Asian dramatic storytelling.
              </p>
            </div>

            <div className="epk-bio-card">
              <span className="editorial-kicker">APPROVED PRESS BIOGRAPHY (BENGALI)</span>
              <h2 className="epk-card-title">সংক্ষিপ্ত জীবনী</h2>
              <p className="epk-text" style={{ lineHeight: '1.9' }}>
                তৌসিফ মাহবুব সমসাময়িক বাংলাদেশের অন্যতম জনপ্রিয় ও প্রশংসিত অভিনেতা। ২০১৩ সালে রেদোয়ান রনি ও আদনান আল রাজীব পরিচালিত '@১৮ - অল টাইম দৌড়ের উপর' নাটকের মাধ্যমে তাঁর অভিনয় জীবনের সূচনা। দীর্ঘ এক যুগেরও বেশি সময়ের ক্যারিয়ারে তিনি ১৩০টিরও বেশি নাটক, টেলিফিল্ম এবং ওটিটি সিরিজে অভিনয় করেছেন। ২০২৪ সালে 'লাভ সাব' নাটকে অনবদ্য অভিনয়ের জন্য তিনি মেরিল-প্রথম আলো পুরস্কার (তারকা জরিপ — সেরা অভিনেতা) এবং 'চক্র' সিরিজে দুর্দান্ত রূপান্তরের জন্য বাইফা অ্যাওয়ার্ড লাভ করেন।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. APPROVED HIGH-RES PR ASSETS */}
      <section className="epk-assets-section">
        <div className="container">
          <div className="section-head-split" style={{ marginBottom: '2rem' }}>
            <div>
              <span className="editorial-kicker">IMAGE ASSETS FOR PRINT & BROADCAST</span>
              <h2 className="editorial-section-title">APPROVED PROMOTIONAL HEADSHOTS</h2>
            </div>
          </div>

          <div className="epk-assets-grid">
            {pressImages.map((img, idx) => (
              <div key={idx} className="epk-image-card">
                <div className="eic-img-frame">
                  <img src={img.path} alt="" aria-hidden="true" className="eic-ambient-backdrop" />
                  <img src={img.path} alt={img.title} className="eic-img" />
                </div>
                <div className="eic-info">
                  <h4 className="eic-title">{img.title}</h4>
                  <span className="eic-spec">{img.spec}</span>
                  <div className="eic-verified-badge">
                    <Shield size={13} /> OFFICIAL PRESS PORTRAIT • VERIFIED
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRODUCTION RIDER & BOOKING PROTOCOLS */}
      <section className="epk-protocols-section">
        <div className="container">
          <div className="epk-protocol-card">
            <span className="editorial-kicker">CASTING & SCRIPT SUBMISSIONS</span>
            <h2 className="epk-card-title">PRODUCTION RIDER & POLICIES</h2>
            
            <div className="epk-rules-grid">
              <div className="epk-rule-item">
                <CheckCircle2 size={18} className="epk-rule-icon" />
                <div>
                  <h4 className="eri-title">Complete Script Requirement</h4>
                  <p className="eri-desc">Tawsif does not review unscripted concepts. All submissions must include a complete episodic bible or feature treatment.</p>
                </div>
              </div>

              <div className="epk-rule-item">
                <CheckCircle2 size={18} className="epk-rule-icon" />
                <div>
                  <h4 className="eri-title">Lead Time & Scheduling</h4>
                  <p className="eri-desc">Festive Eid productions book 60 to 90 days in advance. Streaming OTT series require a minimum 6-week preparation window.</p>
                </div>
              </div>

              <div className="epk-rule-item">
                <CheckCircle2 size={18} className="epk-rule-icon" />
                <div>
                  <h4 className="eri-title">Official Representation</h4>
                  <p className="eri-desc">All commercial brand endorsements and international appearances must be coordinated through the official management desk.</p>
                </div>
              </div>
            </div>

            <div className="epk-action-wrap">
              <Link to="/contact" className="hbb-btn">
                CONTACT ARTIST MANAGEMENT DESK →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
