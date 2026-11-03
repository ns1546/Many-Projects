import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import { haptics } from '../utils/haptics';
import {
  Volume2,
  VolumeX,
  Wifi,
  BatteryCharging,
  Bluetooth,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Sliders,
  Radio,
  Zap,
} from 'lucide-react';
import { soundbox } from '../utils/soundbox';

export default function PageSoundbox() {
  const {
    language,
    setLanguage,
    soundboxEnabled,
    setSoundboxEnabled,
    transactions,
  } = useMobileApp();

  const isBn = language === 'bn';

  const [volume, setVolume] = useState(85);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastSpeech, setLastSpeech] = useState(
    isBn ? 'লেজারএক্স ডিজিটাল সাউন্ডবক্স প্রস্তুত রয়েছে।' : 'LedgerX Digital Soundbox is ready.'
  );
  const [customAmount, setCustomAmount] = useState('550');

  const triggerTestSound = (type, amount, party) => {
    haptics.success();
    setIsPlaying(true);
    soundbox.announce({
      type,
      amount,
      partyName: party,
      language,
    });

    const phraseBn =
      type === 'sale'
        ? `লেজারএক্সে ${amount} টাকা বিক্রয় সফল হয়েছে!`
        : type === 'credit_collection'
        ? `${party} থেকে ${amount} টাকা বকেয়া আদায় হয়েছে!`
        : `${amount} টাকা জমা সম্পন্ন হয়েছে!`;

    const phraseEn = `Received ${amount} Taka on LedgerX!`;
    setLastSpeech(isBn ? phraseBn : phraseEn);

    setTimeout(() => setIsPlaying(false), 2500);
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24, position: 'relative' }}>
      {/* Header */}
      <SubpageHeader
        titleBn="স্মার্ট ডিজিটাল সাউন্ডবক্স"
        titleEn="Smart Digital Soundbox"
        subtitleBn="তাৎক্ষণিক বাংলা অডিও ভয়েস ঘোষণা"
        subtitleEn="Instant Bengali Voice Announcements"
      />

      <div style={{ padding: '16px' }}>
        {/* Hardware Status Card */}
        <div
          style={{
            background: 'linear-gradient(145deg, #1F2937 0%, #111827 100%)',
            borderRadius: 24,
            padding: '20px',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            marginBottom: 16,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: soundboxEnabled ? '#10B981' : '#EF4444',
                  boxShadow: soundboxEnabled ? '0 0 10px #10B981' : 'none',
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#F3F4F6' }}>
                {soundboxEnabled ? (isBn ? 'ডিভাইস অনলাইন' : 'Device Online') : (isBn ? 'মিউট / অফলাইন' : 'Muted')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#9CA3AF' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Bluetooth size={14} color="#60A5FA" /> 5.2
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Wifi size={14} color="#34D399" /> 4G LTE
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <BatteryCharging size={14} color="#FBBF24" /> 92%
              </span>
            </div>
          </div>

          {/* Speaker Animation Center */}
          <div style={{ textAlign: 'center', margin: '14px 0' }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: isPlaying
                  ? 'radial-gradient(circle, #E2136E 0%, #9D0B4B 100%)'
                  : 'radial-gradient(circle, #374151 0%, #1F2937 100%)',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isPlaying ? '0 0 30px rgba(226, 19, 110, 0.6)' : 'inset 0 2px 8px rgba(0,0,0,0.5)',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              <Volume2 size={44} color="#FFFFFF" className={isPlaying ? 'animate-bounce' : ''} />
            </div>

            <div style={{ marginTop: 12, fontSize: 15, fontWeight: 800, color: '#FFFFFF' }}>
              LedgerX Soundbox Pro v4.0
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
              MID: 8801700-SOUND-01 • Bengali Female Neural HD Voice
            </div>
          </div>

          {/* Live Waveform Quote */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: 14,
              padding: '10px 14px',
              fontSize: 12,
              color: '#F9FAFB',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              marginTop: 10,
            }}
          >
            "{lastSpeech}"
          </div>
        </div>

        {/* Volume & Voice Controls Box */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 800, color: '#111827' }}>
              <Sliders size={17} color="var(--bk-pink)" />
              <span>{isBn ? 'সাউন্ডবক্স কন্ট্রোল' : 'Soundbox Control'}</span>
            </div>

            <button
              onClick={() => {
                haptics.tap();
                setSoundboxEnabled(!soundboxEnabled);
              }}
              style={{
                background: soundboxEnabled ? '#ECFDF5' : '#FEF2F2',
                border: 'none',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 11,
                fontWeight: 700,
                color: soundboxEnabled ? '#059669' : '#DC2626',
                cursor: 'pointer',
              }}
            >
              {soundboxEnabled ? (isBn ? 'সক্রিয়' : 'Enabled') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}
            </button>
          </div>

          {/* Volume Slider */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#6B7280', marginBottom: 4 }}>
              <span>{isBn ? 'স্পিকার ভলিউম' : 'Speaker Volume'}</span>
              <span style={{ fontWeight: 800, color: 'var(--bk-pink)' }}>{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--bk-pink)', cursor: 'pointer' }}
            />
          </div>

          {/* Speech Rate Controls */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 6 }}>
              {isBn ? 'কণ্ঠের গতি (Speech Speed)' : 'Speech Speed'}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { r: 0.85, label: isBn ? 'ধীর (0.85x)' : 'Slow' },
                { r: 1.0, label: isBn ? 'স্বাভাবিক (1.0x)' : 'Normal' },
                { r: 1.25, label: isBn ? 'দ্রুত (1.25x)' : 'Fast' },
              ].map(s => (
                <button
                  key={s.r}
                  onClick={() => {
                    haptics.tap();
                    setSpeechRate(s.r);
                  }}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 8,
                    border: speechRate === s.r ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                    background: speechRate === s.r ? '#FFF0F6' : '#FFFFFF',
                    color: speechRate === s.r ? 'var(--bk-pink)' : '#4B5563',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language Switch */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                haptics.tap();
                setLanguage('bn');
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 12,
                border: language === 'bn' ? '2px solid var(--bk-pink)' : '1px solid #E5E7EB',
                background: language === 'bn' ? '#FFF0F6' : '#FFFFFF',
                color: language === 'bn' ? 'var(--bk-pink)' : '#4B5563',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              বাংলা কণ্ঠ (Default)
            </button>
            <button
              onClick={() => {
                haptics.tap();
                setLanguage('en');
              }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 12,
                border: language === 'en' ? '2px solid var(--bk-pink)' : '1px solid #E5E7EB',
                background: language === 'en' ? '#FFF0F6' : '#FFFFFF',
                color: language === 'en' ? 'var(--bk-pink)' : '#4B5563',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              English Voice
            </button>
          </div>
        </div>

        {/* Instant Voice Test Triggers */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#111827', marginBottom: 12 }}>
            {isBn ? 'টেস্ট ভয়েস ঘোষণা শুনুন' : 'Test Voice Announcements'}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
            <button
              onClick={() => triggerTestSound('sale', 500, 'খুচরা ক্রেতা')}
              style={{
                background: '#FFF0F6',
                border: '1px solid #FCE7F3',
                borderRadius: 12,
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 11, color: 'var(--bk-pink)', fontWeight: 700 }}>বিক্রয় টেস্ট</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#111827', marginTop: 2 }}>৳ ৫০০ টাকা</div>
            </button>

            <button
              onClick={() => triggerTestSound('credit_collection', 1200, 'রফিকুল ইসলাম')}
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: 12,
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>বকেয়া আদায়</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#111827', marginTop: 2 }}>৳ ১,২০০ টাকা</div>
            </button>

            <button
              onClick={() => triggerTestSound('sale', 2500, 'হাজী স্টোর')}
              style={{
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 12,
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 11, color: '#1E60D5', fontWeight: 700 }}>বড় পেমেন্ট</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#111827', marginTop: 2 }}>৳ ২,৫০০ টাকা</div>
            </button>

            <button
              onClick={() => {
                haptics.tap();
                soundbox.playChime();
              }}
              style={{
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: 12,
                padding: '12px 10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 11, color: '#D97706', fontWeight: 700 }}>বিজ্ঞপ্তি চাইম</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#111827', marginTop: 2 }}>Sound Chime</div>
            </button>
          </div>

          {/* Custom Amount Voice Announce */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              placeholder="পরিমাণ লিখুন (৳)"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid #D1D5DB',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={() => triggerTestSound('sale', Number(customAmount) || 100, 'গ্রাহক')}
              style={{
                background: 'var(--bk-pink)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '10px 18px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Play size={14} />
              <span>{isBn ? 'শুনুন' : 'Announce'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
