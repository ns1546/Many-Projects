import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { allFilmographyWorks, getWorkSlug, pillarCards, pressArticles } from '../data/dossierData';
import { ArrowRight, Trophy, Newspaper, ExternalLink, Globe, ShieldCheck } from 'lucide-react';
import TextShimmer from '../components/ui/text-shimmer';

export default function HomePage({ onSelectWork }) {
  const navigate = useNavigate();

  // Selected 4 landmark productions to highlight on homepage
  const highlightWorks = allFilmographyWorks.slice(0, 4);

  return (
    <div className="home-page-root">
      {/* 1. ICONIC HERO SECTION */}
      <section className="gazu-hero">
        <div className="hero-container container">
          {/* Giant Background Typography: T A W S I F */}
          <div className="giant-typography-back" aria-hidden="true">
            <span className="giant-char">T</span>
            <span className="giant-char">A</span>
            <span className="giant-char">W</span>
            <span className="giant-char">S</span>
            <span className="giant-char">I</span>
            <span className="giant-char">F</span>
          </div>

          {/* New Clean Cutout from User Provided Image */}
          <div className="hero-model-wrap">
            <img
              src="/assets/tawsif_orange_sunglasses_cutout.png"
              alt="Tawsif Mahbub — Official Portrait"
              className="hero-model-img"
            />
            <div className="model-ground-shadow"></div>
          </div>

          {/* Bottom-Left Action Group */}
          <div className="hero-bottom-left">
            <Link to="/filmography" className="gazu-btn-black">
              EXPLORE FILMOGRAPHY <ArrowRight size={14} />
            </Link>
            <a
              href="https://www.facebook.com/TawsifMahbub"
              target="_blank"
              rel="noreferrer"
              className="gazu-link-underline"
            >
              OFFICIAL FACEBOOK <span className="arrow-slant">↗</span>
            </a>
          </div>

          {/* Bottom-Right Accolade Stamp */}
          <div className="hero-bottom-right">
            <TextShimmer
              text="MERIL-PROTHOM ALO AWARD"
              as="span"
              className="hero-br-label font-bold"
              duration={2.5}
            />
            <span className="hero-br-title">BEST TV ACTOR</span>
            <span className="hero-br-year">PUBLIC CHOICE WINNER</span>
            <div className="br-underline"></div>
          </div>
        </div>
      </section>

      {/* 2. THREE-CATEGORY BLACK STRIP (Restored as requested by user) */}
      <section className="gazu-category-bar" id="pillars">
        <div className="container category-grid">
          {pillarCards.map(pillar => (
            <Link
              key={pillar.id}
              to="/filmography"
              className="category-card"
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
            </Link>
          ))}
        </div>
      </section>

      {/* 3. LANDMARK PERFORMANCES PREVIEW (Click to explore full details in Filmography) */}
      <section className="premiere-showcase-section">
        <div className="container">
          <div className="section-head-split">
            <div>
              <span className="editorial-kicker">FEATURED PRODUCTIONS</span>
              <h2 className="editorial-section-title">LANDMARK PERFORMANCES</h2>
            </div>
            <Link to="/filmography" className="section-action-link">
              VIEW COMPLETE FILMOGRAPHY ({allFilmographyWorks.length} WORKS) <ArrowRight size={15} />
            </Link>
          </div>

          <div className="premiere-cards-grid">
            {highlightWorks.map(work => {
              const workSlug = work.slug || getWorkSlug(work);
              return (
                <div
                  key={work.id}
                  className="premiere-work-card"
                  onClick={() => navigate(`/works/${workSlug}`)}
                  title={`Click to view complete dossier for ${work.title}`}
                >
                  <div className="pwc-poster-wrap">
                    <img src={work.image} alt={work.title} className="pwc-poster-img" />
                    <span className="pwc-badge">{work.badge}</span>
                    <div className="pwc-hover-overlay">
                      <span className="pwc-view-btn">VIEW PRODUCTION DOSSIER →</span>
                    </div>
                  </div>
                  <div className="pwc-info">
                    <div className="pwc-meta-line">
                      <span className="pwc-year">{work.year}</span>
                      <span className="pwc-dot">•</span>
                      <span className="pwc-cat">{work.category}</span>
                    </div>
                    <h3 className="pwc-title">{work.title}</h3>
                    <p className="pwc-director">Directed by {work.director}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="home-section-cta-center">
            <Link to="/filmography" className="home-clean-cta-btn">
              EXPLORE FULL PRODUCTION CATALOG ({allFilmographyWorks.length}+ WORKS) →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. ARTIST PROFILE & CRAFT OVERVIEW (Click to read deep dive on Biography & Craft) */}
      <section className="studio-showcase-section" id="about">
        <div className="container">
          <div className="studio-section-header">
            <span className="studio-sec-kicker">ARTIST PROFILE</span>
            <span className="studio-sec-location">DHAKA, BANGLADESH</span>
          </div>

          <div className="studio-editorial-spread">
            {/* Left: Portrait Frame */}
            <div className="studio-poster-wrapper">
              <div className="studio-poster-card">
                <div className="poster-visual-frame">
                  <img
                    src="/assets/tawsif_bio_portrait.jpg"
                    alt="Tawsif Mahbub Official Portrait"
                    className="poster-portrait-img"
                  />
                </div>
                <div className="poster-card-caption">
                  <span>TAWSIF MAHBUB • DHAKA, BANGLADESH</span>
                </div>
              </div>
            </div>

            {/* Right: Narrative Hook with Clear Link to Inner Biography Page */}
            <div className="studio-dossier-column">
              <div className="dossier-inner">
                <span className="dossier-chapter-badge">CAREER OVERVIEW</span>

                <h3 className="dossier-quote-headline">
                  "Acting is not about pretending; it is about finding truth in invented worlds."
                </h3>

                <p className="dossier-lead-text">
                  Over a career spanning more than 130 telefilms, flagship festival dramas, and psychological OTT thrillers, Tawsif Mahbub has brought effortless naturalism to contemporary screen storytelling. From underground rock clubs to national television acclaim, his journey represents dedication to authentic human drama.
                </p>

                <div className="dossier-highlights-grid">
                  <div className="dossier-highlight-item">
                    <span className="dh-number">13+</span>
                    <span className="dh-label">Years on Screen</span>
                    <p className="dh-desc">Leading contemporary Bengali television and streaming originals.</p>
                  </div>

                  <div className="dossier-highlight-item">
                    <span className="dh-number">130+</span>
                    <span className="dh-label">Telefilms & Dramas</span>
                    <p className="dh-desc">Award-winning titles spanning romance, suspense, and social realism.</p>
                  </div>

                  <div className="dossier-highlight-item">
                    <span className="dh-number">50+</span>
                    <span className="dh-label">Filmmakers</span>
                    <p className="dh-desc">Partnering with acclaimed directors across Bangladesh.</p>
                  </div>
                </div>

                <div className="dossier-action-row">
                  <Link to="/biography" className="dossier-primary-btn">
                    BIOGRAPHY & CRAFT OVERVIEW →
                  </Link>
                  <Link to="/biography/formative-years" className="dossier-secondary-btn">
                    FORMATIVE YEARS & MUSIC
                  </Link>
                  <Link to="/biography/acting-method" className="dossier-secondary-btn">
                    ACTING METHOD & CRAFT
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. NATIONAL HONORS & AWARDS SPOTLIGHT (Click to view full citations on Awards page) */}
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
              </div>

              <p className="gtc-citation">
                Presented to Tawsif Mahbub in recognition of his nuanced, vulnerable performance in 'Love Sab'. Voted by television and digital audiences across Bangladesh as the definitive male television performance of the year.
              </p>

              <div className="gtc-action-row">
                <Link to="/awards/meril-prothom-alo" className="gtc-work-link">
                  VIEW OFFICIAL CITATION DOSSIER →
                </Link>
                <Link to="/works/love-sab" className="gtc-work-link">
                  OPEN 'LOVE SAB' DOSSIER →
                </Link>
              </div>
            </div>

            <div className="gtc-right">
              <div className="gtc-poster-frame">
                <img src="/assets/works/love_sab.jpg" alt="Love Sab Poster" />
                <div className="gtc-badge-overlay">
                  <Trophy size={18} />
                  <span>BEST ACTOR WINNER</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VISUAL REPERTOIRE PREVIEW (Click to view interactive 3D reel on Gallery page) */}
      <section className="home-gallery-preview-section">
        <div className="container">
          <div className="section-head-split" style={{ marginBottom: '2rem' }}>
            <div>
              <span className="editorial-kicker">PHOTOGRAPHY & MEDIA</span>
              <h2 className="editorial-section-title">PORTRAITS & PRODUCTION STILLS</h2>
            </div>
            <Link to="/gallery" className="section-action-link">
              EXPLORE FULL GALLERY & 3D REEL <ArrowRight size={15} />
            </Link>
          </div>

          <div className="home-stills-grid">
            <Link to="/gallery" className="home-still-card">
              <img src="/assets/gallery/docx/01_tawsif_editorial_patio.jpg" alt="" aria-hidden="true" className="hsc-ambient-bg" />
              <img src="/assets/gallery/docx/01_tawsif_editorial_patio.jpg" alt="Outdoor Editorial Patio" className="hsc-img" loading="lazy" />
              <div className="hsc-overlay">
                <span>OUTDOOR PATIO EDITORIAL</span>
              </div>
            </Link>
            <Link to="/gallery" className="home-still-card">
              <img src="/assets/gallery/docx/06_tawsif_white_panjabi.jpg" alt="" aria-hidden="true" className="hsc-ambient-bg" />
              <img src="/assets/gallery/docx/06_tawsif_white_panjabi.jpg" alt="Bengali Heritage Session" className="hsc-img" loading="lazy" />
              <div className="hsc-overlay">
                <span>BENGALI HERITAGE SESSION</span>
              </div>
            </Link>
            <Link to="/gallery" className="home-still-card">
              <img src="/assets/gallery/docx/02_tawsif_couture_tuxedo.jpg" alt="" aria-hidden="true" className="hsc-ambient-bg" />
              <img src="/assets/gallery/docx/02_tawsif_couture_tuxedo.jpg" alt="Bespoke Couture Study" className="hsc-img" loading="lazy" />
              <div className="hsc-overlay">
                <span>BESPOKE COUTURE STUDY</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. NATIONAL PRESS & MEDIA SPOTLIGHT */}
      <section className="home-press-spotlight-section">
        <div className="container">
          <div className="section-head-split" style={{ marginBottom: '2rem' }}>
            <div>
              <span className="editorial-kicker">
                <Newspaper size={13} style={{ display: 'inline', marginRight: '6px' }} />
                VERIFIED JOURNALISTIC RECORD
              </span>
              <h2 className="editorial-section-title">PRESS & MEDIA COVERAGE</h2>
            </div>
            <Link to="/biography/press-archive" className="section-action-link">
              EXPLORE FULL PRESS ARCHIVE (6 PUBLICATIONS) <ArrowRight size={15} />
            </Link>
          </div>

          <div className="home-press-grid">
            {pressArticles.slice(0, 3).map(article => (
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

          <div className="home-section-cta-center" style={{ marginTop: '2rem' }}>
            <Link to="/biography/press-archive" className="home-clean-cta-btn">
              VIEW ALL 6 VERIFIED PUBLICATIONS & RETROSPECTIVES →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. MANAGEMENT & SCRIPT DESK (Click to submit production inquiries on Contact page) */}
      <section className="home-booking-banner-section">
        <div className="container">
          <div className="home-booking-banner-card">
            <div className="hbb-content">
              <span className="editorial-kicker">ARTIST REPRESENTATION & SCRIPT DESK</span>
              <h2 className="hbb-title">PRODUCTION & CASTING INQUIRIES</h2>
              <p className="hbb-desc">
                For script submissions, festival appearances, broadcast telefilms, OTT series casting, and commercial brand partnerships.
              </p>
            </div>
            <div className="hbb-action">
              <Link to="/contact" className="hbb-btn">
                SUBMIT PRODUCTION INQUIRY <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
