import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowUp, Mail, MapPin, Film, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="editorial-colophon-footer">
      <div className="container">
        {/* Top Masthead - Clean, Authoritative & Prestigious */}
        <div className="ecf-masthead">
          <div className="ecf-brand-block">
            <span className="ecf-kicker">OFFICIAL ARTIST PORTFOLIO</span>
            <h2 className="ecf-brand-title">TAWSIF MAHBUB</h2>
            <p className="ecf-brand-tagline">
              Meril-Prothom Alo Best TV Actor Winner • BIFA Best Actor (OTT) • 13+ Years of Screen Excellence
            </p>
          </div>

          <div className="ecf-action-block">
            <Link to="/contact" className="ecf-contact-btn" onClick={scrollToTop}>
              PRODUCTION INQUIRIES <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Central Content Columns — 4 Symmetrical Balanced Columns Just Like PC */}
        <div className="ecf-columns-grid">
          {/* Column 1: Artist Synopsis & Authenticity */}
          <div className="ecf-col ecf-col-bio">
            <span className="ecf-col-label">THE CRAFT & CAREER</span>
            <p className="ecf-bio-text">
              From his breakthrough in <em>@18 All Time Dourer Upor</em> to <em>Bachelor Point</em> and the award-winning <em>Love Sab</em>, shaping modern naturalistic drama.
            </p>
            <div className="ecf-social-chips">
              <a
                href="https://www.facebook.com/TawsifMahbub"
                target="_blank"
                rel="noreferrer"
                className="ecf-social-chip"
              >
                Official Facebook <span>4.75M</span> <ArrowUpRight size={11} />
              </a>
            </div>
          </div>

          {/* Column 2: Main Navigation Directory */}
          <div className="ecf-col ecf-col-nav">
            <span className="ecf-col-label">MAIN DIRECTORY</span>
            <ul className="ecf-nav-list">
              <li><Link to="/" onClick={scrollToTop}>Home Overview</Link></li>
              <li><Link to="/filmography" onClick={scrollToTop}>Complete Filmography</Link></li>
              <li><Link to="/biography" onClick={scrollToTop}>Biography & Craft</Link></li>
              <li><Link to="/awards" onClick={scrollToTop}>Honors & Accolades</Link></li>
              <li><Link to="/gallery" onClick={scrollToTop}>Photo Archive</Link></li>
            </ul>
          </div>

          {/* Column 3: Archive & Feature Dossiers */}
          <div className="ecf-col ecf-col-nav">
            <span className="ecf-col-label">ARCHIVE DOSSIERS</span>
            <ul className="ecf-nav-list">
              <li><Link to="/biography/press-archive" onClick={scrollToTop}>Press & Media Archive</Link></li>
              <li><Link to="/biography/formative-years" onClick={scrollToTop}>Formative Years & Music</Link></li>
              <li><Link to="/biography/acting-method" onClick={scrollToTop}>Acting Method & Stamina</Link></li>
              <li><Link to="/awards/meril-prothom-alo" onClick={scrollToTop}>Meril-Prothom Alo Citation</Link></li>
              <li><Link to="/press-kit" onClick={scrollToTop}>Electronic Press Kit (EPK)</Link></li>
            </ul>
          </div>

          {/* Column 4: Representation & Management Office */}
          <div className="ecf-col ecf-col-liaison">
            <span className="ecf-col-label">MANAGEMENT & INQUIRY</span>
            <div className="ecf-liaison-box">
              <div className="ecf-liaison-row">
                <MapPin size={13} className="ecf-icon" />
                <span>Dhanmondi, Dhaka 1205</span>
              </div>
              <div className="ecf-liaison-row">
                <Mail size={13} className="ecf-icon" />
                <a href="mailto:management@tawsifmahbub.com">management@tawsifmahbub.com</a>
              </div>
              <div className="ecf-liaison-row">
                <Film size={13} className="ecf-icon" />
                <span>Television • OTT • Endorsements</span>
              </div>
              <div className="ecf-liaison-row">
                <ShieldCheck size={13} className="ecf-icon" />
                <span>Screenplay Review: 5–7 Days</span>
              </div>
            </div>
            <div className="ecf-mobile-social-wrap">
              <a
                href="https://www.facebook.com/TawsifMahbub"
                target="_blank"
                rel="noreferrer"
                className="ecf-social-chip"
              >
                Official Facebook <span>4.75M</span> <ArrowUpRight size={11} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="ecf-bottom-bar">
          <div className="ecf-copyright">
            © {new Date().getFullYear()} Tawsif Mahbub. Official Artist Website. All rights reserved.
          </div>

          {/* Professional Developer Branding */}
          <div className="ecf-developer-credit">
            <span className="edc-label">DESIGN &amp; DEVELOPED BY</span>
            <a
              href="https://www.facebook.com/EvoRiseSolutions/"
              target="_blank"
              rel="noopener noreferrer"
              className="edc-badge"
              title="EvoRise Solutions — Digital Product & Engineering Agency"
            >
              <span className="edc-dot" aria-hidden="true"></span>
              <span className="edc-name">EvoRise Solutions</span>
              <ArrowUpRight size={12} className="edc-arrow" />
            </a>
          </div>

          <div className="ecf-colophon-notes">
            <span>Dhaka, Bangladesh</span>
          </div>

          <button onClick={scrollToTop} className="ecf-top-btn" title="Back to Top">
            <span>BACK TO TOP</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}

