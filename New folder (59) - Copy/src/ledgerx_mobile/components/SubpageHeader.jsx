import React from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { ArrowLeft, ChevronLeft } from 'lucide-react';

export default function SubpageHeader({ titleBn, titleEn, subtitleBn, subtitleEn, rightAction }) {
  const { language, goBack } = useMobileApp();
  const isBn = language === 'bn';

  return (
    <div
      className="lx-subpage-header"
      style={{
        background: 'var(--bk-pink-gradient)',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(226, 19, 110, 0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Back Button */}
        <button
          onClick={goBack}
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title={isBn ? 'পেছনে ফিরে যান' : 'Go back'}
        >
          <ChevronLeft size={22} strokeWidth={2.8} />
        </button>

        {/* Title & Subtitle */}
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: '-0.2px', lineHeight: 1.2 }}>
            {isBn ? titleBn : titleEn}
          </div>
          {(subtitleBn || subtitleEn) && (
            <div style={{ fontSize: 10.5, color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              {isBn ? subtitleBn : subtitleEn}
            </div>
          )}
        </div>
      </div>

      {/* Right Custom Action (Optional) */}
      {rightAction && (
        <div>
          {rightAction}
        </div>
      )}
    </div>
  );
}
