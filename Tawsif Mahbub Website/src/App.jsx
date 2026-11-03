import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import HomePage from './pages/HomePage';
import FilmographyPage from './pages/FilmographyPage';
import BiographyPage from './pages/BiographyPage';
import AwardsPage from './pages/AwardsPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import WorkDetailPage from './pages/WorkDetailPage';
import BiographyFormativeYearsPage from './pages/BiographyFormativeYearsPage';
import BiographyActingMethodPage from './pages/BiographyActingMethodPage';
import BiographyPressArchivePage from './pages/BiographyPressArchivePage';
import BiographyChapterPage from './pages/BiographyChapterPage';
import AwardsMerilProthomAloPage from './pages/AwardsMerilProthomAloPage';
import AwardsBifaChokroPage from './pages/AwardsBifaChokroPage';
import PressKitPage from './pages/PressKitPage';
import { getWorkSlug } from './data/dossierData';
import { initSecurityShield } from './utils/securityShield';
import DemoOne from './components/ui/demo';
import TextShimmerDemo from './components/ui/text-shimmer-demo';
import TimelineDemo from './components/ui/timeline-demo';

// Scroll To Top on route change helper
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  useEffect(() => {
    initSecurityShield();
  }, []);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('tawsif_favs');
      return saved ? JSON.parse(saved) : [1, 2];
    } catch {
      return [1, 2];
    }
  });

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem('tawsif_favs', JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="editorial-app">
        {/* Universal Header with Editorial Drawer */}
        <Header
          onOpenSearch={() => setShowSearchModal(true)}
          favoritesCount={favorites.length}
        />

        <main className="main-content-flow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Filmography & Work Deep-Dive Routes */}
            <Route
              path="/filmography"
              element={
                <FilmographyPage
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              }
            />
            <Route
              path="/works/:slug"
              element={
                <WorkDetailPage
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              }
            />

            {/* Biography & Dedicated Chapter Sub-Pages */}
            <Route path="/biography" element={<BiographyPage />} />
            <Route path="/biography/:slug" element={<BiographyChapterPage />} />
            <Route path="/biography/formative-years" element={<BiographyFormativeYearsPage />} />
            <Route path="/biography/acting-method" element={<BiographyActingMethodPage />} />
            <Route path="/biography/press-archive" element={<BiographyPressArchivePage />} />

            {/* Awards & Dedicated Citation Sub-Pages */}
            <Route path="/awards" element={<AwardsPage />} />
            <Route path="/awards/meril-prothom-alo" element={<AwardsMerilProthomAloPage />} />
            <Route path="/awards/bifa-chokro" element={<AwardsBifaChokroPage />} />

            {/* Gallery, Contact, & Press Kit Routes */}
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/press-kit" element={<PressKitPage />} />

            {/* UI Demos */}
            <Route path="/demo" element={<div className="pt-24"><DemoOne /></div>} />
            <Route path="/shimmer-demo" element={<div className="pt-24"><TextShimmerDemo /></div>} />
            <Route path="/timeline-demo" element={<div className="pt-24"><TimelineDemo /></div>} />

            {/* Catch-all fallback to Home */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Global Search Modal */}
        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSelectWork={(work) => {
            const slug = work.slug || getWorkSlug(work);
            window.location.href = `/works/${slug}`;
          }}
        />
      </div>
    </BrowserRouter>
  );
}
