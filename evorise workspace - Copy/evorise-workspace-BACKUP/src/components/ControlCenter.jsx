import React, { useState, useEffect, useRef } from 'react';
import { Settings2, Wifi, Bluetooth, Cast, Moon, Sun, Volume2, Monitor, Play, SkipForward, SkipBack, Maximize, BellOff, Focus, Power } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const ControlCenter = ({ isOpen, onClose }) => {
  const { settings, updateSetting } = useSettings();
  const [wifi, setWifi] = useState(true);
  const [bluetooth, setBluetooth] = useState(false);
  const [airdrop, setAirdrop] = useState(true);
  const [dnd, setDnd] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [volume, setVolume] = useState(80);
  const [brightness, setBrightness] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={ref}
      style={{
        position: 'absolute',
        top: '60px',
        right: '20px',
        width: '320px',
        background: 'rgba(25, 25, 30, 0.75)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: '24px',
        padding: '16px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(255,255,255,0.1) inset',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
        animation: 'cc-slide-down 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        color: 'white'
      }}
    >
      <style>{`
        @keyframes cc-slide-down {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cc-block {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 18px;
          backdrop-filter: blur(20px);
          overflow: hidden;
          transition: background 0.2s;
        }
        .cc-block:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .cc-slider-wrap {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          height: 48px;
          padding: 0 12px;
          gap: 12px;
        }
        .cc-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
        }
        .cc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .cc-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
          cursor: pointer;
        }
        .cc-toggle.active {
          background: var(--blue, #007aff);
        }
        .cc-toggle.active-orange {
          background: var(--orange, #ff9500);
        }
        .cc-toggle.active-indigo {
          background: #5856d6;
        }
      `}</style>

      {/* Connectivity & Quick Toggles Row */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Connectivity */}
        <div className="cc-block" style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setWifi(!wifi)}>
            <div className={`cc-toggle ${wifi ? 'active' : ''}`}><Wifi size={18} color="white" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Wi-Fi</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{wifi ? 'Evorise-5G' : 'Off'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setBluetooth(!bluetooth)}>
            <div className={`cc-toggle ${bluetooth ? 'active' : ''}`}><Bluetooth size={18} color="white" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Bluetooth</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{bluetooth ? 'On' : 'Off'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setAirdrop(!airdrop)}>
            <div className={`cc-toggle ${airdrop ? 'active' : ''}`}><Cast size={18} color="white" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Casting</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{airdrop ? 'Everyone' : 'Contacts Only'}</div>
            </div>
          </div>
        </div>

        {/* Small Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '90px' }}>
          <div className="cc-block" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: dnd ? '#5856d6' : '' }} onClick={() => setDnd(!dnd)}>
            <div style={{ textAlign: 'center' }}>
              <BellOff size={22} color="white" style={{ marginBottom: 4 }} />
              <div style={{ fontSize: '11px', fontWeight: 600 }}>DND</div>
            </div>
          </div>
          <div className="cc-block" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: focusMode ? '#ff9500' : '' }} onClick={() => setFocusMode(!focusMode)}>
            <div style={{ textAlign: 'center' }}>
              <Focus size={22} color="white" style={{ marginBottom: 4 }} />
              <div style={{ fontSize: '11px', fontWeight: 600 }}>Focus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="cc-block" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="cc-slider-wrap">
          <Monitor size={18} color="rgba(255,255,255,0.8)" />
          <input 
            type="range" 
            className="cc-slider" 
            min="0" max="100" 
            value={brightness} 
            onChange={e => setBrightness(e.target.value)}
          />
        </div>
        <div className="cc-slider-wrap">
          <Volume2 size={18} color="rgba(255,255,255,0.8)" />
          <input 
            type="range" 
            className="cc-slider" 
            min="0" max="100" 
            value={volume} 
            onChange={e => setVolume(e.target.value)}
          />
        </div>
      </div>

      {/* Media Player */}
      <div className="cc-block" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--grad-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
            <span style={{ fontSize: '20px' }}>🎵</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.2 }}>Deep Focus</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Evorise Audio</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '4px' }}>
          <SkipBack size={24} color="white" style={{ cursor: 'pointer', opacity: 0.8 }} />
          <div onClick={() => setIsPlaying(!isPlaying)} style={{ cursor: 'pointer' }}>
            {isPlaying ? <Power size={32} color="white" /> : <Play size={32} color="white" fill="white" />}
          </div>
          <SkipForward size={24} color="white" style={{ cursor: 'pointer', opacity: 0.8 }} />
        </div>
      </div>

    </div>
  );
};

export default ControlCenter;
