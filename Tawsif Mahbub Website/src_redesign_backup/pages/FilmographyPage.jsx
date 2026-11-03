import React, { useState } from 'react';
import { allFilmographyWorks } from '../data/dossierData';
import { Search, Heart, Film, ExternalLink, Play, ArrowRight, X } from 'lucide-react';

export default function FilmographyPage({
  favorites = [],
  onToggleFavorite,
  selectedWork,
  setSelectedWork
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
          <span className="editorial-kicker">PERFORMANCE ARCHIVE</span>
          <h1 className="page-main-title">SELECTED FILMOGRAPHY</h1>
          <p className="page-subtitle-text">
            Explore 13+ years of landmark television dramas, festival telefilms, and digital streaming originals starring Tawsif Mahbub with real key art posters, character dossiers, and streaming links.
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
            <span>SHOWING {filteredWorks.length} CURATED PRODUCTIONS</span>
            {searchQuery && <span>FILTERED BY: "{searchQuery}"</span>}
          </div>

          <div className="filmography-cards-grid">
            {filteredWorks.map(work => {
              const isFav = favorites.includes(work.id);

              return (
                <div key={work.id} className="film-work-card">
                  {/* Poster Thumbnail Box */}
                  <div className="fwc-poster-box" onClick={() => setSelectedWork(work)}>
                    <img src={work.image} alt={work.title} className="fwc-poster-img" />
                    <span className="fwc-badge">{work.badge}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(work.id);
                      }}
                      className={`fwc-fav-btn ${isFav ? 'is-fav' : ''}`}
                      title={isFav ? "Remove from Saved" : "Save to Favorites"}
                    >
                      <Heart size={15} className={isFav ? "fill-red-500 text-red-500" : ""} />
                    </button>
                    <div className="fwc-overlay">
                      <span className="fwc-zoom-label">INSPECT WORK DOSSIER →</span>
                    </div>
                  </div>

                  {/* Card Info Box */}
                  <div className="fwc-info-box">
                    <div className="fwc-meta-row">
                      <span className="fwc-year">{work.year}</span>
                      <span className="fwc-dot">•</span>
                      <span className="fwc-cat">{work.category}</span>
                      <span className="fwc-dot">•</span>
                      <span className="fwc-platform">{work.platform}</span>
                    </div>

                    <h3 className="fwc-title" onClick={() => setSelectedWork(work)}>
                      {work.title}
                    </h3>

                    <p className="fwc-synopsis">{work.synopsis}</p>

                    <div className="fwc-credits-grid">
                      <div className="fwc-credit-item">
                        <span className="fwc-label">DIRECTOR</span>
                        <span className="fwc-val">{work.director}</span>
                      </div>
                      <div className="fwc-credit-item">
                        <span className="fwc-label">ROLE</span>
                        <span className="fwc-val">{work.roleName}</span>
                      </div>
                      <div className="fwc-credit-item fwc-span-2">
                        <span className="fwc-label">CO-STAR</span>
                        <span className="fwc-val">{work.coStar}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="fwc-actions-row">
                      <button
                        onClick={() => setSelectedWork(work)}
                        className="fwc-detail-btn"
                      >
                        FULL DETAILS →
                      </button>
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

      {/* 3. WORK DETAIL MODAL */}
      {selectedWork && (
        <div className="work-modal-backdrop" onClick={() => setSelectedWork(null)}>
          <div className="work-modal-card" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedWork(null)}
              className="modal-close-btn"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="work-modal-grid">
              <div className="wm-poster-column">
                <img src={selectedWork.image} alt={selectedWork.title} className="wm-poster-img" />
                <span className="wm-badge">{selectedWork.badge}</span>
              </div>

              <div className="wm-info-column">
                <span className="wm-kicker">{selectedWork.year} • {selectedWork.category} • {selectedWork.platform}</span>
                <h2 className="wm-title">{selectedWork.title}</h2>

                <p className="wm-synopsis-full">{selectedWork.synopsis}</p>

                <div className="wm-spec-table">
                  <div className="wm-spec-row">
                    <span className="wm-spec-label">Director:</span>
                    <span className="wm-spec-value">{selectedWork.director}</span>
                  </div>
                  <div className="wm-spec-row">
                    <span className="wm-spec-label">Character / Role:</span>
                    <span className="wm-spec-value">{selectedWork.roleName}</span>
                  </div>
                  <div className="wm-spec-row">
                    <span className="wm-spec-label">Leading Co-Star:</span>
                    <span className="wm-spec-value">{selectedWork.coStar}</span>
                  </div>
                  <div className="wm-spec-row">
                    <span className="wm-spec-label">Official Platform:</span>
                    <span className="wm-spec-value">{selectedWork.platform}</span>
                  </div>
                </div>

                <div className="wm-actions-group">
                  {selectedWork.youtubeUrl && (
                    <a
                      href={selectedWork.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="wm-primary-action"
                    >
                      <Play size={14} fill="currentColor" /> STREAM OFFICIAL DRAMA <ExternalLink size={13} />
                    </a>
                  )}
                  <button
                    onClick={() => onToggleFavorite(selectedWork.id)}
                    className="wm-fav-action"
                  >
                    <Heart size={14} className={favorites.includes(selectedWork.id) ? "fill-red-500 text-red-500" : ""} />
                    {favorites.includes(selectedWork.id) ? "SAVED IN FAVORITES" : "SAVE TO FAVORITES"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
    </div >
  );
}
