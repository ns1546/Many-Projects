import React, { useState, useEffect } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { X, QrCode, Scan, Download, Flashlight, CheckCircle2, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRModal() {
  const {
    language,
    shopInfo,
    customers,
    setSelectedCustomer,
    setActiveModal,
  } = useMobileApp();

  const isBn = language === 'bn';
  const [tab, setTab] = useState('myQr'); // 'myQr' | 'scan'
  const [qrUrl, setQrUrl] = useState('');
  const [flashlight, setFlashlight] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  useEffect(() => {
    const payload = JSON.stringify({
      app: 'Hisab Pati',
      outletId: shopInfo.outletId,
      name: shopInfo.shopNameEn,
      phone: shopInfo.phone,
      bin: shopInfo.binNumber,
    });

    QRCode.toDataURL(payload, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1C1C1E',
        light: '#FFFFFF',
      },
    })
      .then(url => setQrUrl(url))
      .catch(err => console.error('[QR] Error generating code:', err));
  }, [shopInfo]);

  const handleSimulatedScan = () => {
    setScanSuccess(true);
    setTimeout(() => {
      const randomCust = customers[0];
      setSelectedCustomer(randomCust);
      setActiveModal('addMoney');
    }, 900);
  };

  return (
    <div className="bk-modal-backdrop" onClick={() => setActiveModal(null)}>
      <div className="bk-modal-sheet" style={{ maxHeight: '92%' }} onClick={e => e.stopPropagation()}>
        {/* Header Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, background: '#F3F4F6', padding: 4, borderRadius: 14 }}>
            <button
              onClick={() => setTab('myQr')}
              style={{
                background: tab === 'myQr' ? 'var(--bk-pink)' : 'transparent',
                color: tab === 'myQr' ? '#FFFFFF' : '#4B5563',
                border: 'none',
                borderRadius: 10,
                padding: '7px 16px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
              }}
            >
              <QrCode size={15} />
              <span>{isBn ? 'আমার কিউআর' : 'My QR'}</span>
            </button>
            <button
              onClick={() => setTab('scan')}
              style={{
                background: tab === 'scan' ? 'var(--bk-pink)' : 'transparent',
                color: tab === 'scan' ? '#FFFFFF' : '#4B5563',
                border: 'none',
                borderRadius: 10,
                padding: '7px 16px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.15s ease',
              }}
            >
              <Scan size={15} />
              <span>{isBn ? 'স্ক্যান করুন' : 'Scan'}</span>
            </button>
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

        {/* Tab 1: My Merchant QR Code */}
        {tab === 'myQr' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 22,
                padding: '24px 20px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
                border: '1.5px solid #F3F4F6',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                boxSizing: 'border-box',
                position: 'relative',
              }}
            >
              {/* Merchant Title */}
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                {isBn ? shopInfo.shopNameBn : shopInfo.shopNameEn}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, fontWeight: 500 }}>
                {isBn ? 'মার্চেন্ট অ্যাকাউন্ট' : 'Merchant Account'} • {shopInfo.phone}
              </div>

              {/* QR Image */}
              <div
                style={{
                  margin: '18px 0',
                  padding: 12,
                  background: '#FFFFFF',
                  borderRadius: 16,
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                }}
              >
                {qrUrl ? (
                  <img src={qrUrl} alt="Merchant QR" style={{ width: 200, height: 200, display: 'block' }} />
                ) : (
                  <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Loading...
                  </div>
                )}
              </div>

              <div style={{ fontSize: 11, color: 'var(--bk-pink)', fontWeight: 700 }}>
                {isBn ? 'যেকোনো ব্যাংক বা ওয়ালেট অ্যাপ দিয়ে স্ক্যান করে পেমেন্ট নিন' : 'Scan with any banking app to pay'}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 16 }}>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `ledgerx-qr-${shopInfo.outletId}.png`;
                  link.href = qrUrl;
                  link.click();
                }}
                style={{
                  flex: 1,
                  background: 'var(--bk-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--bk-radius-full)',
                  padding: '12px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Download size={15} />
                <span>{isBn ? 'কিউআর ডাউনলোড' : 'Download QR'}</span>
              </button>

              <button
                onClick={() => {
                  const url = `https://wa.me/?text=${encodeURIComponent(`LedgerX Merchant QR: ${shopInfo.phone}`)}`;
                  window.open(url, '_blank');
                }}
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 'var(--bk-radius-full)',
                  padding: '12px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Share2 size={15} />
                <span>{isBn ? 'শেয়ার করুন' : 'Share'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Live Camera QR Scanner */}
        {tab === 'scan' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '100%',
                height: 280,
                background: '#0B0F19',
                borderRadius: 20,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Target Scan Frame */}
              <div
                style={{
                  width: 190,
                  height: 190,
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: 18,
                  position: 'relative',
                  boxShadow: flashlight ? '0 0 40px rgba(255, 255, 255, 0.6)' : 'none',
                }}
              >
                {/* 4 Corner Accents */}
                <div style={{ position: 'absolute', top: -2, left: -2, width: 22, height: 22, borderTop: '4px solid var(--bk-pink)', borderLeft: '4px solid var(--bk-pink)', borderTopLeftRadius: 8 }} />
                <div style={{ position: 'absolute', top: -2, right: -2, width: 22, height: 22, borderTop: '4px solid var(--bk-pink)', borderRight: '4px solid var(--bk-pink)', borderTopRightRadius: 8 }} />
                <div style={{ position: 'absolute', bottom: -2, left: -2, width: 22, height: 22, borderBottom: '4px solid var(--bk-pink)', borderLeft: '4px solid var(--bk-pink)', borderBottomLeftRadius: 8 }} />
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderBottom: '4px solid var(--bk-pink)', borderRight: '4px solid var(--bk-pink)', borderBottomRightRadius: 8 }} />

                {/* Laser scan line */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'var(--bk-pink)',
                    boxShadow: '0 0 10px var(--bk-pink)',
                    animation: 'scanLaser 2s infinite ease-in-out',
                  }}
                />
              </div>

              {/* Flashlight button */}
              <button
                onClick={() => setFlashlight(!flashlight)}
                style={{
                  position: 'absolute',
                  bottom: 14,
                  background: flashlight ? 'var(--bk-pink)' : 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '50%',
                  width: 38,
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Flashlight size={18} />
              </button>
            </div>

            <style>{`
              @keyframes scanLaser {
                0%, 100% { top: 10%; }
                50% { top: 85%; }
              }
            `}</style>

            <div style={{ textAlign: 'center', marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                {isBn ? 'কাস্টমার বা পণ্যের কিউআর কোড স্ক্যানারে ধরুন' : 'Align QR code inside frame'}
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 3 }}>
                {isBn ? 'কাস্টমার ডিজিটাল খাতা কার্ড ও মার্চেন্ট পেমেন্ট অটো ডিটেক্ট করবে' : 'Auto detects customers and invoices'}
              </div>
            </div>

            {/* Test Simulation Trigger */}
            <button
              onClick={handleSimulatedScan}
              style={{
                marginTop: 16,
                background: '#F3F4F6',
                border: '1px solid #D1D5DB',
                borderRadius: 'var(--bk-radius-full)',
                padding: '10px 20px',
                fontSize: 12.5,
                fontWeight: 700,
                color: 'var(--bk-pink)',
                cursor: 'pointer',
              }}
            >
              {scanSuccess ? (
                <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} />
                  {isBn ? 'স্ক্যান সম্পন্ন হয়েছে!' : 'Scan Successful!'}
                </span>
              ) : (
                <span>{isBn ? '▶ টেস্ট গ্রাহক কিউআর স্ক্যান সিমুলেট করুন' : '▶ Simulate Scan Customer Card'}</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
