import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { biographyChapters, findBiographyChapter } from '../data/dossierData';
import { ChevronRight, ArrowLeft, Calendar, Sparkles, CheckCircle2, Film, Quote, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

export default function BiographyChapterPage() {
  const { slug } = useParams();
  const chapter = findBiographyChapter(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!chapter) {
    return (
      <div className="container" style={{ padding: '8rem 1.5rem', textAlign: 'center' }}>
        <BookOpen size={48} style={{ color: 'var(--text-dark)', marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '2.2rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>CHAPTER DOSSIER NOT FOUND</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The requested biographical era does not exist in the official archive.
        </p>
        <Link to="/biography" className="section-action-link">
          ← RETURN TO CAREER BIOGRAPHY
        </Link>
      </div>
    );
  }

  // Find index to calculate previous and next chapters
  const currentIndex = biographyChapters.findIndex(ch => ch.number === chapter.number);
  const prevChapter = currentIndex > 0 ? biographyChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < biographyChapters.length - 1 ? biographyChapters[currentIndex + 1] : null;

  return (
    <div className="bio-chapter-page-root">
      {/* 1. HERO SECTION */}
      <section className="bcp-hero-section">
        <div className="container">
          {/* Breadcrumb */}
          <div className="wdp-breadcrumbs">
            <Link to="/">HOME</Link>
            <ChevronRight size={12} />
            <Link to="/biography">BIOGRAPHY & CRAFT</Link>
            <ChevronRight size={12} />
            <span>CHAPTER {chapter.number}</span>
          </div>

          <div className="bcp-hero-grid">
            <div className="bcp-hero-text">
              <div className="bcp-badges-row">
                <span className="bcp-chapter-badge">CHAPTER {chapter.number}</span>
                <span className="bcp-era-pill">
                  <Calendar size={12} /> {chapter.era}
                </span>
                <span className="bcp-sub-badge">CAREER ARCHIVE</span>
              </div>

              <h1 className="bcp-main-title">{chapter.title}</h1>
              <h2 className="bcp-main-subtitle">{chapter.subtitle}</h2>

              <p className="bcp-lead-abstract">
                {chapter.content}
              </p>

              <div className="bcp-hero-actions">
                <Link to="/biography" className="bcp-btn-secondary">
                  <ArrowLeft size={14} /> ALL CHAPTERS
                </Link>
                {chapter.button && (
                  <a
                    href={chapter.button.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bcp-btn-primary"
                  >
                    {chapter.button.text}
                  </a>
                )}
              </div>
            </div>

            {/* Right: Archival Imagery Frame */}
            <div className="bcp-hero-media">
              <div className="bcp-media-frame">
                <img src={chapter.image} alt={chapter.title} className="bcp-media-img" />
                <div className="bcp-media-overlay">
                  <span className="bcp-media-tag">ARCHIVAL PHOTO • CHAPTER {chapter.number}</span>
                  <span className="bcp-media-era">{chapter.era}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUOTE CALLOUT */}
      {chapter.interviewQuote && (
        <section className="bcp-quote-section">
          <div className="container">
            <div className="bcp-quote-card">
              <Quote size={28} className="bcp-quote-icon" />
              <blockquote className="bcp-quote-text">
                "{chapter.interviewQuote}"
              </blockquote>
              <cite className="bcp-quote-cite">— {chapter.quoteAuthor}</cite>
            </div>
          </div>
        </section>
      )}

      {/* 3. IN-DEPTH NARRATIVE & MILESTONES GRID */}
      <section className="bcp-body-section">
        <div className="container">
          <div className="bcp-content-layout">
            {/* Main Column: Deep Subjective Narrative Essay */}
            <div className="bcp-main-narrative">
              <div className="bcp-card">
                <span className="editorial-kicker">IN-DEPTH HISTORICAL ACCOUNT</span>
                <h3 className="bcp-card-title">THE DEFINING SAGA OF THIS ERA</h3>

                <div className="bcp-essay-paragraphs">
                  {chapter.longEssay ? (
                    chapter.longEssay.map((p, idx) => (
                      <p key={idx} className="bcp-paragraph">
                        {p}
                      </p>
                    ))
                  ) : (
                    <p className="bcp-paragraph">{chapter.content}</p>
                  )}
                </div>
              </div>

              {/* Key Works in this era */}
              {chapter.keyWorks && chapter.keyWorks.length > 0 && (
                <div className="bcp-card" style={{ marginTop: '2rem' }}>
                  <span className="editorial-kicker">CORRESPONDING PRODUCTIONS</span>
                  <h3 className="bcp-card-title">LANDMARK TITLES FROM THIS ERA</h3>
                  <div className="bcp-works-grid">
                    {chapter.keyWorks.map((work, idx) => (
                      <div key={idx} className="bcp-work-item">
                        <div className="bcp-work-left">
                          <Film size={18} className="bcp-work-icon" />
                          <div>
                            <h4 className="bcp-work-title">{work.title}</h4>
                            <span className="bcp-work-note">{work.note}</span>
                          </div>
                        </div>
                        <div className="bcp-work-right">
                          <span className="bcp-work-year">{work.year}</span>
                          {work.slug && (
                            <Link to={`/works/${work.slug}`} className="bcp-work-link">
                              VIEW WORK <ArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Column: Key Milestones */}
            <div className="bcp-sidebar-col">
              <div className="bcp-card bcp-milestones-card">
                <span className="editorial-kicker">HISTORICAL RECORD</span>
                <h3 className="bcp-card-title">ERA MILESTONES</h3>

                <ul className="bcp-milestones-list">
                  {chapter.items.map((item, idx) => (
                    <li key={idx} className="bcp-milestone-item">
                      <div className="bcp-milestone-check">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="bcp-milestone-text">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Era Quick Facts */}
              <div className="bcp-card" style={{ marginTop: '1.5rem' }}>
                <span className="editorial-kicker">ERA INDEX</span>
                <h4 className="bcp-card-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                  CHRONOLOGY METRICS
                </h4>
                <div className="bcp-meta-row">
                  <span className="bcp-meta-label">ERA PERIOD</span>
                  <span className="bcp-meta-val">{chapter.era}</span>
                </div>
                <div className="bcp-meta-row">
                  <span className="bcp-meta-label">CHAPTER NUMBER</span>
                  <span className="bcp-meta-val">CHAPTER {chapter.number} OF 04</span>
                </div>
                <div className="bcp-meta-row">
                  <span className="bcp-meta-label">CAREER PHASE</span>
                  <span className="bcp-meta-val">{chapter.title.split(':')[0]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. CHAPTER PAGINATION */}
          <div className="bcp-pagination-nav">
            {prevChapter ? (
              <Link to={`/biography/${prevChapter.slug}`} className="bcp-prev-link">
                <ArrowLeft size={16} />
                <div>
                  <span className="bcp-nav-label">PREVIOUS ERA</span>
                  <span className="bcp-nav-title">CH. {prevChapter.number} • {prevChapter.title}</span>
                </div>
              </Link>
            ) : (
              <div className="bcp-pagination-spacer"></div>
            )}

            <Link to="/biography" className="bcp-overview-link">
              CAREER OVERVIEW
            </Link>

            {nextChapter ? (
              <Link to={`/biography/${nextChapter.slug}`} className="bcp-next-link">
                <div style={{ textAlign: 'right' }}>
                  <span className="bcp-nav-label">NEXT ERA</span>
                  <span className="bcp-nav-title">CH. {nextChapter.number} • {nextChapter.title}</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <div className="bcp-pagination-spacer"></div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
