import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { merilProthomAloCitationData } from '../data/dossierData';
import { ChevronRight, ArrowLeft, Trophy, Award, CheckCircle2, Film, Star, UserCheck } from 'lucide-react';

export default function AwardsMerilProthomAloPage() {
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
            <span>MERIL-PROTHOM ALO AWARD</span>
          </div>

          <span className="editorial-kicker"><Trophy size={14} /> HIGHEST NATIONAL AUDIENCE HONOR</span>
          <h1 className="page-main-title">{merilProthomAloCitationData.awardName}</h1>
          <p className="page-subtitle-text">{merilProthomAloCitationData.category}</p>

          <div className="asp-pills-row">
            <span className="asp-pill-gold">WINNER 2024</span>
            <span className="asp-pill">WORK: LOVE SAB (লাভ সাব)</span>
            <span className="asp-pill">DIR: PROBIR ROY CHOWDHURY</span>
            <span className="asp-pill">CO-STAR: TANJIM SAIARA TOTINI</span>
          </div>
        </div>
      </section>

      {/* 2. CITATION & HISTORICAL RECORD */}
      <section className="awards-subpage-content">
        <div className="container">
          <div className="asp-grid-layout">
            {/* Left: Official Citation & Acceptance Speech */}
            <div className="asp-main-col">
              <div className="asp-citation-card">
                <span className="editorial-kicker">OFFICIAL CITATION OF THE JURY & PUBLIC AUDIT</span>
                <h2 className="asp-card-title">CITATION STATEMENT</h2>
                <blockquote className="asp-citation-quote">
                  "{merilProthomAloCitationData.officialCitation}"
                </blockquote>
              </div>

              {/* Historical Context */}
              <div className="asp-detail-card">
                <span className="editorial-kicker">HISTORICAL SIGNIFICANCE</span>
                <h3 className="asp-sec-title">The "Oscars of Bangladesh"</h3>
                <p className="asp-text">{merilProthomAloCitationData.historicalContext}</p>
                
                <h4 className="asp-sub-heading">VOTING DYNAMICS & AUDIENCE AUDIT</h4>
                <ul className="asp-points-list">
                  {merilProthomAloCitationData.significancePoints.map((pt, idx) => (
                    <li key={idx} className="asp-point-item">
                      <CheckCircle2 size={16} className="asp-check" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Acceptance Speech Transcript */}
              <div className="asp-speech-card">
                <span className="editorial-kicker">ACCEPTANCE ADDRESS</span>
                <h3 className="asp-sec-title">Transcript: Words of Gratitude</h3>
                <blockquote className="asp-speech-quote">
                  {merilProthomAloCitationData.acceptanceSpeechExcerpt}
                </blockquote>
              </div>
            </div>

            {/* Right: Key Art Poster & Production Links */}
            <div className="asp-sidebar-col">
              <div className="asp-poster-frame">
                <img src="/assets/works/love_sab.jpg" alt="Love Sab Poster" className="asp-poster-img" />
                <div className="asp-poster-badge">
                  <Trophy size={16} />
                  <span>MERIL-PROTHOM ALO BEST ACTOR</span>
                </div>
              </div>

              {/* Official Meril-Prothom Alo Archival Card from Docx */}
              <div className="asp-citation-photo-frame" style={{ marginTop: '1.25rem', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                <img
                  src="/assets/gallery/docx/12_tawsif_meril_khowabnama.jpg"
                  alt="Official Meril-Prothom Alo Best Actor Citation Card"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-dark)' }}>OFFICIAL CITATION CARD:</strong> Meril-Prothom Alo Awards Best Actor representation.
                </div>
              </div>

              <div className="asp-action-card" style={{ marginTop: '1.25rem' }}>
                <span className="bqc-kicker">PRODUCTION DOSSIER</span>
                <h4 className="aac-title">Love Sab (লাভ সাব)</h4>
                <p className="aac-desc">
                  Explore the complete cast sheet, streaming metrics, and character breakdown for the award-winning telefilm.
                </p>
                <Link to="/works/love-sab" className="aac-btn">
                  OPEN FULL 'LOVE SAB' DOSSIER →
                </Link>
              </div>

              <div className="bsp-subnav-card" style={{ marginTop: '1.5rem' }}>
                <span className="bqc-kicker">AWARDS ARCHIVE</span>
                <ul className="bsp-nav-list">
                  <li>
                    <Link to="/awards/meril-prothom-alo" className="active-sublink">
                      • Meril-Prothom Alo Award 2024 →
                    </Link>
                  </li>
                  <li>
                    <Link to="/awards/bifa-chokro">
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
