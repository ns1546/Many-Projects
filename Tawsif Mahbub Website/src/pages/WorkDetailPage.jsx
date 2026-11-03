import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { findWorkBySlugOrId, allFilmographyWorks, getWorkSlug } from '../data/dossierData';
import { ArrowLeft, Play, Heart, Share2, Film, ChevronRight, Award, User, Calendar, Tv, Sparkles, Clapperboard, CheckCircle2 } from 'lucide-react';

export default function WorkDetailPage({ favorites = [], onToggleFavorite }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const work = findWorkBySlugOrId(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!work) {
    return (
      <div className="work-detail-not-found container" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
        <Film size={48} style={{ color: 'var(--text-dark)', marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>PRODUCTION NOT FOUND</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The production record you are looking for does not exist or has been archived.
        </p>
        <Link to="/filmography" className="section-action-link">
          ← RETURN TO FULL FILMOGRAPHY
        </Link>
      </div>
    );
  }

  const isFav = favorites.includes(work.id);
  const workSlug = work.slug || getWorkSlug(work);

  // Related works from the same category or overall catalog
  const relatedWorks = allFilmographyWorks
    .filter(w => w.id !== work.id && (w.category === work.category || w.director === work.director))
    .slice(0, 3);

  return (
    <div className="work-detail-page-root">
      {/* 1. CINEMATIC BREADCRUMB & HERO BACKDROP */}
      <section className="wdp-hero-section">
        <div className="wdp-backdrop-wrap">
          <img src={work.image} alt={work.title} className="wdp-backdrop-img" />
          <div className="wdp-backdrop-overlay"></div>
        </div>

        <div className="container wdp-hero-container">
          <div className="wdp-breadcrumbs">
            <Link to="/">HOME</Link>
            <ChevronRight size={12} />
            <Link to="/filmography">FILMOGRAPHY</Link>
            <ChevronRight size={12} />
            <span>{work.title.split('(')[0].trim().toUpperCase()}</span>
          </div>

          <div className="wdp-hero-content-split">
            {/* Left: Metadata & Headings */}
            <div className="wdp-hero-meta">
              <div className="wdp-pills-row">
                <span className="wdp-badge-gold">{work.badge || 'VERIFIED ARCHIVE'}</span>
                <span className="wdp-pill-genre">{work.category}</span>
                <span className="wdp-pill-year">{work.year}</span>
                {work.duration && <span className="wdp-pill-duration">{work.duration}</span>}
              </div>

              <h1 className="wdp-main-title">{work.title}</h1>

              {work.tagline && (
                <p className="wdp-tagline">"{work.tagline}"</p>
              )}

              <div className="wdp-hero-summary-grid">
                <div className="wdp-hs-item">
                  <span className="wdp-hs-label">DIRECTOR</span>
                  <span className="wdp-hs-val">{work.director}</span>
                </div>
                <div className="wdp-hs-item">
                  <span className="wdp-hs-label">ROLE</span>
                  <span className="wdp-hs-val">{work.roleName}</span>
                </div>
                <div className="wdp-hs-item">
                  <span className="wdp-hs-label">CO-STAR</span>
                  <span className="wdp-hs-val">{work.coStar}</span>
                </div>
                <div className="wdp-hs-item">
                  <span className="wdp-hs-label">PLATFORM</span>
                  <span className="wdp-hs-val">{work.platform}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="wdp-actions-row">
                {work.youtubeUrl && (
                  <a
                    href={work.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="wdp-watch-btn"
                  >
                    <Play size={16} fill="currentColor" /> WATCH OFFICIAL STREAM
                  </a>
                )}

                <button
                  onClick={() => onToggleFavorite && onToggleFavorite(work.id)}
                  className={`wdp-fav-btn ${isFav ? 'active-fav' : ''}`}
                >
                  <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                  <span>{isFav ? 'SAVED TO FAVORITES' : 'SAVE TO FAVORITES'}</span>
                </button>

                <Link to="/filmography" className="wdp-back-btn">
                  <ArrowLeft size={16} /> ALL WORKS
                </Link>
              </div>
            </div>

            {/* Right: Key Art Poster Display */}
            <div className="wdp-poster-column">
              <div className="wdp-poster-frame">
                <img src={work.image} alt={work.title} className="wdp-poster-img" />
                <div className="wdp-poster-footer">
                  <span className="wpf-title">{work.title.split('(')[0].trim()}</span>
                  <span className="wpf-badge">{work.platform}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PRODUCTION DOSSIER & DEEP DIVE BODY */}
      <section className="wdp-body-section">
        <div className="container">
          <div className="wdp-layout-grid">
            {/* Left Main Content */}
            <div className="wdp-main-column">
              {/* Comprehensive Synopsis */}
              <div className="wdp-card">
                <span className="wdp-card-kicker"><Clapperboard size={14} /> PRODUCTION NARRATIVE</span>
                <h2 className="wdp-card-title">SYNOPSIS & DRAMATIC THEMES</h2>
                <p className="wdp-body-text">
                  {work.extendedSynopsis || work.synopsis}
                </p>
              </div>

              {/* Character Breakdown & Method */}
              {work.characterBreakdown ? (
                <div className="wdp-card">
                  <span className="wdp-card-kicker"><User size={14} /> THE ACTOR'S PROCESS</span>
                  <h2 className="wdp-card-title">CHARACTER PROFILE: {work.characterBreakdown.roleName}</h2>
                  
                  <div className="wdp-char-box">
                    <h4 className="wdp-char-heading">PSYCHOLOGICAL ARCHITECTURE</h4>
                    <p className="wdp-body-text">{work.characterBreakdown.psychology}</p>

                    <h4 className="wdp-char-heading">ACTING APPROACH & VOCAL CADENCE</h4>
                    <p className="wdp-body-text">{work.characterBreakdown.actingMethod}</p>

                    {work.characterBreakdown.directorNote && (
                      <blockquote className="wdp-director-quote">
                        {work.characterBreakdown.directorNote}
                      </blockquote>
                    )}
                  </div>
                </div>
              ) : (
                <div className="wdp-card">
                  <span className="wdp-card-kicker"><User size={14} /> PERFORMANCE PROFILE</span>
                  <h2 className="wdp-card-title">CHARACTER: {work.roleName}</h2>
                  <p className="wdp-body-text">
                    Tawsif Mahbub portrays {work.roleName} opposite {work.coStar}, directed by {work.director}. The performance is marked by naturalistic conversational delivery, emotional vulnerability, and effortless chemistry that resonates deeply with television audiences across Bangladesh.
                  </p>
                </div>
              )}

              {/* Behind the Scenes & Trivia */}
              {work.btsNotes && work.btsNotes.length > 0 && (
                <div className="wdp-card">
                  <span className="wdp-card-kicker"><Sparkles size={14} /> PRODUCTION LOGS & TRIVIA</span>
                  <h2 className="wdp-card-title">BEHIND THE SCENES DOSSIER</h2>
                  <ul className="wdp-bts-list">
                    {work.btsNotes.map((note, idx) => (
                      <li key={idx} className="wdp-bts-item">
                        <CheckCircle2 size={16} className="wdp-bts-icon" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Sidebar: Credits & Metrics */}
            <div className="wdp-sidebar-column">
              {/* Performance Metrics */}
              {work.metrics && work.metrics.length > 0 && (
                <div className="wdp-sidebar-card">
                  <span className="wdp-card-kicker"><Award size={14} /> INDUSTRY IMPACT</span>
                  <h3 className="wdp-sidebar-title">RECEPTION & HONORS</h3>
                  <div className="wdp-metrics-list">
                    {work.metrics.map((m, idx) => (
                      <div key={idx} className="wdp-metric-item">
                        <span className="wmi-label">{m.label}</span>
                        <span className="wmi-value">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Cast & Crew Sheet */}
              <div className="wdp-sidebar-card">
                <span className="wdp-card-kicker"><Tv size={14} /> CREDITS SPECIFICATION</span>
                <h3 className="wdp-sidebar-title">PRODUCTION DIRECTORY</h3>
                <div className="wdp-credits-sheet">
                  <div className="wcs-row">
                    <span className="wcs-key">DIRECTOR</span>
                    <span className="wcs-val">{work.director}</span>
                  </div>
                  <div className="wcs-row">
                    <span className="wcs-key">LEAD ACTOR</span>
                    <span className="wcs-val">Tawsif Mahbub</span>
                  </div>
                  <div className="wcs-row">
                    <span className="wcs-key">CO-STAR</span>
                    <span className="wcs-val">{work.coStar}</span>
                  </div>
                  <div className="wcs-row">
                    <span className="wcs-key">ROLE NAME</span>
                    <span className="wcs-val">{work.roleName}</span>
                  </div>
                  <div className="wcs-row">
                    <span className="wcs-key">RELEASE YEAR</span>
                    <span className="wcs-val">{work.year}</span>
                  </div>
                  <div className="wcs-row">
                    <span className="wcs-key">PLATFORM</span>
                    <span className="wcs-val">{work.platform}</span>
                  </div>
                  {work.productionHouse && (
                    <div className="wcs-row">
                      <span className="wcs-key">STUDIO / HOUSE</span>
                      <span className="wcs-val">{work.productionHouse}</span>
                    </div>
                  )}
                  {work.producer && (
                    <div className="wcs-row">
                      <span className="wcs-key">PRODUCER</span>
                      <span className="wcs-val">{work.producer}</span>
                    </div>
                  )}
                  {work.dop && (
                    <div className="wcs-row">
                      <span className="wcs-key">CINEMATOGRAPHY</span>
                      <span className="wcs-val">{work.dop}</span>
                    </div>
                  )}
                  {work.musicComposer && (
                    <div className="wcs-row">
                      <span className="wcs-key">MUSIC & OST</span>
                      <span className="wcs-val">{work.musicComposer}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Casting / Inquiries Direct Link */}
              <div className="wdp-inquiry-box">
                <span className="wib-kicker">PRODUCTION SCRIPT DESK</span>
                <h4 className="wib-title">Interested in casting Tawsif Mahbub?</h4>
                <p className="wib-desc">
                  Submit script treatments, OTT series bibles, and festival proposals directly to representation desk.
                </p>
                <Link to="/contact" className="wib-btn">
                  SUBMIT PRODUCTION INQUIRY →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RELATED REPERTOIRE CAROUSEL */}
      {relatedWorks.length > 0 && (
        <section className="wdp-related-section">
          <div className="container">
            <div className="section-head-split" style={{ marginBottom: '2rem' }}>
              <div>
                <span className="editorial-kicker">RELATED REPERTOIRE</span>
                <h2 className="editorial-section-title">MORE WORKS BY TAWSIF MAHBUB</h2>
              </div>
              <Link to="/filmography" className="section-action-link">
                VIEW ALL 130+ WORKS <ChevronRight size={14} />
              </Link>
            </div>

            <div className="wdp-related-grid">
              {relatedWorks.map(rw => {
                const rSlug = rw.slug || getWorkSlug(rw);
                return (
                  <Link
                    key={rw.id}
                    to={`/works/${rSlug}`}
                    className="wdp-related-card"
                  >
                    <div className="wrc-img-box">
                      <img src={rw.image} alt={rw.title} />
                      <span className="wrc-badge">{rw.badge || rw.category}</span>
                    </div>
                    <div className="wrc-info">
                      <span className="wrc-year">{rw.year} • {rw.category}</span>
                      <h4 className="wrc-title">{rw.title}</h4>
                      <span className="wrc-director">Dir. {rw.director}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
