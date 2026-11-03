import React from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import { UserPlus, ChevronRight } from 'lucide-react';

export default function RecentContacts() {
  const {
    language,
    customers,
    setSelectedCustomer,
    navigateTo,
  } = useMobileApp();

  const isBn = language === 'bn';

  const avatarGradients = [
    'linear-gradient(135deg, #FF6B6B 0%, #E2136E 100%)',
    'linear-gradient(135deg, #4E65FF 0%, #92EFFD 100%)',
    'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',
    'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)',
    'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
    'linear-gradient(135deg, #F37335 0%, #FDC830 100%)',
  ];

  return (
    <div className="bk-section-card">
      {/* Header Row */}
      <div className="bk-section-title-row">
        <span className="bk-section-heading">
          {isBn ? 'আমার লেজার (সাম্প্রতিক বাকি)' : 'My LedgerX (Recent Dues)'}
        </span>
        <div
          className="bk-section-action-link"
          onClick={() => navigateTo('customer-khata')}
        >
          <span>{isBn ? 'সব দেখুন' : 'See All'}</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="bk-recent-scroll-row">
        {/* Quick Add Contact */}
        <div
          className="bk-contact-bubble"
          onClick={() => navigateTo('customer-khata')}
        >
          <div
            className="bk-contact-avatar"
            style={{
              background: '#F9FAFB',
              border: '2px dashed #D1D5DB',
              color: '#6B7280',
            }}
          >
            <UserPlus size={18} />
          </div>
          <span className="bk-contact-name">
            {isBn ? 'নতুন কাস্টমার' : 'Add New'}
          </span>
        </div>

        {/* Customer Avatars */}
        {customers.slice(0, 6).map((customer, idx) => {
          const initials = (customer.nameBn || customer.nameEn).charAt(0);
          const hasDue = customer.dueAmount > 0;
          const bgGrad = avatarGradients[idx % avatarGradients.length];

          return (
            <div
              key={customer.id}
              className="bk-contact-bubble"
              onClick={() => {
                setSelectedCustomer(customer);
                navigateTo('customer-details', { customer });
              }}
              title={isBn ? `${customer.nameBn} - বাকি ৳${customer.dueAmount}` : `${customer.nameEn} - Due ৳${customer.dueAmount}`}
            >
              <div
                className="bk-contact-avatar"
                style={{ background: bgGrad }}
              >
                {initials}
                {hasDue ? (
                  <span className="bk-due-chip">
                    ৳{customer.dueAmount > 999 ? `${(customer.dueAmount / 1000).toFixed(1)}k` : customer.dueAmount}
                  </span>
                ) : (
                  <span className="bk-paid-chip">
                    {isBn ? 'পরিশোধ' : 'Paid'}
                  </span>
                )}
              </div>
              <span className="bk-contact-name">
                {isBn ? customer.nameBn : customer.nameEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
