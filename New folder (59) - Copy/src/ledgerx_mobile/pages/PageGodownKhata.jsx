import React, { useState } from 'react';
import { useMobileApp } from '../context/MobileAppContext';
import SubpageHeader from '../components/SubpageHeader';
import {
  Warehouse,
  Truck,
  Boxes,
  FileText,
  Search,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  X,
  Phone,
  MapPin,
  TrendingUp,
  Scale,
  Sparkles,
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { soundbox } from '../utils/soundbox';

export default function PageGodownKhata() {
  const { language, navigateTo, customers, products, showToast } = useMobileApp();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'chalans' | 'new-chalan'
  const [search, setSearch] = useState('');
  const [selectedGodown, setSelectedGodown] = useState('ALL');

  // Initial Seed for Godown Stock
  const [godownStock, setGodownStock] = useState([
    {
      id: 'g-001',
      name: 'মিনিকেট চাল (৫০ কেজি বস্তা)',
      category: 'চাল ও শস্য',
      godownName: 'গুদাম ১ (কমলাপুর)',
      rackLocation: 'র্যাক A-12',
      bagsCount: 140,
      weightPerBag: 50,
      totalKg: 7000,
      costPrice: 68,
      sellingPrice: 75,
    },
    {
      id: 'g-002',
      name: 'নাজিরশাইল প্রিমিয়াম (২৫ কেজি)',
      category: 'চাল ও শস্য',
      godownName: 'গুদাম ১ (কমলাপুর)',
      rackLocation: 'র্যাক A-15',
      bagsCount: 95,
      weightPerBag: 25,
      totalKg: 2375,
      costPrice: 82,
      sellingPrice: 90,
    },
    {
      id: 'g-003',
      name: 'তীর সয়াবিন তেল (৫ লিটার জার)',
      category: 'ভোজ্য তেল',
      godownName: 'গুদাম ২ (সাভার)',
      rackLocation: 'র্যাক B-04',
      bagsCount: 80,
      weightPerBag: 20, // 4 jars per carton = 20L
      totalKg: 1600,
      costPrice: 820,
      sellingPrice: 890,
    },
    {
      id: 'g-004',
      name: 'সাদা চিনি (৫০ কেজি বস্তা)',
      category: 'চিনি ও গুড়',
      godownName: 'গুদাম ২ (সাভার)',
      rackLocation: 'র্যাক C-01',
      bagsCount: 120,
      weightPerBag: 50,
      totalKg: 6000,
      costPrice: 125,
      sellingPrice: 135,
    },
    {
      id: 'g-005',
      name: 'মসুর ডাল দেশি (৫০ কেজি বস্তা)',
      category: 'ডাল ও মসলা',
      godownName: 'গুদাম ১ (কমলাপুর)',
      rackLocation: 'র্যাক B-09',
      bagsCount: 65,
      weightPerBag: 50,
      totalKg: 3250,
      costPrice: 130,
      sellingPrice: 142,
    },
  ]);

  // Initial Seed for Delivery Chalans
  const [chalans, setChalans] = useState([
    {
      id: 'CH-2026-089',
      customerName: 'ইঞ্জিনিয়ার মো: ফাহিম রেজা',
      customerPhone: '01712-345678',
      deliveryAddress: 'মিরপুর-১০, ঢাকা',
      godownName: 'গুদাম ১ (কমলাপুর)',
      truckNo: 'ঢাকা মেট্রো-ট ১১-৫৪০২',
      driverName: 'মো: রফিকুল ইসলাম',
      driverPhone: '01819-876543',
      date: '২৫ অক্টোবর ২০২৬, সকাল ১০:১৫',
      status: 'IN_TRANSIT', // 'IN_TRANSIT' | 'DELIVERED'
      items: [
        { name: 'মিনিকেট চাল (৫০ কেজি বস্তা)', bags: 20, weightKg: 1000 },
        { name: 'সাদা চিনি (৫০ কেজি বস্তা)', bags: 10, weightKg: 500 },
      ],
      totalBags: 30,
    },
    {
      id: 'CH-2026-088',
      customerName: 'অধ্যাপিকা নাজমুন নাহার সুলতানা',
      customerPhone: '01911-223344',
      deliveryAddress: 'উত্তরা সেক্টর ৭, ঢাকা',
      godownName: 'গুদাম ২ (সাভার)',
      truckNo: 'ঢাকা মেট্রো-ড ১৪-৯৮২১',
      driverName: 'মো: কালাম মিয়া',
      driverPhone: '01715-998877',
      date: '২৪ অক্টোবর ২০২৬, বিকাল ৪:৩০',
      status: 'DELIVERED',
      items: [
        { name: 'নাজিরশাইল প্রিমিয়াম (২৫ কেজি)', bags: 40, weightKg: 1000 },
      ],
      totalBags: 40,
    },
  ]);

  // Modal states
  const [transferModalStock, setTransferModalStock] = useState(null);
  const [transferBags, setTransferBags] = useState('');
  const [selectedChalanSlip, setSelectedChalanSlip] = useState(null);

  // New Chalan Form state
  const [newChalanCustomer, setNewChalanCustomer] = useState(customers[0]?.nameBn || '');
  const [newChalanPhone, setNewChalanPhone] = useState(customers[0]?.phone || '');
  const [newChalanAddress, setNewChalanAddress] = useState(customers[0]?.address || 'ঢাকা');
  const [newChalanTruck, setNewChalanTruck] = useState('');
  const [newChalanDriver, setNewChalanDriver] = useState('');
  const [newChalanDriverPhone, setNewChalanDriverPhone] = useState('');
  const [newChalanStockId, setNewChalanStockId] = useState(godownStock[0]?.id || '');
  const [newChalanBags, setNewChalanBags] = useState('');

  // Calculations
  const totalBags = godownStock.reduce((sum, g) => sum + (Number(g.bagsCount) || 0), 0);
  const totalKg = godownStock.reduce((sum, g) => sum + (Number(g.totalKg) || 0), 0);
  const totalTons = (totalKg / 1000).toFixed(1);
  const totalValuation = godownStock.reduce((sum, g) => sum + (g.costPrice * g.totalKg), 0);
  const inTransitCount = chalans.filter(c => c.status === 'IN_TRANSIT').length;

  const filteredStock = godownStock.filter(g => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.category.toLowerCase().includes(search.toLowerCase()) ||
      g.rackLocation.toLowerCase().includes(search.toLowerCase());
    if (selectedGodown === 'ALL') return matchesSearch;
    return matchesSearch && g.godownName.includes(selectedGodown);
  });

  // Transfer stock from godown to store counter
  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    const bags = Number(transferBags || 0);
    if (!transferModalStock || bags <= 0 || bags > transferModalStock.bagsCount) {
      showToast(isBn ? 'সঠিক বস্তা সংখ্যা লিখুন' : 'Enter valid bag quantity', 'warning');
      return;
    }

    haptics.success();
    soundbox.speak(
      isBn
        ? `গুদাম থেকে দোকানে ${bags} বস্তা মাল স্থানান্তর সফল!`
        : `${bags} bags transferred to store counter!`,
      'bn'
    );

    setGodownStock(prev =>
      prev.map(g => {
        if (g.id === transferModalStock.id) {
          const remainingBags = g.bagsCount - bags;
          return {
            ...g,
            bagsCount: remainingBags,
            totalKg: remainingBags * g.weightPerBag,
          };
        }
        return g;
      })
    );

    showToast(
      isBn
        ? `গুদাম থেকে ${bags} বস্তা "${transferModalStock.name}" দোকান কাউন্টারে স্থানান্তরিত হয়েছে!`
        : `${bags} bags transferred to shop counter!`,
      'success'
    );
    setTransferModalStock(null);
    setTransferBags('');
  };

  // Submit new delivery chalan
  const handleCreateChalan = (e) => {
    e.preventDefault();
    const bags = Number(newChalanBags || 0);
    const selectedItem = godownStock.find(g => g.id === newChalanStockId);
    if (!selectedItem || bags <= 0 || bags > selectedItem.bagsCount) {
      showToast(isBn ? 'সঠিক বস্তার সংখ্যা উল্লেখ করুন' : 'Invalid bag count', 'warning');
      return;
    }

    haptics.add();
    const newId = `CH-2026-${String(chalans.length + 90).padStart(3, '0')}`;
    const weightKg = bags * selectedItem.weightPerBag;

    const created = {
      id: newId,
      customerName: newChalanCustomer || 'খুচরা পাইকারি গ্রাহক',
      customerPhone: newChalanPhone || '01700-000000',
      deliveryAddress: newChalanAddress || 'ঢাকা',
      godownName: selectedItem.godownName,
      truckNo: newChalanTruck || 'ঢাকা মেট্রো-ট ১১-০০০১',
      driverName: newChalanDriver || 'মো: চালক',
      driverPhone: newChalanDriverPhone || '01800-000000',
      date: 'আজকে, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      status: 'IN_TRANSIT',
      items: [{ name: selectedItem.name, bags, weightKg }],
      totalBags: bags,
    };

    setChalans([created, ...chalans]);
    // Deduct from godown
    setGodownStock(prev =>
      prev.map(g => {
        if (g.id === selectedItem.id) {
          const remaining = g.bagsCount - bags;
          return {
            ...g,
            bagsCount: remaining,
            totalKg: remaining * g.weightPerBag,
          };
        }
        return g;
      })
    );

    soundbox.speak(
      isBn
        ? `চালান ${newId} তৈরি সম্পন্ন। ট্রানজিটে মাল প্রেরণ করা হয়েছে।`
        : `Chalan ${newId} created. Dispatched in transit.`,
      'bn'
    );

    showToast(
      isBn
        ? `চালান ${newId} সফলভাবে ইস্যু করা হয়েছে!`
        : `Delivery chalan ${newId} issued!`,
      'success'
    );

    setSelectedChalanSlip(created);
    setActiveTab('chalans');
    setNewChalanBags('');
    setNewChalanTruck('');
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', paddingBottom: 32, position: 'relative' }}>
      {/* Subpage Header */}
      <SubpageHeader
        title={isBn ? 'গুদাম ও চালানি খাতা' : 'Godown & Logistics'}
        subtitle={isBn ? 'ওয়্যারহাউস স্টক ও ট্রাক চালানি' : 'Godown Stock & Truck Dispatches'}
        icon={Warehouse}
        iconBg="linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)"
        onBack={() => navigateTo('home')}
        rightActions={
          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('new-chalan');
            }}
            style={{
              background: '#059669',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              padding: '6px 12px',
              fontSize: 11.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            <span>{isBn ? '+ চালান' : '+ Chalan'}</span>
          </button>
        }
      />

      <div style={{ padding: '0 16px' }}>
        {/* Metric Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginTop: 14,
            marginBottom: 14,
          }}
        >
          {/* Card 1: মোট বস্তা */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>
                {isBn ? 'মোট বস্তা' : 'Total Bags'}
              </span>
              <Boxes size={15} color="#3B82F6" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {isBn ? totalBags.toLocaleString('bn-BD') : totalBags.toLocaleString('en-US')}{' '}
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>{isBn ? 'বস্তা' : 'bags'}</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#059669', fontWeight: 600, marginTop: 2 }}>
              {isBn ? `ওজন: ${totalTons} মে. টন` : `Weight: ${totalTons} Tons`}
            </div>
          </div>

          {/* Card 2: চলমান চালান */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>
                {isBn ? 'চলমান চালান' : 'In Transit'}
              </span>
              <Truck size={15} color="#D97706" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#D97706' }}>
              {isBn ? inTransitCount.toLocaleString('bn-BD') : inTransitCount}{' '}
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>{isBn ? 'ট্রাক' : 'trucks'}</span>
            </div>
            <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 600, marginTop: 2 }}>
              {isBn ? `মোট চালান: ${chalans.length}টি` : `Total: ${chalans.length}`}
            </div>
          </div>
        </div>

        {/* 3 Segmented Control Tabs */}
        <div
          style={{
            display: 'flex',
            background: '#E2E8F0',
            borderRadius: 14,
            padding: 3,
            marginBottom: 14,
            gap: 2,
          }}
        >
          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('stock');
            }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 11,
              border: 'none',
              background: activeTab === 'stock' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'stock' ? '#0F172A' : '#64748B',
              fontSize: 11.5,
              fontWeight: activeTab === 'stock' ? 800 : 600,
              cursor: 'pointer',
              boxShadow: activeTab === 'stock' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {isBn ? 'স্টক ও র্যাক' : 'Stock & Racks'} ({godownStock.length})
          </button>

          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('chalans');
            }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 11,
              border: 'none',
              background: activeTab === 'chalans' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'chalans' ? '#0F172A' : '#64748B',
              fontSize: 11.5,
              fontWeight: activeTab === 'chalans' ? 800 : 600,
              cursor: 'pointer',
              boxShadow: activeTab === 'chalans' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {isBn ? 'ডেলিভারি চালান' : 'Chalans'} ({chalans.length})
          </button>

          <button
            onClick={() => {
              haptics.tap();
              setActiveTab('new-chalan');
            }}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 11,
              border: 'none',
              background: activeTab === 'new-chalan' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'new-chalan' ? '#059669' : '#64748B',
              fontSize: 11.5,
              fontWeight: activeTab === 'new-chalan' ? 800 : 600,
              cursor: 'pointer',
              boxShadow: activeTab === 'new-chalan' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {isBn ? '+ নতুন চালান' : '+ Issue Chalan'}
          </button>
        </div>

        {/* TAB 1: STOCK & RACKS */}
        {activeTab === 'stock' && (
          <div>
            {/* Search and Godown Location Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 10px',
                  border: '1px solid #CBD5E1',
                }}
              >
                <Search size={15} color="#94A3B8" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={isBn ? 'পণ্য বা র্যাক দিয়ে খুঁজুন...' : 'Search stock or rack...'}
                  style={{
                    border: 'none',
                    outline: 'none',
                    padding: '8px 6px',
                    fontSize: 12,
                    width: '100%',
                    background: 'transparent',
                  }}
                />
              </div>

              <select
                value={selectedGodown}
                onChange={e => setSelectedGodown(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: 12,
                  padding: '0 8px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#334155',
                  outline: 'none',
                }}
              >
                <option value="ALL">{isBn ? 'সকল গুদাম' : 'All Warehouses'}</option>
                <option value="গুদাম ১">{isBn ? 'গুদাম ১ (কমলাপুর)' : 'Godown 1'}</option>
                <option value="গুদাম ২">{isBn ? 'গুদাম ২ (সাভার)' : 'Godown 2'}</option>
              </select>
            </div>

            {/* Stock Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredStock.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 16,
                    padding: '14px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                        {item.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            padding: '2px 6px',
                            borderRadius: 6,
                          }}
                        >
                          {item.godownName}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            background: '#F1F5F9',
                            color: '#475569',
                            padding: '2px 6px',
                            borderRadius: 6,
                          }}
                        >
                          {item.rackLocation}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>
                        {isBn ? item.bagsCount.toLocaleString('bn-BD') : item.bagsCount}{' '}
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748B' }}>{isBn ? 'বস্তা' : 'bags'}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
                        {isBn ? `${item.totalKg.toLocaleString('bn-BD')} কেজি` : `${item.totalKg} kg`}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: '1px dashed #E2E8F0',
                      paddingTop: 8,
                      marginTop: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#64748B' }}>
                      {isBn ? 'ক্রয়মূল্য: ' : 'Cost: '}
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>৳{item.costPrice}</span>
                      {' • '}
                      {isBn ? 'বিক্রয়: ' : 'Sell: '}
                      <span style={{ fontWeight: 800, color: '#059669' }}>৳{item.sellingPrice}</span>
                    </div>

                    <button
                      onClick={() => {
                        haptics.tap();
                        setTransferModalStock(item);
                        setTransferBags('');
                      }}
                      style={{
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        border: '1px solid #C7D2FE',
                        borderRadius: 10,
                        padding: '4px 10px',
                        fontSize: 10.5,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <ArrowRightLeft size={12} />
                      <span>{isBn ? 'কাউন্টারে পাঠান' : 'To Counter'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CHALANS LIST */}
        {activeTab === 'chalans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chalans.map(chalan => (
              <div
                key={chalan.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 16,
                  padding: 14,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' }}>
                        {chalan.id}
                      </span>
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 8,
                          background: chalan.status === 'IN_TRANSIT' ? '#FEF3C7' : '#D1FAE5',
                          color: chalan.status === 'IN_TRANSIT' ? '#B45309' : '#065F46',
                        }}
                      >
                        {chalan.status === 'IN_TRANSIT'
                          ? isBn ? 'ট্রানজিটে চলমান' : 'In Transit'
                          : isBn ? 'খালাস সম্পন্ন' : 'Delivered'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1E293B', marginTop: 3 }}>
                      {chalan.customerName}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#2563EB' }}>
                      {isBn ? chalan.totalBags.toLocaleString('bn-BD') : chalan.totalBags}{' '}
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B' }}>{isBn ? 'বস্তা' : 'bags'}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#94A3B8' }}>{chalan.date}</div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 10,
                    padding: '8px 10px',
                    fontSize: 11,
                    color: '#475569',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <Truck size={12} color="#64748B" />
                    <span>{chalan.truckNo}</span>
                    <span>• {chalan.driverName} ({chalan.driverPhone})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} color="#64748B" />
                    <span>{chalan.deliveryAddress}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>
                    {isBn ? `${chalan.items.length}টি পণ্য চালানভুক্ত` : `${chalan.items.length} items`}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {chalan.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => {
                          haptics.success();
                          setChalans(prev =>
                            prev.map(c => (c.id === chalan.id ? { ...c, status: 'DELIVERED' } : c))
                          );
                          showToast(
                            isBn ? `চালান ${chalan.id} ডেলিভারি নিশ্চিত হয়েছে!` : `Chalan ${chalan.id} marked delivered!`,
                            'success'
                          );
                        }}
                        style={{
                          background: '#ECFDF5',
                          color: '#065F46',
                          border: '1px solid #A7F3D0',
                          borderRadius: 8,
                          padding: '4px 8px',
                          fontSize: 10.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        ✓ {isBn ? 'খালাস নিশ্চিত' : 'Mark Delivered'}
                      </button>
                    )}

                    <button
                      onClick={() => {
                        haptics.tap();
                        setSelectedChalanSlip(chalan);
                      }}
                      style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        border: '1px solid #BFDBFE',
                        borderRadius: 8,
                        padding: '4px 8px',
                        fontSize: 10.5,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        cursor: 'pointer',
                      }}
                    >
                      <FileText size={12} />
                      <span>{isBn ? 'চালান রশিদ' : 'Chalan Slip'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: NEW DELIVERY CHALAN GENERATOR */}
        {activeTab === 'new-chalan' && (
          <form
            onSubmit={handleCreateChalan}
            style={{
              background: '#FFFFFF',
              borderRadius: 18,
              padding: 16,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>
              {isBn ? 'নতুন ৩-কপি ডেলিভারি চালান তৈরি' : 'Issue New 3-Copy Delivery Chalan'}
            </div>

            {/* Customer selection */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', display: 'block', marginBottom: 4 }}>
                {isBn ? 'গ্রাহক / প্রাপকের নাম *' : 'Customer Name *'}
              </label>
              <select
                value={newChalanCustomer}
                onChange={e => {
                  setNewChalanCustomer(e.target.value);
                  const found = customers.find(c => c.nameBn === e.target.value);
                  if (found) {
                    setNewChalanPhone(found.phone);
                    setNewChalanAddress(found.address);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#0F172A',
                  outline: 'none',
                  background: '#F8FAFC',
                }}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.nameBn}>
                    {c.nameBn} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', display: 'block', marginBottom: 4 }}>
                {isBn ? 'ডেলিভারি গন্তব্য / ঠিকানা' : 'Destination Address'}
              </label>
              <input
                type="text"
                value={newChalanAddress}
                onChange={e => setNewChalanAddress(e.target.value)}
                placeholder={isBn ? 'যেমন: আড়ত নং ৪, কারওয়ান বাজার' : 'Destination address'}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: '1.5px solid #CBD5E1',
                  fontSize: 12,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Product & Quantity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 8, marginBottom: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'গুদামের পণ্য *' : 'Godown Stock *'}
                </label>
                <select
                  value={newChalanStockId}
                  onChange={e => setNewChalanStockId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 8px',
                    borderRadius: 12,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 11.5,
                    fontWeight: 700,
                    outline: 'none',
                    background: '#F8FAFC',
                  }}
                >
                  {godownStock.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.bagsCount} বস্তা আছে)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'চালান বস্তা সংখ্যা *' : 'Chalan Bags *'}
                </label>
                <input
                  type="number"
                  value={newChalanBags}
                  onChange={e => setNewChalanBags(e.target.value)}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 13,
                    fontWeight: 800,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Truck Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'ট্রাক নম্বর' : 'Truck No'}
                </label>
                <input
                  type="text"
                  value={newChalanTruck}
                  onChange={e => setNewChalanTruck(e.target.value)}
                  placeholder={isBn ? 'ঢাকা মেট্রো-ট...' : 'Truck plate'}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#475569', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'ড্রাইভার মোবাইল' : 'Driver Phone'}
                </label>
                <input
                  type="tel"
                  value={newChalanDriverPhone}
                  onChange={e => setNewChalanDriverPhone(e.target.value)}
                  placeholder="01700-000000"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 12,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 12,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 14,
                padding: '12px',
                fontSize: 13.5,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                cursor: 'pointer',
              }}
            >
              <Truck size={16} />
              <span>{isBn ? 'চালান ইস্যু করুন ও গেটপাস তৈরি' : 'Issue Chalan & Gate Pass'}</span>
            </button>
          </form>
        )}
      </div>

      {/* ── MODAL 1: TRANSFER FROM GODOWN TO COUNTER ── */}
      {transferModalStock && (
        <div
          onClick={() => setTransferModalStock(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            borderRadius: 'inherit',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 380,
              padding: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowRightLeft size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 900, color: '#0F172A' }}>
                    {isBn ? 'কাউন্টারে স্টক স্থানান্তর' : 'Transfer to Counter'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    {transferModalStock.godownName} ➔ {isBn ? 'দোকানের সেলস কাউন্টার' : 'Shop Counter'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setTransferModalStock(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: 10,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                borderRadius: 14,
                padding: '10px 12px',
                marginBottom: 14,
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1E293B' }}>
                {transferModalStock.name}
              </div>
              <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                {isBn ? 'বর্তমানে গুদামে মজুদ আছে: ' : 'Available in godown: '}
                <strong style={{ color: '#059669' }}>{transferModalStock.bagsCount} {isBn ? 'বস্তা' : 'bags'}</strong>
              </div>
            </div>

            <form onSubmit={handleExecuteTransfer}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', display: 'block', marginBottom: 4 }}>
                  {isBn ? 'দোকানে কত বস্তা পাঠাবেন? *' : 'How many bags to transfer? *'}
                </label>
                <input
                  type="number"
                  autoFocus
                  value={transferBags}
                  onChange={e => setTransferBags(e.target.value)}
                  placeholder={`সর্বোচ্চ ${transferModalStock.bagsCount} বস্তা`}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '2px solid #6366F1',
                    fontSize: 16,
                    fontWeight: 900,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setTransferModalStock(null)}
                  style={{
                    flex: 1,
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: 12,
                    padding: 11,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1.5,
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 12,
                    padding: 11,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'স্থানান্তর সম্পন্ন করুন' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: 3-COPY PRINTABLE CHALAN SLIP ── */}
      {selectedChalanSlip && (
        <div
          onClick={() => setSelectedChalanSlip(null)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            borderRadius: 'inherit',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              width: '100%',
              maxWidth: 380,
              padding: 20,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              maxHeight: '85%',
              overflowY: 'auto',
            }}
          >
            {/* Chalan Slip Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={18} color="#2563EB" />
                <span style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>
                  {isBn ? 'সরকারি ৩-কপি ডেলিভারি চালান' : '3-Copy Delivery Chalan'}
                </span>
              </div>
              <button
                onClick={() => setSelectedChalanSlip(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: 10,
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Slip Paper View */}
            <div
              style={{
                background: '#FAFAFA',
                border: '1px solid #E2E8F0',
                borderRadius: 14,
                padding: '14px',
                fontFamily: 'monospace',
                fontSize: 11.5,
                lineHeight: 1.5,
                marginBottom: 14,
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #CBD5E1', paddingBottom: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A' }}>
                  LEDGERX CENTRAL WAREHOUSE
                </div>
                <div style={{ fontSize: 10, color: '#64748B' }}>
                  {selectedChalanSlip.godownName}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>
                  CHALAN NO: {selectedChalanSlip.id}
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <div><strong>প্রাপক / Customer:</strong> {selectedChalanSlip.customerName}</div>
                <div><strong>মোবাইল / Phone:</strong> {selectedChalanSlip.customerPhone}</div>
                <div><strong>গন্তব্য / Address:</strong> {selectedChalanSlip.deliveryAddress}</div>
                <div><strong>তারিখ / Date:</strong> {selectedChalanSlip.date}</div>
              </div>

              <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: 6, marginBottom: 8 }}>
                <div><strong>ট্রাক নম্বর / Truck:</strong> {selectedChalanSlip.truckNo}</div>
                <div><strong>চালক / Driver:</strong> {selectedChalanSlip.driverName} ({selectedChalanSlip.driverPhone})</div>
              </div>

              {/* Items Table */}
              <div style={{ borderTop: '1px solid #CBD5E1', borderBottom: '1px solid #CBD5E1', padding: '6px 0', margin: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 10.5 }}>
                  <span>পণ্য বিবরণী</span>
                  <span>বস্তা (ওজন)</span>
                </div>
                {selectedChalanSlip.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span>{it.name}</span>
                    <span><strong>{it.bags} বস্তা</strong> ({it.weightKg} কেজি)</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 12, marginTop: 6 }}>
                <span>মোট বস্তা সংখ্যা:</span>
                <span style={{ color: '#2563EB' }}>{selectedChalanSlip.totalBags} বস্তা</span>
              </div>

              <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px dashed #CBD5E1', display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#64748B' }}>
                <div>গুদাম ইনচার্জ স্বাক্ষর</div>
                <div>ড্রাইভার স্বাক্ষর</div>
                <div>প্রাপক স্বাক্ষর</div>
              </div>
            </div>

            {/* Slip Action Buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  haptics.success();
                  window.print();
                }}
                style={{
                  flex: 1,
                  background: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Printer size={14} />
                <span>{isBn ? 'প্রিন্ট গেটপাস' : 'Print Slip'}</span>
              </button>

              <button
                onClick={() => {
                  haptics.tap();
                  const shareMsg = `*ডেলিভারি চালান গেটপাস*\nচালান নং: ${selectedChalanSlip.id}\nগ্রাহক: ${selectedChalanSlip.customerName}\nট্রাক: ${selectedChalanSlip.truckNo}\nমোট বস্তা: ${selectedChalanSlip.totalBags}\nগন্তব্য: ${selectedChalanSlip.deliveryAddress}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareMsg)}`, '_blank');
                }}
                style={{
                  flex: 1,
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 12,
                  padding: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Share2 size={14} />
                <span>{isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
