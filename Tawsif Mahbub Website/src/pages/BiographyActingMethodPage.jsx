import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { actingMethodDeepData, characterStudies } from '../data/dossierData';
import { ChevronRight, ArrowLeft, Shield, Sparkles, Award, User, Clock, Heart, CheckCircle2 } from 'lucide-react';

export default function BiographyActingMethodPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bio-subpage-root">
      {/* 1. HERO HEADER */}
      <section className="bio-subpage-hero">
        <div className="container">
          <div className="wdp-breadcrumbs">
            <Link to="/">HOME</Link>
            <ChevronRight size={12} />
            <Link to="/biography">BIOGRAPHY & CRAFT</Link>
            <ChevronRight size={12} />
            <span>ACTING METHOD & DISCIPLINE</span>
          </div>

          <span className="editorial-kicker">THE ARTISTIC PHILOSOPHY • CHAPTER 02</span>
          <h1 className="page-main-title">{actingMethodDeepData.heroTitle}</h1>
          <p className="page-subtitle-text">{actingMethodDeepData.subtitle}</p>

          <div className="bsp-meta-pills">
            <span className="bsp-pill"><Shield size={13} /> 4 CORE CRAFT PILLARS</span>
            <span className="bsp-pill"><Clock size={13} /> 18-HOUR MARATHON RIGOR</span>
            <span className="bsp-pill"><Award size={13} /> MERIL-PROTHOM ALO WINNER</span>
          </div>
        </div>
      </section>

      {/* 2. THE 4 PILLARS DETAILED BREAKDOWN */}
      <section className="bio-subpage-content-section">
        <div className="container">
          <div className="bsp-grid-layout">
            {/* Left: Pillars & Character Studies */}
            <div className="bsp-narrative-col">
              <div className="bsp-section-head">
                <span className="editorial-kicker">METHODOLOGICAL ARCHITECTURE</span>
                <h2 className="editorial-section-title">THE FOUR PILLARS OF PERFORMANCE</h2>
              </div>

              <div className="bsp-pillars-grid">
                {actingMethodDeepData.pillars.map((pillar, idx) => (
                  <div key={idx} className="bsp-deep-pillar-card">
                    <span className="bdpc-num">{pillar.number}</span>
                    <h3 className="bdpc-title">{pillar.name}</h3>
                    <p className="bdpc-desc">{pillar.desc}</p>
                  </div>
                ))}
              </div>

              {/* The Physical Commitment & 2022 Injury Special Dossier */}
              <div className="bsp-injury-dossier-card">
                <div className="bidc-badge">DOCUMENTED ON-SET INCIDENT • 2022</div>
                <h3 className="bidc-title">The "Shadhinota Tumi" Forearm Fracture Commitment</h3>
                <p className="bidc-text">
                  In December 2022, while shooting key promotional poster frames for the 1971 Liberation War drama <em>Shadhinota Tumi</em>, Tawsif held co-star Tanjin Tisha across multiple takes over several minutes. The sustained physical stress resulted in a left forearm hairline bone fracture.
                </p>
                <p className="bidc-text">
                  Rather than stalling production—which would have inflicted severe financial penalties on the crew and director—Tawsif received immediate clinical splinting and insisted on continuing shooting. He wrapped the remaining sequence through excruciating discomfort, an incident frequently cited by Dhaka directors as proof of his unyielding loyalty to production partners.
                </p>
              </div>

              {/* Character Studies Deep Dive */}
              <div className="bsp-char-studies-section" style={{ marginTop: '3rem' }}>
                <span className="editorial-kicker">CASE STUDIES IN TRANSFORMATION</span>
                <h2 className="editorial-section-title" style={{ marginBottom: '1.5rem' }}>
                  DEFINITIVE ROLES & BODY LANGUAGE
                </h2>

                <div className="bsp-studies-list">
                  {characterStudies.map((cs, idx) => (
                    <div key={idx} className="bsp-study-item">
                      <div className="bsi-img-box">
                        <img src={cs.image} alt={cs.character} />
                      </div>
                      <div className="bsi-content">
                        <span className="bsi-role-badge">{cs.roleType}</span>
                        <h4 className="bsi-char-name">{cs.character}</h4>
                        <span className="bsi-project">In: {cs.project} (Dir. {cs.director})</span>
                        <p className="bsi-analysis">{cs.craftAnalysis}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Director Critiques & Sidebar */}
            <div className="bsp-sidebar-col">
              <div className="bsp-sidebar-card">
                <span className="bqc-kicker">DIRECTORIAL CITATIONS</span>
                <h3 className="bsp-sidebar-title">CRITICAL PERSPECTIVES</h3>

                <div className="bsp-directors-list">
                  {actingMethodDeepData.directors.map((d, idx) => (
                    <div key={idx} className="bsp-dir-item">
                      <blockquote className="bdi-quote">"{d.statement}"</blockquote>
                      <div className="bdi-author">
                        <span className="bdi-name">{d.name}</span>
                        <span className="bdi-title">{d.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Card */}
              <div className="bsp-subnav-card">
                <span className="bqc-kicker">BIOGRAPHY CHAPTERS</span>
                <ul className="bsp-nav-list">
                  <li>
                    <Link to="/biography/formative-years">
                      01. The Formative Years & Music →
                    </Link>
                  </li>
                  <li>
                    <Link to="/biography/acting-method" className="active-sublink">
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
