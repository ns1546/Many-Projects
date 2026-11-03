import React from 'react';
import { profileData, biographyChapters, criticQuotes } from '../data/dossierData';
import { Award, BookOpen, Heart, Music, GraduationCap, MapPin, Calendar, UserCheck } from 'lucide-react';
import TawsifCareerTimeline from '../components/ui/tawsif-career-timeline';

export default function BiographyPage() {
  return (
    <div className="biography-page-root">
      {/* 1. EDITORIAL HEADER */}
      <section className="page-header-section bio-header-spread">
        <div className="container">
          <span className="editorial-kicker">ARTISTIC TRAJECTORY & CHRONOLOGY</span>
          <h1 className="page-main-title">BIOGRAPHY & CRAFT</h1>
          <p className="page-subtitle-text">
            From playing bass in underground Dhaka rock clubs to an engineering degree and becoming the Meril-Prothom Alo Best Actor of modern Bangladeshi screen drama.
          </p>

          {/* Hero Bio Cover Split */}
          <div className="bio-cover-split">
            <div className="bio-cover-portrait">
              <img
                src="/assets/gallery/portrait_studio.jpg"
                alt="Tawsif Mahbub Editorial Portrait"
                className="bio-cover-img"
              />
              <div className="bio-portrait-caption">
                <span>TAWSIF MAHBUB • DHAKA STUDIO DOSSIER</span>
              </div>
            </div>

            <div className="bio-vitals-card">
              <span className="bvc-kicker">OFFICIAL DOSSIER VITALS</span>
              <h2 className="bvc-name">{profileData.name} ({profileData.nativeName})</h2>

              <div className="bvc-grid">
                <div className="bvc-item">
                  <span className="bvc-label"><MapPin size={13} /> ORIGIN & ROOTS</span>
                  <span className="bvc-value">{profileData.birthPlace}</span>
                </div>
                <div className="bvc-item">
                  <span className="bvc-label"><Calendar size={13} /> BORN</span>
                  <span className="bvc-value">{profileData.birthDate}</span>
                </div>
                <div className="bvc-item">
                  <span className="bvc-label"><GraduationCap size={13} /> EDUCATION</span>
                  <span className="bvc-value">{profileData.degrees}</span>
                </div>
                <div className="bvc-item">
                  <span className="bvc-label"><UserCheck size={13} /> SPOUSE</span>
                  <span className="bvc-value">{profileData.wife}</span>
                </div>
                <div className="bvc-item">
                  <span className="bvc-label"><Music size={13} /> MUSIC ROOTS</span>
                  <span className="bvc-value">{profileData.music}</span>
                </div>
                <div className="bvc-item">
                  <span className="bvc-label"><Award size={13} /> DEBUT</span>
                  <span className="bvc-value">{profileData.breakthrough}</span>
                </div>
              </div>

              <blockquote className="bio-pullquote">
                "An actor is not an inventor of emotions—he is an excavator of shared human experience."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHRONOLOGICAL CHAPTER TIMELINE (INTERACTIVE PROXIMITY SCROLL) */}
      <TawsifCareerTimeline />

      {/* 3. PEER & DIRECTOR CITATIONS */}
      <section className="bio-peers-section">
        <div className="container">
          <span className="editorial-kicker">INDUSTRY COLLABORATORS</span>
          <h2 className="editorial-section-title" style={{ marginBottom: '2.5rem' }}>ON-SET DIRECTORIAL CRITIQUES</h2>

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
    </div>
  );
}
    </div >
  );
}
