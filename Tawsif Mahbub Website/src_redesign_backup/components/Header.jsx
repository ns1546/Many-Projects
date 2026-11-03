import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Heart, ExternalLink } from 'lucide-react';

export default function Header({ onOpenSearch, favoritesCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'HOME', num: '01' },
    { path: '/filmography', label: 'SELECTED FILMOGRAPHY', num: '02' },
    { path: '/biography', label: 'BIOGRAPHY & CRAFT', num: '03' },
    { path: '/awards', label: 'HONORS & AWARDS', num: '04' },
    { path: '/gallery', label: 'GALLERY & STILLS', num: '05' },
    { path: '/contact', label: 'DIRECT BOOKING', num: '06' },
  ];

  const handleNavClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="gazu-header">
      <div className="container header-grid">
        {/* Left Navigation Button */}
        <nav className="header-nav-left" aria-label="Main Navigation">
          <button
            className="header-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Navigation Menu"
            title="Open Navigation Menu"
          >
            {menuOpen ? <X size={15} /> : <Menu size={15} />}
            <span>MENU</span>
          </button>
        </nav>

        {/* Center Brand Title */}
        <div className="header-logo-center">
          <Link
            to="/"
            className="gazu-logo-text"
            onClick={handleNavClick}
          >
            TAWSIF MAHBUB
          </Link>
        </div>

        {/* Right Symmetrical Spacer */}
        <div className="header-nav-right" aria-hidden="true"></div>
      </div>

      {/* Global Navigation Drawer (Accessible via MENU button on Desktop & Mobile) */}
      {menuOpen && (
        <div className="editorial-menu-drawer">
          <div className="container menu-drawer-content">
            <div className="drawer-nav-grid">
              {/* Left Column: Numbered Page Navigation */}
              <div className="drawer-column">
                <span className="drawer-col-title">ARCHIVE PAGES</span>
                {navLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`drawer-nav-item ${location.pathname === item.path ? 'active-nav' : ''}`}
                  >
                    <span className="nav-num">{item.num}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Right Column: Search & Quick Actions */}
              <div className="drawer-column drawer-meta-col">
                <span className="drawer-col-title">ARCHIVE TOOLS</span>
                <div className="drawer-tools-row">
                  <button
                    onClick={() => { setMenuOpen(false); onOpenSearch(); }}
                    className="drawer-action-btn"
                  >
                    <Search size={14} /> SEARCH FILM ARCHIVE
                  </button>
                  <Link
                    to="/filmography"
                    onClick={handleNavClick}
                    className="drawer-action-btn"
                  >
                    <Heart size={14} /> SAVED WORKS ({favoritesCount})
                  </Link>
                </div>

                <span className="drawer-col-title" style={{ marginTop: '1.25rem' }}>OFFICIAL VERIFIED CHANNEL</span>
                <a
                  href="https://www.facebook.com/TawsifMahbub"
                  target="_blank"
                  rel="noreferrer"
                  className="drawer-fb-link"
                >
                  OFFICIAL FACEBOOK (4.75M FOLLOWERS) <ExternalLink size={12} style={{ display: 'inline', marginLeft: 4 }} />
                </a>
                <p className="drawer-meta-text">
                  The verified official digital dossier of television actor Tawsif Mahbub. Representing 13+ years of seminal television drama, telefilms, and digital originals.
                </p>
                <Link
                  to="/contact"
                  onClick={handleNavClick}
                  className="drawer-booking-btn"
                >
                  REQUEST BOOKING / SCRIPT →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
