import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formativeYearsData } from '../data/dossierData';
import { ChevronRight, ArrowLeft, Music, GraduationCap, MapPin, Calendar, Award, Sparkles, BookOpen } from 'lucide-react';

export default function BiographyFormativeYearsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bio-subpage-root">
      {/* 1. EDITORIAL SUBPAGE HERO */}
      <section className="bio-subpage-hero">
        <div className="container">
          <div className="wdp-breadcrumbs">
            <Link to="/">HOME</Link>
            <ChevronRight size={12} />
            <Link to="/biography">BIOGRAPHY & CRAFT</Link>
            <ChevronRight size={12} />
            <span>FORMATIVE YEARS</span>
          </div>

          <span className="editorial-kicker">HISTORICAL DOSSIER • CHAPTER 01</span>
          <h1 className="page-main-title">{formativeYearsData.heroTitle}</h1>
          <p className="page-subtitle-text">{formativeYearsData.subtitle}</p>

          <div className="bsp-meta-pills">
            <span className="bsp-pill"><MapPin size={13} /> BHOLA & DHAKA</span>
            <span className="bsp-pill"><GraduationCap size={13} /> AIUB CLASS OF 2011</span>
            <span className="bsp-pill"><Music size={13} /> BASS GUITARIST</span>
            <span className="bsp-pill"><Calendar size={13} /> 1988 — 2013</span>
          </div>
        </div>
      </section>

      {/* 2. CHRONOLOGICAL ESSAY & MEDIA SPREAD */}
      <section className="bio-subpage-content-section">
        <div className="container">
          <div className="bsp-grid-layout">
            {/* Left: Detailed Narrative Chapters */}
            <div className="bsp-narrative-col">
              {formativeYearsData.chapters.map((chap, idx) => (
                <div key={idx} className="bsp-chapter-card">
                  <div className="bsp-chap-header">
                    <span className="bsp-chap-period">{chap.period}</span>
                    <h3 className="bsp-chap-title">{chap.title}</h3>
                  </div>
                  <p className="bsp-chap-text">{chap.summary}</p>
                </div>
              ))}

              {/* Musical Lore Callout Box */}
              <div className="bsp-special-box">
                <div className="bsb-icon-wrap">
                  <Music size={24} />
                </div>
                <div>
                  <h4 className="bsb-title">The Legend of 'The Manager' & The Song "Natok"</h4>
                  <p className="bsb-text">
                    In the late 2000s, Tawsif performed as the bassist for Dhaka underground alternative rock outfit 'The Manager' and 'Divine Sanity'. Their most celebrated underground demo was an original track named 'Natok' (Drama). Tawsif frequently marvels at the cosmic irony: "I was headbanging and recording a song called Natok years before acting in natoks would define my destiny."
                  </p>
                </div>
              </div>

              {/* Academic Discipline */}
              <div className="bsp-special-box">
                <div className="bsb-icon-wrap">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h4 className="bsb-title">Engineering Mindset Applied to Actor's Craft</h4>
                  <p className="bsb-text">
                    Completing an electrical engineering degree at AIUB required mathematical precision, circuit logic, and tireless analytical patience. Tawsif applies this exact engineering rigor to script analysis: deconstructing emotional subtext like schematic blueprints and calibrating rhythm like signal frequencies.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Sidebar Vitals & Pull Quotes */}
            <div className="bsp-sidebar-col">
              {/* Photo Frame */}
              <div className="bsp-portrait-card">
                <img
                  src="/assets/gallery/portrait_studio.jpg"
                  alt="Tawsif Mahbub Early Career"
                  className="bsp-sidebar-img"
                />
                <div className="bsp-caption">
                  <span>TAWSIF MAHBUB • EARLY PORTRAIT ARCHIVE</span>
                </div>
              </div>

              {/* Pull Quote Card */}
              {formativeYearsData.quotes.map((q, idx) => (
                <div key={idx} className="bsp-quote-card">
                  <span className="bqc-kicker">IN HIS OWN WORDS</span>
                  <blockquote className="bqc-text">"{q.text}"</blockquote>
                  <span className="bqc-speaker">— {q.speaker}</span>
                </div>
              ))}

              {/* Quick Navigation to Other Subpages */}
              <div className="bsp-subnav-card">
                <span className="bqc-kicker">BIOGRAPHY CHAPTERS</span>
                <ul className="bsp-nav-list">
                  <li>
                    <Link to="/biography/formative-years" className="active-sublink">
                      01. The Formative Years & Music →
                    </Link>
                  </li>
                  <li>
                    <Link to="/biography/acting-method">
                      02. The Acting Method & Craft →
                    </Link>
                  </li>
                  <li>
                    <Link to="/biography/press-archive">
                      03. Press Archive & Media Interviews →
                    </Link>
                  </li>
                  <li>
                    <Link to="/biography" className="bsp-back-main">
                      ← Return to Biography Main Overview
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
