import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bifaChokroCitationData } from '../data/dossierData';
import { ChevronRight, ArrowLeft, Trophy, Award, CheckCircle2, Film, Tv } from 'lucide-react';

export default function AwardsBifaChokroPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="awards-subpage-root">
      {/* 1. HERO HEADER */}
      <section className="awards-subpage-hero">
        <div className="container">
          <div className="wdp-breadcrumbs">
            <Link to="/">HOME</Link>
            <ChevronRight size={12} />
            <Link to="/awards">HONORS & ACCOLADES</Link>
            <ChevronRight size={12} />
            <span>BIFA OTT BEST ACTOR</span>
          </div>

          <span className="editorial-kicker"><Award size={14} /> DIGITAL STREAMING EXCELLENCE</span>
          <h1 className="page-main-title">{bifaChokroCitationData.awardName}</h1>
          <p className="page-subtitle-text">{bifaChokroCitationData.category}</p>

          <div className="asp-pills-row">
            <span className="asp-pill-gold">WINNER 2024</span>
            <span className="asp-pill">SERIES: CHOKRO (চক্র)</span>
            <span className="asp-pill">PLATFORM: iSCREEN ORIGINALS</span>
            <span className="asp-pill">DIR: VICKY ZAHED</span>
          </div>
        </div>
      </section>

      {/* 2. CITATION & ANALYSIS */}
      <section className="awards-subpage-content">
        <div className="container">
          <div className="asp-grid-layout">
            <div className="asp-main-col">
              <div className="asp-citation-card">
                <span className="editorial-kicker">OFFICIAL JURY CONFERMENT</span>
                <h2 className="asp-card-title">CITATION STATEMENT</h2>
                <blockquote className="asp-citation-quote">
                  "{bifaChokroCitationData.officialCitation}"
                </blockquote>
              </div>

              <div className="asp-detail-card">
                <span className="editorial-kicker">CRITICAL ASSESSMENT</span>
                <h3 className="asp-sec-title">The Psychological Breakthrough</h3>
                <p className="asp-text">
                  The BAIFA (Bangladesh International Fame Awards) recognized Tawsif Mahbub for his fearless embrace of psychological realism in 'Chokro'. Playing Gautam required shedding all vanity, adopting haunted body language, and diving headfirst into existential dread.
                </p>

                <h4 className="asp-sub-heading">CRITICAL MERIT HIGHLIGHTS</h4>
                <ul className="asp-points-list">
                  {bifaChokroCitationData.significancePoints.map((pt, idx) => (
                    <li key={idx} className="asp-point-item">
                      <CheckCircle2 size={16} className="asp-check" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="asp-sidebar-col">
              <div className="asp-poster-frame">
                <img src="/assets/works/chokro_thriller.jpg" alt="Chokro Poster" className="asp-poster-img" />
                <div className="asp-poster-badge">
                  <Award size={16} />
                  <span>BIFA BEST ACTOR WINNER</span>
                </div>
              </div>

              {/* Official Trophy Ceremony Photo from Archives */}
              <div className="asp-trophy-photo-frame" style={{ marginTop: '1.25rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                <img
                  src="/assets/gallery/docx/11_tawsif_bifa_trophy.jpg"
                  alt="Tawsif Mahbub holding BIFA Best Actor Trophy"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-dark)' }}>CEREMONY ARCHIVE:</strong> Tawsif Mahbub with his official BIFA Best Actor (OTT) trophy.
                </div>
              </div>

              <div className="asp-action-card" style={{ marginTop: '1.25rem' }}>
                <span className="bqc-kicker">PRODUCTION DOSSIER</span>
                <h4 className="aac-title">Chokro (চক্র — Season 1 & 2)</h4>
                <p className="aac-desc">
                  Inspect the complete psychological thriller series breakdown, episode roster, and occult research notes.
                </p>
                <Link to="/works/chokro" className="aac-btn">
                  OPEN FULL 'CHOKRO' DOSSIER →
                </Link>
              </div>

              <div className="bsp-subnav-card" style={{ marginTop: '1.5rem' }}>
                <span className="bqc-kicker">AWARDS ARCHIVE</span>
                <ul className="bsp-nav-list">
                  <li>
                    <Link to="/awards/meril-prothom-alo">
                      • Meril-Prothom Alo Award 2024 →
                    </Link>
                  </li>
                  <li>
                    <Link to="/awards/bifa-chokro" className="active-sublink">
                      • BIFA / BAIFA OTT Best Actor (Chokro) →
                    </Link>
                  </li>
                  <li>
                    <Link to="/awards" className="bsp-back-main">
                      ← Return to All Awards Archive
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
