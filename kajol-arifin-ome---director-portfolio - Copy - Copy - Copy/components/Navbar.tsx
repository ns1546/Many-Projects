import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ menuOpen, setMenuOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[200] flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-500 ${scrolled ? 'bg-[#050505]/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'} ${menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      {/* Logo */}
      <Link
        to="/"
        className="font-heading text-3xl md:text-4xl tracking-tighter text-white hover:text-red-600 transition-colors group"
      >
        OME<span className="text-red-600 group-hover:animate-pulse">.</span>
      </Link>

      {/* Center nav links (desktop) */}
      <div className="hidden md:flex items-center gap-8">
        {[
          { label: 'Works', path: '/works' },
          { label: 'About', path: '/about' },
          { label: 'Achievements', path: '/achievements' },
          { label: 'Archive', path: '/archive' },
          { label: 'Press', path: '/press' },
          { label: 'Contact', path: '/contact' },
        ].map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-xs uppercase tracking-widest font-medium transition-colors duration-300 relative group ${location.pathname.startsWith(link.path) && link.path !== '/' ? 'text-red-600' : 'text-white/60 hover:text-white'}`}
          >
            {link.label}
            <span className={`absolute -bottom-1 left-0 h-[1px] bg-red-600 transition-all duration-300 ${location.pathname.startsWith(link.path) && link.path !== '/' ? 'w-full' : 'w-0 group-hover:w-full'}`} />
          </Link>
        ))}
      </div>

      {/* Hamburger */}
      <button
        onClick={() => setMenuOpen(true)}
        className="w-10 h-10 flex flex-col justify-center items-end gap-1.5 cursor-pointer group"
        aria-label="Open menu"
      >
        <span className="w-8 h-[2px] bg-white group-hover:bg-red-600 transition-colors" />
        <span className="w-5 h-[2px] bg-white group-hover:bg-red-600 group-hover:w-8 transition-all" />
      </button>
    </nav>
  );
};

export default Navbar;
