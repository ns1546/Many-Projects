import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ExternalLink, ArrowRight } from 'lucide-react';

export default function Header({ onOpenSearch, favoritesCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/filmography', label: 'FILMOGRAPHY' },
    { path: '/biography', label: 'BIOGRAPHY & CRAFT' },
    { path: '/awards', label: 'HONORS & AWARDS' },
    { path: '/gallery', label: 'GALLERY' },
    { path: '/contact', label: 'CONTACT' },
  ];

  const pageLabels = {
    '/': 'HOME',
    '/filmography': 'FILMOGRAPHY',
    '/biography': 'BIOGRAPHY & CRAFT',
    '/awards': 'HONORS & AWARDS',
    '/gallery': 'GALLERY',
    '/contact': 'CONTACT',
    '/press-kit': 'PRESS KIT'
  };

  const getPageLabel = (path) => {
    if (path.startsWith('/works')) return 'PRODUCTION DOSSIER';
    if (path === '/biography/formative-years') return 'BIO: FORMATIVE YEARS';
    if (path === '/biography/acting-method') return 'BIO: ACTING METHOD';
    if (path === '/biography/press-archive') return 'BIO: PRESS ARCHIVE';
    if (path.startsWith('/biography')) return 'BIOGRAPHY & CRAFT';
    if (path === '/awards/meril-prothom-alo') return 'MERIL-PROTHOM ALO';
    if (path === '/awards/bifa-chokro') return 'BIFA OTT BEST ACTOR';
    if (path.startsWith('/awards')) return 'HONORS & AWARDS';
    if (path === '/press-kit') return 'ELECTRONIC PRESS KIT';
    return pageLabels[path] || 'OFFICIAL ARCHIVE';
  };

  const currentPageLabel = getPageLabel(location.pathname);

  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="gazu-header">
      <div className="container header-grid">
        {/* Left: Editorial Menu Toggle Button with Current Page Indicator */}
        <div className="header-nav-left">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`header-menu-btn ${menuOpen ? 'menu-active' : ''}`}
            aria-label="Toggle Menu Drawer"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={15} /> : <Menu size={15} />}
            <span className="menu-btn-label">{menuOpen ? 'CLOSE' : 'MENU'}</span>
            <span className="menu-page-divider">/</span>
            <span className="menu-active-page-name">{currentPageLabel}</span>
          </button>
        </div>

        {/* Center: Iconic Centered Brand Typography (Clean, No "ACTOR" badge) */}
        <div className="header-logo-center">
          <Link
            to="/"
            className="gazu-logo-text"
            onClick={handleNavClick}
          >
            TAWSIF MAHBUB
          </Link>
        </div>

        {/* Right: Direct Booking Inquiry (Clean, No Search button, No Heart badge) */}
        <div className="header-nav-right">
          <Link
            to="/contact"
            onClick={handleNavClick}
            className="header-direct-booking-btn"
            title="Direct Production & Booking Inquiry"
          >
            <span className="header-inquiry-full">DIRECT INQUIRY</span>
            <span className="header-inquiry-short">INQUIRY</span>
          </Link>
        </div>
      </div>

      {/* Editorial Navigation Drawer (Full Menu with Clear Active Page Indicator) */}
      {menuOpen && (
        <div className="editorial-menu-drawer">
          <div className="container menu-drawer-content">
            <div className="drawer-nav-grid">
              {/* Left Column: Numbered Navigation Links with Active Indicator */}
              <div className="drawer-column">
                <span className="drawer-col-title">NAVIGATION DIRECTORY</span>
                {navLinks.map((item, idx) => {
                  const isCurrent =
                    location.pathname === item.path ||
                    (item.path === '/filmography' && location.pathname === '/works');

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={`drawer-nav-item ${isCurrent ? 'active-nav is-current-page' : ''}`}
                    >
                      <span className="nav-num">0{idx + 1}</span>
                      <span className="drawer-nav-label">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right Column: Information, Quick Tools & Official Representation */}
              <div className="drawer-column drawer-meta-col">
                <span className="drawer-col-title">QUICK ACCESS & DISCOVERY</span>
                <div className="drawer-tools-row">
                  <button
                    onClick={() => { setMenuOpen(false); onOpenSearch(); }}
                    className="drawer-action-btn"
                  >
                    SEARCH FILM CATALOG →
                  </button>
                  <Link
                    to="/filmography"
                    onClick={handleNavClick}
                    className="drawer-action-btn"
                  >
                    VIEW SAVED PRODUCTIONS ({favoritesCount})
                  </Link>
                  <Link
                    to="/biography/press-archive"
                    onClick={handleNavClick}
                    className="drawer-action-btn"
                  >
                    PRESS & MEDIA ARCHIVE →
                  </Link>
                  <Link
                    to="/press-kit"
                    onClick={handleNavClick}
                    className="drawer-action-btn"
                  >
                    ELECTRONIC PRESS KIT (EPK) →
                  </Link>
                </div>

                <span className="drawer-col-title" style={{ marginTop: '1.25rem' }}>OFFICIAL VERIFIED SOCIAL</span>
                <a
                  href="https://www.facebook.com/TawsifMahbub"
                  target="_blank"
                  rel="noreferrer"
                  className="drawer-fb-link"
                >
                  OFFICIAL FACEBOOK (4.75M FOLLOWERS) <ExternalLink size={12} style={{ display: 'inline', marginLeft: 4 }} />
                </a>
                <p className="drawer-meta-text">
                  Official digital portfolio of actor Tawsif Mahbub. Representing 13+ years of landmark television dramas, telefilms, and digital streaming originals.
                </p>
                <Link
                  to="/contact"
                  onClick={handleNavClick}
                  className="drawer-booking-btn"
                >
                  MANAGEMENT & SCRIPT INQUIRY <ArrowRight size={13} style={{ display: 'inline', marginLeft: 6 }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
