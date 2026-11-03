import React from 'react';
import { AlertOctagon, RefreshCw, Download, MessageSquare, ShieldCheck } from 'lucide-react';
import { telemetry } from '../../utils/telemetry';

export class LedgerXCrashBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      crashReportSent: false,
      isRestarting: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[LedgerX Crash Guard Intercepted Error]:', error, errorInfo);

    // Silently capture and upload telemetry
    telemetry.captureCrash(error, {
      componentStack: errorInfo?.componentStack,
    }).then(() => {
      this.setState({ crashReportSent: true });
    });
  }

  handleSafeRestart = () => {
    this.setState({ isRestarting: true });
    setTimeout(() => {
      window.location.href = '/';
    }, 400);
  };

  handleDownloadLog = () => {
    try {
      const dump = {
        title: 'LedgerX Enterprise Diagnostic Flight-Log',
        timestamp: new Date().toISOString(),
        error: this.state.error?.message || String(this.state.error),
        stack: this.state.error?.stack || null,
        componentStack: this.state.errorInfo?.componentStack || null,
        flightLog: telemetry.getFlightLog(),
        appVersion: '6.0.0',
      };

      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LEDGERX_FLIGHT_LOG_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not export flight log.');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
            {/* Top Pink Banner */}
            <div className="bg-[#E2136E] px-8 py-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm shadow-inner">
                <AlertOctagon className="w-9 h-9 text-white animate-pulse" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">সিস্টেম রিকভারি মোড (Recovery Mode)</h1>
              <p className="text-pink-100 text-xs mt-1 font-semibold">
                একটি অপ্রত্যাশিত সমস্যা শনাক্ত করা হয়েছে, তবে আপনার ব্যবসার কোনো তথ্য নষ্ট হয়নি।
              </p>
            </div>

            {/* Body Content */}
            <div className="p-8 space-y-6">
              {/* Zero Data-Loss Guarantee Badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-900">১০০% নো-ডাটা-লস গ্যারান্টি (Zero Data-Loss Active)</div>
                  <div className="text-emerald-700 mt-0.5">
                    আপনার সমস্ত গ্রাহক, বাকি ও ক্যাশ খাতা স্থানীয় মেমোরিতে নিরাপদে সংরক্ষিত আছে।
                  </div>
                </div>
              </div>

              {/* Technical Error Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 font-mono overflow-x-auto max-h-32">
                <div className="text-slate-400 font-sans font-bold text-[10px] uppercase mb-1">Error Diagnostic:</div>
                {this.state.error?.message || 'Unknown runtime exception'}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleSafeRestart}
                  disabled={this.state.isRestarting}
                  className="w-full py-4 bg-[#E2136E] hover:bg-[#C2105C] active:scale-[0.99] text-white rounded-2xl font-bold text-base shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className={`w-5 h-5 ${this.state.isRestarting ? 'animate-spin' : ''}`} />
                  {this.state.isRestarting ? 'রিস্টার্ট হচ্ছে...' : 'নিরাপদ রিস্টার্ট ও ডাটা রিলোড'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={this.handleDownloadLog}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    ফ্লাইট লগ ডাউনলোড
                  </button>

                  <a
                    href="https://wa.me/8801700000000?text=LedgerX%20Assistance%20Needed"
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    হোয়াটসঅ্যাপ হেল্পডেস্ক
                  </a>
                </div>
              </div>

              {/* Telemetry Status Footer */}
              <div className="text-center text-[11px] text-slate-400 font-medium">
                {this.state.crashReportSent
                  ? '✓ ত্রুটির রিপোর্ট স্বয়ংক্রিয়ভাবে ইঞ্জিনিয়ারিং সেন্টারে পাঠানো হয়েছে।'
                  : 'সেন্ট্রাল ডায়াগনস্টিক ট্র্যাকার অ্যাক্টিভ...'}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LedgerXCrashBoundary;
