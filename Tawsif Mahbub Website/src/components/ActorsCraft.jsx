import React, { useState } from 'react';
import { craftPillars, characterStudies, btsDossierNotes } from '../data/dossierData';
import { Award, Sparkles, Compass, ShieldAlert, Film, HeartHandshake, Mic2, Activity, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';

const pillarIcons = {
  rhythm: Activity,
  naturalism: HeartHandshake,
  transformation: ShieldAlert,
  stamina: Compass
};

export default function ActorsCraft() {
  const [selectedStudy, setSelectedStudy] = useState(0);

  return (
    <section className="actors-craft-root-section" id="craft">
      <div className="container">
        {/* Section Intro */}
        <div className="craft-section-header">
          <span className="editorial-kicker">TECHNIQUE, PHILOSOPHY & METHODOLOGY</span>
          <h2 className="editorial-section-title">THE ACTOR'S CRAFT</h2>
          <p className="craft-intro-subtitle">
            Beyond commercial acclaim, Tawsif Mahbub’s career represents a deliberate revolution in Bengali screen performance: rejecting exaggerated theatrical melodrama in pursuit of conversational intimacy, musical cadence, and psychological fearlessness.
          </p>
        </div>

        {/* 1. THE FOUR PILLARS OF CRAFT (Balanced 2-Column Spacious Grid) */}
        <div className="craft-pillars-grid">
          {craftPillars.map((pillar) => {
            const IconComponent = pillarIcons[pillar.id] || Sparkles;
            return (
              <div key={pillar.id} className="craft-pillar-card">
                <div className="cpc-header-row">
                  <div className="cpc-number-box">
                    <span className="cpc-num">PILLAR {pillar.pillarNum}</span>
                    <span className="cpc-badge">{pillar.badge}</span>
                  </div>
                  <div className="cpc-icon-wrap">
                    <IconComponent size={22} />
                  </div>
                </div>

                <h3 className="cpc-title">{pillar.title}</h3>
                <h4 className="cpc-subtitle">{pillar.subtitle}</h4>
                <p className="cpc-desc">{pillar.description}</p>

                <div className="cpc-highlights">
                  <span className="cpc-hl-label">METHOD HIGHLIGHTS</span>
                  <ul className="cpc-hl-list">
                    {pillar.highlights.map((h, i) => (
                      <li key={i} className="cpc-hl-item">
                        <CheckCircle2 size={15} className="cpc-check-icon" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. DUAL MASTERY CHARACTER CASE STUDIES */}
        <div className="craft-studies-section">
          <div className="css-header">
            <div>
              <span className="editorial-kicker">RANGE & TRANSFORMATION MATRIX</span>
              <h3 className="css-title">CHARACTER METAMORPHOSIS</h3>
            </div>
            <p className="css-subtext">
              An analytical breakdown of four contrasting archetypes demonstrating Tawsif’s dynamic span between comedic restraint, generational romance, and occult psychological terror.
            </p>
          </div>

          {/* Interactive Study Tabs */}
          <div className="css-tabs-row" role="tablist">
            {characterStudies.map((study, idx) => (
              <button
                key={study.character}
                type="button"
                className={`css-tab-btn ${selectedStudy === idx ? 'active' : ''}`}
                onClick={() => setSelectedStudy(idx)}
              >
                <span className="css-tab-role">{study.character}</span>
                <span className="css-tab-project">{study.project.split('(')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Study Showcase Card */}
          {characterStudies[selectedStudy] && (
            <div className="character-spotlight-card">
              <div className="csc-media-frame">
                <img
                  src={characterStudies[selectedStudy].image}
                  alt={`${characterStudies[selectedStudy].character} character study`}
                  className="csc-img"
                />
                <div className="csc-media-badge">
                  <Film size={13} />
                  <span>{characterStudies[selectedStudy].roleType}</span>
                </div>
              </div>

              <div className="csc-info-pane">
                <div className="csc-meta-header">
                  <span className="csc-kicker">CHARACTER PROFILE #0{selectedStudy + 1}</span>
                  <h4 className="csc-character-name">{characterStudies[selectedStudy].character}</h4>
                  <div className="csc-tags-row">
                    <span className="csc-tag-item"><strong>PROJECT:</strong> {characterStudies[selectedStudy].project}</span>
                    <span className="csc-tag-item"><strong>DIRECTOR:</strong> {characterStudies[selectedStudy].director}</span>
                  </div>
                </div>

                <div className="csc-analysis-block">
                  <span className="csc-analysis-label">ACTING CRAFT & PERFORMANCE ANALYSIS</span>
                  <p className="csc-analysis-text">{characterStudies[selectedStudy].craftAnalysis}</p>
                </div>

                <div className="csc-badge-status">
                  <Sparkles size={14} />
                  <span>LANDMARK BENGALI SCREEN PERFORMANCE</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. BEHIND-THE-SCENES & ON-SET JOURNAL */}
        <div className="craft-bts-section">
          <div className="bts-header">
            <span className="editorial-kicker">ON-SET JOURNAL & PROCESS</span>
            <h3 className="editorial-section-title">BEHIND THE CAMERA</h3>
            <p className="bio-intro-subtext">
              Documented on-set realities, character preparation, and creative decisions from notable productions.
            </p>
          </div>

          <div className="bts-grid">
            {btsDossierNotes.map((note, index) => (
              <div key={index} className="bts-note-card">
                <div className="bnc-top">
                  <span className="bnc-cat">{note.category}</span>
                  <span className="bnc-date">{note.date}</span>
                </div>
                <h4 className="bnc-title">{note.title}</h4>
                <p className="bnc-summary">{note.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
