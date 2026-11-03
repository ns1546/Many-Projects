import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { galleryItems } from '../data/dossierData';
import { Eye, X, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeModalImage, setActiveModalImage] = useState(null);

  const categories = [
    { id: 'all', label: `ALL ASSETS (${galleryItems.length})` },
    { id: 'Studio Editorial', label: 'STUDIO EDITORIAL' },
    { id: 'Production Still', label: 'ON-SET & STILLS' },
    { id: 'Awards & Red Carpet', label: 'AWARDS & RED CARPET' },
    { id: 'Character Study', label: 'CHARACTER STUDIES' }
  ];

  const filteredItems = galleryItems.filter(item => {
    return activeCategory === 'all' || item.category === activeCategory;
  });

  return (
    <div className="gallery-page-root">
      {/* 1. PAGE HEADER */}
      <section className="page-header-section">
        <div className="container">
          <span className="editorial-kicker">PHOTOGRAPHY & MEDIA</span>
          <h1 className="page-main-title">PORTRAITS & EDITORIAL ARCHIVE</h1>
          <p className="page-subtitle-text">
            Official photographic documentation: studio portraits, on-set production stills, character studies, and verified awards imagery.
          </p>

          <div className="gallery-filter-tabs">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`gallery-filter-btn ${activeCategory === cat.id ? 'active-filter' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. PHOTO MASONRY / GRID WITH SMART CONTAINMENT & AMBIENT BACKDROP */}
      <section className="gallery-grid-section">
        <div className="container">
          <div className="editorial-photo-grid">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="gallery-card"
                onClick={() => setActiveModalImage(item)}
              >
                <div className="gc-image-wrap">
                  {/* Smart Ambient Backdrop: Soft blurred reflection filling the frame margins */}
                  <img
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    className="gc-ambient-backdrop"
                  />
                  {/* Smart Contained Foreground: 100% full picture visible with zero cropping */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="gc-img"
                    loading="lazy"
                  />
                  <div className="gc-overlay">
                    <span className="gc-category-badge">{item.category}</span>
                    <span className="gc-inspect-btn"><Eye size={15} /> VIEW FULL PHOTO</span>
                  </div>
                </div>
                <div className="gc-info">
                  <h3 className="gc-title">{item.title}</h3>
                  <p className="gc-caption">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. VERIFIED MEDIA & PRESS DOSSIER (NO DOWNLOAD) */}
      <section className="media-kit-section">
        <div className="container">
          <div className="media-kit-box">
            <div className="mkb-content">
              <span className="editorial-kicker">PRESS & INDUSTRY RESOURCES</span>
              <h2 className="mkb-title">OFFICIAL MEDIA & PRESS KIT</h2>
              <p className="mkb-desc">
                High-resolution promotional headshots, verified biographical summaries, and official archival assets for film festival programs, broadcast coverage, and press publications.
              </p>
            </div>
            <div className="mkb-action">
              <Link
                to="/press-kit"
                className="mkb-explore-btn"
              >
                <Sparkles size={15} /> EXPLORE PRESS DOSSIER <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIGHTBOX MODAL (NO DOWNLOAD) */}
      {activeModalImage && (
        <div className="gallery-modal-backdrop" onClick={() => setActiveModalImage(null)}>
          <div className="gallery-modal-card" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setActiveModalImage(null)}
              className="modal-close-btn"
              aria-label="Close image modal"
            >
              <X size={20} />
            </button>
            <div className="gm-image-container">
              <img
                src={activeModalImage.image}
                alt=""
                aria-hidden="true"
                className="gm-ambient-bg"
              />
              <img
                src={activeModalImage.image}
                alt={activeModalImage.title}
                className="gm-full-img"
              />
            </div>
            <div className="gm-caption-box">
              <span className="gm-badge">{activeModalImage.category}</span>
              <h3 className="gm-title">{activeModalImage.title}</h3>
              <p className="gm-caption">{activeModalImage.caption}</p>
              <div className="gm-meta-tag">
                <Sparkles size={13} /> OFFICIAL ARCHIVAL PORTRAIT • VERIFIED
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
