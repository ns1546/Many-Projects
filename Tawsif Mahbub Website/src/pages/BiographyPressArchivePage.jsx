import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Newspaper, Quote, ExternalLink, Calendar, ShieldCheck, Globe, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { pressArticles } from '../data/dossierData';

export default function BiographyPressArchivePage() {
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['ALL', 'NATIONAL PRESS', 'HUMANITARIAN', 'INTERVIEWS', 'INDUSTRY'];

  const filteredArticles = selectedFilter === 'ALL'
    ? pressArticles
    : pressArticles.filter(art => {
      if (selectedFilter === 'HUMANITARIAN') return art.badge === 'HUMANITARIAN';
      if (selectedFilter === 'NATIONAL PRESS') return art.badge === 'NATIONAL PRESS' || art.source.includes('Daily');
      if (selectedFilter === 'INTERVIEWS') return art.badge.includes('INTERVIEW') || art.badge.includes('FEATURE');
      if (selectedFilter === 'INDUSTRY') return art.badge.includes('RETROSPECTIVE') || art.badge.includes('ANALYTICS');
      return true;
    });

  return (
    <div className="bio-subpage-root press-archive-page-root">
      {/* 1. HERO HEADER */}
      <section className="bio-subpage-hero">
        <div className="container">
          <div className="wdp-breadcrumbs">
            <Link to="/">HOME</Link>
            <ChevronRight size={12} />
            <Link to="/biography">BIOGRAPHY & CRAFT</Link>
            <ChevronRight size={12} />
            <span>PRESS ARCHIVE</span>
          </div>

          <span className="editorial-kicker">VERIFIED JOURNALISTIC RECORD • CHAPTER 03</span>
          <h1 className="page-main-title">PRESS & MEDIA ARCHIVE</h1>
          <p className="page-subtitle-text">
            Documented news features, broadsheet retrospectives, and verified media coverage from Bangladesh’s premier national dailies and investigative cultural portals.
          </p>

          <div className="bsp-meta-pills">
            <span className="bsp-pill"><Newspaper size={13} /> 6 VERIFIED PUBLICATIONS</span>
            <span className="bsp-pill"><ShieldCheck size={13} /> DIRECT BROADCAST LINKS</span>
            <span className="bsp-pill"><Calendar size={13} /> 2024 — 2026 ARCHIVE</span>
          </div>
        </div>
      </section>

      {/* 2. PRESS ARTICLES LIST & MEDIA DOSSIER */}
      <section className="bio-subpage-content-section">
        <div className="container">
          {/* Filter Bar */}
          <div className="press-filter-bar">
            <span className="pfb-label"><Filter size={13} /> FILTER BY TOPIC:</span>
            <div className="pfb-pills-row">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`pfb-btn ${selectedFilter === cat ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bsp-grid-layout">
            {/* Left: Articles List */}
            <div className="bsp-narrative-col">
              <div className="bpa-articles-list">
                {filteredArticles.map((art) => (
                  <article key={art.id} className="bpa-article-card">
                    <div className="bac-meta">
                      <div className="bac-source-group">
                        <Globe size={13} className="bac-globe-icon" />
                        <span className="bac-source">{art.source}</span>
                      </div>
                      <span className="bac-dot">•</span>
                      <span className="bac-date">{art.date}</span>
                      <span className="bac-cat-badge">{art.badge}</span>
                    </div>

                    <h2 className="bac-headline">{art.title}</h2>
                    <p className="bac-excerpt">{art.summary}</p>

                    <div className="bac-footer">
                      <a
                        href={art.url}
                        target="_blank"
                        rel="noreferrer"
                        className="bac-read-btn"
                        title={`Open full verified coverage on ${art.source}`}
                      >
                        <span>READ FULL ARTICLE ON PUBLICATION</span>
                        <ExternalLink size={13} />
                      </a>
                      <span className="bac-verified-stamp">
                        <ShieldCheck size={12} /> VERIFIED SOURCE LINK
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* The Cinema Stance Manifesto */}
              <div className="bpa-manifesto-card">
                <span className="editorial-kicker">ARTISTIC MANIFESTO</span>
                <h3 className="bmc-title">The Silver Screen Philosophy</h3>
                <p className="bmc-text">
                  "I get asked in every interview why I haven't done a commercial feature film yet. The truth is simple: cinema is sacred to me. Having earned the audience's love across 130 telefilms, I will not trade that trust for a mediocre, rushed box office release. When I sign my first feature film, it will be because the script demands my life's breath—not just my name."
                </p>
                <span className="bmc-author">— Tawsif Mahbub, National Press Conference Archive</span>
              </div>
            </div>

            {/* Right: Sidebar */}
            <div className="bsp-sidebar-col">
              <div className="bsp-portrait-card">
                <img
                  src="/assets/gallery/tawsif_interview.jpg"
                  alt="Tawsif Mahbub National Press Interview"
                  className="bsp-sidebar-img"
                />
                <div className="bsp-caption">
                  <span>TAWSIF MAHBUB • TELEVISION & PRESS FORUM</span>
                </div>
              </div>

              {/* Media Kit CTA Card */}
              <div className="bsp-epk-sidebar-card">
                <span className="editorial-kicker">JOURNALIST RESOURCES</span>
                <h4 className="bsp-epk-title">Official Media & Press Kit</h4>
                <p className="bsp-epk-desc">
                  Access approved biographical synopses, verified production data, and high-resolution media headshots for editorial features.
                </p>
                <Link to="/press-kit" className="bsp-epk-btn">
                  OPEN ELECTRONIC PRESS KIT (EPK) <ArrowRight size={13} />
                </Link>
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
                    <Link to="/biography/acting-method">
                      02. The Acting Method & Craft →
                    </Link>
                  </li>
                  <li>
                    <Link to="/biography/press-archive" className="active-sublink">
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
