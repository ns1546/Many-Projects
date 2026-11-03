import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { X, Volume2, VolumeX, Radio, Play, CheckCircle } from 'lucide-react';
import { soundbox } from '../utils/soundbox';

export default function SoundboxModal() {
  const { language, soundboxEnabled, setSoundboxEnabled, setActiveModal } = useMobileApp();
  const isBn = language === 'bn';

  const [volume, setVolume] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  const testAnnouncement = (type, amount, name) => {
    setIsPlaying(true);
    soundbox.volume = volume;
    soundbox.announce({
      type,
      amount,
      partyName: name,
      language,
    });
    setTimeout(() => setIsPlaying(false), 2400);
  };

  return (
    <div className="bk-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bk-modal-sheet" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: '#FDF2F8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DB2777',
              }}
            >
              <Radio size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1F2937' }}>
                {isBn ? 'স্মার্ট অডিও সাউন্ডবক্স' : 'Digital Soundbox'}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                {isBn ? 'অফলাইন বাংলা ভয়েস লেনদেন ঘোষণা' : 'Offline Bengali voice transaction announcer'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            style={{
              background: '#F3F4F6',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4B5563',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Physical Soundbox Chassis Mockup */}
        <div className="bk-soundbox-chassis" style={{ marginBottom: 16, textAlign: 'center' }}>
          {/* LED Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: isPlaying ? '#00D09C' : (soundboxEnabled ? '#3B82F6' : '#64748B'),
                boxShadow: isPlaying ? '0 0 12px #00D09C' : 'none',
              }}
            />
            <span style={{ fontSize: 10.5, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
              {isPlaying ? (isBn ? 'কথা বলছে...' : 'Speaking...') : (soundboxEnabled ? (isBn ? 'সাউন্ডবক্স সক্রিয়' : 'Soundbox Online') : (isBn ? 'বন্ধ' : 'Muted'))}
            </span>
          </div>

          {/* Speaker Mesh Circular Grille */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              margin: '0 auto 14px auto',
              background: 'radial-gradient(circle, #25334D 20%, #0F172A 80%)',
              border: '3px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isPlaying ? '0 0 25px rgba(226, 19, 110, 0.5)' : 'inset 0 4px 10px rgba(0,0,0,0.6)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <Volume2 size={36} color={isPlaying ? 'var(--bk-pink)' : '#64748B'} />
          </div>

          <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC' }}>
            LedgerX Voicebox 4G Pro
          </div>
          <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 2 }}>
            Bangla TTS Engine • Crystal Clear Chime
          </div>
        </div>

        {/* Master Soundbox Enable / Disable Toggle */}
        <div
          style={{
            background: '#F9FAFB',
            borderRadius: 14,
            padding: '12px 14px',
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
              {isBn ? 'স্বয়ংক্রিয় ভয়েস অ্যালার্ট চালু' : 'Voice Announcements Active'}
            </div>
            <div style={{ fontSize: 10.5, color: '#6B7280' }}>
              {isBn ? 'প্রতিটি বিক্রি ও টাকা জমার পর স্বয়ংক্রিয় ঘোষণা' : 'Auto announces sales and dues'}
            </div>
          </div>
          <button
            onClick={() => setSoundboxEnabled(!soundboxEnabled)}
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              background: soundboxEnabled ? 'var(--bk-pink)' : '#D1D5DB',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: soundboxEnabled ? 25 : 3,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.2s',
              }}
            />
          </button>
        </div>

        {/* Speech Test Triggers */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            {isBn ? 'টেস্ট ভয়েস প্লে করুন:' : 'Test Voice Announcements:'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => testAnnouncement('sale', 3400, 'মো: রফিকুল ইসলাম')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Play size={14} color="var(--bk-pink)" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                  {isBn ? 'বিক্রয় ঘোষণা (৩,৪০০ টাকা)' : 'Sale: ৳3,400 Received'}
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--bk-pink)', fontWeight: 700 }}>
                {isBn ? 'শুনুন' : 'Play'}
              </span>
            </button>

            <button
              onClick={() => testAnnouncement('due', 1250, 'কামাল মিয়া')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Play size={14} color="#059669" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                  {isBn ? 'বাকি জমা ঘোষণা (১,২৫০ টাকা)' : 'Due: ৳1,250 Collected'}
                </span>
              </div>
              <span style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>
                {isBn ? 'শুনুন' : 'Play'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
