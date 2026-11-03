import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { biographyChapters } from '../data/dossierData';
import { Calendar, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

export default function BiographyChronology() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredChapters = activeFilter === 'all'
    ? biographyChapters
    : biographyChapters.filter((ch) => ch.number === activeFilter);

  return (
    <section className="bio-chronology-section" id="chronology">
      <div className="container">
        {/* Section Header */}
        <div className="bio-section-intro">
          <span className="editorial-kicker">CAREER CHRONOLOGY</span>
          <h2 className="editorial-section-title">THE ARTISTIC TRAJECTORY</h2>
          <p className="bio-intro-subtext">
            Explore the four defining eras of Tawsif Mahbub’s evolution. Click any era below to open its dedicated archival dossier, milestones, and historical narrative.
          </p>

          {/* Era Filter Selector */}
          <div className="bio-era-filters" role="tablist" aria-label="Career Eras">
            <button
              type="button"
              className={`bio-era-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              <span>ALL ERAS (1988 — PRESENT)</span>
            </button>
            {biographyChapters.map((ch) => (
              <button
                key={ch.number}
                type="button"
                className={`bio-era-filter-btn ${activeFilter === ch.number ? 'active' : ''}`}
                onClick={() => setActiveFilter(ch.number)}
              >
                <span>CH. {ch.number} • {ch.era}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Eye-Soothing Chapter Cards Grid */}
        <div className="bio-compact-chapters-grid">
          {filteredChapters.map((chapter) => {
            const chapterUrl = `/biography/${chapter.slug || 'chapter-' + parseInt(chapter.number)}`;
            return (
              <article
                key={chapter.number}
                className="bio-compact-chapter-card"
                onClick={() => navigate(chapterUrl)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(chapterUrl); }}
                aria-label={`Open Chapter ${chapter.number} dossier: ${chapter.title}`}
              >
                {/* Visual Header Image with Aspect Ratio */}
                <div className="bccc-img-wrap">
                  <img
                    src={chapter.image}
                    alt={chapter.title}
                    className="bccc-thumb-img"
                    loading="lazy"
                  />
                  <div className="bccc-img-overlay">
                    <span className="bccc-chapter-badge">CH. {chapter.number}</span>
                    <span className="bccc-era-pill">
                      <Calendar size={12} /> {chapter.era}
                    </span>
                  </div>
                </div>

                {/* Content Pane */}
                <div className="bccc-main">
                  <h3 className="bccc-title">
                    <Link to={chapterUrl} className="bccc-title-link" onClick={e => e.stopPropagation()}>
                      {chapter.title}
                    </Link>
                  </h3>
                  <h4 className="bccc-subtitle">{chapter.subtitle}</h4>

                  <p className="bccc-excerpt">
                    {chapter.content.slice(0, 150)}...
                  </p>

                  <div className="bccc-footer">
                    <Link
                      to={chapterUrl}
                      className="bccc-action-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BookOpen size={13} /> READ COMPLETE ERA DOSSIER <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
