import React, { useState, useMemo } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  Crown,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

export default function PageCustomerDirectory() {
  const {
    language,
    customers = [],
    addCustomer,
    navigateTo,
    setSelectedCustomer,
    showToast,
  } = useMobileApp();

  const isBn = language === 'bn';

  // Filters & Search
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState('ALL'); // ALL, DUE, VIP, WHOLESALE, RETAIL
  const [sortBy, setSortBy] = useState('DUE_DESC'); // DUE_DESC, NAME_ASC, DUE_ASC

  // High-Capacity Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    address: '',
    type: 'RETAIL',
    openingDue: '',
  });

  // KPI Metrics Calculation
  const kpis = useMemo(() => {
    const total = customers.length;
    const dueCusts = customers.filter(c => Number(c.dueAmount || 0) > 0);
    const totalDue = dueCusts.reduce((sum, c) => sum + Number(c.dueAmount || 0), 0);
    const vipCusts = customers.filter(c => c.type === 'VIP' || (c.notes && c.notes.includes('VIP')));
    return {
      total,
      dueCount: dueCusts.length,
      totalDue,
      vipCount: vipCusts.length,
    };
  }, [customers]);

  // Filtered and Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => {
        const due = Number(c.dueAmount || 0);
        if (segment === 'DUE' && due <= 0) return false;
        if (segment === 'VIP' && c.type !== 'VIP' && !(c.notes && c.notes.includes('VIP'))) return false;
        if (segment === 'WHOLESALE' && c.type !== 'WHOLESALE' && !(c.notes && c.notes.includes('পাইকারি'))) return false;
        if (segment === 'RETAIL' && c.type === 'WHOLESALE') return false;

        if (search.trim()) {
          const q = search.toLowerCase();
          const custName = (c.nameBn || c.name || c.nameEn || '').toLowerCase();
          const matchName = custName.includes(q);
          const matchPhone = (c.phone || '').toLowerCase().includes(q);
          const matchAddr = (c.address || '').toLowerCase().includes(q);
          return matchName || matchPhone || matchAddr;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'DUE_DESC') return Number(b.dueAmount || 0) - Number(a.dueAmount || 0);
        if (sortBy === 'DUE_ASC') return Number(a.dueAmount || 0) - Number(b.dueAmount || 0);
        if (sortBy === 'NAME_ASC') {
          const nameA = a.nameBn || a.name || a.nameEn || '';
          const nameB = b.nameBn || b.name || b.nameEn || '';
          return nameA.localeCompare(nameB);
        }
        return 0;
      });
  }, [customers, segment, search, sortBy]);

  // Reset page when search or segment changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, segment, sortBy]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, currentPage]);

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!newCust.name.trim()) {
      showToast(isBn ? 'গ্রাহকের নাম আবশ্যক' : 'Customer name is required', 'error');
      return;
    }

    try {
      addCustomer({
        nameBn: newCust.name.trim(),
        nameEn: newCust.name.trim(),
        phone: newCust.phone.trim(),
        address: newCust.address.trim(),
        type: newCust.type,
        openingDue: Number(newCust.openingDue) || 0,
      });

      haptics.success();
      showToast(isBn ? 'নতুন গ্রাহক সফলভাবে যুক্ত হয়েছে!' : 'Customer added successfully!');
      setShowAddModal(false);
      setNewCust({ name: '', phone: '', address: '', type: 'RETAIL', openingDue: '' });
    } catch (err) {
      showToast(isBn ? 'গ্রাহক যোগ করতে ব্যর্থ হয়েছে' : 'Failed to add customer', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Customer ID', 'Name', 'Phone', 'Address', 'Type', 'Due Amount (BDT)'];
      const rows = filteredCustomers.map(c => [
        c.id,
        `"${(c.nameBn || c.name || c.nameEn || '').replace(/"/g, '""')}"`,
        `"${c.phone || ''}"`,
        `"${(c.address || '').replace(/"/g, '""')}"`,
        c.type || 'RETAIL',
        c.dueAmount || 0,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Customer_Directory_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(isBn ? 'কাস্টমার ডিরেক্টরি সিএসভি ডাউনলোড হয়েছে!' : 'Customer directory CSV downloaded!');
    } catch (e) {
      showToast(isBn ? 'সিএসভি ডাউনলোড ব্যর্থ হয়েছে' : 'Failed to export CSV', 'error');
    }
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 28, position: 'relative' }}>
      {/* Subpage Header */}
      <SubpageHeader
        titleBn="গ্রাহক ডিরেক্টরি ও সিআরএম"
        titleEn="Customer Directory & CRM"
        actionIcon={FileSpreadsheet}
        onActionClick={handleExportCSV}
      />

      <div style={{ padding: '14px 14px' }}>
        {/* KPI Summary Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '10px 8px',
              border: '1px solid #E5E7EB',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'মোট খরিদ্দার' : 'Total Customers'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#111827', marginTop: 2 }}>
              {kpis.total.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div
            style={{
              background: '#FEF2F2',
              borderRadius: 14,
              padding: '10px 8px',
              border: '1px solid #FECDD3',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 600 }}>
              {isBn ? 'বাকি খরিদ্দার' : 'Due Customers'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#DC2626', marginTop: 2 }}>
              {kpis.dueCount.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div
            style={{
              background: '#EFF6FF',
              borderRadius: 14,
              padding: '10px 8px',
              border: '1px solid #BFDBFE',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 10, color: '#1E40AF', fontWeight: 600 }}>
              {isBn ? 'মোট বকেয়া পাওনা' : 'Receivable'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#1E40AF', marginTop: 2 }}>
              ৳ {kpis.totalDue.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>
        </div>

        {/* Action Bar: Add Customer Button */}
        <button
          onClick={() => {
            haptics.tap();
            setShowAddModal(true);
          }}
          className="lx-touch-btn"
          style={{
            width: '100%',
            background: 'var(--bk-pink)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 14,
            padding: '11px 16px',
            fontSize: 13.5,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(226, 19, 110, 0.28)',
            marginBottom: 14,
          }}
        >
          <Plus size={17} strokeWidth={2.8} />
          <span>{isBn ? 'নতুন গ্রাহক যোগ করুন' : 'Add New Customer'}</span>
        </button>

        {/* Search & Sorting Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 12,
              padding: '0 12px',
            }}
          >
            <Search size={15} color="#9CA3AF" style={{ marginRight: 8 }} />
            <input
              type="text"
              placeholder={isBn ? 'নাম, মোবাইল বা ঠিকানা খুঁজুন...' : 'Search name, phone, address...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '9px 0',
                fontSize: 12.5,
                outline: 'none',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 12,
              padding: '0 8px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#374151',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="DUE_DESC">{isBn ? 'বেশি বাকি' : 'Highest Due'}</option>
            <option value="DUE_ASC">{isBn ? 'কম বাকি' : 'Lowest Due'}</option>
            <option value="NAME_ASC">{isBn ? 'নাম (A-Z)' : 'Name (A-Z)'}</option>
          </select>
        </div>

        {/* Customer Segment Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 14,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
          }}
        >
          {[
            { id: 'ALL', labelBn: `সকল (${customers.length})`, labelEn: `All (${customers.length})` },
            { id: 'DUE', labelBn: `বকেয়া আছে (${kpis.dueCount})`, labelEn: `Has Due (${kpis.dueCount})` },
            { id: 'VIP', labelBn: 'ভিআইপি (VIP)', labelEn: 'VIP Loyal' },
            { id: 'WHOLESALE', labelBn: 'পাইকারি', labelEn: 'Wholesale' },
            { id: 'RETAIL', labelBn: 'খুচরা গ্রাহক', labelEn: 'Retail Cash' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                haptics.tap();
                setSegment(tab.id);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: segment === tab.id ? 'var(--bk-pink)' : '#D1D5DB',
                background: segment === tab.id ? 'var(--bk-pink)' : '#FFFFFF',
                color: segment === tab.id ? '#FFFFFF' : '#4B5563',
                fontSize: 11.5,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isBn ? tab.labelBn : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Customers Count & Capacity Note */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px' }}>
          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
            {isBn
              ? `মোট ${filteredCustomers.length} জনের মধ্যে ${(currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, filteredCustomers.length)} জন প্রদর্শিত`
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, filteredCustomers.length)} of ${filteredCustomers.length}`}
          </div>
          <div style={{ fontSize: 10.5, color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>
            {isBn ? 'হাই-স্পিড পেজিনেশন' : 'High Capacity'}
          </div>
        </div>

        {/* Customer Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {paginatedCustomers.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '36px 16px',
                textAlign: 'center',
                color: '#6B7280',
                border: '1px dashed #D1D5DB',
              }}
            >
              <Users size={32} color="#9CA3AF" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#374151' }}>
                {isBn ? 'কোনো গ্রাহক পাওয়া যায়নি' : 'No customers found'}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                {isBn ? 'সার্চ ফিল্টার পরিবর্তন করুন অথবা নতুন গ্রাহক যুক্ত করুন' : 'Change filter or tap Add New Customer'}
              </div>
            </div>
          ) : (
            paginatedCustomers.map(c => {
              const due = Number(c.dueAmount || 0);
              const isDue = due > 0;
              const isVip = c.type === 'VIP' || (c.notes && c.notes.includes('VIP'));
              const displayName = c.nameBn || c.name || c.nameEn || (isBn ? 'সাধারণ গ্রাহক' : 'Customer');
              const initial = displayName.charAt(0);

              return (
                <div
                  key={c.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    padding: '12px 14px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    {/* Avatar & Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 12,
                              background: isVip ? '#FEF3C7' : isDue ? '#FEE2E2' : '#EFF6FF',
                              color: isVip ? '#D97706' : isDue ? '#DC2626' : '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: 14,
                              position: 'relative',
                            }}
                          >
                            {initial}
                            {isVip && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: -4,
                                  right: -4,
                                  background: '#F59E0B',
                                  borderRadius: '50%',
                                  width: 14,
                                  height: 14,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Crown size={8} color="#FFFFFF" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>
                                {displayName}
                              </span>
                              {c.type === 'WHOLESALE' && (
                                <span
                                  style={{
                                    fontSize: 9.5,
                                background: '#EEF2FF',
                                color: '#4F46E5',
                                padding: '1px 6px',
                                borderRadius: 6,
                                fontWeight: 700,
                              }}
                            >
                              {isBn ? 'পাইকারি' : 'Wholesale'}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Phone size={10} color="#9CA3AF" />
                          <span>{c.phone || (isBn ? 'মোবাইল নেই' : 'No phone')}</span>
                          {c.address && (
                            <>
                              <span>•</span>
                              <MapPin size={10} color="#9CA3AF" />
                              <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.address}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Due Amount Pill */}
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 900,
                          color: isDue ? '#DC2626' : '#059669',
                        }}
                      >
                        {isDue ? `৳ ${due.toLocaleString(isBn ? 'bn-BD' : 'en-US')}` : (isBn ? 'পরিশোধিত' : 'Clear')}
                      </div>
                      <div style={{ fontSize: 9.5, color: isDue ? '#EF4444' : '#10B981', fontWeight: 700 }}>
                        {isDue ? (isBn ? 'বাকি পাওনা' : 'Receivable') : (isBn ? 'জিরো বকেয়া' : 'No Due')}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 12,
                      paddingTop: 10,
                      borderTop: '1px solid #F3F4F6',
                    }}
                  >
                    {/* Communication Shortcuts */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.phone ? (
                        <>
                          <a
                            href={`tel:${c.phone}`}
                            style={{
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: '#F3F4F6',
                              color: '#374151',
                              padding: '5px 10px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            <Phone size={11} color="#059669" />
                            <span>{isBn ? 'কল' : 'Call'}</span>
                          </a>

                          <a
                            href={`https://wa.me/88${c.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: '#ECFDF5',
                              color: '#065F46',
                              padding: '5px 10px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            <MessageCircle size={11} color="#10B981" />
                            <span>WhatsApp</span>
                          </a>
                        </>
                      ) : (
                        <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>
                          {isBn ? 'যোগাযোগ নম্বর নেই' : 'No contact'}
                        </span>
                      )}
                    </div>

                    {/* View Full Ledger Button */}
                    <button
                      onClick={() => {
                        haptics.tap();
                        setSelectedCustomer(c);
                        navigateTo('customer-details', { customerId: c.id });
                      }}
                      className="lx-touch-btn"
                      style={{
                        background: '#EFF6FF',
                        color: '#1E40AF',
                        border: '1px solid #BFDBFE',
                        borderRadius: 8,
                        padding: '5px 10px',
                        fontSize: 11,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <span>{isBn ? 'লেজার খাতা' : 'Ledger'}</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* High-Capacity Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 16,
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '8px 14px',
              border: '1px solid #E5E7EB',
            }}
          >
            <button
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.max(1, p - 1));
              }}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                background: currentPage === 1 ? '#F9FAFB' : '#FFFFFF',
                color: currentPage === 1 ? '#9CA3AF' : '#111827',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={13} />
              <span>{isBn ? 'পূর্ববর্তী' : 'Prev'}</span>
            </button>

            <span style={{ fontSize: 12, fontWeight: 800, color: '#374151' }}>
              {isBn ? `পৃষ্ঠা ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </span>

            <button
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.min(totalPages, p + 1));
              }}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                background: currentPage === totalPages ? '#F9FAFB' : '#FFFFFF',
                color: currentPage === totalPages ? '#9CA3AF' : '#111827',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{isBn ? 'পরবর্তী' : 'Next'}</span>
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* ── Slide-up Add Customer Drawer Modal (Strictly Contained) ── */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            borderRadius: 'inherit',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: '20px 18px',
              maxHeight: '90%',
              overflowY: 'auto',
            }}
          >
            <div style={{ width: 40, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '0 auto 14px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                {isBn ? 'নতুন কাস্টমার নিবন্ধন' : 'Register New Customer'}
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              {/* Customer Name */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'গ্রাহকের পুরো নাম *' : 'Full Customer Name *'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'যেমন: হাজী মোবারক হোসেন' : 'e.g. Haji Mobarak'}
                  value={newCust.name}
                  onChange={e => setNewCust({ ...newCust, name: e.target.value })}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid #D1D5DB',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Mobile Phone */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'মোবাইল নম্বর' : 'Mobile Number'}
                </label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={newCust.phone}
                  onChange={e => setNewCust({ ...newCust, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid #D1D5DB',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Address */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'ঠিকানা / এলাকা' : 'Address / Location'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'যেমন: দোকান নং ১২, চকবাজার, ঢাকা' : 'Location / Shop address'}
                  value={newCust.address}
                  onChange={e => setNewCust({ ...newCust, address: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid #D1D5DB',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Customer Type Segment */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'গ্রাহকের ক্যাটাগরি' : 'Customer Category'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { id: 'RETAIL', labelBn: 'খুচরা', labelEn: 'Retail' },
                    { id: 'WHOLESALE', labelBn: 'পাইকারি', labelEn: 'Wholesale' },
                    { id: 'VIP', labelBn: 'ভিআইপি', labelEn: 'VIP' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewCust({ ...newCust, type: t.id })}
                      style={{
                        padding: '8px 0',
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: newCust.type === t.id ? 'var(--bk-pink)' : '#D1D5DB',
                        background: newCust.type === t.id ? '#FFF0F6' : '#FFFFFF',
                        color: newCust.type === t.id ? 'var(--bk-pink)' : '#4B5563',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isBn ? t.labelBn : t.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opening Due */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'পূর্বের বকেয়া (যদি থাকে ৳)' : 'Opening Due Balance (if any ৳)'}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newCust.openingDue}
                  onChange={e => setNewCust({ ...newCust, openingDue: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1px solid #D1D5DB',
                    fontSize: 14,
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                type="submit"
                className="lx-touch-btn"
                style={{
                  width: '100%',
                  background: 'var(--bk-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(226, 19, 110, 0.28)',
                }}
              >
                {isBn ? 'গ্রাহক সংরক্ষণ করুন' : 'Save Customer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
