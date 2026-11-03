import React from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { Home, ReceiptText, QrCode, Volume2, UserCheck } from 'lucide-react';

export default function BottomNav() {
  const { language, activeTab, setActiveTab, currentScreen, setCurrentScreen, navigateTo } = useMobileApp();
  const isBn = language === 'bn';

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentScreen('home');
  };

  const isHomeActive = currentScreen === 'home' && activeTab === 'home';
  const isStatementActive = currentScreen === 'home' && activeTab === 'statement';
  const isSoundboxActive = currentScreen === 'soundbox';
  const isSettingsActive = currentScreen === 'home' && activeTab === 'settings';

  return (
    <nav className="bk-bottom-nav">
      {/* 1. Home Tab */}
      <button
        className={`bk-nav-btn ${isHomeActive ? 'active' : ''}`}
        onClick={() => handleTabClick('home')}
      >
        <Home size={21} strokeWidth={isHomeActive ? 2.5 : 2} />
        <span>{isBn ? 'হোম' : 'Home'}</span>
      </button>

      {/* 2. Statement / Khata Tab */}
      <button
        className={`bk-nav-btn ${isStatementActive ? 'active' : ''}`}
        onClick={() => handleTabClick('statement')}
      >
        <ReceiptText size={21} strokeWidth={isStatementActive ? 2.5 : 2} />
        <span>{isBn ? 'লেনদেন' : 'Statement'}</span>
      </button>

      {/* 3. Center Elevated Floating QR Button */}
      <div
        className="bk-qr-fab"
        onClick={() => navigateTo('qr-hub')}
        title={isBn ? 'কিউআর স্ক্যান ও মার্চেন্ট কিউআর' : 'QR Scan & Pay'}
      >
        <QrCode size={26} strokeWidth={2.4} />
      </div>

      {/* 4. Digital Soundbox Tab */}
      <button
        className={`bk-nav-btn ${isSoundboxActive ? 'active' : ''}`}
        onClick={() => navigateTo('soundbox')}
      >
        <Volume2 size={21} strokeWidth={isSoundboxActive ? 2.5 : 2} />
        <span>{isBn ? 'সাউন্ডবক্স' : 'Soundbox'}</span>
      </button>

      {/* 5. Account / Settings Tab */}
      <button
        className={`bk-nav-btn ${isSettingsActive ? 'active' : ''}`}
        onClick={() => handleTabClick('settings')}
      >
        <UserCheck size={21} strokeWidth={isSettingsActive ? 2.5 : 2} />
        <span>{isBn ? 'আমার একাউন্ট' : 'Account'}</span>
      </button>
    </nav>
  );
}
