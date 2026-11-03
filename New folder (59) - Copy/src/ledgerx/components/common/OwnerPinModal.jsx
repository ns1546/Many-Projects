import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { Lock, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OwnerPinModal({ isOpen, onClose, onSuccess, title }) {
  const { verifyOwnerPin } = useTenant();
  const { t, isBengali } = useLocale();
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setHasError(false);
      if (next.length === 4) {
        // Auto-verify on 4th digit
        if (verifyOwnerPin(next)) {
          toast.success(isBengali ? 'অনুমোদন সফল হয়েছে!' : 'Authorized successfully!', { icon: '🔓' });
          onSuccess();
          onClose();
          setPin('');
        } else {
          setHasError(true);
          toast.error(isBengali ? 'ভুল পিন নম্বর! আবার চেষ্টা করুন।' : 'Incorrect PIN! Try again.', { icon: '⚠️' });
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setHasError(false);
  };

  const handleClear = () => {
    setPin('');
    setHasError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden border border-gray-100 p-6 text-center animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-pink-100 text-[#E2136E] flex items-center justify-center mx-auto">
            <Lock size={20} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <h3 className="text-base font-bold text-gray-800 leading-tight">
          {title || t('pin_prompt_title')}
        </h3>
        <p className="text-xs text-gray-500 mt-1 mb-5">
          {t('pin_prompt_desc')}
        </p>

        {/* 4-Dot PIN Indicator */}
        <div className={`flex justify-center gap-4 mb-6 ${hasError ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > index
                  ? 'bg-[#E2136E] scale-110 shadow-md shadow-pink-500/30'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* 3x4 Tactile Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(String(digit))}
              className="h-12 rounded-xl bg-gray-50 hover:bg-pink-50 active:bg-pink-100 text-gray-800 hover:text-[#E2136E] font-bold text-lg transition-colors border border-gray-100 shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 font-semibold text-xs transition-colors border border-gray-100"
          >
            {isBengali ? 'মুছুন' : 'Clear'}
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-gray-50 hover:bg-pink-50 text-gray-800 font-bold text-lg transition-colors border border-gray-100 shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 font-semibold text-base transition-colors border border-gray-100"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
