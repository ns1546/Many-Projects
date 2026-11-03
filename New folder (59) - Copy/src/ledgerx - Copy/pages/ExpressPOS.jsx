import React, { useState } from 'react';
import RushHourPOS from '../components/pos/RushHourPOS';
import ThermalReceiptPreview from '../components/print/ThermalReceiptPreview';
import Mushak63Invoice from '../components/print/Mushak63Invoice';
import { useNavigate } from 'react-router-dom';

export default function ExpressPOS() {
  const navigate = useNavigate();
  const [receiptModal, setReceiptModal] = useState(null); // { type: 'THERMAL' | 'MUSHAK', saleData }

  return (
    <div className="w-full pb-1">
      {/* Embedded High-Performance POS Component with clean unified header */}
      <RushHourPOS 
        onBack={() => navigate('/')}
        onOpenReceipt={(saleData) => setReceiptModal({ type: 'THERMAL', saleData })} 
      />

      {/* Thermal Receipt Preview Modal */}
      {receiptModal && receiptModal.type === 'THERMAL' && (
        <ThermalReceiptPreview
          sale={receiptModal.saleData}
          isOpen={true}
          onClose={() => setReceiptModal(null)}
          onSwitchToMushak={() => setReceiptModal({ type: 'MUSHAK', saleData: receiptModal.saleData })}
        />
      )}

      {/* NBR Mushak 6.3 Tax Invoice Modal */}
      {receiptModal && receiptModal.type === 'MUSHAK' && (
        <Mushak63Invoice
          sale={receiptModal.saleData}
          isOpen={true}
          onClose={() => setReceiptModal(null)}
          onSwitchToThermal={() => setReceiptModal({ type: 'THERMAL', saleData: receiptModal.saleData })}
        />
      )}
    </div>
  );
}
