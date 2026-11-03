import React, { useState, useEffect } from 'react';
import { awardsArchive, merilProthomAloCitationData, bifaChokroCitationData } from '../data/dossierData';
import { Award, Trophy, Star, CheckCircle2, X, ExternalLink, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AwardsPage() {
  const navigate = useNavigate();
  const [selectedCitation, setSelectedCitation] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedCitation(null);
    };
    if (selectedCitation) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedCitation]);

  return (
    <div className="awards-page-root">
      {/* 1. PAGE HEADER */}
      <section className="page-header-section">
        <div className="container">
          <span className="editorial-kicker">NATIONAL RECOGNITION</span>
          <h1 className="page-main-title">HONORS & ACCOLADES</h1>
          <p className="page-subtitle-text">
            Official record of major television, OTT, and audience-choice awards received by Tawsif Mahbub, including the prestigious Meril-Prothom Alo Best Actor crown.
          </p>
        </div>
      </section>

      {/* 2. GRAND TROPHY SPOTLIGHT */}
      <section className="trophy-spotlight-section">
        <div className="container">
          <div className="grand-trophy-card">
            <div className="gtc-left">
              <span className="gtc-kicker"><Trophy size={16} /> MAJOR NATIONAL HONOR</span>
              <h2 className="gtc-title">MERIL-PROTHOM ALO AWARD</h2>
              <span className="gtc-category">BEST TV ACTOR — PUBLIC CHOICE (তারকা জরিপ)</span>

              <div className="gtc-meta-row">
                <span className="gtc-pill">WINNER 2024</span>
                <span className="gtc-pill">TITLE: LOVE SAB (লাভ সাব)</span>
                <span className="gtc-pill">DIRECTOR: PROBIR ROY CHOWDHURY</span>
              </div>

              <p className="gtc-citation">
                "Presented to Tawsif Mahbub in recognition of his nuanced, vulnerable performance in 'Love Sab'. Voted by television and digital audiences across Bangladesh as the definitive male television performance of the year."
              </p>

              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
                <Link
                  to="/awards/meril-prothom-alo"
                  className="gtc-work-link"
                >
                  READ OFFICIAL CITATION DOSSIER →
                </Link>
                <Link
                  to="/awards/bifa-chokro"
                  className="gtc-work-link"
                >
                  VIEW BIFA OTT BEST ACTOR (CHOKRO) →
                </Link>
              </div>
            </div>

            <div className="gtc-right">
              <Link
                to="/awards/meril-prothom-alo"
                className="gtc-poster-frame"
                title="Click to view Meril-Prothom Alo Citation"
              >
                <img src="/assets/works/love_sab.jpg" alt="Love Sab Poster" />
                <div className="gtc-badge-overlay">
                  <Award size={20} />
                  <span>BEST ACTOR WINNER</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPLETE AWARDS ARCHIVE TABLE & CARDS */}
      <section className="awards-archive-list-section">
        <div className="container">
          <div className="section-head-split" style={{ marginBottom: '2rem' }}>
            <div>
              <span className="editorial-kicker">OFFICIAL RECOGNITIONS</span>
              <h2 className="editorial-section-title">COMPLETE AWARDS & NOMINATIONS</h2>
            </div>
          </div>

          <div className="awards-detailed-grid">
            {awardsArchive.map(item => (
              <div
                key={item.id}
                className="award-dossier-card award-record-card"
                onClick={() => {
                  if (item.work.includes('Love Sab')) {
                    navigate('/awards/meril-prothom-alo');
                  } else if (item.work.includes('Chokro')) {
                    navigate('/awards/bifa-chokro');
                  }
                }}
                style={{
                  cursor: (item.work.includes('Love Sab') || item.work.includes('Chokro')) ? 'pointer' : 'default'
                }}
              >
                <div className="adc-top">
                  <span className="adc-year">{item.year}</span>
                  <span className={`adc-status-tag ${item.status === 'WINNER' ? 'status-won' : 'status-nom'}`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="adc-award-name">{item.title}</h3>
                <h4 className="adc-category-name">{item.category}</h4>

                <div className="adc-work-info">
                  <span className="adc-work-label">RECOGNIZED PRODUCTION:</span>
                  <strong className="adc-work-title">{item.work}</strong>
                </div>

                <p className="adc-citation-text">{item.citation}</p>

                <div className="adc-jury-foot">
                  <span>Presented by: {item.jury}</span>
                  {(item.work.includes('Love Sab') || item.work.includes('Chokro')) && (
                    <span style={{ fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'underline' }}>
                      VIEW CITATION DOSSIER ↗
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive In-Page Citation Modal */}
      {selectedCitation && (
        <div
          className="chapter-modal-backdrop"
          onClick={() => setSelectedCitation(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="chapter-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px' }}
          >
            <div className="cm-header-bar">
              <div className="cm-header-meta">
                <span className="cm-chapter-tag"><Trophy size={13} style={{ display: 'inline', marginRight: 4 }} /> NATIONAL CITATION</span>
                <span className="cm-era-tag">WINNER 2024</span>
                <span className="cm-verified-tag">AUDITED CONFERMENT</span>
              </div>
              <button
                type="button"
                className="cm-close-btn"
                onClick={() => setSelectedCitation(null)}
                aria-label="Close citation"
              >
                <X size={20} />
              </button>
            </div>

            <div className="cm-body-scroll">
              <div className="cm-body-header">
                <h2 className="cm-main-title">{selectedCitation.awardName}</h2>
                <h3 className="cm-subtitle">{selectedCitation.category}</h3>
              </div>

              {/* Citation Blockquote */}
              <div style={{ background: 'var(--text-dark)', color: '#ffffff', padding: '1.75rem', borderRadius: '2px', marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>OFFICIAL JURY CITATION</span>
                <blockquote style={{ fontSize: '1.05rem', fontStyle: 'italic', lineHeight: '1.75', margin: 0 }}>
                  "{selectedCitation.officialCitation}"
                </blockquote>
              </div>

              {/* Historical Context */}
              <div className="cm-narrative-section">
                <span className="editorial-kicker">HISTORICAL SIGNIFICANCE & CONTEXT</span>
                <p className="cm-narrative-text">{selectedCitation.historicalContext}</p>
              </div>

              {/* Significance Points */}
              {selectedCitation.significancePoints && (
                <div className="cm-milestones-card">
                  <span className="editorial-kicker">CRITICAL AUDIT & IMPACT POINTS</span>
                  <ul className="cm-milestones-list">
                    {selectedCitation.significancePoints.map((pt, idx) => (
                      <li key={idx} className="cm-milestone-item">
                        <CheckCircle2 size={16} className="cm-check-icon" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Acceptance Speech Excerpt */}
              {selectedCitation.acceptanceSpeechExcerpt && (
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-main)', borderLeft: '3px solid var(--text-dark)', borderRadius: '0 2px 2px 0' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: '800', letterSpacing: '0.14em', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>WORDS OF GRATITUDE</span>
                  <p style={{ fontSize: '0.92rem', fontStyle: 'italic', color: 'var(--text-dark)', lineHeight: '1.7', margin: 0 }}>
                    "{selectedCitation.acceptanceSpeechExcerpt}"
                  </p>
                </div>
              )}

              <div className="cm-actions-footer">
                <button
                  type="button"
                  className="cm-secondary-btn"
                  onClick={() => setSelectedCitation(null)}
                >
                  CLOSE CITATION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
