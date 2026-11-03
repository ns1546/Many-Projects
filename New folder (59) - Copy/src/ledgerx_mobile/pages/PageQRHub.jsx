import React, { useState, useEffect, useRef } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Download,
  Share2,
  Camera,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Store,
  Sparkles,
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Minus,
  Edit3,
  X,
  Search,
  Zap,
  ArrowRight,
  User,
  Phone,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundbox } from '../utils/soundbox';

export default function PageQRHub() {
  const {
    language,
    shopInfo,
    products = [],
    setProducts,
    updateProductStock,
    customers = [],
    recordSale,
    recordDueCollection,
    navigateTo,
    showToast,
    registerBackHandler,
  } = useMobileApp();

  const isBn = language === 'bn';
  const [activeTab, setActiveTab] = useState('scan'); // Default directly to 'scan' for instant utility
  const [fixedAmount, setFixedAmount] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [manualCode, setManualCode] = useState('');

  // Scanned item action states
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [matchedCustomer, setMatchedCustomer] = useState(null);
  const [unknownBarcode, setUnknownBarcode] = useState(null);

  // Quick Action Sub-drawers
  const [actionMode, setActionMode] = useState(null); // 'sell' | 'restock' | 'edit' | null
  const [sellQty, setSellQty] = useState(1);
  const [restockQty, setRestockQty] = useState(10);
  const [restockCost, setRestockCost] = useState('');

  // New Product Drawer state
  const [newProdData, setNewProdData] = useState({
    nameBn: '',
    category: 'মুদি সামগ্রী',
    price: '',
    costPrice: '',
    stock: '10',
    unit: 'কেজি',
    minAlert: '5',
  });

  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);

  // Play crisp 1760Hz POS retail scanner beep
  const playScannerBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  };

  // Hardware Back Button Registration
  useEffect(() => {
    if (matchedProduct || matchedCustomer || unknownBarcode || actionMode) {
      return registerBackHandler('qrhub-modal', () => {
        if (actionMode) {
          setActionMode(null);
          return true;
        }
        if (matchedProduct) {
          setMatchedProduct(null);
          return true;
        }
        if (matchedCustomer) {
          setMatchedCustomer(null);
          return true;
        }
        if (unknownBarcode) {
          setUnknownBarcode(null);
          return true;
        }
        return false;
      });
    }
  }, [matchedProduct, matchedCustomer, unknownBarcode, actionMode, registerBackHandler]);

  // Handle scanned decoded text
  const handleDecodedCode = (decodedText) => {
    if (!decodedText) return;
    const clean = decodedText.trim();

    playScannerBeep();
    haptics.success();

    // 1. Search in products
    const foundProd = products.find(
      p =>
        (p.barcode && p.barcode.toString() === clean) ||
        (p.sku && p.sku.toString() === clean) ||
        (p.id && p.id.toString() === clean) ||
        (clean.length >= 6 && p.barcode && clean.includes(p.barcode.toString()))
    );

    if (foundProd) {
      setMatchedProduct(foundProd);
      setMatchedCustomer(null);
      setUnknownBarcode(null);
      setSellQty(1);
      setRestockQty(10);
      setRestockCost(foundProd.costPrice || Math.round(foundProd.price * 0.85));
      soundbox.speak ? soundbox.speak(isBn ? `${foundProd.nameBn} পাওয়া গেছে` : `Found ${foundProd.nameEn}`, isBn ? 'bn' : 'en') : null;
      return;
    }

    // 2. Search in customers (Bangla QR or Customer Phone/ID)
    const phoneMatch = clean.replace(/\D/g, '');
    const foundCust = customers.find(
      c =>
        (c.phone && c.phone.replace(/\D/g, '') === phoneMatch) ||
        (c.id && c.id === clean) ||
        (clean.includes('MID:') && clean.includes(c.id))
    );

    if (foundCust) {
      setMatchedCustomer(foundCust);
      setMatchedProduct(null);
      setUnknownBarcode(null);
      soundbox.speak ? soundbox.speak(isBn ? `${foundCust.nameBn} এর খাতা পাওয়া গেছে` : `Customer ${foundCust.nameEn} found`, isBn ? 'bn' : 'en') : null;
      return;
    }

    // 3. Unknown Barcode / QR -> Prompt to register product
    setUnknownBarcode(clean);
    setNewProdData({
      nameBn: '',
      category: 'মুদি সামগ্রী',
      price: '',
      costPrice: '',
      stock: '20',
      unit: 'কেজি',
      minAlert: '5',
    });
    setMatchedProduct(null);
    setMatchedCustomer(null);
  };

  // Lifecycle management for Html5Qrcode Camera
  useEffect(() => {
    if (activeTab !== 'scan') {
      stopCamera();
      return;
    }

    let isMounted = true;

    async function initCamera() {
      setCameraError(null);
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode('qr-hub-reader');
        }

        const config = {
          fps: 15,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        };

        const cameraIdOrConfig = { facingMode };

        await scannerRef.current.start(
          cameraIdOrConfig,
          config,
          (decodedText) => {
            if (isMounted) {
              handleDecodedCode(decodedText);
            }
          },
          () => {
            // Frame skip
          }
        );

        if (isMounted) {
          setIsCameraActive(true);
          isScanningRef.current = true;
        }
      } catch (err) {
        console.warn('[PageQRHub] Camera error:', err);
        if (isMounted) {
          setIsCameraActive(false);
          isScanningRef.current = false;
          setCameraError(
            isBn
              ? 'ক্যামেরা চালু করা সম্ভব হয়নি। ফোনের সেটিংসে ক্যামেরা অনুমতি নিশ্চিত করুন বা নিচে ম্যানুয়ালি কোড লিখুন।'
              : 'Unable to start camera. Check camera permissions or enter code manually below.'
          );
        }
      }
    }

    // Delay slight tick to allow DOM element rendering
    const timer = setTimeout(() => {
      initCamera();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [activeTab, facingMode]);

  const stopCamera = async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        isScanningRef.current = false;
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
    }
    setIsCameraActive(false);
  };

  const flipCamera = async () => {
    haptics.tap();
    await stopCamera();
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDecodedCode(manualCode.trim());
    setManualCode('');
  };

  // Submit Quick Sale from QR Product Sheet
  const handleExecuteQuickSale = () => {
    if (!matchedProduct || sellQty <= 0) return;
    haptics.success();

    const total = Number(matchedProduct.price || 0) * sellQty;
    recordSale({
      items: [
        {
          id: matchedProduct.id,
          name: isBn ? matchedProduct.nameBn : matchedProduct.nameEn,
          price: matchedProduct.price,
          quantity: sellQty,
          unit: matchedProduct.unit || 'কেজি',
        },
      ],
      totalAmount: total,
      paidAmount: total,
      paymentMethod: 'নগদ ক্যাশ',
      customerName: isBn ? 'খুচরা গ্রাহক' : 'Retail Customer',
      note: 'কিউআর স্ক্যান দ্রুত বিক্রয়',
    });

    updateProductStock(matchedProduct.id, -sellQty, 'কিউআর বিক্রয়');
    soundbox.speak(
      isBn
        ? `মেসার্স আল-মদিনা স্টোরে ${matchedProduct.nameBn} এর ${total} টাকা নগদ বিক্রয় সফল হয়েছে!`
        : `Sale recorded: ${total} BDT for ${matchedProduct.nameEn}!`,
      'bn'
    );

    showToast(isBn ? `৳ ${total} বিক্রয় সম্পন্ন হয়েছে!` : `Sold for ৳ ${total}!`, 'success');
    setMatchedProduct(null);
    setActionMode(null);
  };

  // Submit Restock Purchase from QR Product Sheet
  const handleExecuteRestock = () => {
    if (!matchedProduct || restockQty <= 0) return;
    haptics.success();

    const unitCost = Number(restockCost || matchedProduct.costPrice || matchedProduct.price * 0.85);
    const totalCost = unitCost * restockQty;

    updateProductStock(matchedProduct.id, restockQty, 'কিউআর রিস্টক ক্রয়');

    soundbox.speak(
      isBn
        ? `${matchedProduct.nameBn} এর ${restockQty} ${matchedProduct.unit} নতুন স্টক যুক্ত হয়েছে!`
        : `${restockQty} units restocked for ${matchedProduct.nameEn}!`,
      'bn'
    );

    showToast(
      isBn
        ? `+${restockQty} ${matchedProduct.unit} স্টকে যোগ হয়েছে (মোট খরচ ৳ ${totalCost})!`
        : `+${restockQty} stock added!`,
      'success'
    );

    setMatchedProduct(null);
    setActionMode(null);
  };

  // Submit New Product Registration
  const handleSaveNewProduct = (e) => {
    e.preventDefault();
    if (!newProdData.nameBn.trim()) {
      showToast(isBn ? 'পণ্যের নাম লিখুন!' : 'Please enter product name!', 'error');
      return;
    }

    haptics.success();
    const created = {
      id: `prod-${Date.now().toString().slice(-6)}`,
      nameBn: newProdData.nameBn,
      nameEn: newProdData.nameBn,
      category: newProdData.category,
      price: Number(newProdData.price || 0),
      costPrice: Number(newProdData.costPrice || (Number(newProdData.price || 0) * 0.85)),
      stock: Number(newProdData.stock || 0),
      unit: newProdData.unit,
      minAlert: Number(newProdData.minAlert || 5),
      barcode: unknownBarcode,
    };

    setProducts(prev => [created, ...prev]);
    soundbox.speak(
      isBn
        ? `নতুন পণ্য ${created.nameBn} সফলভাবে স্টকে যোগ করা হয়েছে!`
        : `New item ${created.nameEn} added to stock!`,
      'bn'
    );

    showToast(isBn ? `"${created.nameBn}" পণ্য ক্যাটালগে যুক্ত হয়েছে!` : `Product added to inventory!`, 'success');
    setUnknownBarcode(null);
    setMatchedProduct(created);
  };

  const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
    `BANGLA_QR|MID:${shopInfo.outletId}|PHONE:${shopInfo.phone}|SHOP:${shopInfo.shopNameEn}|AMT:${fixedAmount || 'OPEN'}`
  )}`;

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 32, position: 'relative' }}>
      {/* Header */}
      <SubpageHeader
        titleBn="কিউআর হাব ও স্ক্যানার"
        titleEn="QR Hub & Barcode Engine"
        subtitleBn="লাইভ স্ক্যানার, বাংলা কিউআর ও স্টক ক্রয়-বিক্রয়"
        subtitleEn="Live Barcode Scanner & Bangla QR"
      />

      <div style={{ padding: '14px 16px' }}>
        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#E5E7EB',
            padding: 4,
            borderRadius: 14,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('scan');
            }}
            className="lx-touch-btn"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'scan' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'scan' ? 'var(--bk-pink)' : '#4B5563',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: activeTab === 'scan' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Camera size={16} />
            <span>{isBn ? 'কিউআর ও বারকোড স্ক্যান' : 'Live Camera Scan'}</span>
          </button>

          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('myQr');
            }}
            className="lx-touch-btn"
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === 'myQr' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'myQr' ? 'var(--bk-pink)' : '#4B5563',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: activeTab === 'myQr' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <QrCode size={16} />
            <span>{isBn ? 'আমার মার্চেন্ট কিউআর' : 'My Bangla QR'}</span>
          </button>
        </div>

        {/* ── TAB 1: LIVE SCANNER ENGINE ──────────────────────────────── */}
        {activeTab === 'scan' && (
          <div>
            {/* Viewfinder Card */}
            <div
              style={{
                background: '#111827',
                borderRadius: 24,
                padding: '20px 14px',
                color: '#FFFFFF',
                boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
                border: '1px solid #1F2937',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: '#F9FAFB' }}>
                    {isBn ? 'লাইভ ক্যামেরা ভিউফাইন্ডার' : 'Live Camera Viewfinder'}
                  </div>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                    {isBn ? 'পণ্যের বারকোড বা কিউআর কোড স্ক্যান করুন' : 'Align barcode/QR inside the frame'}
                  </div>
                </div>

                {/* Flip Camera Button */}
                <button
                  onClick={flipCamera}
                  className="lx-touch-btn"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: 12,
                    padding: '6px 10px',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <RotateCcw size={13} />
                  <span>{isBn ? 'ক্যামেরা ঘুরান' : 'Flip'}</span>
                </button>
              </div>

              {/* Real Camera Container */}
              <div
                style={{
                  width: '100%',
                  height: 260,
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: '#000000',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                {/* HTML5-QRCode Mount Node */}
                <div id="qr-hub-reader" style={{ width: '100%', height: '100%' }} />

                {/* Sweeping Laser Line Animation Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    left: 20,
                    right: 20,
                    height: 2,
                    background: '#FF0055',
                    boxShadow: '0 0 12px 2px #FF0055',
                    animation: 'scanLaserMotion 2.2s infinite ease-in-out',
                    zIndex: 5,
                    pointerEvents: 'none',
                  }}
                />

                {/* 4 Framing Target Corners */}
                <div style={{ position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTop: '4px solid var(--bk-pink)', borderLeft: '4px solid var(--bk-pink)', zIndex: 6, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTop: '4px solid var(--bk-pink)', borderRight: '4px solid var(--bk-pink)', zIndex: 6, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottom: '4px solid var(--bk-pink)', borderLeft: '4px solid var(--bk-pink)', zIndex: 6, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottom: '4px solid var(--bk-pink)', borderRight: '4px solid var(--bk-pink)', zIndex: 6, pointerEvents: 'none' }} />
              </div>

              {cameraError && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 12,
                    padding: '8px 12px',
                    marginTop: 10,
                    fontSize: 11,
                    color: '#FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <AlertTriangle size={15} color="#EF4444" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Manual Barcode Input Fallback */}
              <form onSubmit={handleManualSearch} style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search
                      size={15}
                      color="#9CA3AF"
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="text"
                      placeholder={isBn ? 'বারকোড নম্বর বা কাস্টমার ফোন...' : 'Enter barcode or phone...'}
                      value={manualCode}
                      onChange={e => setManualCode(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: 12,
                        padding: '10px 12px 10px 36px',
                        color: '#FFFFFF',
                        fontSize: 12.5,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="lx-touch-btn"
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
                    {isBn ? 'খুঁজুন' : 'Lookup'}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Demo Shortcuts (Instant Testing) */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 18,
                padding: '14px',
                marginTop: 14,
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 8 }}>
                {isBn ? 'দ্রুত টেস্ট স্ক্যানার (ডেমো পণ্য ও কাস্টমার):' : 'One-Tap Test Scans:'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {products.slice(0, 2).map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleDecodedCode(p.barcode || p.sku || p.id)}
                    className="lx-touch-btn"
                    style={{
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: 10,
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {isBn ? p.nameBn : p.nameEn}
                    </div>
                    <div style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>
                      ৳ {p.price} • {p.stock} {p.unit}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY BANGLA QR ───────────────────────────────────── */}
        {activeTab === 'myQr' && (
          <div>
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid #E5E7EB',
                padding: '24px 20px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#FFF0F6',
                  color: 'var(--bk-pink)',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  marginBottom: 12,
                  border: '1px solid #FCE7F3',
                }}
              >
                <Sparkles size={13} />
                <span>বাংলাদেশ ব্যাংক অনুমোদিত বাংলা কিউআর</span>
              </div>

              <div style={{ fontSize: 17, fontWeight: 900, color: '#111827' }}>
                {isBn ? shopInfo.shopNameBn : shopInfo.shopNameEn}
              </div>
              <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2, fontWeight: 500 }}>
                {shopInfo.phone} • MID: {shopInfo.outletId}
              </div>

              {/* QR Canvas */}
              <div
                style={{
                  width: 220,
                  height: 220,
                  margin: '18px auto',
                  padding: 12,
                  background: '#FFFFFF',
                  borderRadius: 18,
                  border: '2px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <img
                  src={qrDataUrl}
                  alt="Merchant QR"
                  style={{ width: '100%', height: '100%', borderRadius: 8 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--bk-pink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: 14,
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  ৳
                </div>
              </div>

              <input
                type="number"
                placeholder={isBn ? 'নির্দিষ্ট পরিমাণ টাকা (ঐচ্ছিক)' : 'Fixed Amount (Optional)'}
                value={fixedAmount}
                onChange={e => setFixedAmount(e.target.value)}
                style={{
                  border: '1px solid #D1D5DB',
                  borderRadius: 12,
                  padding: '8px 12px',
                  fontSize: 12,
                  textAlign: 'center',
                  width: '75%',
                  outline: 'none',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <button
                onClick={() => {
                  window.print();
                  showToast(isBn ? 'প্রিন্ট স্ট্যান্ডি প্রস্তুত হচ্ছে...' : 'Printing standee...', 'success');
                }}
                className="lx-touch-btn"
                style={{
                  background: 'var(--bk-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(226, 19, 110, 0.3)',
                }}
              >
                <Download size={16} />
                <span>{isBn ? 'কার্ড ডাউনলোড' : 'Download Standee'}</span>
              </button>

              <button
                onClick={() => {
                  const url = `https://wa.me/?text=${encodeURIComponent(
                    `Pay to ${shopInfo.shopNameBn} via Bangla QR: ${qrDataUrl}`
                  )}`;
                  window.open(url, '_blank');
                }}
                className="lx-touch-btn"
                style={{
                  background: '#FFFFFF',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: 14,
                  padding: '12px',
                  fontSize: 13,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Share2 size={16} />
                <span>{isBn ? 'শেয়ার করুন' : 'Share QR'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL 1: SCANNED PRODUCT FOUND ACTION SHEET ─────────────── */}
      {matchedProduct && (
        <div
          onClick={() => {
            setMatchedProduct(null);
            setActionMode(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: '24px 20px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
              maxHeight: '88vh',
              overflowY: 'auto',
            }}
          >
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Package size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                    {isBn ? matchedProduct.nameBn : matchedProduct.nameEn}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
                    {matchedProduct.category} • বারকোড: {matchedProduct.barcode || matchedProduct.id}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setMatchedProduct(null)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#6B7280" />
              </button>
            </div>

            {/* Price & Current Stock Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                background: '#F9FAFB',
                padding: '12px',
                borderRadius: 16,
                border: '1px solid #E5E7EB',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700 }}>বিক্রয় মূল্য</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#BE123C', marginTop: 2 }}>
                  ৳ {matchedProduct.price}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700 }}>পাইকারি কেনা</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#374151', marginTop: 2 }}>
                  ৳ {matchedProduct.costPrice || Math.round(matchedProduct.price * 0.85)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 700 }}>বর্তমান স্টক</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: matchedProduct.stock <= 5 ? '#DC2626' : '#059669',
                    marginTop: 2,
                  }}
                >
                  {matchedProduct.stock} {matchedProduct.unit || 'কেজি'}
                </div>
              </div>
            </div>

            {/* Sub-Action: POS Quick Sale */}
            {actionMode === 'sell' && (
              <div style={{ background: '#FFF1F2', padding: 14, borderRadius: 16, marginBottom: 16, border: '1px solid #FECDD3' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#9F1239', marginBottom: 10 }}>
                  {isBn ? 'বিক্রয় পরিমাণ নির্ধারণ করুন:' : 'Set Sale Quantity:'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 }}>
                  <button
                    onClick={() => setSellQty(Math.max(1, sellQty - 1))}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #FECDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Minus size={16} color="#BE123C" />
                  </button>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#9F1239', minWidth: 40, textAlign: 'center' }}>
                    {sellQty}
                  </span>
                  <button
                    onClick={() => setSellQty(sellQty + 1)}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #FECDD3', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Plus size={16} color="#BE123C" />
                  </button>
                </div>
                <button
                  onClick={handleExecuteQuickSale}
                  className="lx-touch-btn"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #BE123C 0%, #E11D48 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 14,
                    padding: '12px',
                    fontSize: 13.5,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(190, 18, 60, 0.35)',
                  }}
                >
                  ৳ {(matchedProduct.price * sellQty).toLocaleString('en-US')} নগদ বিক্রয় নিশ্চিত করুন →
                </button>
              </div>
            )}

            {/* Sub-Action: Restock Purchase */}
            {actionMode === 'restock' && (
              <div style={{ background: '#ECFDF5', padding: 14, borderRadius: 16, marginBottom: 16, border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#065F46', marginBottom: 10 }}>
                  {isBn ? 'স্টক ক্রয় ও রিস্টক এন্ট্রি:' : 'Restock Purchase Entry:'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#047857', display: 'block', marginBottom: 4 }}>
                      ক্রয় পরিমাণ ({matchedProduct.unit})
                    </label>
                    <input
                      type="number"
                      value={restockQty}
                      onChange={e => setRestockQty(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px', border: '1px solid #A7F3D0', borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#047857', display: 'block', marginBottom: 4 }}>
                      কেনা দর (প্রতি {matchedProduct.unit})
                    </label>
                    <input
                      type="number"
                      value={restockCost}
                      onChange={e => setRestockCost(e.target.value)}
                      style={{ width: '100%', padding: '8px', border: '1px solid #A7F3D0', borderRadius: 10, fontSize: 13, fontWeight: 700, textAlign: 'center', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleExecuteRestock}
                  className="lx-touch-btn"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 14,
                    padding: '12px',
                    fontSize: 13.5,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(4, 120, 87, 0.35)',
                  }}
                >
                  +{restockQty} {matchedProduct.unit} স্টকে যুক্ত করুন →
                </button>
              </div>
            )}

            {/* Primary Action Buttons (Deep Saturated Colors) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <button
                onClick={() => {
                  haptics.tap();
                  setActionMode(actionMode === 'sell' ? null : 'sell');
                }}
                className="lx-touch-btn"
                style={{
                  background: 'linear-gradient(145deg, #BE123C 0%, #9F1239 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 16,
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(190, 18, 60, 0.35)',
                }}
              >
                <ShoppingCart size={20} />
                <span style={{ fontSize: 13, fontWeight: 900 }}>+ দ্রুত বিক্রয়</span>
                <span style={{ fontSize: 10, color: '#FFE4E6', fontWeight: 600 }}>POS কুইক সেল</span>
              </button>

              <button
                onClick={() => {
                  haptics.tap();
                  setActionMode(actionMode === 'restock' ? null : 'restock');
                }}
                className="lx-touch-btn"
                style={{
                  background: 'linear-gradient(145deg, #047857 0%, #065F46 100%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 16,
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(4, 120, 87, 0.35)',
                }}
              >
                <TrendingUp size={20} />
                <span style={{ fontSize: 13, fontWeight: 900 }}>+ স্টক ক্রয় / রিস্টক</span>
                <span style={{ fontSize: 10, color: '#D1FAE5', fontWeight: 600 }}>মজুদ বৃদ্ধি</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: UNKNOWN BARCODE -> 1-TAP PRODUCT REGISTRATION ──── */}
      {unknownBarcode && (
        <div
          onClick={() => setUnknownBarcode(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: '24px 20px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={22} strokeWidth={2.8} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                    {isBn ? 'নতুন পণ্য স্টকে যুক্ত করুন' : 'Register Scanned Product'}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    সনাক্তকৃত বারকোড: <strong style={{ color: '#BE123C' }}>{unknownBarcode}</strong>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setUnknownBarcode(null)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#6B7280" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct}>
              {/* Product Name */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  পণ্যের নাম (বাংলায়) *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মিনিকেট চাল ২৫ কেজি বস্তা"
                  value={newProdData.nameBn}
                  onChange={e => setNewProdData({ ...newProdData, nameBn: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>

              {/* Category & Unit */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                    ক্যাটাগরি
                  </label>
                  <select
                    value={newProdData.category}
                    onChange={e => setNewProdData({ ...newProdData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 8px', border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 12.5, background: '#FFFFFF', boxSizing: 'border-box' }}
                  >
                    <option value="মুদি সামগ্রী">মুদি সামগ্রী</option>
                    <option value="চাল ও ডাল">চাল ও ডাল</option>
                    <option value="তেল ও মসলা">তেল ও মসলা</option>
                    <option value="পানীয় ও স্ন্যাক্স">পানীয় ও স্ন্যাক্স</option>
                    <option value="টয়লেট্রিজ">টয়লেট্রিজ</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                    পরিমাপের একক
                  </label>
                  <select
                    value={newProdData.unit}
                    onChange={e => setNewProdData({ ...newProdData, unit: e.target.value })}
                    style={{ width: '100%', padding: '10px 8px', border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 12.5, background: '#FFFFFF', boxSizing: 'border-box' }}
                  >
                    <option value="কেজি">কেজি (Kg)</option>
                    <option value="পিস">পিস (Pcs)</option>
                    <option value="প্যাকেট">প্যাকেট (Pkt)</option>
                    <option value="বস্তা">বস্তা (Bag)</option>
                    <option value="লিটার">লিটার (Ltr)</option>
                  </select>
                </div>
              </div>

              {/* Price, Cost & Opening Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                    বিক্রয় মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    value={newProdData.price}
                    onChange={e => setNewProdData({ ...newProdData, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 8px', border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 13, textAlign: 'center', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                    ক্রয় দর (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={newProdData.costPrice}
                    onChange={e => setNewProdData({ ...newProdData, costPrice: e.target.value })}
                    style={{ width: '100%', padding: '10px 8px', border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 13, textAlign: 'center', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                    প্রারম্ভিক স্টক
                  </label>
                  <input
                    type="number"
                    value={newProdData.stock}
                    onChange={e => setNewProdData({ ...newProdData, stock: e.target.value })}
                    style={{ width: '100%', padding: '10px 8px', border: '1px solid #D1D5DB', borderRadius: 12, fontSize: 13, textAlign: 'center', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="lx-touch-btn"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 16,
                  padding: '14px',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(4, 120, 87, 0.35)',
                }}
              >
                স্টকে সংরক্ষণ করুন ও শুরু করুন →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: SCANNED CUSTOMER FOUND ACTION SHEET ────────────── */}
      {matchedCustomer && (
        <div
          onClick={() => setMatchedCustomer(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: '24px 20px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                    {isBn ? matchedCustomer.nameBn : matchedCustomer.nameEn}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    {matchedCustomer.phone}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMatchedCustomer(null)}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#6B7280" />
              </button>
            </div>

            <div style={{ background: '#FFF1F2', padding: 14, borderRadius: 16, marginBottom: 16, border: '1px solid #FECDD3', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#BE123C', fontWeight: 700 }}>বর্তমান বকেয়া বাকি</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#9F1239', marginTop: 2 }}>
                ৳ {Number(matchedCustomer.dueAmount || 0).toLocaleString('en-US')}
              </div>
            </div>

            <button
              onClick={() => {
                const cust = matchedCustomer;
                setMatchedCustomer(null);
                navigateTo('customer-details', { customerId: cust.id });
              }}
              className="lx-touch-btn"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 16,
                padding: '14px',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(4, 120, 87, 0.35)',
              }}
            >
              + বকেয়া টাকা আদায় ও খাতা দেখুন →
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scanLaserMotion {
          0% { top: 20px; opacity: 0.8; }
          50% { top: 220px; opacity: 1; }
          100% { top: 20px; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
