import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Camera, 
  Flashlight, 
  FlashlightOff, 
  Check, 
  AlertCircle, 
  Barcode, 
  Zap, 
  RefreshCw,
  Sparkles,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { mobilePOSBridge } from '../../../utils/MobilePOSBridge';
import toast from 'react-hot-toast';

export default function MobileCameraScanner({ onBarcodeScanned, isBengali = true }) {
  const containerId = 'ledgerx-live-scanner-viewfinder';
  const scannerInstanceRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [manualCode, setManualCode] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [scanCount, setScanCount] = useState(0);

  const [isScanningLocked, setIsScanningLocked] = useState(false);

  const lastScannedTimeRef = useRef(0);
  const lastCodeRef = useRef('');
  const lockTimerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let html5QrCode = null;

    async function initializeScanner() {
      try {
        setCameraError(null);

        // Check Secure Context for Mobile Web
        const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        html5QrCode = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.DATA_MATRIX,
            Html5QrcodeSupportedFormats.ITF,
          ],
          verbose: false,
        });

        scannerInstanceRef.current = html5QrCode;

        // Optimized scan config for 1D retail barcodes & 2D QR (High FPS + Macro Reticle)
        const config = {
          fps: 25,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const boxWidth = Math.floor(viewfinderWidth * 0.92);
            const boxHeight = Math.floor(Math.max(130, minEdge * 0.45));
            return { width: boxWidth, height: boxHeight };
          },
          aspectRatio: 1.333333,
          disableFlip: false,
        };

        // Attempt 1: Start with facingMode 'environment' with continuous autofocus for tiny barcodes
        try {
          await html5QrCode.start(
            { 
              facingMode: 'environment',
              advanced: [
                { focusMode: 'continuous' },
                { exposureMode: 'continuous' }
              ]
            },
            config,
            (decodedText) => {
              if (isMounted) {
                handleDetectedCode(decodedText);
              }
            },
            () => {}
          );
        } catch (facingErr) {
          console.warn('facingMode environment with advanced focus failed, trying camera list...', facingErr);
          // Attempt 2: Query camera devices and select the back/environment camera
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            const backCamera = cameras.find((c) => /back|rear|environment/i.test(c.label)) || cameras[cameras.length - 1];
            await html5QrCode.start(
              backCamera.id,
              config,
              (decodedText) => {
                if (isMounted) {
                  handleDetectedCode(decodedText);
                }
              },
              () => {}
            );
          } else {
            throw facingErr;
          }
        }

        if (isMounted) {
          setIsCameraActive(true);

          // Check camera capabilities (Torch & Zoom)
          try {
            const capabilities = html5QrCode.getRunningTrackCapabilities();
            if (capabilities && capabilities.torch) {
              setHasTorch(true);
            }
            if (capabilities && capabilities.zoom) {
              setMaxZoom(Math.min(5, capabilities.zoom.max || 1));
            }
          } catch (e) {}
        }
      } catch (err) {
        console.warn('HTML5 Scanner start failed:', err);
        if (isMounted) {
          setIsCameraActive(false);
          const isHttpInsecure = typeof window !== 'undefined' && !window.isSecureContext && window.location.protocol === 'http:';
          setCameraError(
            isHttpInsecure
              ? (isBengali
                  ? 'মোবাইল ব্রাউজারে সরাসরি লাইভ ক্যামেরা চালু করতে HTTPS প্রয়োজন অথবা নিচের "ক্যামেরা চালু করুন" বাটনে ট্যাপ করে ছবি তুললে ১ সেকেন্ডে বারকোড স্ক্যান হবে।'
                  : 'Live camera streaming over local HTTP is restricted by mobile browsers. Tap "Open Camera" below to scan instantly via snapshot, or open the HTTPS link.')
              : (err?.message || (isBengali ? 'ক্যামেরা চালু করা যায়নি।' : 'Camera could not be started.'))
          );
        }
      }
    }

    // Small delay to ensure DOM container is rendered
    const timer = setTimeout(() => {
      initializeScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      if (scannerInstanceRef.current) {
        try {
          if (scannerInstanceRef.current.isScanning) {
            scannerInstanceRef.current.stop().then(() => {
              try {
                scannerInstanceRef.current.clear();
              } catch (e) {}
            }).catch(() => {});
          }
        } catch (e) {}
      }
    };
  }, [isBengali]);

  const handleDetectedCode = (code) => {
    if (!code) return;
    const cleanCode = String(code).trim();
    const now = Date.now();

    // 🔒 Professional Barcode Scanner Lock-on:
    // If the EXACT same barcode is scanned within 3.0 seconds, IGNORE completely.
    // This stops the barcode from continuously auto-incrementing when held in front of the lens!
    if (cleanCode === lastCodeRef.current && now - lastScannedTimeRef.current < 3000) {
      return;
    }

    lastCodeRef.current = cleanCode;
    lastScannedTimeRef.current = now;

    // Trigger visual lock-on confirmation state
    setIsScanningLocked(true);
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = setTimeout(() => {
      setIsScanningLocked(false);
    }, 2500);

    setScanCount((prev) => prev + 1);
    setLastScanned({
      code: cleanCode,
      time: new Date().toLocaleTimeString(),
    });

    // Sound & Haptic Feedback - Exactly 1 Crisp Chirp
    mobilePOSBridge.emitScannedBarcode(cleanCode);

    if (onBarcodeScanned) {
      onBarcodeScanned(cleanCode);
    }
  };

  const toggleTorch = async () => {
    if (!scannerInstanceRef.current || !hasTorch) return;
    try {
      const nextState = !isTorchOn;
      await scannerInstanceRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState }],
      });
      setIsTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle error:', e);
    }
  };

  const handleZoomChange = async (increment) => {
    if (!scannerInstanceRef.current || maxZoom <= 1) return;
    try {
      const nextZoom = Math.min(maxZoom, Math.max(1, zoomLevel + increment));
      await scannerInstanceRef.current.applyVideoConstraints({
        advanced: [{ zoom: nextZoom }],
      });
      setZoomLevel(nextZoom);
    } catch (e) {
      console.warn('Zoom change error:', e);
    }
  };

  // High-accuracy photo snapshot decoding (BarcodeDetector hardware acceleration + optimized canvas ZXing fallback)
  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading(isBengali ? 'বারকোড প্রসেস করা হচ্ছে...' : 'Processing barcode...', { id: 'img-scan' });

    try {
      // 1. Hardware-accelerated BarcodeDetector (Supported natively in Android Chrome)
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'qr_code'],
          });
          const bitmap = await createImageBitmap(file);
          const detected = await barcodeDetector.detect(bitmap);
          if (detected && detected.length > 0 && detected[0].rawValue) {
            const raw = detected[0].rawValue;
            toast.dismiss('img-scan');
            handleDetectedCode(raw);
            toast.success(isBengali ? `বারকোড স্ক্যান সফল: ${raw}` : `Barcode detected: ${raw}`, { icon: '🎯' });
            return;
          }
        } catch (detectorErr) {
          console.warn('Native BarcodeDetector pass failed, trying canvas ZXing:', detectorErr);
        }
      }

      // 2. Optimized Downscaled & Contrast-Enhanced Canvas Processing for ZXing
      const optimizedBlob = await preprocessBarcodeImage(file);
      const testFile = new File([optimizedBlob], 'barcode.jpg', { type: 'image/jpeg' });

      if (scannerInstanceRef.current) {
        const decodedText = await scannerInstanceRef.current.scanFile(testFile, true);
        toast.dismiss('img-scan');
        if (decodedText) {
          handleDetectedCode(decodedText);
          toast.success(isBengali ? `বারকোড স্ক্যান সফল: ${decodedText}` : `Barcode detected: ${decodedText}`, { icon: '🎯' });
          return;
        }
      }

      // 3. Fallback to raw file with ZXing
      if (scannerInstanceRef.current) {
        const decodedRaw = await scannerInstanceRef.current.scanFile(file, true);
        toast.dismiss('img-scan');
        if (decodedRaw) {
          handleDetectedCode(decodedRaw);
          toast.success(isBengali ? `বারকোড স্ক্যান সফল: ${decodedRaw}` : `Barcode detected: ${decodedRaw}`, { icon: '🎯' });
          return;
        }
      }

      throw new Error('No barcode found');
    } catch (err) {
      toast.dismiss('img-scan');
      console.warn('Photo scan error:', err);
      toast.error(
        isBengali
          ? 'বারকোড স্পষ্ট বোঝা যায়নি। আলোর দিকে রেখে সোজাভাবে ছবি তুলুন অথবা নিচে ম্যানুয়ালি কোডটি লিখুন।'
          : 'Could not detect barcode clearly. Hold steady with good lighting or type manually below.'
      );
    } finally {
      // Reset file input so user can scan again immediately
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Preprocess camera photo to optimal resolution (1280px max) with center focus & contrast enhancement
  const preprocessBarcodeImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // Draw scaled image
          ctx.drawImage(img, 0, 0, w, h);

          // Contrast enhancement
          try {
            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;
            const factor = 1.25; // 25% contrast boost
            for (let i = 0; i < data.length; i += 4) {
              data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
              data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
              data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
            }
            ctx.putImageData(imgData, 0, 0);
          } catch (ex) {}

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else resolve(file);
            },
            'image/jpeg',
            0.92
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleDetectedCode(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="relative w-full flex flex-col items-center bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
      {/* Hidden Native Camera Input Fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoCapture}
        className="hidden"
      />

      {/* Top Scanner Status Bar */}
      <div className="w-full px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCameraActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCameraActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </span>
          <span className="font-bold text-slate-200">
            {isCameraActive
              ? (isBengali ? 'লাইভ ক্যামেরা স্ক্যানিং চলছে' : 'Live Camera Active')
              : (isBengali ? 'ক্যামেরা লোড হচ্ছে...' : 'Initializing Camera...')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-1.5 rounded-lg border transition-colors ${
                isTorchOn
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title={isBengali ? 'ফ্ল্যাশলাইট' : 'Torch'}
            >
              {isTorchOn ? <Flashlight className="w-3.5 h-3.5" /> : <FlashlightOff className="w-3.5 h-3.5" />}
            </button>
          )}

          {maxZoom > 1 && (
            <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => handleZoomChange(-0.5)}
                disabled={zoomLevel <= 1}
                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">{zoomLevel.toFixed(1)}x</span>
              <button
                onClick={() => handleZoomChange(0.5)}
                disabled={zoomLevel >= maxZoom}
                className="p-0.5 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          )}

          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-black">
            {scanCount} {isBengali ? 'স্ক্যান' : 'Scans'}
          </span>
        </div>
      </div>

      {/* Viewfinder Window */}
      <div className="relative w-full aspect-[4/3] max-h-[360px] bg-black flex items-center justify-center overflow-hidden">
        {/* HTML5 QR Code Container (Zero photo capture, 100% continuous video) */}
        <div
          id={containerId}
          className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
        />

        {/* Targeted Reticle Box with Green Laser Animation & Lock-on Feedback */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            <div
              className={`relative w-80 h-32 border-2 rounded-2xl transition-all duration-300 overflow-hidden ${
                isScanningLocked
                  ? 'border-emerald-300 bg-emerald-500/15 shadow-[0_0_35px_rgba(52,211,153,0.7)]'
                  : 'border-emerald-400/90 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
              }`}
            >
              {/* Laser Line */}
              <div
                className={`absolute left-0 right-0 h-0.5 shadow-[0_0_12px_#34d399] ${
                  isScanningLocked ? 'bg-emerald-200' : 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce'
                }`}
              />

              {/* Corner Accents */}
              <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white rounded-tl-sm" />
              <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white rounded-tr-sm" />
              <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white rounded-bl-sm" />
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-white rounded-br-sm" />

              <span className="absolute bottom-1.5 left-0 right-0 text-center text-[10px] font-bold uppercase tracking-widest drop-shadow flex items-center justify-center gap-1">
                {isScanningLocked ? (
                  <span className="text-emerald-300 font-black animate-pulse flex items-center gap-1 bg-slate-950/70 px-2 py-0.5 rounded-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {isBengali ? 'স্ক্যান সম্পন্ন — পরবর্তী পণ্য ধরুন' : 'Scanned! Move to Next'}
                  </span>
                ) : (
                  <span className="text-white/80">{isBengali ? 'বারকোড এই বক্সে রাখুন' : 'Align Barcode Here'}</span>
                )}
              </span>
            </div>

            {/* Quick Zoom Pills directly overlayed at bottom for tiny barcodes */}
            <div className="mt-3 pointer-events-auto flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/80 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                {isBengali ? 'জুম:' : 'Zoom:'}
              </span>
              {[1, 2, 3].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={async () => {
                    if (!scannerInstanceRef.current) return;
                    try {
                      await scannerInstanceRef.current.applyVideoConstraints({
                        advanced: [{ zoom: z }],
                      });
                      setZoomLevel(z);
                    } catch (e) {
                      console.warn('Zoom change error:', e);
                    }
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold transition-all ${
                    Math.round(zoomLevel) === z
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {z}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Fallback Box */}
        {cameraError && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isBengali ? 'রিলোড' : 'Reload'}</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/25"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isBengali ? 'ক্যামেরা চালু' : 'Open Camera'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Last Scanned Item Banner */}
      {lastScanned && (
        <div className="w-full bg-emerald-500/10 border-t border-b border-emerald-500/20 px-4 py-2.5 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-bold">
                {isBengali ? 'সফল স্ক্যান' : 'Scanned'}
              </span>
              <span className="text-xs font-mono font-bold text-white">{lastScanned.code}</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400">{lastScanned.time}</span>
        </div>
      )}

      {/* Manual Barcode Input Fallback */}
      <form onSubmit={handleManualSubmit} className="w-full p-3.5 bg-slate-900/80 flex items-center gap-2">
        <div className="relative flex-1">
          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder={isBengali ? 'বারকোড বা SKU লিখুন...' : 'Enter barcode or SKU...'}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
        <button
          type="submit"
          className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shrink-0 shadow-md shadow-emerald-400/20"
        >
          {isBengali ? 'যোগ' : 'Add'}
        </button>
      </form>
    </div>
  );
}
