import React, { useState, useEffect, useMemo } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import { haptics } from '../utils/haptics';
import {
  Truck,
  Search,
  Plus,
  Phone,
  ArrowUpRight,
  ChevronRight,
  Building,
  Boxes,
  CheckCircle2,
  X,
  CreditCard,
  FileText,
  DollarSign,
} from 'lucide-react';

export default function PageSupplierKhata() {
  const {
    language,
    suppliers,
    setSuppliers,
    products,
    recordSupplierPayment,
    recordSupplierPurchase,
    navigateTo,
    addSupplier,
    registerBackHandler,
    triggerCelebration,
  } = useMobileApp();

  const isBn = language === 'bn';
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'payable' | 'cleared'
  const [sortBy, setSortBy] = useState('payable-desc'); // 'payable-desc' | 'payable-asc' | 'name-asc'
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState(null);

  // Supplier Payment Drawer State
  const [payingSupplier, setPayingSupplier] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('নগদ ক্যাশ');
  const [payNote, setPayNote] = useState('');

  // Wholesale Purchase Drawer State
  const [purchasingSupplier, setPurchasingSupplier] = useState(null);
  const [purchaseInvoiceNo, setPurchaseInvoiceNo] = useState('');
  const [purchaseItem, setPurchaseItem] = useState({
    productId: products[0]?.id || '',
    customName: '',
    qty: '10',
    rate: '50',
    unit: 'কেজি',
  });
  const [purchaseCashPaid, setPurchaseCashPaid] = useState('0');
  const [purchaseNote, setPurchaseNote] = useState('');

  // New Supplier Form
  const [newSupplier, setNewSupplier] = useState({
    nameBn: '',
    phone: '',
    category: '',
    payable: '',
  });

  // ── Hardware Back Button Interceptor for Modals/Drawers ──────────────
  useEffect(() => {
    if (showAddForm || payingSupplier || purchasingSupplier) {
      return registerBackHandler('supplier-khata-modals', () => {
        if (showAddForm) {
          setShowAddForm(false);
          return true;
        }
        if (payingSupplier) {
          setPayingSupplier(null);
          return true;
        }
        if (purchasingSupplier) {
          setPurchasingSupplier(null);
          return true;
        }
        return false;
      });
    }
  }, [showAddForm, payingSupplier, purchasingSupplier, registerBackHandler]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const totalPayable = useMemo(() => {
    return (suppliers || []).reduce((sum, s) => sum + Number(s.payable || 0), 0);
  }, [suppliers]);

  const suppliersWithPayable = useMemo(() => {
    return (suppliers || []).filter(s => Number(s.payable || 0) > 0);
  }, [suppliers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (suppliers || []).filter(s => {
      if (filter === 'payable' && Number(s.payable || 0) <= 0) return false;
      if (filter === 'cleared' && Number(s.payable || 0) > 0) return false;

      if (q) {
        return (
          (s.nameBn || '').toLowerCase().includes(q) ||
          (s.nameEn || '').toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q) ||
          (s.phone || '').includes(q) ||
          (s.address || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [suppliers, filter, search]);

  const sortedSuppliers = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'payable-desc') return Number(b.payable || 0) - Number(a.payable || 0);
      if (sortBy === 'payable-asc') return Number(a.payable || 0) - Number(b.payable || 0);
      if (sortBy === 'name-asc') return (a.nameBn || '').localeCompare(b.nameBn || '');
      return 0;
    });
  }, [filtered, sortBy]);

  const PAGE_SIZE = 15;
  const totalPages = Math.max(1, Math.ceil(sortedSuppliers.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const paginatedSuppliers = sortedSuppliers.slice(startIndex, endIndex);

  const handleCreateSupplier = (e) => {
    e.preventDefault();
    if (!newSupplier.nameBn.trim()) return;

    haptics.tap();
    const created = {
      id: `sup-${Date.now().toString().slice(-5)}`,
      nameBn: newSupplier.nameBn,
      nameEn: newSupplier.nameBn,
      phone: newSupplier.phone || '01700-000000',
      category: newSupplier.category || 'জেনারেল সাপ্লায়ার',
      payable: Number(newSupplier.payable || 0),
    };

    if (addSupplier) {
      addSupplier(created);
    } else {
      setSuppliers(prev => [created, ...prev]);
    }
    setNewSupplier({ nameBn: '', phone: '', category: '', payable: '' });
    setShowAddForm(false);
    haptics.success();
    showToastMsg(isBn ? 'নতুন মহাজন হিসাব যুক্ত হয়েছে!' : 'New supplier registered successfully!');
  };

  const handlePaySupplier = (e) => {
    e.preventDefault();
    const num = Number(payAmount || 0);
    if (!payingSupplier || num <= 0) return;

    recordSupplierPayment({
      supplierId: payingSupplier.id,
      supplierName: isBn ? payingSupplier.nameBn : payingSupplier.nameEn,
      amount: num,
      paymentMethod,
      note: payNote || 'মহাজন দেনা পরিশোধ',
    });

    haptics.success();
    if (triggerCelebration) {
      triggerCelebration({
        type: 'expense',
        amount: num,
        partyName: isBn ? payingSupplier.nameBn : payingSupplier.nameEn,
        partyPhone: payingSupplier.phone || '',
        titleBn: 'মহাজন দেনা পরিশোধ সফল!',
        titleEn: 'Supplier Payment Recorded!',
        subtitleBn: 'সাপ্লায়ার হিসাব ও ক্যাশবক্স সমন্বিত হয়েছে',
        subtitleEn: 'Supplier balance & cashbox synchronized',
      });
    } else {
      showToastMsg(
        isBn
          ? `৳${num.toLocaleString('bn-BD')} মহাজন দেনা পরিশোধ করা হয়েছে!`
          : `Paid ৳${num.toLocaleString('en-US')} to ${payingSupplier.nameEn}!`
      );
    }

    setPayingSupplier(null);
    setPayAmount('');
    setPayNote('');
  };

  const handleExecuteWholesalePurchase = (e) => {
    e.preventDefault();
    if (!purchasingSupplier) return;

    const qty = Number(purchaseItem.qty || 0);
    const rate = Number(purchaseItem.rate || 0);
    const totalCost = qty * rate;
    const cashPaid = Number(purchaseCashPaid || 0);

    if (totalCost <= 0) return;

    const matchedProduct = products.find(p => p.id === purchaseItem.productId);
    const itemName = matchedProduct ? (isBn ? matchedProduct.nameBn : matchedProduct.nameEn) : (purchaseItem.customName || 'পাইকারি পণ্য');

    recordSupplierPurchase({
      supplierId: purchasingSupplier.id,
      supplierName: isBn ? purchasingSupplier.nameBn : purchasingSupplier.nameEn,
      totalAmount: totalCost,
      paidAmount: cashPaid,
      items: [
        {
          id: purchaseItem.productId || `prod-custom-${Date.now()}`,
          name: itemName,
          qty,
          buyPrice: rate,
          total: totalCost,
        },
      ],
      note: purchaseNote || `চালান #${purchaseInvoiceNo || 'N/A'}: ${itemName} (${qty} ${purchaseItem.unit})`,
    });

    haptics.success();
    if (triggerCelebration) {
      triggerCelebration({
        type: 'sale',
        amount: totalCost,
        partyName: isBn ? purchasingSupplier.nameBn : purchasingSupplier.nameEn,
        partyPhone: purchasingSupplier.phone || '',
        titleBn: 'পাইকারি ক্রয় ও চালান সংরক্ষিত!',
        titleEn: 'Wholesale Purchase Saved!',
        subtitleBn: `${qty} ${purchaseItem.unit} মজুদ বৃদ্ধি ও দেনা সমন্বিত হয়েছে`,
        subtitleEn: 'Inventory increased & payable recorded',
      });
    } else {
      showToastMsg(
        isBn
          ? `চালান এন্ট্রি সফল! ${qty} ${purchaseItem.unit} মজুদ বৃদ্ধি ও দেনা সমন্বয় হয়েছে।`
          : `Wholesale purchase saved! Stock & payable updated.`
      );
    }

    setPurchasingSupplier(null);
    setPurchaseInvoiceNo('');
    setPurchaseCashPaid('0');
    setPurchaseNote('');
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 24, position: 'relative' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          className="lx-toast-banner"
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: '#111827',
              color: '#FFFFFF',
              padding: '10px 18px',
              borderRadius: 24,
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              maxWidth: '90%',
            }}
          >
            <CheckCircle2 size={16} color="#10B981" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <SubpageHeader
        titleBn="মহাজন ও সাপ্লায়ার খাতা"
        titleEn="Supplier & Wholesaler Ledger"
        subtitleBn={`${suppliers.length} টি সাপ্লাই কোম্পানি`}
        subtitleEn={`${suppliers.length} vendor accounts`}
        rightAction={
          <button
            onClick={() => {
              haptics.tap();
              setShowAddForm(!showAddForm);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: 20,
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Plus size={14} />
            <span>{showAddForm ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? 'নতুন মহাজন' : 'Add')}</span>
          </button>
        }
      />

      <div style={{ padding: '14px 14px' }}>
        {/* Total Payable Summary Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 18,
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            marginBottom: 12,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'মোট মহাজন দেনা (Total Payable)' : 'Total Wholesaler Debt'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--bk-pink)', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              ৳ {totalPayable.toLocaleString(isBn ? 'bn-BD' : 'en-US')}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid #F3F4F6', paddingLeft: 12 }}>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}>
              {isBn ? 'দেনা থাকা মহাজন সংখ্যা' : 'Vendors to Pay'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#4B5563', fontFamily: 'Outfit, sans-serif', marginTop: 2 }}>
              {suppliersWithPayable.length} <span style={{ fontSize: 12, color: '#9CA3AF' }}>/ {suppliers.length}</span>
            </div>
          </div>
        </div>

        {/* Add Supplier Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateSupplier}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--bk-pink)',
              borderRadius: 18,
              padding: '16px',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--bk-pink)', marginBottom: 8 }}>
              {isBn ? 'নতুন মহাজন / সাপ্লায়ার যুক্ত করুন' : 'Add New Supplier Account'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                placeholder={isBn ? 'কোম্পানির নাম *' : 'Company Name *'}
                value={newSupplier.nameBn}
                onChange={e => setNewSupplier({ ...newSupplier, nameBn: e.target.value })}
                required
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="text"
                placeholder={isBn ? 'মোবাইল নম্বর' : 'Phone'}
                value={newSupplier.phone}
                onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder={isBn ? 'পণ্য ক্যাটাগরি (চাল, তেল)' : 'Category'}
                value={newSupplier.category}
                onChange={e => setNewSupplier({ ...newSupplier, category: e.target.value })}
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
              <input
                type="number"
                placeholder={isBn ? 'বর্তমান দেনা (৳)' : 'Payable Amount'}
                value={newSupplier.payable}
                onChange={e => setNewSupplier({ ...newSupplier, payable: e.target.value })}
                style={{ padding: '9px 10px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--bk-pink)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {isBn ? 'সংরক্ষণ করুন' : 'Save Supplier'}
            </button>
          </form>
        )}

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, background: '#FFFFFF', padding: 4, borderRadius: 12, border: '1px solid #E5E7EB' }}>
          {[
            { id: 'all', labelBn: 'সকল মহাজন', labelEn: 'All' },
            { id: 'payable', labelBn: 'বকেয়া দেনাদার', labelEn: 'Has Debt' },
            { id: 'cleared', labelBn: 'পরিশোধিত', labelEn: 'Cleared' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                haptics.tap();
                setFilter(t.id);
              }}
              style={{
                flex: 1,
                padding: '7px 4px',
                borderRadius: 8,
                border: 'none',
                background: filter === t.id ? 'var(--bk-pink)' : 'transparent',
                color: filter === t.id ? '#FFFFFF' : '#4B5563',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isBn ? t.labelBn : t.labelEn}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 12px',
            }}
          >
            <Search size={16} color="#9CA3AF" style={{ marginRight: 8, flexShrink: 0 }} />
            <input
              type="text"
              placeholder={isBn ? 'কোম্পানি বা ক্যাটাগরি খুঁজুন...' : 'Search supplier or category...'}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', border: 'none', background: 'transparent', padding: '10px 0', fontSize: 12.5, outline: 'none' }}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setCurrentPage(1);
                }}
                style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', color: '#9CA3AF' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={e => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 14,
              padding: '0 10px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#374151',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="payable-desc">{isBn ? 'বেশি দেনা আগে' : 'Highest Debt'}</option>
            <option value="payable-asc">{isBn ? 'কম দেনা আগে' : 'Lowest Debt'}</option>
            <option value="name-asc">{isBn ? 'নাম (অ-ক্ষর)' : 'Name (A-Z)'}</option>
          </select>
        </div>

        {/* High-Capacity Record Count & Pagination Info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#6B7280',
            fontWeight: 700,
            marginBottom: 10,
            padding: '4px 6px',
            background: '#EEF2F6',
            borderRadius: 10,
          }}
        >
          <span>
            {isBn
              ? `মোট ${filtered.length.toLocaleString('bn-BD')} জন মহাজন • প্রদর্শিত ${paginatedSuppliers.length > 0 ? (startIndex + 1).toLocaleString('bn-BD') : 0}-${Math.min(endIndex, filtered.length).toLocaleString('bn-BD')} জন`
              : `Total ${filtered.length} suppliers • Showing ${paginatedSuppliers.length > 0 ? startIndex + 1 : 0}-${Math.min(endIndex, filtered.length)}`}
          </span>
          <span style={{ color: 'var(--bk-pink)', fontWeight: 800 }}>
            {isBn ? `পৃষ্ঠা ${safePage.toLocaleString('bn-BD')} / ${totalPages.toLocaleString('bn-BD')}` : `Page ${safePage} of ${totalPages}`}
          </span>
        </div>

        {/* Supplier List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {paginatedSuppliers.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '32px 16px',
                textAlign: 'center',
                color: '#6B7280',
                fontSize: 13,
                border: '1px dashed #D1D5DB',
              }}
            >
              <Building size={32} color="#9CA3AF" style={{ margin: '0 auto 8px', display: 'block' }} />
              <div>{isBn ? 'কোনো মহাজন বা কোম্পানি পাওয়া যায়নি' : 'No suppliers match your search'}</div>
            </div>
          ) : (
            paginatedSuppliers.map(s => {
              const hasPayable = Number(s.payable || 0) > 0;
              return (
                <div
                  key={s.id}
                  className="lx-touch-btn"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 18,
                    padding: '14px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Top Info Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          background: '#F5F3FF',
                          color: '#7C3AED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Building size={20} strokeWidth={2.4} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isBn ? s.nameBn : s.nameEn}
                        </div>
                        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                          {s.category} • {s.phone}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                      <div style={{ fontSize: 9.5, color: '#9CA3AF', fontWeight: 600 }}>
                        {isBn ? 'দেনা' : 'PAYABLE'}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: hasPayable ? '#E11D48' : '#059669', fontFamily: 'Outfit, sans-serif' }}>
                        ৳ {Number(s.payable || 0).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Button Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      marginTop: 12,
                      paddingTop: 8,
                      borderTop: '1px solid #F3F4F6',
                    }}
                  >
                    {/* Pay Supplier Button */}
                    <button
                      onClick={() => {
                        haptics.tap();
                        setPayingSupplier(s);
                        setPayAmount(s.payable > 0 ? s.payable.toString() : '');
                      }}
                      className="lx-touch-btn"
                      style={{
                        flex: 1,
                        background: '#FFF1F2',
                        color: 'var(--bk-pink)',
                        border: '1px solid #FECDD3',
                        borderRadius: 10,
                        padding: '7px 8px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <ArrowUpRight size={13} strokeWidth={2.6} />
                      <span>{isBn ? 'টাকা পরিশোধ' : 'Pay Debt'}</span>
                    </button>

                    {/* Wholesale Purchase Button (+ চালান ক্রয়) */}
                    <button
                      onClick={() => {
                        haptics.tap();
                        setPurchasingSupplier(s);
                        setPurchaseInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
                      }}
                      className="lx-touch-btn"
                      style={{
                        flex: 1,
                        background: '#F5F3FF',
                        color: '#7C3AED',
                        border: '1px solid #DDD6FE',
                        borderRadius: 10,
                        padding: '7px 8px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <Boxes size={13} strokeWidth={2.4} />
                      <span>{isBn ? '+ চালান ক্রয়' : '+ Stock In'}</span>
                    </button>

                    {/* Direct Call Button */}
                    <a
                      href={`tel:${s.phone}`}
                      onClick={() => haptics.tap()}
                      title="Call Supplier"
                      className="lx-touch-btn"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      <Phone size={14} />
                    </a>
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
              marginTop: 14,
              padding: '10px 12px',
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E5E7EB',
            }}
          >
            <button
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.max(1, p - 1));
              }}
              disabled={safePage <= 1}
              className="lx-touch-btn"
              style={{
                background: safePage <= 1 ? '#F3F4F6' : 'var(--bk-pink)',
                color: safePage <= 1 ? '#9CA3AF' : '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              {isBn ? '← পূর্ববর্তী' : '← Previous'}
            </button>

            <span style={{ fontSize: 12, fontWeight: 800, color: '#374151' }}>
              {isBn
                ? `পৃষ্ঠা ${safePage.toLocaleString('bn-BD')} / ${totalPages.toLocaleString('bn-BD')}`
                : `Page ${safePage} of ${totalPages}`}
            </span>

            <button
              onClick={() => {
                haptics.tap();
                setCurrentPage(p => Math.min(totalPages, p + 1));
              }}
              disabled={safePage >= totalPages}
              className="lx-touch-btn"
              style={{
                background: safePage >= totalPages ? '#F3F4F6' : 'var(--bk-pink)',
                color: safePage >= totalPages ? '#9CA3AF' : '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              {isBn ? 'পরবর্তী →' : 'Next →'}
            </button>
          </div>
        )}
      </div>

      {/* Pay Supplier Modal / Bottom Sheet */}
      {payingSupplier && (
        <div
          className="bk-slide-drawer-backdrop"
          onClick={() => {
            haptics.tap();
            setPayingSupplier(null);
          }}
        >
          <div
            className="bk-slide-drawer"
            onClick={e => e.stopPropagation()}
            style={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
                  {isBn ? 'মহাজন দেনা পরিশোধ' : 'Pay Wholesaler Debt'}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {isBn ? payingSupplier.nameBn : payingSupplier.nameEn} • {isBn ? 'দেনা' : 'Payable'}: ৳{Number(payingSupplier.payable || 0).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  setPayingSupplier(null);
                }}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#6B7280" />
              </button>
            </div>

            <form onSubmit={handlePaySupplier}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'পরিশোধের পরিমাণ (৳)' : 'Payment Amount (৳)'}
                </label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 14,
                    border: '1.5px solid #D1D5DB',
                    fontSize: 20,
                    fontWeight: 900,
                    fontFamily: 'Outfit, sans-serif',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Quick Amount Suggestion Chips */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {[500, 1000, 2000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      haptics.add();
                      setPayAmount(val.toString());
                    }}
                    style={{
                      padding: '5px 10px',
                      background: '#F3F4F6',
                      border: '1px solid #E5E7EB',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#374151',
                      cursor: 'pointer',
                    }}
                  >
                    +৳{val}
                  </button>
                ))}
                {payingSupplier.payable > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      haptics.add();
                      setPayAmount(payingSupplier.payable.toString());
                    }}
                    style={{
                      padding: '5px 10px',
                      background: '#FDF2F8',
                      border: '1px solid #FBCFE8',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: 'var(--bk-pink)',
                      cursor: 'pointer',
                    }}
                  >
                    {isBn ? 'সম্পূর্ণ দেনা' : 'Full Due'} (৳{payingSupplier.payable})
                  </button>
                )}
              </div>

              {/* Live Payable Balance Impact Box */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1.5px dashed #CBD5E1',
                  borderRadius: 12,
                  padding: '10px 12px',
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  মহাজন দেনা সমন্বয় হিসাব:
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748B' }}>
                  <span>পূর্বের মোট দেনা:</span>
                  <span style={{ fontWeight: 800 }}>৳ {Number(payingSupplier.payable || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#059669', marginTop: 2 }}>
                  <span>পরিশোধ করছেন:</span>
                  <span style={{ fontWeight: 800 }}>- ৳ {Number(payAmount || 0).toLocaleString()}</span>
                </div>
                <div style={{ borderTop: '1px dashed #CBD5E1', margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 900 }}>
                  <span style={{ color: '#0F172A' }}>অবশিষ্ট দেনা থাকবে:</span>
                  <span style={{ color: Math.max(0, (payingSupplier.payable || 0) - Number(payAmount || 0)) > 0 ? '#E11D48' : '#059669', fontFamily: 'Outfit, sans-serif' }}>
                    ৳ {Math.max(0, (payingSupplier.payable || 0) - Number(payAmount || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'পরিশোধ মাধ্যম' : 'Payment Method'}
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['নগদ ক্যাশ', 'বিকাশ', 'ব্যাংক একাউন্ট'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setPaymentMethod(m);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        borderRadius: 10,
                        border: paymentMethod === m ? '1.5px solid var(--bk-pink)' : '1px solid #D1D5DB',
                        background: paymentMethod === m ? '#FDF2F8' : '#FFFFFF',
                        color: paymentMethod === m ? 'var(--bk-pink)' : '#4B5563',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'মন্তব্য বা চালান রেফারেন্স' : 'Note / Reference'}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? 'যেমন: মেমো #৪২২' : 'E.g. Invoice #422'}
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #D1D5DB',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'var(--bk-pink)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(226, 19, 110, 0.3)',
                }}
              >
                {isBn ? 'পরিশোধ নিশ্চিত করুন' : 'Confirm Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Wholesale Stock Purchase Drawer (+ চালান ক্রয়) */}
      {purchasingSupplier && (
        <div
          className="bk-slide-drawer-backdrop"
          onClick={() => {
            haptics.tap();
            setPurchasingSupplier(null);
          }}
        >
          <div
            className="bk-slide-drawer"
            onClick={e => e.stopPropagation()}
            style={{ padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#7C3AED' }}>
                  {isBn ? 'মহাজন থেকে চালান ক্রয় (Stock In)' : 'Wholesale Stock Purchase'}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {isBn ? purchasingSupplier.nameBn : purchasingSupplier.nameEn}
                </div>
              </div>
              <button
                onClick={() => {
                  haptics.tap();
                  setPurchasingSupplier(null);
                }}
                style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#6B7280" />
              </button>
            </div>

            <form onSubmit={handleExecuteWholesalePurchase}>
              {/* Invoice / Memo No */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'চালান / মেমো নম্বর' : 'Invoice / Challan Memo No'}
                </label>
                <input
                  type="text"
                  value={purchaseInvoiceNo}
                  onChange={e => setPurchaseInvoiceNo(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none' }}
                />
              </div>

              {/* Product Selector */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'পণ্য নির্বাচন করুন' : 'Select Product from Inventory'}
                </label>
                <select
                  value={purchaseItem.productId}
                  onChange={e => {
                    const sel = products.find(p => p.id === e.target.value);
                    setPurchaseItem({
                      ...purchaseItem,
                      productId: e.target.value,
                      rate: sel ? (sel.costPrice || sel.price).toString() : purchaseItem.rate,
                      unit: sel ? sel.unit : 'কেজি',
                    });
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 12, outline: 'none', background: '#FFFFFF' }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {isBn ? p.nameBn : p.nameEn} (বর্তমান স্টক: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Qty & Purchase Rate */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'পরিমাণ (Qty)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    required
                    value={purchaseItem.qty}
                    onChange={e => setPurchaseItem({ ...purchaseItem, qty: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                    {isBn ? 'ক্রয় দর (৳)' : 'Buy Rate (৳)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={purchaseItem.rate}
                    onChange={e => setPurchaseItem({ ...purchaseItem, rate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }}
                  />
                </div>
              </div>

              {/* Calculated Total Card */}
              <div
                style={{
                  background: '#F5F3FF',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: '#7C3AED' }}>
                  {isBn ? 'মোট চালান মূল্য:' : 'Total Invoice Value:'}
                </span>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#7C3AED', fontFamily: 'Outfit, sans-serif' }}>
                  ৳ {(Number(purchaseItem.qty || 0) * Number(purchaseItem.rate || 0)).toLocaleString()}
                </span>
              </div>

              {/* Payment Split */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'নগদ ক্যাশ পরিশোধ (৳) [অবশিষ্ট বাকি থাকবে]' : 'Cash Paid Now (৳) [Remaining on Credit]'}
                </label>
                <input
                  type="number"
                  value={purchaseCashPaid}
                  onChange={e => setPurchaseCashPaid(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              {/* Live Invoice Due Split Preview */}
              <div
                style={{
                  background: '#F5F3FF',
                  border: '1.5px dashed #DDD6FE',
                  borderRadius: 12,
                  padding: '10px 12px',
                  marginBottom: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#6D28D9' }}>
                  <span>চালান মোট মূল্য:</span>
                  <span style={{ fontWeight: 800 }}>
                    ৳ {(Number(purchaseItem.qty || 0) * Number(purchaseItem.rate || 0)).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#059669', marginTop: 2 }}>
                  <span>এখন নগদ পরিশোধ:</span>
                  <span style={{ fontWeight: 800 }}>- ৳ {Number(purchaseCashPaid || 0).toLocaleString()}</span>
                </div>
                <div style={{ borderTop: '1px dashed #DDD6FE', margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 900 }}>
                  <span style={{ color: '#4C1D95' }}>মহাজনের নতুন দেনা যুক্ত হবে:</span>
                  <span style={{ color: '#DC2626', fontFamily: 'Outfit, sans-serif' }}>
                    + ৳ {Math.max(0, (Number(purchaseItem.qty || 0) * Number(purchaseItem.rate || 0)) - Number(purchaseCashPaid || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#7C3AED',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 14,
                  padding: '12px',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                }}
              >
                {isBn ? 'চালান গ্রহণ ও স্টক বৃদ্ধি করুন' : 'Accept Challan & Update Stock'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
