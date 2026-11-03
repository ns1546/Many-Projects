import React from 'react';
import { Star, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

export default function RiskBadge({ currentDuePoisha, creditLimitPoisha, trustScore = 5, locale = 'bn' }) {
  const isOverLimit = currentDuePoisha > creditLimitPoisha;
  const ratio = creditLimitPoisha > 0 ? (currentDuePoisha / creditLimitPoisha) * 100 : 0;

  let riskColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let riskText = locale === 'bn' ? 'নিরাপদ গ্রাহক' : 'Safe Customer';

  if (isOverLimit || ratio >= 100) {
    riskColor = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
    riskText = locale === 'bn' ? 'সীমা অতিক্রান্ত ⚠️' : 'Limit Exceeded ⚠️';
  } else if (ratio >= 80) {
    riskColor = 'bg-amber-50 text-amber-700 border-amber-200';
    riskText = locale === 'bn' ? 'সতর্কতা (৮০%+)' : 'Warning (80%+)';
  }

  return (
    <div className="flex items-center gap-2">
      {/* Risk Level Badge */}
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskColor}`}>
        {riskText}
      </span>

      {/* Trust Score 1-5 Stars */}
      <div className="flex items-center text-amber-400" title={`Trust Score: ${trustScore}/5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={11}
            className={star <= trustScore ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
          />
        ))}
      </div>
    </div>
  );
}
