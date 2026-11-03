import React from 'react';
import { profileData, criticQuotes } from '../data/dossierData';
import { Award, GraduationCap, MapPin, Calendar, Music, Film, CheckCircle2, ChevronRight, Quote, Sparkles } from 'lucide-react';
import BiographyChronology from '../components/BiographyChronology';
import ActorsCraft from '../components/ActorsCraft';
import { Link } from 'react-router-dom';

export default function BiographyPage() {
  return (
    <div className="biography-page-root">
      {/* 1. EDITORIAL HEADER & VITALS SPREAD */}
      <section className="page-header-section bio-header-spread" id="overview">
        <div className="container">
          <div className="bio-breadcrumbs">
            <Link to="/">HOME</Link>
            <ChevronRight size={12} />
            <span>BIOGRAPHY & CRAFT</span>
          </div>

          <div className="bio-hero-intro">
            <span className="editorial-kicker">ARTISTIC TRAJECTORY • CHRONOLOGY & METHOD</span>
            <h1 className="page-main-title">BIOGRAPHY & CRAFT</h1>
            <p className="page-subtitle-text">
              From playing bass in underground Dhaka rock clubs to completing an electrical engineering degree at AIUB and becoming the Meril-Prothom Alo Best Actor of modern Bangladeshi screen drama.
            </p>
          </div>

          {/* Quick Sub-Navigation Anchor Links */}
          <div className="bio-subnav-pills">
            <a href="#overview" className="bio-subnav-btn">OVERVIEW & VITALS</a>
            <a href="#chronology" className="bio-subnav-btn">4 CAREER ERAS</a>
            <a href="#craft" className="bio-subnav-btn">ACTOR'S METHOD</a>
            <a href="#collaborators" className="bio-subnav-btn">DIRECTORIAL CRITIQUES</a>
            <Link to="/biography/press-archive" className="bio-subnav-btn" style={{ fontWeight: 800 }}>PRESS ARCHIVE (CH. 03) →</Link>
          </div>

          {/* Hero Bio Cover Split — Magazine Layout */}
          <div className="bio-cover-split">
            {/* Left: Portrait Frame */}
            <div className="bio-cover-portrait">
              <div className="bio-portrait-frame">
                <img
                  src="/assets/gallery/portrait_studio.jpg"
                  alt="Tawsif Mahbub Editorial Portrait"
                  className="bio-cover-img"
                />
                <div className="bio-portrait-caption">
                  <span className="bpc-label">OFFICIAL ARCHIVE</span>
                  <span className="bpc-text">TAWSIF MAHBUB • DHAKA STUDIO PORTRAIT</span>
                </div>
              </div>
            </div>

            {/* Right: Vitals Dossier Card */}
            <div className="bio-vitals-card">
              <div className="bvc-header">
                <span className="bvc-kicker">ARTIST PROFILE & VITALS</span>
                <h2 className="bvc-name">{profileData.name} ({profileData.nativeName})</h2>
                <span className="bvc-headline">{profileData.headline}</span>
              </div>

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
                  <span className="bvc-label"><Award size={13} /> PRIMARY HONORS</span>
                  <span className="bvc-value">Meril-Prothom Alo Best Actor • BIFA Best Actor (OTT)</span>
                </div>
                <div className="bvc-item">
                  <span className="bvc-label"><Music size={13} /> MUSIC ROOTS</span>
                  <span className="bvc-value">{profileData.music}</span>
                </div>
                <div className="bvc-item">
                  <span className="bvc-label"><Film size={13} /> DEBUT</span>
                  <span className="bvc-value">{profileData.breakthrough}</span>
                </div>
                <div className="bvc-item">
                  <span className="bvc-label"><CheckCircle2 size={13} /> REPERTOIRE</span>
                  <span className="bvc-value">130+ Leading Dramas & OTT Works</span>
                </div>
                <div className="bvc-item">
                  <span className="bvc-label"><Sparkles size={13} /> CAREER SPAN</span>
                  <span className="bvc-value">2013 — Present (13+ Years Active)</span>
                </div>
              </div>

              <blockquote className="bio-pullquote">
                <Quote size={20} className="bio-quote-icon" />
                <p className="bp-text">
                  "An actor is not an inventor of emotions — he is an excavator of shared human experience."
                </p>
                <cite className="bp-cite">— Tawsif Mahbub</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHRONOLOGICAL BIOGRAPHY & CAREER MILESTONES */}
      <BiographyChronology />

      {/* 3. THE ACTOR'S CRAFT & ACTING METHODOLOGY */}
      <ActorsCraft />

      {/* 4. PEER & DIRECTOR CITATIONS */}
      <section className="bio-peers-section" id="collaborators">
        <div className="container">
          <div className="bio-section-intro">
            <span className="editorial-kicker">INDUSTRY COLLABORATORS</span>
            <h2 className="editorial-section-title">ON-SET DIRECTORIAL CRITIQUES</h2>
            <p className="bio-intro-subtext">
              Direct insights from Bangladesh’s leading cinematic and television directors regarding Tawsif Mahbub’s work ethic, screen presence, and rehearsal discipline.
            </p>
          </div>

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

      {/* 5. CHAPTER 03: PRESS & MEDIA ARCHIVE SPOTLIGHT */}
      <section className="bio-press-banner-section" style={{ padding: '3.5rem 0', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="bio-cta-card" style={{ background: '#ffffff', border: '1px solid var(--border-subtle)' }}>
            <div className="bcc-text-col">
              <span className="editorial-kicker">VERIFIED JOURNALISTIC RECORD • CHAPTER 03</span>
              <h3 className="bcc-title" style={{ fontSize: '1.65rem' }}>PRESS & MEDIA INTERVIEW ARCHIVE</h3>
              <p className="bcc-desc">
                Explore in-depth national press coverage, broadsheet retrospectives, and verified humanitarian relief reports across The Daily Star, Prothom Alo, Dhaka Post, TOB News, and BD24Live.
              </p>
            </div>
            <div className="bcc-btn-col">
              <Link to="/biography/press-archive" className="bt-btn">
                OPEN PRESS ARCHIVE (6 PUBLICATIONS) →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EXPLORATION FOOTER CTA */}
      <section className="bio-cta-section">
        <div className="container">
          <div className="bio-cta-card">
            <div className="bcc-text-col">
              <span className="editorial-kicker">EXPLORE PRODUCTION WORK</span>
              <h3 className="bcc-title">EXPLORE THE COMPLETE WORKS & FILMOGRAPHY</h3>
              <p className="bcc-desc">
                Review over 20+ key telefilms, OTT series, trailers, and YouTube milestones documented with direct streaming links and character notes.
              </p>
            </div>
            <div className="bcc-btn-col">
              <Link to="/filmography" className="bt-btn">
                VIEW COMPLETE FILMOGRAPHY →
              </Link>
              <Link to="/awards" className="bio-ghost-btn">
                EXPLORE HONORS & AWARDS →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
