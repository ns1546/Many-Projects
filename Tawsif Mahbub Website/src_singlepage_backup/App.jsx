import React, { useState } from 'react';
import { 
  profileData, 
  pillarCards, 
  quickStats, 
  bestOfWorks, 
  awardsList, 
  verifiedIncidents 
} from './data/dossierData';
import { 
  Search, 
  Heart, 
  Award, 
  Film, 
  Clock, 
  Users, 
  ArrowRight, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Play
} from 'lucide-react';

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedWork, setSelectedWork] = useState(null);
  const [favorites, setFavorites] = useState([1, 2]);
  const [openIncident, setOpenIncident] = useState('gd2021');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredWorks = bestOfWorks.filter(w => {
    const matchesFilter = activeFilter === 'all' 
      ? true 
      : (activeFilter === 'romance' && w.category.toLowerCase().includes('romance')) ||
        (activeFilter === 'ott' && w.category.toLowerCase().includes('thriller')) ||
        (activeFilter === 'comedy' && (w.category.toLowerCase().includes('comedy') || w.category.toLowerCase().includes('youth')));
    
    const matchesSearch = searchQuery.trim() === '' || 
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.roleName && w.roleName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="gazu-app">
      {/* 1. TOP ANNOUNCEMENT BAR (Direct GAZU Image 3 Reference) */}
      <aside className="top-utility-bar">
        <div className="container utility-content">
          <div className="utility-left">
            <span className="live-dot"></span>
            <span>MERIL-PROTHOM ALO AWARD WINNER • BEST TV ACTOR • CHOKRO 2 STREAMING ON iSCREEN</span>
          </div>
          <div className="utility-right">
            <span>DHAKA, BANGLADESH</span>
            <span className="pipe-sep">|</span>
            <a href="https://www.facebook.com/TawsifMahbub" target="_blank" rel="noreferrer" className="utility-fb-link">
              4.75M+ VERIFIED FACEBOOK
            </a>
            <span className="pipe-sep">|</span>
            <button onClick={() => scrollToSection('about')} className="utility-btn">
              OFFICIAL ARCHIVE
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MINIMALIST EDITORIAL NAV (Exact GAZU Navigation Bar) */}
      <header className="gazu-header">
        <div className="container header-grid">
          {/* Left Category / Page Links */}
          <nav className="header-nav-left" aria-label="Main Navigation">
            <button onClick={() => scrollToSection('pillars')} className="nav-text-btn">PILLARS</button>
            <button onClick={() => scrollToSection('collection')} className="nav-text-btn">FILMOGRAPHY</button>
            <button onClick={() => scrollToSection('about')} className="nav-text-btn">BIOGRAPHY</button>
            <button onClick={() => scrollToSection('awards')} className="nav-text-btn">AWARDS</button>
          </nav>

          {/* Center Brand Title */}
          <div className="header-logo-center">
            <a href="#" className="gazu-logo-text" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              TAWSIF
            </a>
          </div>

          {/* Right Utility Icons & Actions */}
          <div className="header-nav-right">
            <button 
              onClick={() => setShowSearchModal(true)} 
              className="icon-label-btn"
              title="Search Filmography"
            >
              <Search size={14} />
              <span>SEARCH</span>
            </button>
            
            <a 
              href="https://www.facebook.com/TawsifMahbub" 
              target="_blank" 
              rel="noreferrer" 
              className="icon-label-btn fb-badge-btn"
              title="4,747,459 Verified Facebook Followers"
            >
              <CheckCircle2 size={13} className="text-blue-500" />
              <span>4.75M FB</span>
            </a>

            <button 
              onClick={() => scrollToSection('collection')} 
              className="icon-label-btn"
              title="Saved Titles"
            >
              <Heart size={14} className={favorites.length > 0 ? "fill-red-500 text-red-500" : ""} />
              <span>SAVED ({favorites.length})</span>
            </button>

            <button onClick={() => scrollToSection('contact')} className="nav-cta-btn">
              BOOKING
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button 
            className="mobile-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`bar ${mobileMenuOpen ? 'open-1' : ''}`}></span>
            <span className={`bar ${mobileMenuOpen ? 'open-2' : ''}`}></span>
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <button onClick={() => scrollToSection('pillars')}>CORE PILLARS</button>
            <button onClick={() => scrollToSection('spotlight')}>OTT SPOTLIGHT</button>
            <button onClick={() => scrollToSection('collection')}>FILMOGRAPHY ARCHIVE</button>
            <button onClick={() => scrollToSection('about')}>BIOGRAPHY & ROOTS</button>
            <button onClick={() => scrollToSection('awards')}>AWARDS & HONORS</button>
            <button onClick={() => scrollToSection('records')}>VERIFIED CLARIFICATIONS</button>
            <button onClick={() => scrollToSection('contact')}>DIRECT BOOKING</button>
            <a 
              href="https://www.facebook.com/TawsifMahbub" 
              target="_blank" 
              rel="noreferrer"
              className="mobile-fb-link"
            >
              VISIT OFFICIAL FACEBOOK (4.75M) →
            </a>
          </div>
        )}
      </header>

      <main>
        {/* 3. HERO SECTION (Faithful fusion of Image 1 Brigitte Schwartz + Image 2 Jack Ryan + Image 3 GAZU) */}
        <section className="gazu-hero">
          <div className="hero-container container">
            {/* Top-Left Tagline (From GAZU Image 3: "FASHION THAT MOVES WITH YOU") */}
            <div className="hero-top-tagline">
              <span className="tagline-eyebrow">DHAKA CINEMA & TV</span>
              <span className="tagline-line-1">ACTING THAT MOVES</span>
              <span className="tagline-line-2">A GENERATION.</span>
              <div className="tagline-rule"></div>
            </div>

            {/* Top-Right Timestamp & Status (From Brigitte Schwartz Image 1: "DECEMBER / 2025 BRIGITTE SCHWARTZ") */}
            <div className="hero-top-right-meta">
              <span className="meta-badge">
                <CheckCircle2 size={12} className="meta-verified-icon" />
                VERIFIED OFFICIAL
              </span>
              <span className="meta-followers">4,747,459 FACEBOOK FANS</span>
              <span className="meta-location">DHAKA, BANGLADESH</span>
            </div>

            {/* Giant Background Typography: T A W S I F */}
            <div className="giant-typography-back" aria-hidden="true">
              <span className="giant-char">T</span>
              <span className="giant-char">A</span>
              <span className="giant-char">W</span>
              <span className="giant-char">S</span>
              <span className="giant-char">I</span>
              <span className="giant-char">F</span>
            </div>

            {/* Real Tawsif Mahbub Cutout Layered Symmetrically In Front */}
            <div className="hero-model-wrap">
              <img 
                src="/assets/fb/tawsif_fb_cutout.png" 
                alt="Tawsif Mahbub — Official Editorial Portrait" 
                className="hero-model-img" 
              />
              <div className="model-ground-shadow"></div>
            </div>

            {/* Bottom-Left Action Group (From GAZU Image 3: "SHOP NOW" + "EXPLORE NEW IN") */}
            <div className="hero-bottom-left">
              <button onClick={() => scrollToSection('collection')} className="gazu-btn-black">
                EXPLORE FILMOGRAPHY
              </button>
              <a 
                href="https://www.facebook.com/TawsifMahbub" 
                target="_blank" 
                rel="noreferrer" 
                className="gazu-link-underline"
              >
                OFFICIAL FACEBOOK <span className="arrow-slant">↗</span>
              </a>
            </div>

            {/* Bottom-Right Stamp (From GAZU Image 3: "NEW COLLECTION 2024") */}
            <div className="hero-bottom-right">
              <span className="hero-br-label">MERIL-PROTHOM ALO WINNER</span>
              <span className="hero-br-title">BEST TV ACTOR</span>
              <span className="hero-br-year">2026 ARCHIVE</span>
              <div className="br-underline"></div>
            </div>
          </div>
        </section>

        {/* 4. THREE-CATEGORY STRIP (From GAZU Image 3: Black Bar with MEN / WOMEN / KIDS) */}
        <section className="gazu-category-bar" id="pillars">
          <div className="container category-grid">
            {pillarCards.map(pillar => (
              <div 
                key={pillar.id} 
                className="category-card"
                onClick={() => {
                  setActiveFilter(pillar.id);
                  scrollToSection('collection');
                }}
              >
                <div className="cat-thumb-box">
                  <img src={pillar.image} alt={pillar.title} className="cat-thumb-img" />
                </div>
                <div className="cat-info-box">
                  <span className="cat-badge-label">{pillar.badge}</span>
                  <h3 className="cat-title">{pillar.title}</h3>
                  <p className="cat-desc">{pillar.subtitle}</p>
                  <span className="cat-link">
                    {pillar.linkText} <span className="cat-arrow">→</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. SPOTLIGHT BANNER ("NEW VIBES" Section from GAZU Image 3) */}
        <section className="gazu-spotlight-section" id="spotlight">
          <div className="container">
            <div className="spotlight-banner-box">
              {/* Left Side: Editorial Typography & Copy */}
              <div className="spotlight-text-col">
                <span className="spotlight-eyebrow">NEW ERA & STREAMING ORIGINALS</span>
                <h2 className="spotlight-headline">
                  NEW<br />VIBES
                </h2>
                <p className="spotlight-p">
                  Discover the artistic transformation of Tawsif Mahbub. From beloved rooftop romantic telefilms 
                  to Vicky Zahed's dark psychological thrillers like <em>Chokro</em> and upcoming cinema feature leaps.
                </p>
                <div className="spotlight-metrics-row">
                  <div className="metric-cell">
                    <span className="metric-number">4.75M</span>
                    <span className="metric-label">Facebook Fandom</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-number">539K+</span>
                    <span className="metric-label">Monthly Active Engagement</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-number">13+ Yrs</span>
                    <span className="metric-label">Television & OTT Legacy</span>
                  </div>
                </div>
                <button onClick={() => scrollToSection('collection')} className="gazu-btn-black">
                  EXPLORE ICONIC ROLES
                </button>
              </div>

              {/* Right Side: High-Fashion Real Photo from Verified Page */}
              <div className="spotlight-photo-col">
                <img 
                  src="/assets/fb/fb_photo_0.jpg" 
                  alt="Tawsif Mahbub Official Portrait with Sunglasses" 
                  className="spotlight-photo-img" 
                />
                <div className="photo-credit-tag">
                  OFFICIAL FACEBOOK PORTRAIT • DHAKA
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TRUST & QUICK STATS STRIP (Line Icons from GAZU Image 3) */}
        <section className="gazu-trust-strip">
          <div className="container trust-grid">
            {quickStats.map((item, idx) => (
              <div key={idx} className="trust-item">
                <div className="trust-icon-wrap">
                  {item.icon === 'Clock' && <Clock size={28} strokeWidth={1.5} />}
                  {item.icon === 'Film' && <Film size={28} strokeWidth={1.5} />}
                  {item.icon === 'Award' && <Award size={28} strokeWidth={1.5} />}
                  {item.icon === 'Users' && <Users size={28} strokeWidth={1.5} />}
                </div>
                <div className="trust-text-wrap">
                  <h4 className="trust-title">{item.title}</h4>
                  <p className="trust-sub">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. BEST OF TAWSIF (The 4 Product Cards from GAZU Image 3: "BEST OF GAZU") */}
        <section className="gazu-collection-section" id="collection">
          <div className="container">
            <div className="collection-header-row">
              <div className="collection-header-left">
                <h2 className="collection-title">BEST OF TAWSIF</h2>
                <div className="filter-pill-group">
                  <button 
                    className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    ALL RELEASES
                  </button>
                  <button 
                    className={`filter-pill ${activeFilter === 'romance' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('romance')}
                  >
                    ROMANCE & DRAMA
                  </button>
                  <button 
                    className={`filter-pill ${activeFilter === 'ott' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('ott')}
                  >
                    OTT THRILLERS
                  </button>
                  <button 
                    className={`filter-pill ${activeFilter === 'comedy' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('comedy')}
                  >
                    YOUTH COMEDY
                  </button>
                </div>
              </div>
              <button 
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className="gazu-view-all-link"
              >
                RESET FILTERS
              </button>
            </div>

            {/* Editorial Card Grid */}
            <div className="collection-cards-grid">
              {filteredWorks.map(work => (
                <article 
                  key={work.id} 
                  className="product-card"
                  onClick={() => setSelectedWork(work)}
                >
                  <div className="card-image-box">
                    <img src={work.image} alt={work.title} className="card-product-img" />
                    <button 
                      className="heart-btn"
                      onClick={(e) => toggleFavorite(work.id, e)}
                      aria-label="Save to favorites"
                    >
                      <Heart 
                        size={17} 
                        className={favorites.includes(work.id) ? "heart-filled" : "heart-empty"} 
                      />
                    </button>
                    <span className="card-badge-pill">{work.badge}</span>
                  </div>

                  <div className="card-info-box">
                    <div className="card-meta-line">
                      <span className="card-category">{work.category}</span>
                      <span className="card-year">{work.year}</span>
                    </div>
                    <h3 className="card-title">{work.title}</h3>
                    <p className="card-role">
                      <strong>Role:</strong> {work.roleName || 'Lead Actor'}
                    </p>
                    <p className="card-director">Dir. {work.director} • Co-Star: {work.coStar}</p>
                    <div className="card-footer-line">
                      <span className="card-views">{work.views}</span>
                      <span className="card-action">QUICK VIEW →</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 8. BIOGRAPHY & EXHAUSTIVE DOSSIER ARCHIVE SECTION */}
        <section className="gazu-bio-section" id="about">
          <div className="container bio-layout-grid">
            {/* Left Column: Authentic Detailed Story */}
            <div className="bio-narrative-col">
              <span className="editorial-label">OFFICIAL BIOGRAPHY</span>
              <h2 className="bio-main-title">
                THE ELECTRICAL ENGINEER WHO BECAME THE VOICE OF URBAN BENGALI FICTION
              </h2>

              <p className="bio-lead-p">
                {profileData.officialBio}
              </p>

              <blockquote className="gazu-quote-box">
                "One of the biggest songs my underground rock band released back in 2009 was titled 'Natok'. 
                It is pure poetry that a decade later, television dramas became my true lifelong craft."
              </blockquote>

              <p className="bio-body-p">
                Before becoming a household name across Bangladesh and West Bengal, Tawsif Mahbub earned his 
                <strong> Bachelor of Science in Electrical and Electronic Engineering (EEE)</strong> from American 
                International University-Bangladesh (AIUB, Class of 2011). In his youth, he played bass guitar 
                for underground rock bands <em>The Manager</em> and <em>Divine Sanity</em>.
              </p>

              <p className="bio-body-p">
                Spotted by celebrated filmmaker Adnan Al Rajeev in 2010 for a Nescafé commercial, Tawsif took 
                the national screen by storm on Valentine's Day 2013 with <strong>@18 - All Time Dourer Upor</strong> 
                playing Fahim. His lightning-fast comic timing, authentic urban swagger, and heartfelt emotional range 
                breathed fresh life into contemporary television fiction.
              </p>

              <div className="bio-bullet-box">
                <h4 className="bullet-box-title">PERSONAL MILESTONES & CORE FACTS</h4>
                <ul className="bullet-list">
                  <li>
                    <strong>Marriage:</strong> Married Jannatul Ferdous Zara on February 9, 2018. Their grand Walima was celebrated at the Officers' Club, Bailey Road, Dhaka.
                  </li>
                  <li>
                    <strong>Family Heritage:</strong> Born in Daulatkhan, Bhola District; son of Mahbub Alam and Sultana Parveen.
                  </li>
                  <li>
                    <strong>Fandom Hub:</strong> Over <strong>4.75 Million verified followers</strong> on Facebook (<code>facebook.com/TawsifMahbub</code>) with over 539,000 monthly active engagements.
                  </li>
                  <li>
                    <strong>Brotherhood:</strong> Lifelong close camaraderie with contemporaries Siam Ahmed and Farhan Ahmed Jovan.
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Architectural Verified Specs Table */}
            <div className="bio-dossier-col">
              <div className="dossier-panel">
                <div className="dossier-top">
                  <span className="dossier-label">OFFICIAL DOSSIER RECORD</span>
                  <span className="dossier-code">ID: TM-BD-1988</span>
                </div>

                <div className="dossier-table">
                  <div className="dossier-row">
                    <span className="d-key">Full Name</span>
                    <span className="d-val">{profileData.name} ({profileData.nativeName})</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">Date of Birth</span>
                    <span className="d-val">{profileData.birthDate} (Scorpio)</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">Birthplace / Roots</span>
                    <span className="d-val">{profileData.birthPlace}</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">Education Degree</span>
                    <span className="d-val">{profileData.degrees}</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">Height / Frame</span>
                    <span className="d-val">{profileData.height} • Athletic Build</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">Spouse</span>
                    <span className="d-val">{profileData.wife}</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">Breakthrough Work</span>
                    <span className="d-val">{profileData.breakthrough}</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">TV Accolade</span>
                    <span className="d-val">Meril-Prothom Alo Best Actor Winner</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">OTT Accolade</span>
                    <span className="d-val">BIFA Best Actor (Popular OTT)</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">Facebook Community</span>
                    <span className="d-val">{profileData.fbFollowers}</span>
                  </div>
                  <div className="dossier-row">
                    <span className="d-key">Musical Career</span>
                    <span className="d-val">{profileData.music}</span>
                  </div>
                </div>

                <div className="dossier-actions">
                  <a href="/tawsif_mahbub_data.json" download className="dossier-download-btn">
                    DOWNLOAD VERIFIED ARCHIVE JSON ↓
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. AWARDS & CRITICAL ACCREDITATION */}
        <section className="gazu-awards-section" id="awards">
          <div className="container">
            <div className="section-head-left">
              <span className="editorial-label">INDUSTRY HONORS</span>
              <h2 className="section-title-large">AWARDS & CRITICAL RECOGNITIONS</h2>
            </div>

            <div className="awards-table-box">
              <table className="awards-table">
                <thead>
                  <tr>
                    <th>YEAR</th>
                    <th>AWARDING INSTITUTION</th>
                    <th>HONORED WORK</th>
                    <th>CATEGORY</th>
                    <th>OUTCOME</th>
                  </tr>
                </thead>
                <tbody>
                  {awardsList.map((item, idx) => (
                    <tr key={idx} className={item.status === 'WON' ? 'row-winner' : ''}>
                      <td className="award-year">{item.year}</td>
                      <td className="award-inst">{item.institution}</td>
                      <td className="award-work"><em>{item.work}</em></td>
                      <td className="award-cat">{item.category}</td>
                      <td>
                        <span className={`status-tag ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 10. VERIFIED ACCORDION / NO UNSPOKEN NEWS */}
        <section className="gazu-records-section" id="records">
          <div className="container">
            <div className="records-inner-box">
              <span className="editorial-label">PUBLIC INTEGRITY & JOURNALISTIC CLARITY</span>
              <h2 className="section-title-large">VERIFIED INCIDENTS & CLEARANCES</h2>
              <p className="records-sub-p">
                Zero omissions. Full factual transparency on police records, cyber extortion cases, and on-set medical events.
              </p>

              <div className="records-accordion-list">
                {verifiedIncidents.map(inc => (
                  <div key={inc.id} className="accordion-card">
                    <button 
                      className="accordion-trigger"
                      onClick={() => setOpenIncident(openIncident === inc.id ? null : inc.id)}
                    >
                      <span className="inc-badge">{inc.tag}</span>
                      <span className="inc-title">{inc.title}</span>
                      <span className="inc-date">{inc.date}</span>
                      <ChevronDown 
                        size={18} 
                        className={`chevron-icon ${openIncident === inc.id ? 'rotated' : ''}`} 
                      />
                    </button>

                    {openIncident === inc.id && (
                      <div className="accordion-body">
                        <p>{inc.summary}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 11. CONTACT & BOOKING */}
        <section className="gazu-contact-section" id="contact">
          <div className="container contact-grid-box">
            <div className="contact-left-col">
              <span className="editorial-label">DIRECT COLLABORATION</span>
              <h2 className="section-title-large">BOOKING & CASTING ENQUIRIES</h2>
              <p className="contact-lead">
                For feature film lead casting, OTT streaming originals, festive telefilm productions, 
                and major corporate brand ambassadorships.
              </p>

              <div className="contact-details-stack">
                <div className="c-box">
                  <span className="c-head">RESIDENCE / BASE</span>
                  <span className="c-info">Dhanmondi, Dhaka 1205, Bangladesh</span>
                </div>
                <div className="c-box">
                  <span className="c-head">VERIFIED DIGITAL CHANNELS</span>
                  <div className="c-pills">
                    <a href="https://www.facebook.com/TawsifMahbub" target="_blank" rel="noreferrer" className="pill-link fb-link-highlight">
                      Facebook (4.75M Verified) ↗
                    </a>
                    <a href="https://www.instagram.com/tawsifmahbub/" target="_blank" rel="noreferrer" className="pill-link">
                      Instagram (2.7M) ↗
                    </a>
                    <a href="https://www.imdb.com/name/nm8977227/" target="_blank" rel="noreferrer" className="pill-link">
                      IMDb Profile ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-right-col">
              <form 
                className="gazu-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you. Your casting inquiry has been received and routed to Tawsif Mahbub official management.');
                }}
              >
                <h3 className="form-heading">TRANSMIT CASTING BRIEF</h3>
                <div className="field-row">
                  <label>PRODUCTION HOUSE / DIRECTOR</label>
                  <input type="text" placeholder="e.g. Chorki, Hoichoi, CMV, RTV" required />
                </div>
                <div className="field-row">
                  <label>OFFICIAL BUSINESS EMAIL</label>
                  <input type="email" placeholder="producer@production.com" required />
                </div>
                <div className="field-row">
                  <label>PROJECT CLASSIFICATION</label>
                  <select required defaultValue="">
                    <option value="" disabled>Select project type</option>
                    <option value="film">Feature Film Leading Role</option>
                    <option value="ott">OTT Web Series Lead</option>
                    <option value="drama">Eid / Festival Telefilm Fiction</option>
                    <option value="brand">Commercial TVC / Brand Endorsement</option>
                  </select>
                </div>
                <div className="field-row">
                  <label>PROJECT SYNOPSIS & SHOOTING TIMELINE</label>
                  <textarea rows={4} placeholder="Project synopsis, director name, estimated dates, and shooting schedule..." required></textarea>
                </div>
                <button type="submit" className="gazu-btn-black w-full">
                  DISPATCH CASTING BRIEF →
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* 12. FOOTER (Exact GAZU Signature Simplicity) */}
      <footer className="gazu-footer">
        <div className="container footer-stack">
          <div className="footer-huge-name">
            TAWSIF MAHBUB
          </div>
          <div className="footer-lower-row">
            <span className="footer-copy">
              © 2026 TAWSIF MAHBUB OFFICIAL DOSSIER. ALL RIGHTS RESERVED.
            </span>
            <div className="footer-links">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                BACK TO TOP ↑
              </button>
              <a href="https://www.facebook.com/TawsifMahbub" target="_blank" rel="noreferrer">
                FACEBOOK
              </a>
              <a href="/tawsif_mahbub_master_dossier.md" target="_blank" rel="noreferrer">
                DOSSIER FILE
              </a>
              <a href="/tawsif_mahbub_data.json" target="_blank" rel="noreferrer">
                RAW JSON
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 13. QUICK VIEW MODAL (Luxury Editorial Modal) */}
      {selectedWork && (
        <div className="modal-backdrop" onClick={() => setSelectedWork(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={() => setSelectedWork(null)}
              aria-label="Close Modal"
            >
              <X size={20} />
            </button>
            <div className="modal-grid">
              <div className="modal-img-col">
                <img src={selectedWork.image} alt={selectedWork.title} className="modal-img" />
              </div>
              <div className="modal-info-col">
                <span className="modal-badge">{selectedWork.badge}</span>
                <h3 className="modal-title">{selectedWork.title}</h3>
                <p className="modal-meta">
                  <strong>Character Role:</strong> {selectedWork.roleName || 'Lead Actor'}<br />
                  <strong>Director:</strong> {selectedWork.director}<br />
                  <strong>Co-Star:</strong> {selectedWork.coStar}<br />
                  <strong>Release Platform:</strong> {selectedWork.platform} ({selectedWork.year})<br />
                  <strong>Audience Metric:</strong> {selectedWork.views}
                </p>
                <p className="modal-desc">{selectedWork.synopsis}</p>
                <div className="modal-btn-row">
                  <button 
                    className="gazu-btn-black"
                    onClick={() => {
                      alert(`Streaming preview details loaded for ${selectedWork.title}`);
                    }}
                  >
                    WATCH TRAILER PREVIEW
                  </button>
                  <button 
                    className="gazu-link-underline"
                    onClick={() => setSelectedWork(null)}
                  >
                    CLOSE WINDOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14. SEARCH MODAL */}
      {showSearchModal && (
        <div className="modal-backdrop" onClick={() => setShowSearchModal(false)}>
          <div className="search-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-wrap">
              <Search size={20} className="search-modal-icon" />
              <input 
                type="text" 
                placeholder="Search by title, director, role (e.g. Chokro, Vicky Zahed, Nehal, Totini)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button onClick={() => setShowSearchModal(false)} className="search-modal-close">
                <X size={20} />
              </button>
            </div>
            {searchQuery.trim() !== '' && (
              <div className="search-results-list">
                <p className="search-count-label">Found {filteredWorks.length} matching works</p>
                {filteredWorks.map(w => (
                  <div 
                    key={w.id} 
                    className="search-item-row"
                    onClick={() => {
                      setSelectedWork(w);
                      setShowSearchModal(false);
                    }}
                  >
                    <img src={w.image} alt={w.title} className="search-item-thumb" />
                    <div className="search-item-info">
                      <span className="search-item-title">{w.title}</span>
                      <span className="search-item-sub">{w.category} • Dir. {w.director}</span>
                    </div>
                    <span className="search-item-arrow">→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
