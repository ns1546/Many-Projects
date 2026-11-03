'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '18001234567'; // From website footer +1 (800) 123-4567
  const message = 'Hello Petopia! I have a question.';
  
  const handleConnect = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Popup */}
      {isOpen && (
        <div className="mb-4 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#25D366] p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 fill-white" />
              <span className="font-semibold font-poppins">Chat with Petopia</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5 bg-gray-50">
            <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-700 mb-4 inline-block">
              Hi there! 👋 How can we help you and your pets today?
            </div>
            <button 
              onClick={handleConnect}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb355] text-white font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-green-500/20"
            >
              <Send className="h-4 w-4" /> Connect with Petopia
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 bg-[#25D366] hover:bg-[#1fb355] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-transform hover:scale-110 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}
