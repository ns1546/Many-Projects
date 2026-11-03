import React, { useState, useRef, useEffect } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { CheckCircle2, ChevronRight, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { soundbox } from '../utils/soundbox';
import { haptics } from '../utils/haptics';

export default function HoldToConfirm({ onConfirm, labelBn, labelEn, disabled = false }) {
  const { language } = useMobileApp();
  const isBn = language === 'bn';

  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false); // 1-tap fast mode
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const lastPulseTimeRef = useRef(0);

  const HOLD_DURATION = 1100; // ms to reach 100%

  const handleFastClick = () => {
    if (disabled) return;
    haptics.success();
    soundbox.playSuccessChime ? soundbox.playSuccessChime() : soundbox.playChime();
    if (onConfirm) onConfirm();
  };

  const startHold = (e) => {
    if (disabled) return;
    if (isFastMode) {
      handleFastClick();
      return;
    }
    e.preventDefault();
    setIsHolding(true);
    haptics.holdPulse();
    soundbox.playChime();
    const now = performance.now();
    startTimeRef.current = now;
    lastPulseTimeRef.current = now;

    const updateProgress = (timestamp) => {
      const elapsed = timestamp - startTimeRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setProgress(pct);

      if (timestamp - lastPulseTimeRef.current > 130) {
        haptics.holdPulse();
        lastPulseTimeRef.current = timestamp;
      }

      if (pct < 100) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Complete!
        setIsHolding(false);
        setProgress(100);
        haptics.success();
        soundbox.playSuccessChime ? soundbox.playSuccessChime() : soundbox.playChime();
        if (onConfirm) onConfirm();
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const cancelHold = () => {
    if (isFastMode || progress >= 100) return;
    setIsHolding(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="bk-hold-container">
      <div
        className="bk-hold-btn"
        style={{
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          cursor: isFastMode ? 'pointer' : 'default',
        }}
        onClick={isFastMode ? handleFastClick : undefined}
        onMouseDown={!isFastMode ? startHold : undefined}
        onMouseUp={!isFastMode ? cancelHold : undefined}
        onMouseLeave={!isFastMode ? cancelHold : undefined}
        onTouchStart={!isFastMode ? startHold : undefined}
        onTouchEnd={!isFastMode ? cancelHold : undefined}
      >
        {/* Left Arrow White Circle */}
        <div className="bk-hold-circle-arrow">
          {progress >= 100 ? (
            <CheckCircle2 size={24} color="#00A86B" strokeWidth={2.6} />
          ) : isFastMode ? (
            <Zap size={22} color="#059669" strokeWidth={2.8} />
          ) : (
            <ArrowRight size={22} color="var(--bk-pink)" strokeWidth={2.8} />
          )}
        </div>

        {/* Progress Fill Background Layer */}
        <div
          className="bk-hold-progress-fill"
          style={{ width: isFastMode ? '100%' : `${progress}%`, opacity: isFastMode ? 0.15 : 1 }}
        />

        {/* Label Text */}
        <div className="bk-hold-text">
          {progress >= 100 ? (
            <span>{isBn ? 'লেনদেন নিশ্চিত হয়েছে!' : 'Confirmed!'}</span>
          ) : isHolding ? (
            <span>{isBn ? 'ধরে রাখুন...' : 'Holding...'}</span>
          ) : isFastMode ? (
            <span>{isBn ? (labelBn ? `${labelBn} (১-ট্যাপে)` : '১-ট্যাপে দ্রুত বিক্রয় নিশ্চিত করুন') : 'Tap to Complete Fast'}</span>
          ) : (
            <span>
              {isBn
                ? (labelBn || 'ট্যাপ করে ধরে রাখুন')
                : (labelEn || 'Tap and Hold to Confirm')}
            </span>
          )}
        </div>
      </div>

      {/* Mode Switcher: 1-Tap Fast vs Slide Hold */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
        <button
          type="button"
          onClick={() => {
            setIsFastMode(!isFastMode);
            haptics.tap();
          }}
          style={{
            background: isFastMode ? '#ECFDF5' : '#F3F4F6',
            border: `1px solid ${isFastMode ? '#A7F3D0' : '#D1D5DB'}`,
            borderRadius: 14,
            padding: '3px 10px',
            fontSize: 10.5,
            fontWeight: 700,
            color: isFastMode ? '#065F46' : '#6B7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {isFastMode ? <Zap size={11} color="#059669" /> : <ShieldCheck size={11} />}
          <span>
            {isFastMode
              ? (isBn ? '⚡ দ্রুত ১-ট্যাপ মোড চালু (স্লাইড বন্ধ)' : '⚡ Fast 1-Tap Mode Active')
              : (isBn ? '🔒 স্লাইড সিকিউর মোড (১-ট্যাপে পরিবর্তন করুন)' : '🔒 Slide Secure Mode (Switch to 1-Tap)')}
          </span>
        </button>
      </div>
    </div>
  );
}
