import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
import ClapperboardLogin from './components/ClapperboardLogin';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import WorksPage from './pages/WorksPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ArchivePage from './pages/ArchivePage';
import CollaboratorsPage from './pages/CollaboratorsPage';
import PressPage from './pages/PressPage';
import PressDetailsPage from './pages/PressDetailsPage';
import ContactPage from './pages/ContactPage';
import PhilosophyPage from './pages/PhilosophyPage';
import TimelinePage from './pages/TimelinePage';
import QuotesPage from './pages/QuotesPage';
import FuturePage from './pages/FuturePage';
import GalleryPage from './pages/GalleryPage';
import FirstsPage from './pages/FirstsPage.tsx';
import DirectorDeskPage from './pages/DirectorDeskPage.tsx';
import ScriptToScreenPage from './pages/ScriptToScreenPage.tsx';
import StoriesBehindFramesPage from './pages/StoriesBehindFramesPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import AchievementsPage from './pages/AchievementsPage';
import MediaContributionPage from './pages/MediaContributionPage';
import AchievementDetailsPage from './pages/AchievementDetailsPage';

gsap.registerPlugin(ScrollTrigger);

const ScrollToTop: React.FC<{ entered: boolean }> = ({ entered }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (entered) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    window.scrollTo(0, 0);
    // Allow DOM to update before refreshing ScrollTrigger
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  }, [pathname, entered]);
  return null;
};

const SiteLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="relative bg-[#050505] min-h-screen selection:bg-red-600 selection:text-white overflow-x-hidden">
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Sidebar menu overlay */}
      <div
        className={`fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Sidebar menu panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[420px] bg-[#080808] border-l border-white/10 z-[310] flex flex-col justify-center px-12 py-20 overflow-y-auto transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-8 right-8 w-10 h-10 flex flex-col justify-center items-center gap-1.5 cursor-pointer group"
        >
          <span className="w-7 h-[2px] bg-white group-hover:bg-red-600 transition-colors rotate-45 translate-y-[5px]" />
          <span className="w-7 h-[2px] bg-white group-hover:bg-red-600 transition-colors -rotate-45 -translate-y-[3px]" />
        </button>

        <p className="text-red-600 font-heading tracking-[0.5em] text-xs mb-10 uppercase mt-12 md:mt-0">Navigation</p>

        <nav className="flex flex-col gap-1 pb-12 md:pb-0">
          {[
            { label: 'Home', path: '/' },
            { 
              label: 'Works', 
              path: '/works', 
              sub: [
                { label: 'Web Series', path: '/works?category=web-series' },
                { label: 'Single Drama', path: '/works?category=single-drama' },
                { label: 'Short Film', path: '/works?category=short-film' },
                { label: 'Telefilm', path: '/works?category=telefilm' }
              ] 
            },
            { label: 'Achievements', path: '/achievements' },
            { 
              label: 'About', 
              path: '/about', 
              sub: [
                { label: 'Career Timeline', path: '/about/timeline' },
                { label: 'Achievements', path: '/achievements' },
                { label: 'My Firsts', path: '/about/firsts' },
                { label: 'Philosophy', path: '/about/philosophy' },
                { label: 'Director\'s Desk', path: '/about/desk' },
                { label: 'Quotes', path: '/about/quotes' }
              ] 
            },
            { 
              label: 'Behind The Scenes', 
              path: '/archive', // Fallback path if they click the main link, though usually they click sub
              sub: [
                { label: 'Script to Screen', path: '/script-to-screen' },
                { label: 'Stories Behind Frames', path: '/stories-behind-frames' },
                { label: 'The Archive', path: '/archive' }
              ]
            },
            { label: 'Collaborators', path: '/collaborators' },
            { label: 'Press', path: '/press' },
            { label: 'Gallery', path: '/gallery' },
            { label: 'Future Plans', path: '/future' },
            { label: 'Contact', path: '/contact' },
          ].map((item, i) => (
            <div key={item.path}>
              {item.sub ? (
                <div
                  className="group flex items-center gap-3 py-2 text-4xl font-heading text-white tracking-wider cursor-default"
                  style={{
                    opacity: menuOpen ? 1 : 0,
                    transform: menuOpen ? 'translateX(0)' : 'translateX(30px)',
                    transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms`,
                  }}
                >
                  <span className="w-0 h-[2px] bg-red-600 group-hover:w-5 transition-all duration-300 mt-1" />
                  {item.label}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="group flex items-center gap-3 py-2 text-4xl font-heading text-white hover:text-red-600 tracking-wider transition-colors duration-300"
                  style={{
                    opacity: menuOpen ? 1 : 0,
                    transform: menuOpen ? 'translateX(0)' : 'translateX(30px)',
                    transition: `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms, color 0.3s`,
                  }}
                >
                  <span className="w-0 h-[2px] bg-red-600 group-hover:w-5 transition-all duration-300 mt-1" />
                  {item.label}
                </Link>
              )}
              {item.sub && (
                <div className="ml-8 flex flex-wrap gap-2 mb-1">
                  {item.sub.map(sub => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      onClick={() => setMenuOpen(false)}
                      className="text-[11px] uppercase tracking-widest text-white/30 hover:text-red-600 transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-8 border-t border-white/10 pt-8">
          <p className="text-white/30 text-xs tracking-widest uppercase mb-2">Connect</p>
          <p className="text-white/60 text-sm hover:text-white transition-colors">hello@omeproductions.com</p>
          <p className="text-white/30 text-xs mt-1 tracking-widest">Dhaka, Bangladesh</p>
        </div>
      </div>

      {/* Scroll progress bar */}
      <div id="scroll-progress" className="fixed bottom-0 left-0 h-1 bg-red-600 z-[60] shadow-[0_0_10px_rgba(229,9,20,0.8)]" style={{ width: '0%' }} />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about/timeline" element={<TimelinePage />} />
          <Route path="/about/firsts" element={<FirstsPage />} />
          <Route path="/about/philosophy" element={<PhilosophyPage />} />
          <Route path="/about/desk" element={<DirectorDeskPage />} />
          <Route path="/about/quotes" element={<QuotesPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:slug" element={<ProjectDetailPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/script-to-screen" element={<ScriptToScreenPage />} />
          <Route path="/stories-behind-frames" element={<StoriesBehindFramesPage />} />
          <Route path="/collaborators" element={<CollaboratorsPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/press/photo/:id" element={<PressDetailsPage />} />
          <Route path="/press-awards" element={<Navigate to="/press" replace />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/achievements/photo/:id" element={<AchievementDetailsPage />} />
          <Route path="/achievements/contribution/:year" element={<MediaContributionPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/future" element={<FuturePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    gsap.ticker.fps(60);
    gsap.ticker.lagSmoothing(0);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleEnter = () => {
    setEntered(true);
    document.body.style.overflow = '';

    // Scroll progress
    gsap.to('#scroll-progress', {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
  };

  return (
    <BrowserRouter>
      <ScrollToTop entered={entered} />
      {!entered && <ClapperboardLogin onEnter={handleEnter} />}
      {entered && <SiteLayout />}
    </BrowserRouter>
  );
};

export default App;
