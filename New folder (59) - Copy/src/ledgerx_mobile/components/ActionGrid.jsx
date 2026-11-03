import React from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import {
  Zap,
  Users,
  Building2,
  Wallet,
  Package,
  Warehouse,
  Contact,
  TrendingUp,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export default function ActionGrid() {
  const { language, navigateTo } = useMobileApp();
  const isBn = language === 'bn';

  const actions = [
    {
      id: 'quick-sale',
      labelBn: 'দ্রুত বিক্রয়',
      labelEn: 'Quick Sale',
      icon: Zap,
      bg: '#FFF0F6',
      color: '#E2136E',
      badge: isBn ? 'পিওএস' : 'POS',
    },
    {
      id: 'customer-khata',
      labelBn: 'কাস্টমার বাকি',
      labelEn: 'Customers',
      icon: Users,
      bg: '#EFF6FF',
      color: '#1E60D5',
      badge: isBn ? 'বাকি' : 'Due',
    },
    {
      id: 'supplier-khata',
      labelBn: 'মহাজন খাতা',
      labelEn: 'Suppliers',
      icon: Building2,
      bg: '#F5F3FF',
      color: '#7C3AED',
      badge: isBn ? 'দেনা' : 'Payable',
    },
    {
      id: 'cashbox',
      labelBn: 'ক্যাশবাক্স',
      labelEn: 'Cashbox',
      icon: Wallet,
      bg: '#FFFBEB',
      color: '#D97706',
      badge: isBn ? 'ড্রয়ার' : 'Till',
    },
    {
      id: 'inventory',
      labelBn: 'পণ্য ও স্টক',
      labelEn: 'Inventory',
      icon: Package,
      bg: '#F0FDFA',
      color: '#0D9488',
      badge: isBn ? 'স্টক' : 'Stock',
    },
    {
      id: 'godown',
      labelBn: 'গুদাম ও চালানি',
      labelEn: 'Godown',
      icon: Warehouse,
      bg: '#EEF2FF',
      color: '#4F46E5',
      badge: isBn ? 'ওয়্যারহাউস' : 'Logistics',
    },
    {
      id: 'customer-directory',
      labelBn: 'গ্রাহক ডিরেক্টরি',
      labelEn: 'Directory',
      icon: Contact,
      bg: '#ECFDF5',
      color: '#059669',
      badge: isBn ? 'কন্টাক্ট' : 'Contacts',
    },
    {
      id: 'pnl-report',
      labelBn: 'লাভ-ক্ষতি',
      labelEn: 'P&L Reports',
      icon: TrendingUp,
      bg: '#FEF2F2',
      color: '#DC2626',
      badge: isBn ? 'রিপোর্ট' : 'P&L',
    },
  ];

  return (
    <div className="bk-action-grid-card">
      <div className="bk-action-grid">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className="bk-tile-item"
              onClick={() => {
                haptics.tap();
                navigateTo(action.id);
              }}
            >
              <div
                className="bk-tile-icon-circle"
                style={{ background: action.bg }}
              >
                <Icon size={24} color={action.color} strokeWidth={2.2} />
                {action.badge && (
                  <span className="bk-tile-badge">
                    {action.badge}
                  </span>
                )}
              </div>
              <span className="bk-tile-label">
                {isBn ? action.labelBn : action.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
