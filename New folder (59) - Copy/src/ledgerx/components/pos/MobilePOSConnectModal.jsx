import React, { useState, useEffect } from 'react';
import { mobilePOSBridge } from '../../utils/MobilePOSBridge';
import QRCodeSVG from '../common/QRCodeSVG';
import { useLocale } from '../../context/LocaleContext';
import { 
  Smartphone, 
  Wifi, 
  QrCode, 
  Copy, 
  Check, 
  X, 
  Zap, 
  ShieldCheck, 
  Radio, 
  ArrowRight, 
  RefreshCw, 
  BatteryMedium, 
  Clock, 
  ExternalLink,
  Barcode,
  CheckCircle2,
  Info,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MobilePOSConnectModal({ isOpen, onClose, activeTenant }) {
  const { isBengali } = useLocale();
  const [session, setSession] = useState(null);
  const [lanIp, setLanIp] = useState('192.168.0.100');
  const [isEditingIp, setIsEditingIp] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('PAIRING');
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [latency, setLatency] = useState(18);
  const [recentScans, setRecentScans] = useState([]);
  const [copied, setCopied] = useState(false);
  const [autoCloseSeconds, setAutoCloseSeconds] = useState(null);

  // Auto-close timer when mobile is connected
  useEffect(() => {
    let interval = null;
    if (connectionStatus === 'CONNECTED') {
      setAutoCloseSeconds(3);
      interval = setInterval(() => {
        setAutoCloseSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(interval);
            onClose();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAutoCloseSeconds(null);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus, onClose]);

  // Initialize or restore Host Session with LAN IP
  useEffect(() => {
    if (!isOpen) return;

    const hostSession = mobilePOSBridge.createHostSession(activeTenant?.id || 'store1', lanIp);
    setSession(hostSession);
    setConnectionStatus(mobilePOSBridge.connectionStatus);
    setConnectedDevice(mobilePOSBridge.connectedDevice);

    const unsubStatus = mobilePOSBridge.on('status_change', (data) => {
      setConnectionStatus(data.status);
      if (data.device) setConnectedDevice(data.device);
    });

    const unsubScan = mobilePOSBridge.on('barcode_scanned', (scanData) => {
      setRecentScans((prev) => [
        {
          code: scanData.barcode,
          time: new Date().toLocaleTimeString(),
          device: scanData.device?.deviceName || 'Mobile',
        },
        ...prev.slice(0, 7),
      ]);
      toast.success(
        isBengali
          ? `📱 মোবাইল থেকে স্ক্যান সম্পন্ন: ${scanData.barcode}`
          : `Scanned from mobile: ${scanData.barcode}`,
        { icon: '🎯' }
      );
    });

    const unsubLatency = mobilePOSBridge.on('latency_update', (ms) => {
      setLatency(ms);
    });

    const unsubDisconnect = mobilePOSBridge.on('device_disconnected', () => {
      setConnectedDevice(null);
      setConnectionStatus('PAIRING');
      setAutoCloseSeconds(null);
      toast.error(isBengali ? 'মোবাইল সংযোগ বিচ্ছিন্ন হয়েছে' : 'Mobile terminal disconnected');
    });

    return () => {
      unsubStatus();
      unsubScan();
      unsubLatency();
      unsubDisconnect();
    };
  }, [isOpen, activeTenant, lanIp, isBengali]);

  if (!isOpen || !session) return null;

  const pairingUrl = mobilePOSBridge.getPairingUrl(session.sessionPin, lanIp);

  const copyPairingLink = () => {
    navigator.clipboard.writeText(pairingUrl);
    setCopied(true);
    toast.success(isBengali ? 'ওয়াইফাই লিংক কপি করা হয়েছে' : 'LAN Pairing link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateSession = () => {
    const newSession = mobilePOSBridge.createHostSession(activeTenant?.id || 'store1', lanIp, true);
    setSession(newSession);
    setConnectionStatus('PAIRING');
    setConnectedDevice(null);
    setAutoCloseSeconds(null);
    toast.success(isBengali ? 'নতুন কিউআর ও পিন তৈরি হয়েছে' : 'New QR and PIN generated');
  };

  const cancelAutoClose = () => {
    setAutoCloseSeconds(null);
    toast(isBengali ? 'অটো-ক্লোজ বন্ধ করা হয়েছে' : 'Auto-close canceled');
  };

  const simulateTestScan = () => {
    mobilePOSBridge.emitScannedBarcode('89411018');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Strip */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {isBengali ? 'স্মার্টফোনকে POS মেশিন ও স্ক্যানার বানান' : 'Connect Mobile POS & Scanner'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800">
                  WebRTC P2P
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isBengali
                  ? 'ওয়াইফাই বা ইন্টারনেটের মাধ্যমে যেকোনো ফোনকে ওয়্যারলেস স্ক্যানার বানান'
                  : 'Turn any smartphone into an untethered barcode scanner & pocket POS'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Connected Celebration & Auto-Close Banner */}
          {connectionStatus === 'CONNECTED' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">
                    {isBengali ? '🎉 ফোন সফলভাবে যুক্ত হয়েছে!' : '🎉 Smartphone Connected!'}
                  </h4>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    {autoCloseSeconds !== null
                      ? isBengali
                        ? `${autoCloseSeconds} সেকেন্ডে উইন্ডো বন্ধ হবে... আপনি পিওএস-এ স্ক্যান শুরু করতে পারেন`
                        : `Auto-closing in ${autoCloseSeconds}s... Ready to scan products`
                      : isBengali
                      ? 'উইন্ডো বন্ধ হলেও ব্যাকগ্রাউন্ডে ফোন সার্বক্ষণিক সক্রিয় থাকবে'
                      : 'Closing this window will NOT disconnect your phone'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                {autoCloseSeconds !== null ? (
                  <button
                    type="button"
                    onClick={cancelAutoClose}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 rounded-lg transition"
                  >
                    {isBengali ? 'উইন্ডো খোলা রাখুন' : 'Keep Open'}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-bold bg-white text-emerald-900 rounded-xl shadow-md hover:bg-emerald-50 transition active:scale-95"
                >
                  {isBengali ? '✓ এখনই শুরু করুন' : 'Start Now'}
                </button>
              </div>
            </div>
          )}

          {/* Status Banner */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              connectionStatus === 'CONNECTED'
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm'
                : 'bg-amber-50/90 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      connectionStatus === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
                <span className="font-bold text-xs tracking-wide">
                  {connectionStatus === 'CONNECTED'
                    ? isBengali
                      ? `🟢 ফোন সংযুক্ত রয়েছে: ${connectedDevice?.deviceName || 'স্মার্টফোন'}`
                      : `🟢 Connected: ${connectedDevice?.deviceName || 'Smartphone'}`
                    : isBengali
                    ? 'অপেক্ষা করছে... আপনার ফোন দিয়ে নিচের আসল কিউআর কোড স্ক্যান করুন'
                    : 'Waiting for mobile connection... Scan real QR below'}
                </span>
              </div>

              {connectionStatus === 'CONNECTED' && (
                <div className="flex items-center gap-3 text-[11px] font-bold text-emerald-800 bg-emerald-200/60 px-2.5 py-1 rounded-lg">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 animate-pulse" /> {latency}ms
                  </span>
                  <span className="flex items-center gap-1">
                    <BatteryMedium className="w-3.5 h-3.5" /> 98%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code and PIN Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Authentic Standard QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
              <QRCodeSVG value={pairingUrl} size={170} />
              <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>{isBengali ? 'ক্যামেরা দিয়ে স্ক্যান করুন' : 'Scan with phone camera'}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isBengali ? 'আইফোন ক্যামেরা বা গুগল লেন্স দিয়ে স্ক্যান করলেই খুলবে' : 'Works with iPhone Camera & Google Lens'}
              </p>
            </div>

            {/* Right: Manual 6-Digit PIN & Wi-Fi IP */}
            <div className="space-y-3.5">
              <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-inner">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {isBengali ? 'অথবা ৬-সংখ্যার পিন দিয়ে যুক্ত হোন' : 'Or enter 6-digit PIN on phone'}
                </span>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="text-3xl font-extrabold tracking-widest text-emerald-400 font-mono">
                    {session.sessionPin.slice(0, 3)} {session.sessionPin.slice(3)}
                  </div>
                  <button
                    onClick={regenerateSession}
                    title={isBengali ? 'নতুন পিন তৈরি করুন' : 'Refresh PIN'}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Wi-Fi LAN IP Settings */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    {isBengali ? 'কম্পিউটারের ওয়াইফাই আইপি (LAN IP)' : 'Computer Wi-Fi IP'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingIp(!isEditingIp)}
                    className="text-[10px] text-emerald-600 font-bold hover:underline"
                  >
                    {isEditingIp ? (isBengali ? 'সেভ' : 'Save') : (isBengali ? 'পরিবর্তন' : 'Edit')}
                  </button>
                </div>

                {isEditingIp ? (
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="text"
                      value={lanIp}
                      onChange={(e) => setLanIp(e.target.value)}
                      placeholder="e.g. 192.168.0.100"
                      className="flex-1 px-2.5 py-1 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setIsEditingIp(false)}
                      className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="font-mono text-[11px] text-slate-600 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 truncate">
                    {pairingUrl}
                  </div>
                )}
              </div>

              {/* URL Direct Copy & Open */}
              <div className="flex items-center gap-2">
                <button
                  onClick={copyPairingLink}
                  className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? (isBengali ? 'কপি হয়েছে' : 'Copied') : (isBengali ? 'লিংক কপি করুন' : 'Copy Mobile Link')}</span>
                </button>

                <a
                  href={pairingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                  title={isBengali ? 'ব্রাউজারে খুলুন' : 'Open in new tab'}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Wi-Fi & Mobile Access Guide */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-950 leading-relaxed">
              <strong>{isBengali ? 'মোবাইল সংযোগ ও সিকিউরিটি গাইড:' : 'Mobile Connection & Security Guide:'}</strong>{' '}
              {isBengali
                ? `কম্পিউটার এবং স্মার্টফোন একই ওয়াইফাই বা মোবাইল হটস্পটে কানেক্ট করুন। লিংকটি সরাসরি ক্লিন লোকাল নেটওয়ার্কে চলে, তাই কোনো সিকিউরিটি এরর ছাড়াই ফোনে ওপেন হবে। ক্যামেরা অনুমতি দিলেই লাইভ স্ক্যানার সচল হবে।`
                : `Connect both PC and phone to the same Wi-Fi/Hotspot. The link runs over clean local LAN without certificate blocks. Grant camera permission to scan live.`}
            </div>
          </div>

          {/* Live Mobile Scan Stream */}
          {recentScans.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {isBengali ? 'মোবাইল থেকে সাম্প্রতিক স্ক্যান' : 'Live Mobile Scan Stream'}
                </span>
                <span className="text-[11px] text-slate-400">{recentScans.length} টি স্ক্যান</span>
              </div>
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-200/60 overflow-hidden max-h-36 overflow-y-auto">
                {recentScans.map((scan, i) => (
                  <div key={i} className="px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-800">{scan.code}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{scan.device}</span>
                      <span>•</span>
                      <span>{scan.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={simulateTestScan}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Barcode className="w-3.5 h-3.5 text-emerald-600" />
              {isBengali ? 'টেস্ট স্ক্যান' : 'Simulate Scan'}
            </button>
            <span className="hidden sm:inline-block text-[11px] text-slate-500">
              {connectionStatus === 'CONNECTED'
                ? (isBengali ? '🛡️ ব্যাকগ্রাউন্ডে সবসময় কানেক্টেড' : '🛡️ Stays connected in background')
                : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {connectionStatus === 'CONNECTED' ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isBengali ? 'উইন্ডো বন্ধ করে কাজ শুরু করুন' : 'Close & Start Working'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
              >
                {isBengali ? 'বন্ধ করুন' : 'Close'}
              </button>
            )}

            <a
              href={pairingUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-200/80 hover:bg-slate-300 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-700" />
              <span>{isBengali ? 'মোবাইল টেস্ট' : 'Open Link'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
