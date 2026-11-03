import React, { useEffect, useState } from 'react';
import { CheckCircle2, Share2, Receipt, Sparkles, X, ArrowRight } from 'lucide-react';
import { soundbox } from '../utils/soundbox';
import { haptics } from '../utils/haptics';

export default function CelebrationOverlay({
  isOpen,
  onClose,
  type = 'sale', // 'sale' | 'collect' | 'due' | 'expense' | 'halkhata'
  titleBn = 'কাজটি সফল হয়েছে!',
  titleEn = 'Action Successful!',
  subtitleBn = 'সরাসরি ডিজিটাল খাতা ও সিস্টেমে সংরক্ষিত হয়েছে',
  subtitleEn = 'Saved and ledger synchronized',
  amount = 0,
  partyName = '',
  partyPhone = '',
  invoiceNo = '',
  onViewReceipt,
  isBn = true,
}) {
  const [showContent, setShowContent] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // 1. Tactile haptic pulse
      haptics.success();

      // 2. Play celebratory audio
      soundbox.playSuccess();

      // 3. Generate 30 festive particles (golden coins, sparkles, ribbons)
      const newParticles = Array.from({ length: 32 }, (_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage
        y: -10 - Math.random() * 30,
        size: 8 + Math.random() * 14,
        color: ['#FFD700', '#10B981', '#E11D48', '#3B82F6', '#F59E0B', '#EC4899'][i % 6],
        shape: ['coin', 'star', 'ribbon', 'dot'][i % 4],
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random() * 1.5,
        rotation: Math.random() * 720 - 360,
      }));
      setParticles(newParticles);

      // 4. Trigger animated pop
      const timer = setTimeout(() => setShowContent(true), 60);

      // 5. Automatic vocal speech announcement
      if (amount > 0) {
        const speechTimer = setTimeout(() => {
          let announceText = '';
          if (type === 'sale') {
            announceText = isBn
              ? `মেসার্স আল-মদিনা স্টোরে ${amount} টাকা বিক্রি সফল হয়েছে!`
              : `Sale of ${amount} taka completed successfully!`;
          } else if (type === 'collect') {
            announceText = isBn
              ? `${partyName || 'কাস্টমার'} থেকে ${amount} টাকা বকেয়া আদায় হয়েছে!`
              : `Collected ${amount} taka due from ${partyName || 'customer'}!`;
          } else if (type === 'due') {
            announceText = isBn
              ? `${partyName || 'কাস্টমার'} এর হিসাবে ${amount} টাকা বাকি যুক্ত হয়েছে!`
              : `${amount} taka credit added for ${partyName || 'customer'}!`;
          } else if (type === 'expense') {
            announceText = isBn
              ? `দোকানের ${amount} টাকা খরচ হিসাবভুক্ত হয়েছে!`
              : `Expense of ${amount} taka recorded!`;
          }
          if (announceText) soundbox.speak(announceText, isBn ? 'bn' : 'en');
        }, 350);
        return () => clearTimeout(speechTimer);
      }

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setParticles([]);
    }
  }, [isOpen, type, amount, partyName, isBn]);

  if (!isOpen) return null;

  const typeConfig = {
    sale: {
      color: '#10B981',
      bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      badge: isBn ? 'বিক্রয় রসিদ' : 'Sale Receipt',
    },
    collect: {
      color: '#059669',
      bgGradient: 'linear-gradient(135deg, #059669 0%, #065F46 100%)',
      badge: isBn ? 'বকেয়া আদায়' : 'Due Collected',
    },
    due: {
      color: '#E11D48',
      bgGradient: 'linear-gradient(135deg, #BE123C 0%, #9F1239 100%)',
      badge: isBn ? 'বাকি প্রদান' : 'Credit Given',
    },
    expense: {
      color: '#D97706',
      bgGradient: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
      badge: isBn ? 'দোকানের খরচ' : 'Expense Paid',
    },
    halkhata: {
      color: '#7C3AED',
      bgGradient: 'linear-gradient(135deg, #6D28D9 0%, #4C1D95 100%)',
      badge: isBn ? 'হালখাতা কার্ড' : 'Halkhata Card',
    },
  }[type] || {
    color: '#10B981',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    badge: isBn ? 'সফল হয়েছে' : 'Success',
  };

  const handleShareWhatsApp = () => {
    haptics.tap();
    const shareText = `*${isBn ? 'মেসার্স আল-মদিনা জেনারেল স্টোর' : 'M/S Al-Madina General Store'}*\n` +
      `লেনদেন: ${isBn ? titleBn : titleEn}\n` +
      (partyName ? `গ্রাহক: ${partyName}\n` : '') +
      `পরিমাণ: ৳${amount}\n` +
      `সময়: ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}\n` +
      `ধন্যবাদ সাথে থাকার জন্য!`;
    window.open(`https://wa.me/${partyPhone ? partyPhone.replace(/\D/g, '') : ''}?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* ── Particle Confetti Stream ────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: `lxConfettiFall ${p.duration}s cubic-bezier(0.25, 1, 0.5, 1) infinite`,
              animationDelay: `${p.delay}s`,
              transform: `rotate(${p.rotation}deg)`,
              opacity: 0.9,
            }}
          >
            {p.shape === 'coin' ? (
              <div
                style={{
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FDE047 0%, #CA8A04 100%)',
                  boxShadow: '0 0 8px rgba(250, 204, 21, 0.6)',
                  border: '1.5px solid #FEF08A',
                  color: '#713F12',
                  fontSize: p.size * 0.65,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ৳
              </div>
            ) : p.shape === 'star' ? (
              <Sparkles size={p.size} color={p.color} />
            ) : p.shape === 'ribbon' ? (
              <div
                style={{
                  width: p.size * 1.5,
                  height: p.size * 0.4,
                  background: p.color,
                  borderRadius: 2,
                  boxShadow: `0 0 6px ${p.color}`,
                }}
              />
            ) : (
              <div
                style={{
                  width: p.size * 0.6,
                  height: p.size * 0.6,
                  borderRadius: '50%',
                  background: p.color,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Celebratory Card ──────────────────────────────────────────────── */}
      <div
        className="lx-touch-btn"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '350px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15)',
          overflow: 'hidden',
          textAlign: 'center',
          transform: showContent ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(24px)',
          opacity: showContent ? 1 : 0,
          transition: 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.28s ease',
        }}
      >
        {/* Top Radial Glow Banner */}
        <div
          style={{
            background: typeConfig.bgGradient,
            padding: '24px 16px 20px 16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Background Glow Rings */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />

          {/* Animated Central Icon with Shockwave Ring */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#FFFFFF',
                color: typeConfig.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.18)',
                margin: '0 auto',
                animation: 'lxPopBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              }}
            >
              <CheckCircle2 size={40} strokeWidth={2.8} />
            </div>

            {/* Pulsing Shockwave */}
            <div
              style={{
                position: 'absolute',
                inset: -6,
                borderRadius: '50%',
                border: '2px solid rgba(255, 255, 255, 0.6)',
                animation: 'lxShockwave 1.8s infinite ease-out',
                pointerEvents: 'none',
              }}
            />
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.3px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
            }}
          >
            {isBn ? titleBn : titleEn}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.88)',
              marginTop: 2,
            }}
          >
            {isBn ? subtitleBn : subtitleEn}
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '18px 20px 20px 20px' }}>
          {/* Big Highlight Amount Box */}
          {amount > 0 && (
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                padding: '14px',
                border: '1.5px solid #F1F5F9',
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>
                {typeConfig.badge}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: typeConfig.color,
                  fontFamily: 'Outfit, sans-serif',
                  margin: '3px 0',
                  letterSpacing: '-0.5px',
                }}
              >
                ৳ {Number(amount).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
              </div>
              {partyName && (
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1E293B' }}>
                  {partyName}
                </div>
              )}
              {invoiceNo && (
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2, fontFamily: 'monospace' }}>
                  #{invoiceNo}
                </div>
              )}
            </div>
          )}

          {/* Action Button Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="lx-touch-btn"
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '13px',
                  padding: '12px 10px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                }}
              >
                <Share2 size={16} />
                <span>{isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
              </button>

              {/* View Receipt Voucher */}
              {onViewReceipt && (
                <button
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    if (onClose) onClose();
                    if (onViewReceipt) onViewReceipt();
                  }}
                  className="lx-touch-btn"
                  style={{
                    flex: 1,
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    borderRadius: '13px',
                    padding: '12px 10px',
                    fontSize: 12.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <Receipt size={16} />
                  <span>{isBn ? 'রশিদ প্রিন্ট' : 'Print Slip'}</span>
                </button>
              )}
            </div>

            {/* Done / Continue Button */}
            <button
              type="button"
              onClick={() => {
                haptics.tap();
                onClose();
              }}
              className="lx-touch-btn"
              style={{
                width: '100%',
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                padding: '13px',
                fontSize: 13.5,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 6px 16px rgba(15, 23, 42, 0.25)',
              }}
            >
              <span>{isBn ? 'ঠিক আছে (পরবর্তী কাজ)' : 'Continue'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
