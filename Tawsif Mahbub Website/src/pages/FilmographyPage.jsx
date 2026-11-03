import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { allFilmographyWorks, getWorkSlug, soundtrackHits, pressArticles, youtubeThumbnails } from '../data/dossierData';
import { Search, Heart, Film, ExternalLink, Play, ArrowRight, X, Music, Newspaper, Headphones, Radio, Tv } from 'lucide-react';

export default function FilmographyPage({
  favorites = [],
  onToggleFavorite
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { id: 'all', label: `ALL WORKS (${allFilmographyWorks.length})` },
    { id: 'Romance', label: 'ROMANCE & TELEFILMS' },
    { id: 'Thriller', label: 'PSYCHOLOGICAL THRILLERS' },
    { id: 'Comedy', label: 'CULT COMEDY & YOUTH' },
    { id: 'Drama', label: 'SOCIAL & PATRIOTIC' }
  ];

  const filteredWorks = allFilmographyWorks.filter(work => {
    const matchesFilter = activeFilter === 'all' || work.category === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      work.title.toLowerCase().includes(q) ||
      work.director.toLowerCase().includes(q) ||
      work.coStar.toLowerCase().includes(q) ||
      work.roleName.toLowerCase().includes(q) ||
      work.synopsis.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="filmography-page-root">
      {/* 1. PAGE HERO HEADER */}
      <section className="page-header-section">
        <div className="container">
          <span className="editorial-kicker">FEATURED PRODUCTIONS</span>
          <h1 className="page-main-title">SELECTED FILMOGRAPHY</h1>
          <p className="page-subtitle-text">
            Explore 13+ years of landmark television dramas, festival telefilms, and digital streaming originals starring Tawsif Mahbub with verified key art posters, character profiles, production credits, and streaming links.
          </p>

          {/* Interactive Search & Filter Bar */}
          <div className="film-controls-wrap">
            <div className="film-search-bar">
              <Search size={16} className="fs-icon" />
              <input
                type="text"
                placeholder="Search works by title, co-star (Keya Payel, Tanjin Tisha), or director..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="film-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="fs-clear-btn">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="film-filter-tabs">
              {filterTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`film-tab-btn ${activeFilter === tab.id ? 'active-tab' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. WORKS GRID WITH REAL POSTERS */}
      <section className="film-catalog-section">
        <div className="container">
          <div className="catalog-count-bar">
            <span>SHOWING {filteredWorks.length} VERIFIED PRODUCTIONS</span>
            {searchQuery && <span>FILTERED BY: "{searchQuery}"</span>}
          </div>

          <div className="filmography-cards-grid">
            {filteredWorks.map(work => {
              const isFav = favorites.includes(work.id);
              const workSlug = work.slug || getWorkSlug(work);

              return (
                <div key={work.id} className="film-work-card">
                  {/* Poster Thumbnail Box (Links directly to detail page) */}
                  <Link to={`/works/${workSlug}`} className="fwc-poster-box">
                    <img src={work.image} alt="" aria-hidden="true" className="fwc-poster-ambient" />
                    <img src={work.image} alt={work.title} className="fwc-poster-img" loading="lazy" />
                    <span className="fwc-badge">{work.badge}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFavorite(work.id);
                      }}
                      className={`fwc-fav-btn ${isFav ? 'is-fav' : ''}`}
                      title={isFav ? "Remove from Saved" : "Save to Favorites"}
                    >
                      <Heart size={15} className={isFav ? "fill-red-500 text-red-500" : ""} />
                    </button>
                    <div className="fwc-overlay">
                      <span className="fwc-zoom-label">VIEW PRODUCTION DOSSIER →</span>
                    </div>
                  </Link>

                  {/* Card Info Box */}
                  <div className="fwc-info-box">
                    <div className="fwc-meta-row">
                      <span className="fwc-year">{work.year}</span>
                      <span className="fwc-dot">•</span>
                      <span className="fwc-cat">{work.category}</span>
                      <span className="fwc-dot">•</span>
                      <span className="fwc-platform">{work.platform}</span>
                    </div>

                    <h3 className="fwc-title">
                      <Link to={`/works/${workSlug}`} className="fwc-title-link">
                        {work.title}
                      </Link>
                    </h3>

                    <p className="fwc-synopsis">{work.synopsis}</p>

                    {/* Action Buttons */}
                    <div className="fwc-actions-row">
                      <Link
                        to={`/works/${workSlug}`}
                        className="fwc-detail-btn"
                      >
                        FULL DETAILS →
                      </Link>
                      {work.youtubeUrl && (
                        <a
                          href={work.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="fwc-watch-link"
                          title="Watch Official Video / Stream"
                        >
                          <Play size={13} fill="currentColor" /> WATCH
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredWorks.length === 0 && (
            <div className="catalog-empty-notice">
              <Film size={40} />
              <h3>No titles found for your query</h3>
              <p>Try resetting the search bar or choosing another category above.</p>
              <button
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className="reset-filters-btn"
              >
                RESET ALL FILTERS
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2.5 OFFICIAL 16:9 YOUTUBE BROADCAST & RECORD THUMBNAILS */}
      <section className="yt-thumbnails-section" style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-head-split" style={{ marginBottom: '2.5rem' }}>
            <div>
              <span className="editorial-kicker"><Tv size={13} style={{ display: 'inline', marginRight: '6px' }} /> OFFICIAL 16:9 YOUTUBE BROADCAST ARCHIVE</span>
              <h2 className="editorial-section-title">MULTI-MILLION STREAMING THUMBNAILS</h2>
            </div>
            <p className="bio-intro-subtext" style={{ maxWidth: '480px' }}>
              High-resolution official 16:9 YouTube broadcast thumbnails from record-breaking telefilms reaching tens of millions of viewers across South Asia.
            </p>
          </div>

          <div className="yt-thumbs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '2rem' }}>
            {youtubeThumbnails.map(thumb => (
              <div key={thumb.id} className="yt-thumb-card" style={{ backgroundColor: 'var(--bg-light)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s' }}>
                <a
                  href={thumb.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="yt-thumb-media-box"
                  style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', display: 'block', backgroundColor: '#000' }}
                  title={`Watch ${thumb.title} on YouTube`}
                >
                  <img
                    src={thumb.thumbnail}
                    alt={thumb.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    loading="lazy"
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0, 0, 0, 0.85)', color: '#ffffff', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.08em', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    {thumb.views}
                  </div>
                  <div className="yt-play-overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.25s' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(235, 10, 10, 0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)' }}>
                      <Play size={22} fill="currentColor" style={{ marginLeft: '3px' }} />
                    </div>
                  </div>
                </a>

                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)' }}>{thumb.platform}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: '800' }}>DIR. {thumb.director.toUpperCase()}</span>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.5rem', lineHeight: '1.4' }}>{thumb.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '1rem' }}>{thumb.fullTitle}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <Link
                      to={`/works/${thumb.workSlug}`}
                      style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-dark)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      VIEW DOSSIER <ArrowRight size={12} />
                    </Link>
                    <a
                      href={thumb.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.78rem', fontWeight: '700', color: '#e50914', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Play size={11} fill="currentColor" /> WATCH YOUTUBE ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HIT SOUNDTRACKS & ORIGINAL SONGS (from Official Archives) */}
      <section className="ost-showcase-section" style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="section-head-split" style={{ marginBottom: '2.5rem' }}>
            <div>
              <span className="editorial-kicker"><Headphones size={13} style={{ display: 'inline', marginRight: '6px' }} /> MUSICAL COLLABORATIONS</span>
              <h2 className="editorial-section-title">ORIGINAL SOUNDTRACKS & HIT SONGS</h2>
            </div>
            <p className="bio-intro-subtext" style={{ maxWidth: '480px' }}>
              Iconic playback numbers and original soundtrack collaborations featuring Tawsif Mahbub, composed by Habib Wahid, Imran Mahmudul, Kona, Porshi, and Atiya Anisha.
            </p>
          </div>

          <div className="ost-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {soundtrackHits.map(track => (
              <div key={track.id} className="ost-card" style={{ backgroundColor: 'var(--bg-card)', padding: '1.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.08em', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>{track.badge}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{track.platform}</span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-dark)' }}>{track.title}</h3>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-dark)', fontWeight: '600', marginBottom: '0.25rem' }}>Drama: {track.drama}</p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Vocals: {track.artists}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>On-Screen: {track.actors}</p>
                </div>
                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <a
                    href={track.youtubeSearch}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dark)', textDecoration: 'none' }}
                  >
                    <Play size={12} fill="currentColor" /> LISTEN ON YOUTUBE <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VERIFIED NATIONAL MEDIA & PRESS COVERAGE */}
      <section className="home-press-spotlight-section">
        <div className="container">
          <div className="section-head-split" style={{ marginBottom: '2rem' }}>
            <div>
              <span className="editorial-kicker">
                <Newspaper size={13} style={{ display: 'inline', marginRight: '6px' }} />
                NATIONAL PRESS ARCHIVE
              </span>
              <h2 className="editorial-section-title">VERIFIED MEDIA COVERAGE</h2>
            </div>
            <Link to="/biography/press-archive" className="section-action-link">
              EXPLORE FULL PRESS ARCHIVE (6 PUBLICATIONS) <ArrowRight size={15} />
            </Link>
          </div>

          <div className="home-press-grid">
            {pressArticles.map(article => (
              <div key={article.id} className="hpp-card">
                <div>
                  <div className="hpp-source-row">
                    <span className="hpp-source">
                      <Globe size={12} /> {article.source}
                    </span>
                    <span className="hpp-badge">{article.badge}</span>
                  </div>
                  <h3 className="hpp-title">{article.title}</h3>
                  <p className="hpp-desc">{article.summary}</p>
                </div>
                <div className="hpp-footer">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hpp-read-link"
                    title={`Read full coverage on ${article.source}`}
                  >
                    <span>READ ARTICLE</span>
                    <ExternalLink size={12} />
                  </a>
                  <span className="hpp-date">{article.date}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="home-section-cta-center" style={{ marginTop: '2.5rem' }}>
            <Link to="/biography/press-archive" className="home-clean-cta-btn">
              OPEN VERIFIED PRESS ARCHIVE & MANIFESTO →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
