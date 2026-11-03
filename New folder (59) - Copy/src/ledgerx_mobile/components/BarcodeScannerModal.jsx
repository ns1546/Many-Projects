import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  X,
  Zap,
  RotateCcw,
  Barcode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Volume2,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export default function BarcodeScannerModal({ isOpen, onClose, onScan, products = [], language = 'bn' }) {
  const isBn = language === 'bn';
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [manualBarcode, setManualBarcode] = useState('');
  const [lastScannedProduct, setLastScannedProduct] = useState(null);
  const [scanSuccessAnim, setScanSuccessAnim] = useState(false);

  // Play crisp scanner beep using Web Audio API
  const playScannerBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // High-pitched 1760Hz retail scanner beep
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // Audio fallback
    }
  };

  // Start Html5Qrcode Camera Scanner
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    async function startScanner() {
      setCameraError(null);
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode('barcode-modal-scanner-view');
        }

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 180 },
          aspectRatio: 1.0,
        };

        await scannerRef.current.start(
          { facingMode },
          config,
          (decodedText) => {
            if (isMounted) {
              handleFoundCode(decodedText);
            }
          },
          () => {}
        );

        if (isMounted) {
          setHasCamera(true);
          isScanningRef.current = true;
        }
      } catch (err) {
        console.warn('[BarcodeScannerModal] Camera error:', err);
        if (isMounted) {
          setHasCamera(false);
          isScanningRef.current = false;
          setCameraError(
            isBn
              ? 'ক্যামেরা সংযোগ পাওয়া যায়নি (ক্যামেরা অনুমতি চালু করুন বা নিচে ম্যানুয়াল বারকোড লিখুন)।'
              : 'Camera access denied or unavailable. Use manual barcode input below.'
          );
        }
      }
    }

    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, facingMode]);

  const stopScanner = async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        isScanningRef.current = false;
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
    }
  };

  const handleFoundCode = (code) => {
    if (!code) return;
    const clean = code.trim();

    // Find in products by barcode, sku, or id
    const found = products.find(
      p =>
        (p.barcode && p.barcode.toString() === clean) ||
        (p.sku && p.sku.toString() === clean) ||
        (p.id && p.id.toString() === clean)
    );

    playScannerBeep();
    haptics.success();

    setLastScannedProduct(found || { nameBn: `বারকোড #${clean}`, nameEn: `Barcode #${clean}`, price: 0, notFound: true });
    setScanSuccessAnim(true);

    if (found) {
      onScan(found, clean);
    } else {
      onScan({ id: `custom-barcode-${clean}`, nameBn: `পণ্য #${clean}`, nameEn: `Item #${clean}`, price: 100, barcode: clean }, clean);
    }

    setTimeout(() => {
      setScanSuccessAnim(false);
    }, 1500);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    handleFoundCode(manualBarcode.trim());
    setManualBarcode('');
  };

  // Toggle Torch/Flash if available on device
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.getCapabilities && track.getCapabilities().torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }],
        });
        setTorchOn(!torchOn);
        haptics.tap();
      } catch (e) {}
    } else {
      haptics.warning();
    }
  };

  const flipCamera = () => {
    haptics.tap();
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        borderRadius: 'inherit',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          height: '92vh',
          maxHeight: 780,
          background: '#111827',
          borderRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          border: '1px solid #374151',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Scanner Top Bar */}
        <div
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(17, 24, 39, 0.95)',
            borderBottom: '1px solid #1F2937',
            color: '#FFFFFF',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--bk-pink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Barcode size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>
                {isBn ? 'বারকোড ও কিউআর স্ক্যানার' : 'Barcode & QR Scanner'}
              </div>
              <div style={{ fontSize: 10.5, color: '#9CA3AF' }}>
                {isBn ? 'ক্যামেরা পণ্যের কোডের উপর ধরুন' : 'Point camera at product barcode'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {hasCamera && (
              <>
                <button
                  type="button"
                  onClick={toggleTorch}
                  title="Toggle Flashlight"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: torchOn ? '#FBBF24' : '#1F2937',
                    border: '1px solid #374151',
                    color: torchOn ? '#111827' : '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Zap size={15} />
                </button>
                <button
                  type="button"
                  onClick={flipCamera}
                  title="Flip Camera"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: '#1F2937',
                    border: '1px solid #374151',
                    color: '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={15} />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: '#1F2937',
                border: '1px solid #374151',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewfinder Camera Feed Container */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            background: '#030712',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {hasCamera ? (
            <div
              id="barcode-modal-scanner-view"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF' }}>
              <AlertTriangle size={36} color="#F59E0B" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E5E7EB', marginBottom: 4 }}>
                {cameraError || (isBn ? 'ক্যামেরা অনুপলব্ধ' : 'Camera Unavailable')}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>
                {isBn
                  ? 'নিচের বক্সে সরাসরি বারকোড লিখুন অথবা দ্রুত স্ক্যানিংয়ের জন্য ডেমো চিপে ট্যাপ করুন।'
                  : 'Enter barcode number below or tap sample chips.'}
              </div>
            </div>
          )}

          {/* Holographic Laser Targeting Reticle */}
          <div
            style={{
              position: 'absolute',
              width: 260,
              height: 180,
              border: '2px solid rgba(226, 19, 110, 0.6)',
              borderRadius: 18,
              boxShadow: '0 0 25px rgba(226, 19, 110, 0.4), inset 0 0 15px rgba(226, 19, 110, 0.2)',
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            {/* 4 Framing Corner Brackets */}
            <div style={{ position: 'absolute', top: -2, left: -2, width: 22, height: 22, borderTop: '4px solid #E2136E', borderLeft: '4px solid #E2136E', borderTopLeftRadius: 18 }} />
            <div style={{ position: 'absolute', top: -2, right: -2, width: 22, height: 22, borderTop: '4px solid #E2136E', borderRight: '4px solid #E2136E', borderTopRightRadius: 18 }} />
            <div style={{ position: 'absolute', bottom: -2, left: -2, width: 22, height: 22, borderBottom: '4px solid #E2136E', borderLeft: '4px solid #E2136E', borderBottomLeftRadius: 18 }} />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderBottom: '4px solid #E2136E', borderRight: '4px solid #E2136E', borderBottomRightRadius: 18 }} />

            {/* Moving Laser Beam Animation */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: 'linear-gradient(90deg, transparent 0%, #E2136E 50%, transparent 100%)',
                boxShadow: '0 0 12px #E2136E',
                animation: 'scannerLaser 2s ease-in-out infinite alternate',
              }}
            />
          </div>

          {/* Success Flash Banner Overlay */}
          {scanSuccessAnim && lastScannedProduct && (
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                left: 16,
                right: 16,
                background: 'rgba(5, 150, 105, 0.95)',
                color: '#FFFFFF',
                borderRadius: 16,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                animation: 'bounceIn 0.3s ease',
                zIndex: 20,
              }}
            >
              <CheckCircle2 size={24} color="#A7F3D0" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isBn ? lastScannedProduct.nameBn : lastScannedProduct.nameEn}
                </div>
                <div style={{ fontSize: 11, color: '#D1FAE5' }}>
                  {isBn ? 'সফলভাবে কার্টে যুক্ত হয়েছে!' : 'Added to cart successfully!'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manual Barcode Input & Instant Test Chips */}
        <div
          style={{
            background: '#111827',
            padding: '14px 16px',
            borderTop: '1px solid #1F2937',
            color: '#FFFFFF',
          }}
        >
          {/* Manual Entry Form */}
          <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <input
              type="text"
              placeholder={isBn ? 'বারকোড নম্বর লিখুন (e.g. 89411001)...' : 'Enter barcode number...'}
              value={manualBarcode}
              onChange={e => setManualBarcode(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #374151',
                background: '#1F2937',
                color: '#FFFFFF',
                fontSize: 12.5,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--bk-pink)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '0 16px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'স্ক্যান' : 'Scan'}
            </button>
          </form>

          {/* Quick Real Product Barcode Chips */}
          <div>
            <div style={{ fontSize: 10.5, color: '#9CA3AF', marginBottom: 6, fontWeight: 600 }}>
              {isBn ? 'টেস্টের জন্য ক্যাটালগ বারকোডে ট্যাপ করুন:' : 'Tap sample barcode to simulate scan:'}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                paddingBottom: 4,
              }}
            >
              {products.slice(0, 6).map(p => {
                const code = p.barcode || p.sku || p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleFoundCode(code)}
                    style={{
                      background: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: 8,
                      padding: '5px 8px',
                      color: '#E5E7EB',
                      fontSize: 10.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Barcode size={12} color="var(--bk-pink)" />
                    <span>{code}</span>
                    <span style={{ color: '#9CA3AF', fontSize: 9.5 }}>({isBn ? p.nameBn : p.nameEn})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
