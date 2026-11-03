import React from 'react';
import { awardsArchive } from '../data/dossierData';
import { Award, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AwardsPage() {
  const winnerList = awardsArchive.filter(a => a.status === 'WINNER');
  const honoredList = awardsArchive.filter(a => a.status !== 'WINNER');

  return (
    <div className="awards-page-root">
      {/* 1. PAGE HEADER */}
      <section className="page-header-section">
        <div className="container">
          <span className="editorial-kicker">NATIONAL RECOGNITION & HONORS</span>
          <h1 className="page-main-title">HONORS & ACCOLADES</h1>
          <p className="page-subtitle-text">
            Official archive of national television and digital streaming awards conferred upon Tawsif Mahbub, including the landmark Meril-Prothom Alo Best TV Actor crown.
          </p>
        </div>
      </section>

      {/* 2. GRAND TROPHY SPOTLIGHT */}
      <section className="trophy-spotlight-section">
        <div className="container">
          <div className="grand-trophy-card">
            <div className="gtc-left">
              <span className="gtc-kicker"><Trophy size={16} /> NATIONAL PRESTIGE CONFERRAL</span>
              <h2 className="gtc-title">MERIL-PROTHOM ALO AWARD</h2>
              <span className="gtc-category">BEST TV ACTOR — PUBLIC CHOICE (তারকা জরিপ)</span>

              <div className="gtc-meta-row">
                <span className="gtc-pill">WINNER 2024</span>
                <span className="gtc-pill">TITLE: LOVE SAB (লাভ সাব)</span>
                <span className="gtc-pill">DIRECTOR: PROBIR ROY CHOWDHURY</span>
              </div>

              <p className="gtc-citation">
                "Conferred upon Tawsif Mahbub in recognition of his nuanced, vulnerable, and unforgettable performance in 'Love Sab'. Voted by millions of television viewers across Bangladesh as the definitive male television performance of the year."
              </p>

              <Link to="/filmography" className="gtc-work-link">
                EXPLORE 'LOVE SAB' IN FILMOGRAPHY ARCHIVE →
              </Link>
            </div>

            <div className="gtc-right">
              <div className="gtc-poster-frame">
                <img src="/assets/works/love_sab.jpg" alt="Love Sab Poster" />
                <div className="gtc-badge-overlay">
                  <Award size={20} />
                  <span>BEST ACTOR WINNER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPLETE AWARDS ARCHIVE TABLE & CARDS */}
      <section className="awards-archive-list-section">
        <div className="container">
          <div className="section-head-split" style={{ marginBottom: '2rem' }}>
            <div>
              <span className="editorial-kicker">CURATED RECORD</span>
              <h2 className="editorial-section-title">FULL HONORS CITATIONS</h2>
            </div>
          </div>

          <div className="awards-detailed-grid">
            {awardsArchive.map(item => (
              <div key={item.id} className="award-dossier-card">
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
                  <span>Conferral Body: {item.jury}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
    </div >
  );
}
