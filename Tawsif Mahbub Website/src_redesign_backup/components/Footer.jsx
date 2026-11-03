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
        {/* Top Colophon Masthead */}
        <div className="ecf-masthead">
          <div className="ecf-brand-block">
            <span className="ecf-kicker">OFFICIAL ARCHIVE & ARTIST DOSSIER</span>
            <h2 className="ecf-brand-title">TAWSIF MAHBUB</h2>
            <p className="ecf-brand-tagline">
              Meril-Prothom Alo Best TV Actor Winner • BIFA Best Actor (OTT) • 13+ Years of Screen Excellence
            </p>
          </div>

          <div className="ecf-action-block">
            <Link to="/contact" className="ecf-contact-btn" onClick={scrollToTop}>
              PRODUCTION & SCRIPT INQUIRIES <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>

        {/* Central Editorial Content Columns */}
        <div className="ecf-columns-grid">
          {/* Column 1: Artist Synopsis & Authenticity */}
          <div className="ecf-col ecf-col-bio">
            <span className="ecf-col-label">THE CRAFT & LEGACY</span>
            <p className="ecf-bio-text">
              From his breakthrough in <em>@18 All Time Dourer Upor</em>{' '}to the cultural phenomenon of{' '}<em>Bachelor Point</em>{' '}and the award-winning emotional depth of{' '}<em>Love Sab</em>, Tawsif Mahbub continues to shape contemporary Bangladeshi screen fiction with honesty, emotional precision, and naturalistic screen presence.
            </p>
            <div className="ecf-social-chips">
              <a
                href="https://www.facebook.com/TawsifMahbub"
                target="_blank"
                rel="noreferrer"
                className="ecf-social-chip"
              >
                Official Facebook <span>4.75M Followers</span> <ArrowUpRight size={11} />
              </a>
            </div>
          </div>

          {/* Column 2: Archival Navigation Index */}
          <div className="ecf-col ecf-col-nav">
            <span className="ecf-col-label">ARCHIVE INDEX</span>
            <ul className="ecf-nav-list">
              <li><Link to="/" onClick={scrollToTop}>Flagship Home</Link></li>
              <li><Link to="/filmography" onClick={scrollToTop}>Selected Filmography (20+ Works)</Link></li>
              <li><Link to="/biography" onClick={scrollToTop}>Biography & Chronology</Link></li>
              <li><Link to="/awards" onClick={scrollToTop}>Honors & Meril-Prothom Alo</Link></li>
              <li><Link to="/gallery" onClick={scrollToTop}>Visual Stills & Media Kit</Link></li>
              <li><Link to="/contact" onClick={scrollToTop}>Direct Artist Inquiries</Link></li>
            </ul>
          </div>

          {/* Column 3: Representation & Office */}
          <div className="ecf-col ecf-col-liaison">
            <span className="ecf-col-label">TALENT REPRESENTATION</span>
            <div className="ecf-liaison-box">
              <div className="ecf-liaison-row">
                <MapPin size={14} className="ecf-icon" />
                <span>Dhanmondi, Dhaka 1205, Bangladesh</span>
              </div>
              <div className="ecf-liaison-row">
                <Mail size={14} className="ecf-icon" />
                <a href="mailto:management@tawsifmahbub.com">management@tawsifmahbub.com</a>
              </div>
              <div className="ecf-liaison-row">
                <Film size={14} className="ecf-icon" />
                <span>Television Fiction • Digital OTT • Brand Endorsements</span>
              </div>
              <div className="ecf-liaison-row">
                <ShieldCheck size={14} className="ecf-icon" />
                <span>Formal Screenplay Review Window: 5–7 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="ecf-bottom-bar">
          <div className="ecf-copyright">
            © {new Date().getFullYear()} Tawsif Mahbub. Official Digital Archive. All production credits verified.
          </div>

          <div className="ecf-colophon-notes">
            <span>Archival Monograph • Dhaka, Bangladesh</span>
          </div>

          <button onClick={scrollToTop} className="ecf-top-btn" title="Back to Top">
            <span>RETURN TO APEX</span>
            <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}
}
