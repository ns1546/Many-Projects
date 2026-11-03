import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useKhata } from '../context/KhataContext';
import { useLocale } from '../context/LocaleContext';
import { mobilePOSBridge } from '../utils/MobilePOSBridge';
import MobileCameraScanner from '../components/pos/mobile/MobileCameraScanner';
import QuickAddProductModal from '../components/pos/QuickAddProductModal';
import { formatCurrency, takaToPoisha } from '../utils/currency';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Barcode, 
  Check, 
  Zap, 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  CheckCircle2, 
  PackagePlus, 
  Layers,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MobilePOSView() {
  const [searchParams] = useSearchParams();
  const pairParam = searchParams.get('pair') || '';

  const { products = [], addProduct } = useKhata() || {};
  const { isBengali } = useLocale();

  // Connection & Session State
  const [pinInput, setPinInput] = useState(pairParam);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const [hostInfo, setHostInfo] = useState(null);
  const [latency, setLatency] = useState(16);

  // Audio & Haptic preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Scanned Feed State
  const [lastScannedItem, setLastScannedItem] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [totalScannedCount, setTotalScannedCount] = useState(0);

  // Quick Add State (when unrecognized barcode is scanned)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [unrecognizedBarcode, setUnrecognizedBarcode] = useState('');

  // Auto-connect if pairing PIN provided in URL
  useEffect(() => {
    if (pairParam) {
      handleConnect(pairParam);
    }
  }, [pairParam]);

  // Bridge Listener setup
  useEffect(() => {
    const unsubStatus = mobilePOSBridge.on('status_change', (data) => {
      setConnectionStatus(data.status);
      if (data.host) setHostInfo(data.host);
    });

    const unsubLatency = mobilePOSBridge.on('latency_update', (ms) => {
      setLatency(ms);
    });

    return () => {
      unsubStatus();
      unsubLatency();
    };
  }, []);

  const handleConnect = (pinToUse) => {
    const pin = (pinToUse || pinInput).trim();
    if (!pin) {
      toast.error(isBengali ? 'দয়া করে ৬-সংখ্যার পিন লিখুন' : 'Please enter 6-digit PIN');
      return;
    }
    mobilePOSBridge.connectAsClient(pin, {
      mode: 'SCANNER_GUN',
    });
    toast.success(isBengali ? 'ডেস্কটপ পিওএস-এ কানেক্ট হচ্ছে...' : 'Connecting to Desktop POS...');
  };

  // Handle scanned barcode on mobile
  const handleBarcodeScanned = (barcode) => {
    const clean = String(barcode).trim();
    const matched = products.find((p) => p.sku === clean || p.id === clean || p.barcode === clean);

    const scanRecord = {
      code: clean,
      name: matched ? matched.name : (isBengali ? 'অজ্ঞাত পণ্য (পিসিতে এন্ট্রি উইন্ডো ওপেন হয়েছে)' : 'New Product (Entry opened on PC)'),
      price: matched ? (matched.sellingPricePoisha || takaToPoisha(matched.sellingPrice || 0)) : null,
      isNew: !matched,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setLastScannedItem(scanRecord);
    setScanHistory((prev) => [scanRecord, ...prev.slice(0, 9)]);
    setTotalScannedCount((prev) => prev + 1);

    if (hapticEnabled && navigator.vibrate) {
      try {
        navigator.vibrate([60]);
      } catch (e) {}
    }

    if (soundEnabled) {
      mobilePOSBridge.playSuccessBeep();
    }

    if (matched) {
      toast.success(
        isBengali ? `✅ বিলে যোগ হয়েছে: ${matched.name}` : `✅ Sent to POS: ${matched.name}`,
        { icon: '🎯' }
      );
    } else {
      setUnrecognizedBarcode(clean);
      setIsQuickAddOpen(true);
      toast(
        isBengali ? `📦 নতুন বারকোড: ${clean} — পণ্য তথ্য পূরণ করুন` : `📦 New Barcode: ${clean} — Add Details`,
        { icon: '✨' }
      );
    }
  };

  const handleResetHistory = () => {
    setScanHistory([]);
    setLastScannedItem(null);
    setTotalScannedCount(0);
    toast.success(isBengali ? 'স্ক্যান হিস্টোরি রিসেট করা হয়েছে' : 'Scan history reset');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto shadow-2xl relative font-sans select-none">
      {/* Top Hardware Terminal Status Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
            <Barcode className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-white uppercase">LedgerX Gun Pro</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                RF-MESH
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[170px]">
              {hostInfo?.name || (isBengali ? 'ডেস্কটপ পিওএস টার্মিনাল' : 'Desktop POS Terminal')}
            </p>
          </div>
        </div>

        {/* Live Status Badge & Hardware Toggles */}
        <div className="flex items-center gap-2">
          {connectionStatus === 'CONNECTED' ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{latency}ms</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{isBengali ? 'ডিসকানেক্টেড' : 'Disconnected'}</span>
            </div>
          )}

          {/* Sound & Haptic Toggles */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-emerald-400 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Disconnected / Pairing Prompt Screen */}
      {connectionStatus !== 'CONNECTED' && (
        <div className="m-4 p-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-spin text-amber-400" />
            <span>{isBengali ? 'ডেস্কটপ পিওএস এর সাথে যুক্ত হোন' : 'Connect to Desktop POS'}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isBengali
              ? 'ডেস্কটপের পিওএস স্ক্রিনে প্রদর্শিত ৬-সংখ্যার পিন কোডটি এখানে লিখুন:'
              : 'Enter the 6-digit PIN shown on your desktop POS screen:'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="e.g. 582109"
              className="flex-1 px-4 py-3 text-center text-xl font-mono font-black tracking-widest bg-slate-900 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            <button
              onClick={() => handleConnect(pinInput)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
            >
              <span>{isBengali ? 'যুক্ত হোন' : 'Connect'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Barcode Scanner Terminal Viewport */}
      <main className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
        {/* Full-viewfinder live optical camera */}
        <MobileCameraScanner
          onBarcodeScanned={handleBarcodeScanned}
          isBengali={isBengali}
        />

        {/* Live Scanned Feedback Card (High-Impact Confirmation) */}
        {lastScannedItem && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-xl space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-black text-emerald-400 uppercase tracking-wider text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                {lastScannedItem.isNew 
                  ? (isBengali ? 'নতুন বারকোড শনাক্ত হয়েছে' : 'New Barcode Captured')
                  : (isBengali ? 'ডেস্কটপ পিওএস-এ যোগ হয়েছে' : 'Sent to Desktop POS')}
              </span>
              <span className="text-[10px] font-mono text-slate-400">{lastScannedItem.time}</span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <div className="flex-1 pr-2">
                <div className="text-sm font-black text-white leading-tight">
                  {lastScannedItem.name}
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400 tracking-wider mt-1">
                  {lastScannedItem.code}
                </div>
              </div>

              {lastScannedItem.price && (
                <div className="text-base font-black text-emerald-300 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  {formatCurrency(lastScannedItem.price)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Realtime Scan Stream & Statistics */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {isBengali ? 'সাম্প্রতিক স্ক্যানকৃত পণ্য' : 'Recent Scan Stream'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                {totalScannedCount} {isBengali ? 'টি স্ক্যান' : 'scanned'}
              </span>
              {scanHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetHistory}
                  title={isBengali ? 'হিস্টোরি মুছুন' : 'Clear'}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {scanHistory.length === 0 ? (
            <div className="p-6 text-center bg-slate-900/60 rounded-3xl border border-slate-800/80 space-y-1.5">
              <Barcode className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                {isBengali ? 'পণ্য ক্যামেরার সামনে ধরুন, স্বয়ংক্রিয়ভাবে স্ক্যান হবে' : 'Point camera at any barcode to scan'}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 divide-y divide-slate-800/60 bg-slate-900/70 rounded-3xl border border-slate-800/80 p-2 overflow-hidden shadow-inner">
              {scanHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 flex items-center justify-between text-xs first:pt-1 last:pb-1"
                >
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-white text-xs truncate">{item.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{item.code}</div>
                  </div>
                  <div className="text-right shrink-0">
                    {item.price && (
                      <div className="font-mono font-bold text-emerald-400 text-xs">
                        {formatCurrency(item.price)}
                      </div>
                    )}
                    <span className="text-[9px] text-slate-500">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Hardware Status Footer */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-3 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 z-30 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium">
            {connectionStatus === 'CONNECTED' 
              ? (isBengali ? 'পিসির সাথে রিয়েলটাইম যুক্ত' : 'Linked with Desktop POS')
              : (isBengali ? 'পিসির সাথে যুক্ত নয়' : 'Not linked')}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setUnrecognizedBarcode('');
            setIsQuickAddOpen(true);
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded-xl text-[11px] flex items-center gap-1 transition-all border border-slate-700"
        >
          <PackagePlus className="w-3 h-3" />
          <span>{isBengali ? 'পণ্য যোগ +' : 'Add Item +'}</span>
        </button>
      </footer>

      {/* Quick Add Product Modal when Unrecognized Barcode Scanned on Mobile */}
      <QuickAddProductModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialBarcode={unrecognizedBarcode}
        onSaveAndAddToCart={(newProduct) => {
          if (addProduct) {
            addProduct(newProduct);
          }
          setIsQuickAddOpen(false);
          toast.success(
            isBengali
              ? `"${newProduct.name}" সফলভাবে সংরক্ষিত ও কার্টে যুক্ত হয়েছে!`
              : `"${newProduct.name}" added to inventory and cart!`
          );
        }}
        onSaveOnly={(newProduct) => {
          if (addProduct) {
            addProduct(newProduct);
          }
          setIsQuickAddOpen(false);
          toast.success(
            isBengali ? `"${newProduct.name}" সফলভাবে যুক্ত হয়েছে!` : `"${newProduct.name}" saved to inventory!`
          );
        }}
      />
    </div>
  );
}
