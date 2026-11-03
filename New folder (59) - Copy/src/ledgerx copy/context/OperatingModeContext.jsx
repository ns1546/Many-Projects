import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { voicebox } from '../utils/bengaliVoicebox';

const OperatingModeContext = createContext(null);

export const OPERATING_MODES = {
  EASY: 'EASY', // সহজ টালিখাতা মোড - Zero complexity, fast 1-tap ledger
  ULTRA: 'ULTRA', // আল্ট্রা কন্ট্রোল মোড - Institutional ERP, POS, Godown, NBR VAT
};

export function OperatingModeProvider({ children }) {
  const [operatingMode, setOperatingModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('ledgerx_operating_mode');
      return saved === OPERATING_MODES.ULTRA ? OPERATING_MODES.ULTRA : OPERATING_MODES.EASY;
    } catch {
      return OPERATING_MODES.EASY;
    }
  });

  const setOperatingMode = (mode) => {
    if (mode !== OPERATING_MODES.EASY && mode !== OPERATING_MODES.ULTRA) return;
    setOperatingModeState(mode);
    try {
      localStorage.setItem('ledgerx_operating_mode', mode);
    } catch (e) {
      console.warn('Failed to persist operating mode to localStorage:', e);
    }

    if (mode === OPERATING_MODES.EASY) {
      toast.success('⚡ সহজ টালিখাতা মোড সক্রিয় হয়েছে!', {
        icon: '📝',
        duration: 2500,
      });
      voicebox.speak('সহজ টালিখাতা মোড চালু হয়েছে।');
    } else {
      toast.success('🎛️ প্রো মোড সক্রিয় হয়েছে!', {
        icon: '🚀',
        duration: 2500,
      });
      voicebox.speak('প্রো মোড চালু হয়েছে।');
    }
  };

  const toggleOperatingMode = () => {
    const next = operatingMode === OPERATING_MODES.EASY ? OPERATING_MODES.ULTRA : OPERATING_MODES.EASY;
    setOperatingMode(next);
  };

  return (
    <OperatingModeContext.Provider
      value={{
        operatingMode,
        setOperatingMode,
        toggleOperatingMode,
        isEasyMode: operatingMode === OPERATING_MODES.EASY,
        isUltraMode: operatingMode === OPERATING_MODES.ULTRA,
      }}
    >
      {children}
    </OperatingModeContext.Provider>
  );
}

export function useOperatingMode() {
  const ctx = useContext(OperatingModeContext);
  if (!ctx) {
    throw new Error('useOperatingMode must be used within an OperatingModeProvider');
  }
  return ctx;
}
