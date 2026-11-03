import React from 'react';
import { Link } from 'react-router-dom';
import {
  pillarCards,
  allFilmographyWorks,
  biographyChapters,
  awardsArchive,
  criticQuotes
} from '../data/dossierData';
import { ArrowRight, ArrowUpRight, Award, Film, Play, Sparkles } from 'lucide-react';
import TextShimmer from '../components/ui/text-shimmer';

export default function HomePage({ onSelectWork }) {
  const premiereWorks = allFilmographyWorks.slice(0, 4);

  return (
    <div className="home-page-root">
      {/* 1. ICONIC HERO SECTION */}
      <section className="gazu-hero">
        <div className="hero-container container">
          {/* Giant Background Typography: T A W S I F */}
          <div className="giant-typography-back" aria-hidden="true">
            <span className="giant-char">T</span>
            <span className="giant-char">A</span>
            <span className="giant-char">W</span>
            <span className="giant-char">S</span>
            <span className="giant-char">I</span>
            <span className="giant-char">F</span>
          </div>

          {/* Real Tawsif Mahbub Cutout Layered Symmetrically In Front */}
          <div className="hero-model-wrap">
            <img
              src="/assets/fb/tawsif_fb_cutout.png"
              alt="Tawsif Mahbub — Official Editorial Portrait"
              className="hero-model-img"
            />
            <div className="model-ground-shadow"></div>
          </div>

          {/* Bottom-Left Action Group */}
          <div className="hero-bottom-left">
            <Link to="/filmography" className="gazu-btn-black">
              EXPLORE FILMOGRAPHY
            </Link>
            <a
              href="https://www.facebook.com/TawsifMahbub"
              target="_blank"
              rel="noreferrer"
              className="gazu-link-underline"
            >
              OFFICIAL FACEBOOK <span className="arrow-slant">↗</span>
            </a>
          </div>

          {/* Bottom-Right Stamp */}
          <div className="hero-bottom-right">
            <TextShimmer
              text="MERIL-PROTHOM ALO WINNER"
              as="span"
              className="hero-br-label font-bold"
              duration={2.5}
            />
            <span className="hero-br-title">BEST TV ACTOR</span>
            <span className="hero-br-year">2026 ARCHIVE</span>
            <div className="br-underline"></div>
          </div>
        </div>
      </section>

      {/* 2. THREE-CATEGORY BLACK STRIP */}
      <section className="gazu-category-bar" id="pillars">
        <div className="container category-grid">
          {pillarCards.map(pillar => (
            <Link
              key={pillar.id}
              to="/filmography"
              className="category-card"
            >
              <div className="cat-thumb-box">
                <img src={pillar.image} alt={pillar.title} className="cat-thumb-img" />
              </div>
              <div className="cat-info-box">
                <span className="cat-badge-label">{pillar.badge}</span>
                <h3 className="cat-title">{pillar.title}</h3>
                <p className="cat-desc">{pillar.subtitle}</p>
                <span className="cat-link">
                  {pillar.linkText} <span className="cat-arrow">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. THE EDITORIAL STUDIO SHOWCASE */}
      <section className="studio-showcase-section" id="studio">
        <div className="container">
          {/* Section Header Bar */}
          <div className="studio-section-header">
            <span className="studio-sec-kicker">
              <TextShimmer
                text="ARTIST MONOGRAPH & STUDIO SHOWCASE"
                as="span"
                duration={3}
              />
            </span>
            <span className="studio-sec-location">
              DHAKA ARCHIVE
            </span>
          </div>

          {/* Main 2-Column Editorial Spread */}
          <div className="studio-editorial-spread">
            {/* Left Column: Refined Portrait Card */}
            <div className="studio-poster-wrapper">
              <div className="studio-poster-card">
                <div className="poster-visual-frame">
                  <img
                    src="/assets/tawsif_bio_portrait.jpg"
                    alt="Tawsif Mahbub Editorial Portrait"
                    className="poster-portrait-img"
                  />
                </div>
                <div className="poster-card-caption">
                  <span>TAWSIF MAHBUB • DHAKA STUDIO MONOGRAPH</span>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Narrative & Credentials */}
            <div className="studio-dossier-column">
              <div className="dossier-inner">
                <span className="dossier-chapter-badge">THE ARTISTIC TRAJECTORY</span>

                <h3 className="dossier-quote-headline">
                  "Acting is not about pretending; it is about finding truth in invented worlds."
                </h3>

                <p className="dossier-lead-text">
                  Over a career spanning more than 130 telefilms, flagship festival dramas, and psychological OTT thrillers, Tawsif Mahbub has brought an effortless naturalism to contemporary Bangladeshi screen storytelling. From the carefree youth anthems of early television to demanding, nuanced character studies, his screen presence balances magnetic charisma with emotional truth.
                </p>

                {/* Three Core Metric Pillars */}
                <div className="dossier-highlights-grid">
                  <div className="dossier-highlight-item">
                    <span className="dh-number">13+</span>
                    <span className="dh-label">Years of Excellence</span>
                    <p className="dh-desc">Leading contemporary Bengali television and digital OTT originals.</p>
                  </div>

                  <div className="dossier-highlight-item">
                    <span className="dh-number">40+</span>
                    <span className="dh-label">Acclaimed Telefilms</span>
                    <p className="dh-desc">Award-winning titles spanning romance, suspense, and social realism.</p>
                  </div>

                  <div className="dossier-highlight-item">
                    <span className="dh-number">50+</span>
                    <span className="dh-label">Filmmakers</span>
                    <p className="dh-desc">Partnering with visionary directors across television and OTT cinema.</p>
                  </div>
                </div>

                {/* Curated Actions */}
                <div className="dossier-action-row">
                  <Link to="/filmography" className="dossier-primary-btn">
                    EXPLORE SELECTED FILMOGRAPHY →
                  </Link>
                  <Link to="/awards" className="dossier-secondary-btn">
                    VIEW HONORS & AWARDS
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PREMIERE WORKS SHOWCASE ROW */}
      <section className="premiere-showcase-section">
        <div className="container">
          <div className="section-head-split">
            <div>
              <span className="editorial-kicker">SELECTED FILMOGRAPHY</span>
              <h2 className="editorial-section-title">LANDMARK PERFORMANCES</h2>
            </div>
            <Link to="/filmography" className="section-action-link">
              VIEW COMPLETE ARCHIVE ({allFilmographyWorks.length} WORKS) <ArrowRight size={15} />
            </Link>
          </div>

          <div className="premiere-cards-grid">
            {premiereWorks.map(work => (
              <div
                key={work.id}
                className="premiere-work-card"
                onClick={() => onSelectWork(work)}
              >
                <div className="pwc-poster-wrap">
                  <img src={work.image} alt={work.title} className="pwc-poster-img" />
                  <span className="pwc-badge">{work.badge}</span>
                  <div className="pwc-hover-overlay">
                    <span className="pwc-view-btn">VIEW WORK DOSSIER →</span>
                  </div>
                </div>
                <div className="pwc-info">
                  <div className="pwc-meta-line">
                    <span className="pwc-year">{work.year}</span>
                    <span className="pwc-dot">•</span>
                    <span className="pwc-cat">{work.category}</span>
                  </div>
                  <h3 className="pwc-title">{work.title}</h3>
                  <p className="pwc-director">Directed by {work.director}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CRITIC & DIRECTOR PERSPECTIVES */}
      <section className="director-quotes-section">
        <div className="container">
          <span className="editorial-kicker">CRITICAL RECEPTION & DIRECTORS</span>
          <h2 className="editorial-section-title" style={{ marginBottom: '2.5rem' }}>ON-CAMERA INTEGRITY</h2>

          <div className="quotes-grid">
            {criticQuotes.map((q, idx) => (
              <div key={idx} className="director-quote-card">
                <span className="quote-mark">“</span>
                <p className="dqc-text">{q.quote}</p>
                <div className="dqc-author-box">
                  <strong className="dqc-name">{q.author}</strong>
                  <span className="dqc-role">{q.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BIOGRAPHY SNEAK-PEEK & ACCREDITATION */}
      <section className="bio-teaser-section">
        <div className="container">
          <div className="bio-teaser-box">
            <div className="bt-left">
              <span className="editorial-kicker">BIOGRAPHY & ARTISTIC ROOTS</span>
              <h2 className="bt-title">FROM UNDERGROUND BASSIST TO NATIONAL SCREEN ICON</h2>
              <p className="bt-desc">
                From studying Electrical & Electronic Engineering at AIUB and playing bass guitar in Dhaka indie bands to his breakthrough in <em>@18 All Time Dourer Upor</em> and winning the 2024 Meril-Prothom Alo Best Actor crown.
              </p>
              <Link to="/biography" className="bt-btn">
                READ COMPLETE BIOGRAPHY →
              </Link>
            </div>
            <div className="bt-right">
              <div className="bt-portrait-frame">
                <img src="/assets/gallery/portrait_wiki.jpg" alt="Tawsif Mahbub Portrait" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
}
