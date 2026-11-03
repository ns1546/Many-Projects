import React, { useState } from 'react';
import { Search, X, Film, ArrowRight } from 'lucide-react';
import { allFilmographyWorks } from '../data/dossierData';

export default function SearchModal({ isOpen, onClose, onSelectWork }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const results = allFilmographyWorks.filter(w => {
    const q = searchTerm.toLowerCase();
    return (
      w.title.toLowerCase().includes(q) ||
      w.category.toLowerCase().includes(q) ||
      w.director.toLowerCase().includes(q) ||
      w.coStar.toLowerCase().includes(q) ||
      w.roleName.toLowerCase().includes(q) ||
      w.synopsis.toLowerCase().includes(q)
    );
  });

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div className="search-modal-box" onClick={e => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="search-input-wrap">
            <Search size={18} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Search by title, director, co-star (e.g., Love Sab, Chokro, Ome, Keya Payel)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
              className="search-modal-input"
            />
          </div>
          <button onClick={onClose} className="search-close-btn" aria-label="Close search">
            <X size={18} />
          </button>
        </div>

        <div className="search-results-list">
          {results.length > 0 ? (
            results.map(work => (
              <div
                key={work.id}
                className="search-result-item"
                onClick={() => {
                  onSelectWork(work);
                  onClose();
                }}
              >
                <div className="sri-thumb">
                  <img src={work.image} alt={work.title} />
                </div>
                <div className="sri-info">
                  <div className="sri-meta-line">
                    <span className="sri-year">{work.year}</span>
                    <span className="sri-dot">•</span>
                    <span className="sri-cat">{work.category}</span>
                    <span className="sri-dot">•</span>
                    <span className="sri-dir">Dir: {work.director}</span>
                  </div>
                  <h4 className="sri-title">{work.title}</h4>
                  <p className="sri-role">Role: {work.roleName} | Co-star: {work.coStar}</p>
                </div>
                <div className="sri-arrow">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))
          ) : (
            <div className="search-empty-state">
              <Film size={32} />
              <p>No filmography titles matching "{searchTerm}"</p>
              <span>Try searching by year or actress name (Keya Payel, Tanjin Tisha, Mehazabien, Totini).</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
