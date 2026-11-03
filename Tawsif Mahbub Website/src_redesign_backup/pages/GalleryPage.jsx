import React, { useState } from 'react';
import { galleryItems } from '../data/dossierData';
import { Download, Eye, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import Tawsif3DScrollGallery from '../components/ui/tawsif-3d-scroll-gallery';

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeModalImage, setActiveModalImage] = useState(null);

  const categories = [
    { id: 'all', label: `ALL ASSETS (${galleryItems.length})` },
    { id: 'Studio Editorial', label: 'STUDIO EDITORIAL' },
    { id: 'Production Still', label: 'ON-SET & STILLS' },
    { id: 'Key Art Poster', label: 'KEY ART & POSTERS' },
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
          <span className="editorial-kicker">VISUAL REPERTOIRE & STILLS</span>
          <h1 className="page-main-title">STILLS & EDITORIAL GALLERY</h1>
          <p className="page-subtitle-text">
            Official photographic documentation: studio monograph portraits, on-set production stills, character transformations, and high-resolution media stills.
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

      {/* 2. 3D CINEMATIC PERSPECTIVE SCROLL REEL */}
      <Tawsif3DScrollGallery
        onSelectItem={(item) => setActiveModalImage({
          id: item.id,
          title: item.title,
          category: item.category,
          image: item.image,
          caption: `${item.title} — ${item.category} (${item.year || 'Official Archive'}).`
        })}
      />

      {/* 3. PHOTO MASONRY / GRID */}
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
                  <img src={item.image} alt={item.title} className="gc-img" />
                  <div className="gc-overlay">
                    <span className="gc-category-badge">{item.category}</span>
                    <span className="gc-inspect-btn"><Eye size={15} /> VIEW HI-RES</span>
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

      {/* 3. DOWNLOADABLE MEDIA KIT BANNER */}
      <section className="media-kit-section">
        <div className="container">
          <div className="media-kit-box">
            <div className="mkb-content">
              <span className="editorial-kicker">PRESS & PRODUCER RESOURCE</span>
              <h2 className="mkb-title">OFFICIAL ACTOR MEDIA KIT</h2>
              <p className="mkb-desc">
                High-resolution uncompressed promotional headshots, comprehensive biographical PDF dossier, and official portrait assets for film festival programs and news publications.
              </p>
            </div>
            <div className="mkb-action">
              <a
                href="/assets/tawsif_bio_portrait.jpg"
                download="Tawsif_Mahbub_Official_Portrait.jpg"
                className="mkb-download-btn"
              >
                <Download size={15} /> DOWNLOAD HI-RES HEADSHOT (JPG)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIGHTBOX MODAL */}
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
              <img src={activeModalImage.image} alt={activeModalImage.title} className="gm-full-img" />
            </div>
            <div className="gm-caption-box">
              <span className="gm-badge">{activeModalImage.category}</span>
              <h3 className="gm-title">{activeModalImage.title}</h3>
              <p className="gm-caption">{activeModalImage.caption}</p>
              <a
                href={activeModalImage.image}
                download={`${activeModalImage.title}.jpg`}
                className="gm-download-link"
              >
                <Download size={13} /> DOWNLOAD SOURCE IMAGE
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
      )}
    </div >
  );
}
