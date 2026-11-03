import React, { useState, useMemo, useRef } from 'react';
import { useKhata } from '../context/KhataContext';
import { useTenant } from '../context/TenantContext';
import { useLocale } from '../context/LocaleContext';
import { useOperatingMode } from '../context/OperatingModeContext';
import { formatCurrency, parseToPoisha, takaToPoisha, poishaToTaka } from '../utils/currency';
import { openWhatsAppDirect } from '../utils/whatsapp';
import NumpadDrawer from '../components/common/NumpadDrawer';
import OwnerPinModal from '../components/common/OwnerPinModal';
import RoleAccessGate from '../components/common/RoleAccessGate';
import UnifiedPageHeader from '../components/common/UnifiedPageHeader';
import MetricRibbon from '../components/common/MetricRibbon';
import UnifiedToolbar from '../components/common/UnifiedToolbar';
import {
  Building2,
  Search,
  PlusCircle,
  ArrowLeft,
  Phone,
  User,
  MessageSquare,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  MapPin,
  CheckCircle2,
  X,
  CreditCard,
  Receipt,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  Edit3,
  Trash2,
  RotateCcw,
  KeyRound,
  Printer,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowUpDown,
  Copy,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SupplierKhata() {
  const { 
    suppliers, 
    registers,
    recordSupplierPayment, 
    recordPurchaseBill, 
    recordSupplierReturn,
    addSupplier, 
    editSupplier, 
    deleteSupplier, 
    ledgerEntries, 
    voidLedgerEntry 
  } = useKhata();
  const { activeTenant, isOwner, verifyOwnerPin } = useTenant();
  const { isBengali, locale } = useLocale();
  const { isEasyMode } = useOperatingMode();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('ALL'); // 'ALL' | 'DUE' | 'ZERO'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activePaymentModal, setActivePaymentModal] = useState(null); // supplier object
  const [activePurchaseModal, setActivePurchaseModal] = useState(null); // supplier object
  const [activeReturnModal, setActiveReturnModal] = useState(null); // supplier goods return modal
  const [statementSupplier, setStatementSupplier] = useState(null); // supplier opened in statement drawer
  const [pinModalAction, setPinModalAction] = useState(null);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [supplierMenuOpenId, setSupplierMenuOpenId] = useState(null);

  // Step-by-step Enter key navigation refs
  const newSuppCompanyRef = useRef(null);
  const newSuppPhoneRef = useRef(null);
  const newSuppDueRef = useRef(null);
  const newSuppAddressRef = useRef(null);
  const editSuppCompanyRef = useRef(null);
  const editSuppPhoneRef = useRef(null);
  const editSuppAddressRef = useRef(null);

  // New Supplier Form State
  const [newName, setNewName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDueTaka, setNewDueTaka] = useState('');

  // Edit Supplier State
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Delete Supplier State & Security
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [deletePin, setDeletePin] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Statement Passbook History Filters & Voiding
  const [statementTimeFilter, setStatementTimeFilter] = useState('ALL');
  const [statementTypeFilter, setStatementTypeFilter] = useState('ALL'); // 'ALL' | 'BILLS' | 'PAYMENTS' | 'RETURNS'
  const [statementSortAsc, setStatementSortAsc] = useState(false); // false = newest first, true = oldest first
  const [statementSearch, setStatementSearch] = useState('');
  const [statementViewTab, setStatementViewTab] = useState('PASSBOOK'); // 'PASSBOOK' | 'CHALAN_TRACKER'
  const [chalanTrackerSearch, setChalanTrackerSearch] = useState('');
  const [chalanStatusFilter, setChalanStatusFilter] = useState('ALL'); // 'ALL' | 'DUE' | 'PAID'
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [voidConfirmEntry, setVoidConfirmEntry] = useState(null);
  const [voidPin, setVoidPin] = useState('');
  const [voidReason, setVoidReason] = useState('');
  const [voidError, setVoidError] = useState('');

  // 1-Click Copy Challan to Clipboard
  const handleCopyChalan = (chalanNo, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!chalanNo) return;
    try {
      navigator.clipboard.writeText(chalanNo);
      toast.success(isBengali ? `চালান নং ${chalanNo} কপি হয়েছে!` : `Copied challan #${chalanNo}!`, {
        icon: '📋',
        duration: 2200,
      });
    } catch {
      const ta = document.createElement('textarea');
      ta.value = chalanNo;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(isBengali ? `চালান নং ${chalanNo} কপি হয়েছে!` : `Copied challan #${chalanNo}!`, {
        icon: '📋',
        duration: 2200,
      });
    }
  };

  // Open Payment directly linked to a specific Chalan
  const handleOpenPayForChalan = (supplier, chalan) => {
    const chalanNo = chalan.chalanNo || chalan.billNumber || chalan.voucherNumber || chalan.id;
    const duePoisha = chalan.duePoisha !== undefined ? chalan.duePoisha : (chalan.amountPoisha || 0);
    setActivePaymentModal({
      supplier,
      refChalan: chalanNo,
      defaultAmountPoisha: duePoisha,
    });
  };

  // Open Goods Return directly linked to a specific Chalan
  const handleOpenReturnForChalan = (supplier, chalan) => {
    const chalanNo = chalan.chalanNo || chalan.billNumber || chalan.voucherNumber || chalan.id;
    setActiveReturnModal({
      supplier,
      refChalan: chalanNo,
    });
  };

  // Live updated statement supplier reference (so updates immediately reflect in modal)
  const currentStatementSupplier = useMemo(() => {
    if (!statementSupplier) return null;
    return (suppliers || []).find(s => s.id === statementSupplier.id) || statementSupplier;
  }, [suppliers, statementSupplier]);

  const handleAddSupplierSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addSupplier({
      name: newName.trim(),
      company: newCompany.trim(),
      phone: newPhone.trim(),
      address: newAddress.trim(),
      initialDuePoisha: parseToPoisha(newDueTaka || '0'),
    });

    setNewName('');
    setNewCompany('');
    setNewPhone('');
    setNewAddress('');
    setNewDueTaka('');
    setIsAddSupplierOpen(false);
    toast.success(isBengali ? 'নতুন মহাজন খাতা সফলভাবে খোলা হয়েছে!' : 'Supplier added successfully!');
  };

  const handleOpenEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setEditName(sup.name || '');
    setEditCompany(sup.company || '');
    setEditPhone(sup.phone || '');
    setEditAddress(sup.address || '');
  };

  const handleEditSupplierSubmit = (e) => {
    e.preventDefault();
    if (!editingSupplier || !editName.trim()) return;

    editSupplier(editingSupplier.id, {
      name: editName.trim(),
      company: editCompany.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
    });

    if (statementSupplier && statementSupplier.id === editingSupplier.id) {
      setStatementSupplier(prev => ({
        ...prev,
        name: editName.trim(),
        company: editCompany.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
      }));
    }
    setEditingSupplier(null);
    toast.success(isBengali ? 'মহাজনের তথ্য আপডেট করা হয়েছে!' : 'Supplier updated!');
  };

  const handleConfirmDeleteSupplier = (e) => {
    e.preventDefault();
    if (!deletingSupplier) return;

    if (!isOwner) {
      if (!verifyOwnerPin(deletePin)) {
        setDeleteError(isBengali ? 'ভুল পিন কোড! মালিকের অনুমতি প্রয়োজন।' : 'Incorrect PIN! Owner authorization required.');
        return;
      }
    }

    deleteSupplier(deletingSupplier.id);
    if (statementSupplier && statementSupplier.id === deletingSupplier.id) {
      setStatementSupplier(null);
    }
    setDeletingSupplier(null);
    setDeletePin('');
    setDeleteError('');
    toast.success(isBengali ? 'মহাজন খাতা মুছে ফেলা হয়েছে!' : 'Supplier deleted!');
  };

  const handleConfirmVoid = (e) => {
    e.preventDefault();
    if (!voidConfirmEntry) return;

    if (!isOwner) {
      if (!verifyOwnerPin(voidPin)) {
        setVoidError(isBengali ? 'ভুল পিন কোড! মালিকের অনুমতি প্রয়োজন।' : 'Incorrect PIN! Owner authorization required.');
        return;
      }
    }

    voidLedgerEntry(voidConfirmEntry.id, voidReason || 'ভুল চালান/পেমেন্ট বাতিল');
    setVoidConfirmEntry(null);
    setVoidPin('');
    setVoidReason('');
    setVoidError('');
    toast.success(isBengali ? 'লেনদেন সফলভাবে বাতিল ও ব্যালেন্স রিভার্স হয়েছে!' : 'Transaction voided & balance restored!');
  };

  // Filter suppliers with status segmentation
  const filteredSuppliers = useMemo(() => {
    return (suppliers || []).filter((s) => {
      const duePoisha = s.balancePoisha || s.currentDuePoisha || 0;
      if (supplierFilter === 'DUE' && duePoisha <= 0) return false;
      if (supplierFilter === 'ZERO' && duePoisha > 0) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.company && s.company.toLowerCase().includes(q)) ||
        (s.address && s.address.toLowerCase().includes(q))
      );
    });
  }, [suppliers, search, supplierFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredSuppliers.length / pageSize) || 1;
  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage, pageSize]);

  // Calculate total supplier debt
  const totalPayablePoisha = useMemo(() => {
    return (suppliers || []).reduce(
      (sum, s) => sum + ((s.balancePoisha || s.currentDuePoisha || 0) > 0 ? (s.balancePoisha || s.currentDuePoisha) : 0),
      0
    );
  }, [suppliers]);

  // 1. Raw ledger entries belonging to current statement supplier
  const rawSupplierEntries = useMemo(() => {
    if (!currentStatementSupplier) return [];
    return (ledgerEntries || []).filter(e =>
      e.partyId === currentStatementSupplier.id ||
      e.partyName === currentStatementSupplier.name ||
      (e.partyType === 'SUPPLIER' && e.partyName === currentStatementSupplier.name) ||
      (e.title && e.title.includes(currentStatementSupplier.name))
    );
  }, [ledgerEntries, currentStatementSupplier]);

  // 2. Exact 4-metric summary tallies & calculated opening due
  const supplierSummary = useMemo(() => {
    if (!currentStatementSupplier) {
      return { totalBillsPoisha: 0, totalPaidPoisha: 0, totalReturnsPoisha: 0, openingDuePoisha: 0, currentDuePoisha: 0 };
    }

    const currentDue = currentStatementSupplier.balancePoisha || currentStatementSupplier.currentDuePoisha || 0;
    let totalBills = 0;
    let totalPaid = 0;
    let totalReturns = 0;
    let hasExplicitOpening = false;
    let explicitOpening = 0;

    rawSupplierEntries.forEach(tx => {
      if (tx.isVoided) return;
      const t = tx.type;
      if (t === 'SUPPLIER_OPENING_BALANCE') {
        hasExplicitOpening = true;
        explicitOpening += (tx.amountPoisha || 0);
      } else if (t === 'PURCHASE_BILL' || t === 'CREDIT_PURCHASE' || t === 'BILL' || t === 'GODOWN_INTAKE') {
        totalBills += (tx.amountPoisha || 0);
      } else if (t === 'SUPPLIER_PAYMENT' || t === 'PAYMENT_TO_SUPPLIER') {
        totalPaid += (tx.amountPoisha || 0);
      } else if (t === 'SUPPLIER_RETURN') {
        totalReturns += (tx.amountPoisha || 0);
      }
    });

    let openingDue = 0;
    if (hasExplicitOpening) {
      openingDue = explicitOpening;
    } else {
      // Net change from all active transactions
      const netTransacted = totalBills - totalPaid - totalReturns;
      openingDue = Math.max(0, currentDue - netTransacted);
    }

    return {
      totalBillsPoisha: totalBills,
      totalPaidPoisha: totalPaid,
      totalReturnsPoisha: totalReturns,
      openingDuePoisha: openingDue,
      currentDuePoisha: currentDue,
    };
  }, [currentStatementSupplier, rawSupplierEntries]);

  // 3. Chronological passbook ledger with forward-computed running balance
  const fullPassbookEntries = useMemo(() => {
    if (!currentStatementSupplier) return [];

    // Sort chronologically ascending (oldest first)
    const sorted = [...rawSupplierEntries].sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return timeA - timeB;
    });

    const hasExplicitOpening = sorted.some(e => e.type === 'SUPPLIER_OPENING_BALANCE' && !e.isVoided);
    const enriched = [];

    // Synthetic opening balance row if openingDue > 0 and no explicit opening entry exists
    if (supplierSummary.openingDuePoisha > 0 && !hasExplicitOpening) {
      const firstTxTime = sorted.length > 0 
        ? new Date(sorted[0].timestamp || sorted[0].createdAt || Date.now()).getTime() - 1000 * 60 * 60 
        : Date.now() - 1000 * 60 * 60 * 24;
      
      enriched.push({
        id: `virtual_opening_${currentStatementSupplier.id}`,
        timestamp: new Date(firstTxTime).toISOString(),
        type: 'SUPPLIER_OPENING_BALANCE',
        title: isBengali ? 'প্রারম্ভিক বকেয়া দেনা' : 'Opening Balance Due',
        voucherNumber: isBengali ? 'প্রারম্ভিক' : 'OPENING',
        partyName: currentStatementSupplier.name,
        amountPoisha: supplierSummary.openingDuePoisha,
        description: isBengali ? 'খাতা খোলার সময় পূর্বের প্রারম্ভিক দেনা জের' : 'Opening balance carried forward',
        walletName: isBengali ? 'পূর্ববর্তী দেনা' : 'Prior Balance',
        isVoided: false,
        runningDuePoisha: supplierSummary.openingDuePoisha,
      });
    }

    let running = (supplierSummary.openingDuePoisha > 0 && !hasExplicitOpening) ? supplierSummary.openingDuePoisha : 0;

    sorted.forEach(tx => {
      if (!tx.isVoided) {
        if (tx.type === 'SUPPLIER_OPENING_BALANCE') {
          running += (tx.amountPoisha || 0);
        } else if (tx.type === 'PURCHASE_BILL' || tx.type === 'CREDIT_PURCHASE' || tx.type === 'BILL' || tx.type === 'GODOWN_INTAKE') {
          running += (tx.amountPoisha || 0);
        } else if (tx.type === 'SUPPLIER_PAYMENT' || tx.type === 'PAYMENT_TO_SUPPLIER') {
          running = Math.max(0, running - (tx.amountPoisha || 0));
        } else if (tx.type === 'SUPPLIER_RETURN') {
          running = Math.max(0, running - (tx.amountPoisha || 0));
        }
      }
      enriched.push({
        ...tx,
        runningDuePoisha: running,
      });
    });

    return enriched;
  }, [currentStatementSupplier, rawSupplierEntries, supplierSummary, isBengali]);

  // 4. Statement transactions with search, type and time filters
  const activeStatementTransactions = useMemo(() => {
    let list = [...fullPassbookEntries];

    // Filter by Type
    if (statementTypeFilter === 'BILLS') {
      list = list.filter(e => ['PURCHASE_BILL', 'CREDIT_PURCHASE', 'BILL', 'GODOWN_INTAKE', 'SUPPLIER_OPENING_BALANCE'].includes(e.type));
    } else if (statementTypeFilter === 'PAYMENTS') {
      list = list.filter(e => ['SUPPLIER_PAYMENT', 'PAYMENT_TO_SUPPLIER'].includes(e.type));
    } else if (statementTypeFilter === 'RETURNS') {
      list = list.filter(e => e.type === 'SUPPLIER_RETURN');
    }

    // Filter by Time
    const now = Date.now();
    if (statementTimeFilter === 'TODAY') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      list = list.filter(e => new Date(e.timestamp || e.createdAt).getTime() >= todayStart);
    } else if (statementTimeFilter === 'WEEK') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      list = list.filter(e => new Date(e.timestamp || e.createdAt).getTime() >= weekAgo);
    } else if (statementTimeFilter === 'MONTH') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      list = list.filter(e => new Date(e.timestamp || e.createdAt).getTime() >= monthAgo);
    }

    // Search query
    if (statementSearch.trim()) {
      const q = statementSearch.toLowerCase();
      list = list.filter(e =>
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.voucherNumber && e.voucherNumber.toLowerCase().includes(q)) ||
        (e.billNumber && e.billNumber.toLowerCase().includes(q)) ||
        (e.returnChallanNo && e.returnChallanNo.toLowerCase().includes(q)) ||
        (e.walletName && e.walletName.toLowerCase().includes(q)) ||
        (e.reason && e.reason.toLowerCase().includes(q)) ||
        (e.title && e.title.toLowerCase().includes(q))
      );
    }

    // Sort: default Newest on Top, unless toggled
    if (!statementSortAsc) {
      list.reverse();
    }

    return list;
  }, [fullPassbookEntries, statementTypeFilter, statementTimeFilter, statementSearch, statementSortAsc]);

  // Chalan-by-Chalan Settlement & Tracking Breakdown
  const supplierChalansWithSettlement = useMemo(() => {
    if (!currentStatementSupplier) return [];
    
    // All non-voided purchase bills for this supplier
    const bills = (rawSupplierEntries || []).filter(e => 
      ['PURCHASE_BILL', 'CREDIT_PURCHASE', 'BILL', 'GODOWN_INTAKE'].includes(e.type) && !e.isVoided
    );

    // Payments and returns for this supplier
    const payments = (rawSupplierEntries || []).filter(e => 
      ['SUPPLIER_PAYMENT', 'PAYMENT_TO_SUPPLIER'].includes(e.type) && !e.isVoided
    );
    const returns = (rawSupplierEntries || []).filter(e => 
      e.type === 'SUPPLIER_RETURN' && !e.isVoided
    );

    return bills.map(bill => {
      const chalanNo = bill.billNumber || bill.voucherNumber || bill.id;
      const cleanNo = String(chalanNo).trim();

      // Find linked payments
      const linkedPayments = payments.filter(p => {
        if (p.refChalanNumber && p.refChalanNumber === cleanNo) return true;
        if (p.description && p.description.includes(cleanNo)) return true;
        if (p.title && p.title.includes(cleanNo)) return true;
        return false;
      });

      // Find linked returns
      const linkedReturns = returns.filter(r => {
        if (r.refChalanNumber && r.refChalanNumber === cleanNo) return true;
        if (r.description && r.description.includes(cleanNo)) return true;
        if (r.title && r.title.includes(cleanNo)) return true;
        return false;
      });

      const billedPoisha = bill.amountPoisha || 0;
      const paidPoisha = linkedPayments.reduce((sum, p) => sum + (p.amountPoisha || 0), 0);
      const returnedPoisha = linkedReturns.reduce((sum, r) => sum + (r.amountPoisha || 0), 0);
      const settledPoisha = paidPoisha + returnedPoisha;
      const duePoisha = Math.max(0, billedPoisha - settledPoisha);

      let status = 'UNPAID';
      if (settledPoisha >= billedPoisha) {
        status = 'PAID';
      } else if (settledPoisha > 0) {
        status = 'PARTIAL';
      }

      return {
        ...bill,
        chalanNo: cleanNo,
        billedPoisha,
        paidPoisha,
        returnedPoisha,
        duePoisha,
        status,
        linkedPayments,
        linkedReturns,
      };
    });
  }, [currentStatementSupplier, rawSupplierEntries]);

  const handlePaySupplier = (amountPoisha, note = '', walletId = 'cash_drawer', refChalanNumber = '') => {
    if (!activePaymentModal && !statementSupplier) return;
    const target = activePaymentModal?.supplier || activePaymentModal || statementSupplier;
    recordSupplierPayment(target.id, amountPoisha, note, walletId, refChalanNumber);
    setActivePaymentModal(null);
    toast.success(isBengali ? 'মহাজনকে পেমেন্ট সফল হয়েছে!' : 'Payment recorded!');
  };

  const handlePurchaseSubmit = (amountPoisha, billNumber, note) => {
    if (!activePurchaseModal && !statementSupplier) return;
    const target = activePurchaseModal || statementSupplier;
    recordPurchaseBill(target.id, amountPoisha, billNumber, note);
    setActivePurchaseModal(null);
    toast.success(isBengali ? 'ক্রয় চালান সফলভাবে যুক্ত হয়েছে!' : 'Purchase bill added!');
  };

  const handleReturnSubmit = (amountPoisha, returnChallanNo, reason, note, refChalanNumber = '') => {
    if (!activeReturnModal && !statementSupplier) return;
    const target = activeReturnModal?.supplier || activeReturnModal || statementSupplier;
    recordSupplierReturn(target.id, amountPoisha, returnChallanNo, reason, note, refChalanNumber);
    setActiveReturnModal(null);
    toast.success(isBengali ? 'মহাজনকে মাল ফেরত ও দেনা কর্তন সফল হয়েছে!' : 'Return recorded & balance reduced!');
  };

  const suppliersArr = suppliers || [];
  const suppliersWithDebt = suppliersArr.filter(s => (s.balancePoisha || s.currentDuePoisha || 0) > 0);
  const avgPayablePoisha = suppliersWithDebt.length > 0 ? Math.round(totalPayablePoisha / suppliersWithDebt.length) : 0;

  const supplierMetrics = [
    {
      id: 'totalPayable',
      label: isBengali ? 'মোট মহাজন দেনা' : 'Total Payables',
      value: formatCurrency(totalPayablePoisha, { locale }),
      valueColor: 'text-purple-700',
      subtitle: `${suppliersWithDebt.length} ${isBengali ? 'জন মহাজনের দেনা বাকি' : 'suppliers with due'}`,
      icon: TrendingDown,
      iconColor: 'text-purple-600',
      onClick: () => {
        setSupplierFilter('DUE');
        setCurrentPage(1);
      },
    },
    {
      id: 'withDue',
      label: isBengali ? 'বকেয়া মহাজন' : 'With Due',
      value: `${suppliersWithDebt.length} জন`,
      valueColor: 'text-purple-600',
      subtitle: isBengali ? 'পরিশোধযোগ্য' : 'payable accounts',
      icon: Building2,
      iconColor: 'text-purple-500',
      onClick: () => {
        setSupplierFilter('DUE');
        setCurrentPage(1);
      },
    },
    {
      id: 'settled',
      label: isBengali ? 'দেনামুক্ত' : 'Settled',
      value: `${suppliersArr.length - suppliersWithDebt.length} জন`,
      valueColor: 'text-emerald-600',
      subtitle: isBengali ? 'পরিশোধিত হিসাব' : 'zero debt suppliers',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      onClick: () => {
        setSupplierFilter('ZERO');
        setCurrentPage(1);
      },
    },
    ...(!isEasyMode ? [{
      id: 'avgDebt',
      label: isBengali ? 'গড় দেনা' : 'Avg Debt',
      value: formatCurrency(avgPayablePoisha, { locale }),
      valueColor: 'text-slate-900',
      subtitle: `${suppliersArr.length} ${isBengali ? 'নিবন্ধিত মহাজন' : 'registered'}`,
      icon: FileText,
      iconColor: 'text-slate-400',
    }] : []),
  ];

  const supplierToolbarTabs = [
    { id: 'ALL', label: isBengali ? 'সকল মহাজন' : 'All', count: suppliersArr.length },
    { id: 'DUE', label: isBengali ? 'বকেয়া দেনা' : 'With Due', count: suppliersWithDebt.length },
    { id: 'ZERO', label: isBengali ? 'দেনামুক্ত' : 'Settled', count: suppliersArr.length - suppliersWithDebt.length },
  ];

  return (
    <RoleAccessGate titleBn="মহাজন খাতা ও দেনা হিসাব" requiredRole="দোকান মালিক ও ম্যানেজার">
      <div className="w-full max-w-full space-y-3 pb-12 overflow-x-hidden">

      {/* ── 1. Compact Unified Page Header ── */}
      <UnifiedPageHeader
        icon={Building2}
        title={isEasyMode ? (isBengali ? 'মহাজন দেনা খাতা' : 'Supplier Due Khata') : (isBengali ? 'পাইকারি মহাজন ও মিল খাতা' : 'Supplier & Wholesaler Ledger')}
        subtitle={isBengali ? 'মহাজন ও কোম্পানির বকেয়া চালানি দেনা এবং টাকা পরিশোধের হিসাব' : 'Dealer payables, purchase invoices & settlements'}
        badge={isEasyMode ? (isBengali ? 'সহজ খাতা' : 'Simple') : 'B2B'}
        badgeColor="bg-purple-50 text-purple-800 border-purple-200"
        showBack={true}
        backTo="/"
        actions={
          <button 
            onClick={() => setIsAddSupplierOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>{isBengali ? '+ নতুন মহাজন' : '+ Add Supplier'}</span>
          </button>
        }
      />

      {/* ── 2. Slim Executive Metric Ribbon ── */}
      <MetricRibbon metrics={supplierMetrics} />

      {/* ── 3. Single-Row Unified Filter & Search Toolbar ── */}
      <UnifiedToolbar
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder={isBengali ? 'মহাজনের নাম, মিল বা জেলা... (Enter চাপলে খাতা খুলবে)' : 'Search supplier...'}
        tabs={supplierToolbarTabs}
        activeTab={supplierFilter}
        onTabChange={(tabId) => {
          setSupplierFilter(tabId);
          setCurrentPage(1);
        }}
      />

      {/* ── 4. Full-Width Spacious Supplier Cards (Anti-Cramp, Horizontal) ── */}
      <div className="space-y-4">
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Building2 size={32} />
            </div>
            <p className="font-bold text-slate-800 text-base">
              {isBengali ? 'কোনো মহাজন পাওয়া যায়নি' : 'No suppliers found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isBengali ? 'নতুন মহাজনের জন্য উপরের বোতাম চেপে খাতা খুলুন।' : 'Add a new supplier using the button above.'}
            </p>
          </div>
        ) : (
          paginatedSuppliers.map((supplier) => {
            const duePoisha = supplier.balancePoisha || supplier.currentDuePoisha || 0;
            const isDue = duePoisha > 0;

            return (
              <div
                key={supplier.id}
                onClick={() => setStatementSupplier(supplier)}
                className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-5"
              >
                {/* Left: Avatar & Identity Details */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Large 52px Squircle Avatar */}
                  <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 shadow-2xs border transition-all ${
                    isDue 
                      ? 'bg-purple-50 text-purple-700 border-purple-200 group-hover:bg-purple-600 group-hover:text-white' 
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {supplier.name ? supplier.name.charAt(0) : 'ম'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base md:text-lg text-slate-900 group-hover:text-purple-700 transition-colors leading-snug">
                        {supplier.name}
                      </h3>
                      {supplier.company && (
                        <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1 shrink-0">
                          🏢 {supplier.company}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="font-mono flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                        <Phone size={13} className="text-slate-400" />
                        {supplier.phone || (isBengali ? 'মোবাইল নেই' : 'No phone')}
                      </span>
                      {supplier.address && (
                        <span className="flex items-center gap-1 text-slate-500 font-medium truncate">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{supplier.address}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Dedicated Tactile Squircle & 1-Tap Action Buttons Strip */}
                <div 
                  className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap" 
                  onClick={e => e.stopPropagation()}
                >
                  {/* Dedicated Tactile Balance Squircle */}
                  <div className={`px-5 py-2.5 rounded-2xl border text-center min-w-[140px] ${
                    isDue 
                      ? 'bg-purple-50/70 border-purple-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block leading-none mb-1 text-slate-500">
                      {isBengali ? 'বর্তমান দেনা' : 'Current Due'}
                    </span>
                    <span className={`text-xl font-black tabular-nums tracking-tight ${
                      isDue ? 'text-purple-700' : 'text-slate-400'
                    }`}>
                      {formatCurrency(duePoisha, { locale })}
                    </span>
                  </div>

                  {/* 1-Tap Actions: Primary Khata Drawer + Pay + Bill + 3-Dot More Menu */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Primary Button 0: View Ledger Passbook Drawer */}
                    <button
                      type="button"
                      onClick={() => setStatementSupplier(supplier)}
                      className="min-h-[44px] px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-black shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      title={isBengali ? 'মহাজনের সম্পূর্ণ খতিয়ান ও চালান ড্রয়ার দেখুন' : 'View Ledger Drawer'}
                    >
                      <Receipt size={16} className="shrink-0 text-purple-300" />
                      <span>{isBengali ? 'খতিয়ান' : 'Ledger'}</span>
                    </button>

                    {/* Primary Button 1: Pay Supplier */}
                    <button
                      type="button"
                      onClick={() => setActivePaymentModal(supplier)}
                      className="min-h-[44px] px-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-black shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      title="মহাজনকে টাকা পরিশোধ"
                    >
                      <ArrowUpRight size={16} className="shrink-0 text-purple-100" />
                      <span>{isBengali ? 'পরিশোধ' : 'Pay'}</span>
                    </button>

                    {/* Primary Button 2: Add Purchase Bill */}
                    <button
                      type="button"
                      onClick={() => setActivePurchaseModal(supplier)}
                      className="min-h-[44px] px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-black shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                      title="নতুন ক্রয় চালান যুক্ত করুন"
                    >
                      <PlusCircle size={16} className="shrink-0 text-emerald-100" />
                      <span>{isBengali ? '+ চালান' : '+ Bill'}</span>
                    </button>

                    {/* 3-Dot More Options Dropdown (Return, WhatsApp, Edit, Delete) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSupplierMenuOpenId(supplierMenuOpenId === supplier.id ? null : supplier.id);
                        }}
                        className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer active:scale-95 shrink-0 border border-slate-200/80 shadow-2xs"
                        title={isBengali ? 'আরও অপশন (মাল ফেরত, বার্তা, এডিট, ডিলিট)' : 'More options'}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {supplierMenuOpenId === supplier.id && (
                        <div 
                          className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReturnModal(supplier);
                              setSupplierMenuOpenId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition"
                          >
                            <RotateCcw size={15} className="text-amber-600 shrink-0" />
                            <span>{isBengali ? 'মাল ফেরত (ডেবিট নোট)' : 'Return Goods'}</span>
                          </button>

                          {supplier.phone && (
                            <button
                              type="button"
                              onClick={() => {
                                const msg = `আসসালামু আলাইকুম ${supplier.name} ভাই, আপনার চালানের বর্তমান হিসাব দেখতে চাই।`;
                                openWhatsAppDirect(supplier.phone, msg);
                                setSupplierMenuOpenId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition"
                            >
                              <MessageSquare size={15} className="text-emerald-600 shrink-0" />
                              <span>{isBengali ? 'হোয়াটসঅ্যাপ বার্তা' : 'WhatsApp'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              handleOpenEditSupplier(supplier);
                              setSupplierMenuOpenId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2 transition"
                          >
                            <Edit3 size={15} className="text-slate-500 shrink-0" />
                            <span>{isBengali ? 'মহাজন তথ্য এডিট' : 'Edit Supplier'}</span>
                          </button>

                          <div className="my-1 border-t border-slate-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingSupplier(supplier);
                              setSupplierMenuOpenId(null);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                          >
                            <Trash2 size={15} className="shrink-0" />
                            <span>{isBengali ? 'মহাজন খাতা মুছুন' : 'Delete Supplier'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-2 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Bottom Pagination Toolbar ── */}
      {filteredSuppliers.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-semibold">
          <div className="flex items-center gap-2">
            <span>{isBengali ? 'পৃষ্ঠা আকার:' : 'Show:'}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>
              | {isBengali ? 'প্রদর্শন:' : 'Showing'} <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> - <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredSuppliers.length)}</strong> ({filteredSuppliers.length} {isBengali ? 'জন মহাজন' : 'suppliers'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed font-bold"
            >
              {isBengali ? 'পূর্ববর্তী' : 'Prev'}
            </button>
            <span className="font-bold text-slate-800 px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed font-bold"
            >
              {isBengali ? 'পরবর্তী' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* ── Supplier Statement Passbook Slide-Over Drawer (Right Sheet) ── */}
      {currentStatementSupplier && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
          onClick={() => setStatementSupplier(null)}
        >
          <div 
            className="bg-white w-full max-w-4xl h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-250 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* 1. Modal Top Bar */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black shrink-0 border border-white/20">
                  {currentStatementSupplier.name ? currentStatementSupplier.name.charAt(0) : 'ম'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-xl font-black truncate">{currentStatementSupplier.name}</h3>
                    {currentStatementSupplier.company && (
                      <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-semibold shrink-0">
                        🏢 {currentStatementSupplier.company}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/80 font-mono mt-0.5 truncate">
                    {currentStatementSupplier.phone || (isBengali ? 'মোবাইল নেই' : 'No phone')} {currentStatementSupplier.address ? `• ${currentStatementSupplier.address}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEditSupplier(currentStatementSupplier)}
                  className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="মহাজনের তথ্য পরিবর্তন"
                >
                  <Edit3 size={14} />
                  <span className="hidden sm:inline">{isBengali ? 'এডিট' : 'Edit'}</span>
                </button>

                {/* Print Statement Button */}
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="স্টেটমেন্ট লেজার প্রিন্ট"
                >
                  <Printer size={14} />
                  <span>{isBengali ? 'প্রিন্ট' : 'Print'}</span>
                </button>

                {/* Close Button */}
                <button 
                  type="button"
                  onClick={() => setStatementSupplier(null)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 2. Four-Metric Tally Grid & Quick Math Audit Bar */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/90 shrink-0 space-y-3.5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Metric 1: Total Purchase Bills */}
                <div className="bg-white rounded-2xl p-3.5 border border-rose-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-rose-600 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {isBengali ? 'মোট ক্রয় চালান' : 'Total Bills'}
                    </span>
                    <FileText size={16} />
                  </div>
                  <div className="text-lg md:text-xl font-black text-rose-700 tabular-nums">
                    {formatCurrency(supplierSummary.totalBillsPoisha, { locale })}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isBengali ? 'বকেয়া চালানের যোগফল' : 'Sum of credit bills'}
                  </span>
                </div>

                {/* Metric 2: Total Paid */}
                <div className="bg-white rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-emerald-600 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {isBengali ? 'মোট পরিশোধ' : 'Total Paid'}
                    </span>
                    <ArrowUpRight size={16} />
                  </div>
                  <div className="text-lg md:text-xl font-black text-emerald-700 tabular-nums">
                    {formatCurrency(supplierSummary.totalPaidPoisha, { locale })}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isBengali ? 'ক্যাশ ও ব্যাংক প্রদান' : 'Cash/Bank settlements'}
                  </span>
                </div>

                {/* Metric 3: Total Returned Goods */}
                <div className="bg-white rounded-2xl p-3.5 border border-amber-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-amber-600 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {isBengali ? 'মোট মাল ফেরত' : 'Total Returns'}
                    </span>
                    <RotateCcw size={16} />
                  </div>
                  <div className="text-lg md:text-xl font-black text-amber-700 tabular-nums">
                    {formatCurrency(supplierSummary.totalReturnsPoisha, { locale })}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isBengali ? 'ডেবিট নোট কর্তন' : 'Debit notes / returns'}
                  </span>
                </div>

                {/* Metric 4: Current Net Due Balance */}
                <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-2xl p-3.5 text-white shadow-sm">
                  <div className="flex items-center justify-between text-purple-200 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {isBengali ? 'বর্তমান মোট দেনা' : 'Net Outstanding'}
                    </span>
                    <Building2 size={16} />
                  </div>
                  <div className="text-lg md:text-xl font-black text-white tabular-nums">
                    {formatCurrency(supplierSummary.currentDuePoisha, { locale })}
                  </div>
                  <span className="text-[10px] text-purple-200 font-medium">
                    {isBengali ? 'মহাজনকে প্রদেয় বাকি' : 'Payable to wholesaler'}
                  </span>
                </div>
              </div>

              {/* Arithmetic Audit Formula Ribbon (Removes all tracking confusion!) */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-purple-50/70 border border-purple-200/70 rounded-xl text-xs font-mono text-purple-950">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-600">{isBengali ? 'হিসাব সমীকরণ:' : 'Equation:'}</span>
                  {supplierSummary.openingDuePoisha > 0 && (
                    <>
                      <span className="bg-white px-2 py-0.5 rounded-md border border-purple-200 font-bold text-slate-700">
                        {isBengali ? 'প্রারম্ভিক: ' : 'Open: '} {formatCurrency(supplierSummary.openingDuePoisha, { locale })}
                      </span>
                      <span className="font-bold text-purple-600">+</span>
                    </>
                  )}
                  <span className="bg-white px-2 py-0.5 rounded-md border border-rose-200 font-bold text-rose-700">
                    {isBengali ? 'চালান: ' : 'Bills: '} {formatCurrency(supplierSummary.totalBillsPoisha, { locale })}
                  </span>
                  <span className="font-bold text-purple-600">-</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-emerald-200 font-bold text-emerald-700">
                    {isBengali ? 'পরিশোধ: ' : 'Paid: '} {formatCurrency(supplierSummary.totalPaidPoisha, { locale })}
                  </span>
                  <span className="font-bold text-purple-600">-</span>
                  <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200 font-bold text-amber-700">
                    {isBengali ? 'ফেরত: ' : 'Returned: '} {formatCurrency(supplierSummary.totalReturnsPoisha, { locale })}
                  </span>
                  <span className="font-bold text-purple-600">=</span>
                  <span className="bg-purple-900 text-white px-2.5 py-0.5 rounded-md font-bold shadow-xs">
                    {isBengali ? 'দেনা: ' : 'Net Due: '} {formatCurrency(supplierSummary.currentDuePoisha, { locale })}
                  </span>
                </div>
                <div className="text-[11px] text-purple-800 font-medium">
                  {supplierSummary.currentDuePoisha > 0
                    ? (isBengali ? '📌 মহাজন এই টাকাটি আপনার কাছে পাবে' : '📌 Payable to wholesaler')
                    : (isBengali ? '✅ সম্পূর্ণ পরিশোধিত / কোনো দেনা নেই' : '✅ Fully settled / zero balance')}
                </div>
              </div>
            </div>

            {/* 3. View Mode Switch: 📖 খাতা পাসবুক vs 📋 চালান ট্র্যাকার ও নিষ্পত্তি */}
            <div className="bg-slate-100/90 border-b border-slate-200 px-5 pt-2 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setStatementViewTab('PASSBOOK')}
                className={`px-4 py-2 rounded-t-xl text-xs font-black transition flex items-center gap-2 cursor-pointer border-t border-x ${
                  statementViewTab === 'PASSBOOK'
                    ? 'bg-white text-purple-900 border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <Receipt size={14} className={statementViewTab === 'PASSBOOK' ? 'text-purple-600' : 'text-slate-400'} />
                <span>{isBengali ? 'খাতা পাসবুক (Passbook)' : 'Passbook Ledger'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-purple-100 text-purple-800">
                  {fullPassbookEntries.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatementViewTab('CHALAN_TRACKER')}
                className={`px-4 py-2 rounded-t-xl text-xs font-black transition flex items-center gap-2 cursor-pointer border-t border-x ${
                  statementViewTab === 'CHALAN_TRACKER'
                    ? 'bg-white text-purple-900 border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <FileText size={14} className={statementViewTab === 'CHALAN_TRACKER' ? 'text-purple-600' : 'text-slate-400'} />
                <span>{isBengali ? 'চালান ট্র্যাকার ও নিষ্পত্তি' : 'Chalan Tracker'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  supplierChalansWithSettlement.filter(c => c.status !== 'PAID').length > 0
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {supplierChalansWithSettlement.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatementViewTab('PROFILE')}
                className={`px-4 py-2 rounded-t-xl text-xs font-black transition flex items-center gap-2 cursor-pointer border-t border-x ${
                  statementViewTab === 'PROFILE'
                    ? 'bg-white text-purple-900 border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/60'
                }`}
              >
                <User size={14} className={statementViewTab === 'PROFILE' ? 'text-purple-600' : 'text-slate-400'} />
                <span>{isBengali ? 'মহাজন তথ্য ও যোগাযোগ' : 'Profile & Info'}</span>
              </button>
            </div>

            {/* ── View Tab 1: Chronological Running Balance Passbook ─────── */}
            {statementViewTab === 'PASSBOOK' && (
              <>
                {/* Filter Ribbons: Type Tabs + Time Tabs + Live Search + Sort Toggle */}
                <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                  {/* Type Filters */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    {[
                      { id: 'ALL', label: isBengali ? 'সব' : 'All', count: fullPassbookEntries.length },
                      { id: 'BILLS', label: isBengali ? '🛍️ চালান' : 'Bills', count: fullPassbookEntries.filter(e => ['PURCHASE_BILL', 'CREDIT_PURCHASE', 'BILL', 'GODOWN_INTAKE', 'SUPPLIER_OPENING_BALANCE'].includes(e.type)).length },
                      { id: 'PAYMENTS', label: isBengali ? '💸 পরিশোধ' : 'Paid', count: fullPassbookEntries.filter(e => ['SUPPLIER_PAYMENT', 'PAYMENT_TO_SUPPLIER'].includes(e.type)).length },
                      { id: 'RETURNS', label: isBengali ? '🔄 ফেরত' : 'Returns', count: fullPassbookEntries.filter(e => e.type === 'SUPPLIER_RETURN').length },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setStatementTypeFilter(tab.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          statementTypeFilter === tab.id
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          statementTypeFilter === tab.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Time Filters & Sort Toggle */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      {[
                        { id: 'ALL', label: isBengali ? 'সব' : 'All' },
                        { id: 'TODAY', label: isBengali ? 'আজ' : 'Today' },
                        { id: 'WEEK', label: isBengali ? '৭ দিন' : '7 Days' },
                        { id: 'MONTH', label: isBengali ? 'চলতি মাস' : 'Month' },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setStatementTimeFilter(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            statementTimeFilter === tab.id
                              ? 'bg-white text-slate-900 font-bold shadow-2xs'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Sort Toggle */}
                    <button
                      type="button"
                      onClick={() => setStatementSortAsc(!statementSortAsc)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                      title={statementSortAsc ? 'নতুন আগে দেখান' : 'পুরাতন আগে দেখান'}
                    >
                      <ArrowUpDown size={13} className="text-purple-600" />
                      <span className="hidden sm:inline">
                        {statementSortAsc ? (isBengali ? 'পুরাতন আগে' : 'Oldest First') : (isBengali ? 'নতুন আগে' : 'Newest First')}
                      </span>
                    </button>

                    {/* Live Search */}
                    <div className="relative w-44 sm:w-56">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={statementSearch}
                        onChange={e => setStatementSearch(e.target.value)}
                        placeholder={isBengali ? 'মেমো, ভাউচার বা নোট...' : 'Search memo / notes...'}
                        className="w-full h-8 pl-7 pr-7 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                      {statementSearch && (
                        <button
                          onClick={() => setStatementSearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Passbook Ledger Table & Chronological Timeline */}
                <div className="overflow-y-auto flex-1 bg-slate-50/50 p-4 sm:p-5">
                  {activeStatementTransactions.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                      <Receipt size={40} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">
                        {isBengali ? 'কোনো লেনদেনের রেকর্ড পাওয়া যায়নি' : 'No records found'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {isBengali ? 'নতুন চালান বা পেমেন্ট যুক্ত করতে উপরের বোতাম ব্যবহার করুন।' : 'Use the buttons above to record a bill or payment.'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-3.5">{isBengali ? 'তারিখ ও সময়' : 'Date & Time'}</th>
                            <th className="py-3 px-3">{isBengali ? 'ধরন' : 'Type'}</th>
                            <th className="py-3 px-3">{isBengali ? 'মেমো / চালান নং' : 'Challan / Memo'}</th>
                            <th className="py-3 px-3">{isBengali ? 'মাধ্যম / বিবরণ' : 'Details / Source'}</th>
                            <th className="py-3 px-3 text-right">{isBengali ? 'চালান মূল্য (+)' : 'Bill (+)'}</th>
                            <th className="py-3 px-3 text-right">{isBengali ? 'পরিশোধ / সমন্বয় (-)' : 'Paid / Return (-)'}</th>
                            <th className="py-3 px-3.5 text-right bg-purple-50/50 text-purple-900">{isBengali ? 'চলতি দেনা (জের)' : 'Running Balance'}</th>
                            <th className="py-3 px-2 text-center">{isBengali ? 'অ্যাকশন' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeStatementTransactions.map((tx) => {
                            const isPayment = tx.type === 'SUPPLIER_PAYMENT' || tx.type === 'PAYMENT_TO_SUPPLIER';
                            const isReturn = tx.type === 'SUPPLIER_RETURN';
                            const isOpening = tx.type === 'SUPPLIER_OPENING_BALANCE';
                            const isBill = !isPayment && !isReturn && !isOpening;
                            const isVoided = tx.isVoided;

                            return (
                              <tr
                                key={tx.id}
                                className={`transition-colors ${
                                  isVoided
                                    ? 'bg-rose-50/20 opacity-60 text-slate-400'
                                    : 'hover:bg-slate-50/80'
                                }`}
                              >
                                {/* 1. Date & Time */}
                                <td className="py-3 px-3.5 whitespace-nowrap">
                                  <span className="font-semibold text-slate-800 font-mono block">
                                    {new Date(tx.timestamp || tx.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(tx.timestamp || tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </td>

                                {/* 2. Type Badge */}
                                <td className="py-3 px-3 whitespace-nowrap">
                                  {isOpening ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
                                      📌 {isBengali ? 'প্রারম্ভিক দেনা' : 'Opening'}
                                    </span>
                                  ) : isPayment ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      <ArrowUpRight size={12} /> {isBengali ? 'পরিশোধ' : 'Payment'}
                                    </span>
                                  ) : isReturn ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                                      <RotateCcw size={11} /> {isBengali ? 'মাল ফেরত' : 'Return'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
                                      <FileText size={12} /> {isBengali ? 'ক্রয় চালান' : 'Purchase Bill'}
                                    </span>
                                  )}
                                  {isVoided && (
                                    <span className="block mt-1 text-[9px] bg-rose-600 text-white font-extrabold px-1.5 py-0.2 rounded w-fit">
                                      {isBengali ? 'বাতিলকৃত' : 'VOIDED'}
                                    </span>
                                  )}
                                </td>

                                {/* 3. Challan / Memo No. */}
                                <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span>{tx.billNumber || tx.returnChallanNo || tx.voucherNumber || tx.id}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopyChalan(tx.billNumber || tx.returnChallanNo || tx.voucherNumber || tx.id, e)}
                                      className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-100/70 transition cursor-pointer"
                                      title={isBengali ? 'চালান নম্বর কপি করুন' : 'Copy Challan No'}
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </td>

                                {/* 4. Details / Source */}
                                <td className="py-3 px-3 min-w-[160px] max-w-[240px]">
                                  <p className={`font-semibold text-slate-800 truncate ${isVoided ? 'line-through text-slate-400' : ''}`}>
                                    {tx.description || tx.title || (isBill ? 'বাকি চালান ক্রয়' : isPayment ? 'পাওনা পরিশোধ' : 'মাল ফেরত')}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 flex-wrap">
                                    {tx.refChalanNumber && (
                                      <span className="inline-flex items-center gap-1 font-bold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                        <FileText size={10} />
                                        <span>{isBengali ? 'চালান #' : 'Bill #'}{tx.refChalanNumber}</span>
                                        <button
                                          type="button"
                                          onClick={(e) => handleCopyChalan(tx.refChalanNumber, e)}
                                          className="hover:text-purple-900 cursor-pointer ml-0.5"
                                          title="কপি করুন"
                                        >
                                          <Copy size={9} />
                                        </button>
                                      </span>
                                    )}
                                    {isPayment && (
                                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                                        {tx.walletName || 'নগদ ক্যাশবাক্স'}
                                      </span>
                                    )}
                                    {isReturn && tx.reason && (
                                      <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                                        {tx.reason}
                                      </span>
                                    )}
                                    {isBill && (
                                      <span className="text-slate-400">
                                        {tx.walletName || 'বাকি ক্রয়'}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* 5. Bill Amount (+) */}
                                <td className="py-3 px-3 text-right font-black tabular-nums whitespace-nowrap text-rose-600">
                                  {(isBill || isOpening) ? (
                                    <span className={isVoided ? 'line-through text-slate-400' : ''}>
                                      + {formatCurrency(tx.amountPoisha || 0, { locale })}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>

                                {/* 6. Paid / Return Amount (-) */}
                                <td className="py-3 px-3 text-right font-black tabular-nums whitespace-nowrap">
                                  {isPayment ? (
                                    <span className={`text-emerald-700 ${isVoided ? 'line-through text-slate-400' : ''}`}>
                                      - {formatCurrency(tx.amountPoisha || 0, { locale })}
                                    </span>
                                  ) : isReturn ? (
                                    <span className={`text-amber-700 ${isVoided ? 'line-through text-slate-400' : ''}`}>
                                      - {formatCurrency(tx.amountPoisha || 0, { locale })}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>

                                {/* 7. Running Balance (চলতি দেনা) */}
                                <td className="py-3 px-3.5 text-right font-black tabular-nums whitespace-nowrap bg-purple-50/50 text-slate-900">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0"></span>
                                    <span className="text-sm font-black text-purple-950 font-mono">
                                      {formatCurrency(tx.runningDuePoisha !== undefined ? tx.runningDuePoisha : (currentStatementSupplier.balancePoisha || 0), { locale })}
                                    </span>
                                  </div>
                                </td>

                                {/* 8. Quick Actions: Pay Chalan / Return Chalan / Void */}
                                <td className="py-3 px-2 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1">
                                    {isBill && !isVoided && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenPayForChalan(currentStatementSupplier, tx)}
                                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] transition shadow-2xs flex items-center gap-0.5 cursor-pointer active:scale-95"
                                          title={isBengali ? 'এই চালানের পাওনা পরিশোধ করুন' : 'Pay this bill'}
                                        >
                                          <ArrowUpRight size={11} />
                                          <span>{isBengali ? 'পরিশোধ' : 'Pay'}</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenReturnForChalan(currentStatementSupplier, tx)}
                                          className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] transition shadow-2xs flex items-center gap-0.5 cursor-pointer active:scale-95"
                                          title={isBengali ? 'এই চালানের মাল ফেরত দিন' : 'Return items from this bill'}
                                        >
                                          <RotateCcw size={11} />
                                          <span>{isBengali ? 'ফেরত' : 'Return'}</span>
                                        </button>
                                      </>
                                    )}
                                    {!isVoided && !isOpening ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVoidConfirmEntry(tx);
                                          setVoidPin('');
                                          setVoidReason('');
                                          setVoidError('');
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                        title={isBengali ? 'ভুল লেনদেন বাতিল করুন (মালিকের পিন)' : 'Void this entry'}
                                      >
                                        <RotateCcw size={13} />
                                      </button>
                                    ) : (
                                      <span className="text-slate-200 text-xs">-</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>

                        {/* Table Footer: Tally Check */}
                        <tfoot className="bg-slate-100 border-t-2 border-slate-200 font-black text-slate-900 text-xs">
                          <tr>
                            <td colSpan={4} className="py-3 px-3.5">
                              {isBengali ? 'সক্রিয় মোট লেনদেন হিসেব:' : 'Active Total Tallies:'}
                            </td>
                            <td className="py-3 px-3 text-right text-rose-700 tabular-nums font-black font-mono">
                              + {formatCurrency(supplierSummary.totalBillsPoisha, { locale })}
                            </td>
                            <td className="py-3 px-3 text-right text-emerald-700 tabular-nums font-black font-mono">
                              - {formatCurrency(supplierSummary.totalPaidPoisha + supplierSummary.totalReturnsPoisha, { locale })}
                            </td>
                            <td className="py-3 px-3.5 text-right text-purple-950 tabular-nums font-black font-mono bg-purple-100">
                              {formatCurrency(supplierSummary.currentDuePoisha, { locale })}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── View Tab 2: Chalan Settlement Tracker & Status ─────────── */}
            {statementViewTab === 'CHALAN_TRACKER' && (
              <div className="overflow-y-auto flex-1 bg-slate-50/50 p-4 sm:p-5 space-y-4">
                {/* Filter and Search Bar for Chalans */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    {[
                      { id: 'ALL', label: isBengali ? 'সব চালান' : 'All Bills', count: supplierChalansWithSettlement.length },
                      { id: 'DUE', label: isBengali ? '⚠️ বকেয়া চালান' : 'Due Bills', count: supplierChalansWithSettlement.filter(c => c.status !== 'PAID').length },
                      { id: 'PAID', label: isBengali ? '✓ পরিশোধিত চালান' : 'Paid Bills', count: supplierChalansWithSettlement.filter(c => c.status === 'PAID').length },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setChalanStatusFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                          chalanStatusFilter === tab.id
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          chalanStatusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={chalanTrackerSearch}
                      onChange={e => setChalanTrackerSearch(e.target.value)}
                      placeholder={isBengali ? 'চালান নং বা পণ্যের নাম...' : 'Search challan or item...'}
                      className="w-full h-9 pl-8 pr-7 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    {chalanTrackerSearch && (
                      <button
                        onClick={() => setChalanTrackerSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Chalan Cards List */}
                {(() => {
                  const filtered = supplierChalansWithSettlement.filter(c => {
                    if (chalanStatusFilter === 'DUE' && c.status === 'PAID') return false;
                    if (chalanStatusFilter === 'PAID' && c.status !== 'PAID') return false;
                    if (chalanTrackerSearch) {
                      const q = chalanTrackerSearch.toLowerCase();
                      const matchNo = c.chalanNo && c.chalanNo.toLowerCase().includes(q);
                      const matchDesc = c.description && c.description.toLowerCase().includes(q);
                      return matchNo || matchDesc;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                        <FileText size={40} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-bold text-slate-700">
                          {isBengali ? 'কোনো ক্রয় চালান পাওয়া যায়নি' : 'No challans found'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {isBengali ? 'উপরে "+ চালান" বোতাম চেপে নতুন চালান যুক্ত করুন।' : 'Click "+ Bill" above to add a purchase bill.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filtered.map(chalan => {
                        const isPaid = chalan.status === 'PAID';
                        const isPartial = chalan.status === 'PARTIAL';

                        return (
                          <div
                            key={chalan.id}
                            className={`bg-white rounded-2xl border-2 transition-all p-4.5 shadow-2xs hover:shadow-md ${
                              isPaid
                                ? 'border-emerald-200/80 bg-emerald-50/10'
                                : isPartial
                                ? 'border-amber-300/80 bg-amber-50/10'
                                : 'border-rose-200/90 bg-rose-50/5'
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                    {chalan.chalanNo}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyChalan(chalan.chalanNo, e)}
                                    className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                                    title="চালান নম্বর কপি করুন"
                                  >
                                    <Copy size={13} />
                                  </button>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                                  {new Date(chalan.timestamp || chalan.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })} • {new Date(chalan.timestamp || chalan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              {/* Status Badge */}
                              <div>
                                {isPaid ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300/60 shadow-2xs">
                                    <CheckCircle2 size={12} className="text-emerald-600" />
                                    <span>{isBengali ? 'সম্পূর্ণ পরিশোধিত' : 'Paid in Full'}</span>
                                  </span>
                                ) : isPartial ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 border border-amber-300/60 shadow-2xs">
                                    <Clock size={12} className="text-amber-600" />
                                    <span>{isBengali ? 'আংশিক পরিশোধিত' : 'Partially Paid'}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-300/60 shadow-2xs">
                                    <AlertTriangle size={12} className="text-rose-600" />
                                    <span>{isBengali ? 'সম্পূর্ণ বকেয়া' : 'Unpaid'}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Body: Items / Description */}
                            <div className="py-2.5">
                              <p className="text-xs font-bold text-slate-700">
                                {chalan.description || (isBengali ? 'মালের ক্রয় চালান বিল' : 'Purchase Bill')}
                              </p>
                            </div>

                            {/* 4 Metrics Matrix */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70 text-center font-mono">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans font-semibold">
                                  {isBengali ? 'চালান মূল্য' : 'Bill Total'}
                                </span>
                                <span className="text-xs font-black text-rose-600">
                                  + {formatCurrency(chalan.billedPoisha, { locale })}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans font-semibold">
                                  {isBengali ? 'পরিশোধিত' : 'Paid'}
                                </span>
                                <span className="text-xs font-black text-emerald-700">
                                  - {formatCurrency(chalan.paidPoisha, { locale })}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans font-semibold">
                                  {isBengali ? 'মাল ফেরত' : 'Returned'}
                                </span>
                                <span className="text-xs font-black text-amber-700">
                                  - {formatCurrency(chalan.returnedPoisha, { locale })}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans font-semibold">
                                  {isBengali ? 'অবশিষ্ট দেনা' : 'Balance Due'}
                                </span>
                                <span className="text-xs font-black text-purple-900">
                                  {formatCurrency(chalan.duePoisha, { locale })}
                                </span>
                              </div>
                            </div>

                            {/* Linked Transactions Mini Pill (If any) */}
                            {(chalan.linkedPayments.length > 0 || chalan.linkedReturns.length > 0) && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                                <span className="font-bold text-slate-500 font-sans">
                                  {isBengali ? 'যুক্ত ভাউচার:' : 'Linked:'}
                                </span>
                                {chalan.linkedPayments.map(p => (
                                  <span key={p.id} className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold px-1.5 py-0.2 rounded">
                                    {p.voucherNumber || p.id} (-{formatCurrency(p.amountPoisha, { locale })})
                                  </span>
                                ))}
                                {chalan.linkedReturns.map(r => (
                                  <span key={r.id} className="bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold px-1.5 py-0.2 rounded">
                                    {r.returnChallanNo || r.id} (-{formatCurrency(r.amountPoisha, { locale })})
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 1-Click Action Buttons */}
                            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                              {chalan.duePoisha > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPayForChalan(currentStatementSupplier, chalan)}
                                  className="flex-1 h-9 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                  <ArrowUpRight size={13} />
                                  <span>{isBengali ? 'এই চালান পরিশোধ' : 'Pay this Bill'}</span>
                                </button>
                              ) : (
                                <div className="flex-1 h-9 rounded-xl bg-slate-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1 select-none">
                                  <Check size={13} />
                                  <span>{isBengali ? 'চালানটি সম্পূর্ণ পরিশোধিত' : 'Fully Settled'}</span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenReturnForChalan(currentStatementSupplier, chalan)}
                                className="px-3 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                                title={isBengali ? 'এই চালানের মাল ফেরত দিন' : 'Return goods against this bill'}
                              >
                                <RotateCcw size={12} />
                                <span>{isBengali ? 'মাল ফেরত' : 'Return'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── View Tab 3: Supplier Profile, Contact & Details ─────────── */}
            {statementViewTab === 'PROFILE' && (
              <div className="overflow-y-auto flex-1 bg-slate-50/50 p-5 md:p-7 space-y-6">
                {/* Profile Overview Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl font-black border border-purple-200 shrink-0">
                      {currentStatementSupplier.name ? currentStatementSupplier.name.charAt(0) : 'ম'}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{currentStatementSupplier.name}</h3>
                      {currentStatementSupplier.company && (
                        <p className="text-sm font-bold text-purple-700 flex items-center gap-1.5 mt-0.5">
                          <Building2 size={15} />
                          <span>{currentStatementSupplier.company}</span>
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {isBengali ? 'আইডি:' : 'ID:'} <span className="font-mono font-semibold text-slate-600">{currentStatementSupplier.id}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditSupplier(currentStatementSupplier)}
                    className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition flex items-center gap-2 cursor-pointer active:scale-95 border border-purple-200"
                  >
                    <Edit3 size={15} />
                    <span>{isBengali ? 'তথ্য পরিবর্তন' : 'Edit Profile'}</span>
                  </button>
                </div>

                {/* Contact & Address Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone & Communications */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      {isBengali ? 'যোগাযোগের নম্বর' : 'Phone & Communication'}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold font-mono text-slate-800 flex items-center gap-2">
                        <Phone size={16} className="text-purple-600" />
                        {currentStatementSupplier.phone || (isBengali ? 'মোবাইল নম্বর নেই' : 'No phone number')}
                      </span>
                      {currentStatementSupplier.phone && (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${currentStatementSupplier.phone}`}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="কল করুন"
                          >
                            <Phone size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              const msg = `আসসালামু আলাইকুম ${currentStatementSupplier.name} ভাই, আপনার চালানের বর্তমান হিসাব দেখতে চাই।`;
                              openWhatsAppDirect(currentStatementSupplier.phone, msg);
                            }}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition border border-emerald-200"
                            title="হোয়াটসঅ্যাপ বার্তা"
                          >
                            <MessageSquare size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      {isBengali ? 'ঠিকানা ও অবস্থান' : 'Business Address'}
                    </span>
                    <p className="text-sm font-semibold text-slate-700 flex items-start gap-2">
                      <MapPin size={16} className="text-rose-500 shrink-0 mt-0.5" />
                      <span>{currentStatementSupplier.address || (isBengali ? 'কোনো ঠিকানা উল্লেখ নেই' : 'No address specified')}</span>
                    </p>
                  </div>
                </div>

                {/* Lifetime Accounting Balance Sheet */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                    {isBengali ? 'আজীবন লেনদেন সারসংক্ষেপ' : 'Lifetime Accounting Summary'}
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-100">
                      <span className="text-[11px] font-bold text-rose-700 block mb-1">
                        {isBengali ? 'মোট ক্রয় বিল' : 'Total Purchases'}
                      </span>
                      <span className="text-base font-black text-rose-800 tabular-nums font-mono">
                        {formatCurrency(supplierSummary.totalBillsPoisha, { locale })}
                      </span>
                    </div>

                    <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                      <span className="text-[11px] font-bold text-emerald-700 block mb-1">
                        {isBengali ? 'মোট পরিশোধ' : 'Total Paid'}
                      </span>
                      <span className="text-base font-black text-emerald-800 tabular-nums font-mono">
                        {formatCurrency(supplierSummary.totalPaidPoisha, { locale })}
                      </span>
                    </div>

                    <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100">
                      <span className="text-[11px] font-bold text-amber-700 block mb-1">
                        {isBengali ? 'মোট মাল ফেরত' : 'Total Returns'}
                      </span>
                      <span className="text-base font-black text-amber-800 tabular-nums font-mono">
                        {formatCurrency(supplierSummary.totalReturnsPoisha, { locale })}
                      </span>
                    </div>

                    <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200">
                      <span className="text-[11px] font-bold text-purple-700 block mb-1">
                        {isBengali ? 'বর্তমান দেনা' : 'Current Due'}
                      </span>
                      <span className="text-base font-black text-purple-900 tabular-nums font-mono">
                        {formatCurrency(supplierSummary.currentDuePoisha, { locale })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Danger Zone: Delete Supplier */}
                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 flex items-center justify-between gap-3">
                  <div className="text-xs text-rose-800">
                    <strong className="block font-bold">{isBengali ? 'খাতা মুছে ফেলুন' : 'Delete Supplier Account'}</strong>
                    <span className="text-[11px] text-rose-600">{isBengali ? 'কেবলমাত্র দেনামুক্ত ও ভুল হিসাব মোছার জন্য অনুমোদিত।' : 'Allowed only with zero due and PIN authentication.'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingSupplier(currentStatementSupplier);
                      setDeletePin('');
                      setDeleteError('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 size={14} />
                    <span>{isBengali ? 'খাতা মুছুন' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Supplier Modal ── */}
      {editingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-8 py-6 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shadow-inner border border-white/20">
                  <Edit3 size={22} className="text-white drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight leading-tight">
                    {isBengali ? 'মহাজনের তথ্য পরিবর্তন' : 'Edit Supplier Details'}
                  </h3>
                  <p className="text-xs text-purple-200 font-semibold mt-0.5">
                    {editingSupplier.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEditingSupplier(null)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSupplierSubmit} className="p-8 space-y-4 bg-white">
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1.5">
                  {isBengali ? 'মহাজনের নাম' : 'Supplier Name'} <span className="text-purple-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      editSuppCompanyRef.current?.focus();
                    }
                  }}
                  className="w-full h-12 px-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1.5">
                  {isBengali ? 'কোম্পানি / মিলের নাম' : 'Company / Mill Name'}
                </label>
                <input
                  ref={editSuppCompanyRef}
                  type="text"
                  value={editCompany}
                  onChange={e => setEditCompany(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      editSuppPhoneRef.current?.focus();
                    }
                  }}
                  className="w-full h-12 px-4 rounded-2xl border-2 border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1.5">
                  {isBengali ? 'মোবাইল নম্বর' : 'Phone'}
                </label>
                <input
                  ref={editSuppPhoneRef}
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      editSuppAddressRef.current?.focus();
                    }
                  }}
                  className="w-full h-12 px-4 rounded-2xl border-2 border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-1.5">
                  {isBengali ? 'ঠিকানা / মোকাম' : 'Location / District'}
                </label>
                <input
                  ref={editSuppAddressRef}
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl border-2 border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 shadow-md transition cursor-pointer active:scale-95"
                >
                  {isBengali ? 'আপডেট সংরক্ষণ করুন ✓' : 'Save Changes ✓'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Supplier Confirmation Modal ── */}
      {deletingSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
              <Trash2 size={32} />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              {isBengali ? 'মহাজন খাতা মুছে ফেলতে চান?' : 'Delete Supplier Account?'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              <span className="font-bold text-slate-800">"{deletingSupplier.name}"</span> {isBengali ? 'এর খাতা সম্পূর্ণ মুছে ফেলা হবে।' : 'will be removed.'}
              {((deletingSupplier.balancePoisha || deletingSupplier.currentDuePoisha || 0) > 0) && (
                <span className="block font-bold text-rose-600 mt-1">
                  ⚠️ {isBengali ? 'সতর্কতা: এই মহাজনকে এখনো বাকি দেনা পরিশোধ বাকি রয়েছে:' : 'Warning: Unpaid debt exists:'} {formatCurrency(deletingSupplier.balancePoisha || deletingSupplier.currentDuePoisha || 0, { locale })}
                </span>
              )}
            </p>

            {/* PIN required if not OWNER */}
            {!isOwner && (
              <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left space-y-2">
                <label className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                  <KeyRound size={14} className="text-amber-600" />
                  <span>{isBengali ? 'মালিকের অনুমতি পিন দিন (ম্যানেজার মোড)' : 'Enter Owner PIN (Protected)'}</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={deletePin}
                  onChange={e => {
                    setDeletePin(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="৪ ডিজিট পিন"
                  className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white font-mono text-center font-black tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {deleteError && (
                  <p className="text-[11px] font-bold text-rose-600">{deleteError}</p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setDeletingSupplier(null);
                  setDeletePin('');
                  setDeleteError('');
                }}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                {isBengali ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSupplier}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition cursor-pointer active:scale-95"
              >
                {isBengali ? 'হ্যাঁ, মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Void Transaction Modal ── */}
      {voidConfirmEntry && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-sm">
              <RotateCcw size={32} />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              {isBengali ? 'চালান বা পেমেন্ট বাতিল ও ব্যালেন্স রিভার্স' : 'Void & Reverse Transaction?'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {isBengali ? 'ভাউচার:' : 'Voucher:'} <span className="font-mono font-bold text-slate-800">{voidConfirmEntry.voucherNumber || voidConfirmEntry.billNumber || voidConfirmEntry.id}</span> • {formatCurrency(voidConfirmEntry.amountPoisha || 0, { locale })}
              <span className="block text-slate-600 mt-1">
                {isBengali ? 'এই ভাউচারটি বাতিল হয়ে মহাজনের পূর্ববর্তী দেনা ব্যালেন্স স্বয়ংক্রিয়ভাবে সমন্বয় হবে।' : 'This will rollback the supplier balance and record void audit.'}
              </span>
            </p>

            <div className="mt-4 text-left space-y-3">
              <div>
                <label className="text-[11px] font-black text-slate-700 block mb-1">
                  {isBengali ? 'বাতিলের কারণ' : 'Reason for Voiding'}
                </label>
                <input
                  type="text"
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                  placeholder={isBengali ? 'যেমন: ভুল চালান / ভুল পরিমাণ টাইপ' : 'e.g. Wrong bill / Typo'}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-purple-600"
                />
              </div>

              {!isOwner && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1.5">
                  <label className="text-[11px] font-black text-amber-900 flex items-center gap-1.5">
                    <KeyRound size={13} className="text-amber-600" />
                    <span>{isBengali ? 'মালিকের পিন কোড দিন' : 'Enter Owner PIN'}</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={voidPin}
                    onChange={e => {
                      setVoidPin(e.target.value);
                      setVoidError('');
                    }}
                    placeholder="৪ ডিজিট পিন"
                    className="w-full h-9 px-3 rounded-xl border border-amber-300 bg-white font-mono text-center font-black text-xs"
                  />
                  {voidError && (
                    <p className="text-[10px] font-bold text-rose-600">{voidError}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setVoidConfirmEntry(null);
                  setVoidPin('');
                  setVoidReason('');
                  setVoidError('');
                }}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                {isBengali ? 'ফিরে যান' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="flex-1 h-12 rounded-2xl text-xs sm:text-sm font-black text-white bg-amber-600 hover:bg-amber-700 shadow-md transition cursor-pointer active:scale-95"
              >
                {isBengali ? 'হ্যাঁ, বাতিল করুন' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Print Supplier Statement Modal ── */}
      {isPrintModalOpen && currentStatementSupplier && (
        <PrintSupplierStatementModal
          supplier={currentStatementSupplier}
          summary={supplierSummary}
          transactions={activeStatementTransactions}
          tenant={activeTenant}
          onClose={() => setIsPrintModalOpen(false)}
          isBengali={isBengali}
          locale={locale}
        />
      )}

      {/* ── Payment Modal (Dedicated Chalan Settlement & Wallet Picker) ── */}
      {activePaymentModal && (
        <SupplierPaymentModal
          paymentTarget={activePaymentModal}
          isOpen={true}
          onClose={() => setActivePaymentModal(null)}
          allLedgerEntries={ledgerEntries}
          registers={registers}
          isBengali={isBengali}
          locale={locale}
          onSubmit={({ amountPoisha, description, walletId, refChalanNumber }) => {
            const target = activePaymentModal?.supplier || activePaymentModal;
            if (amountPoisha >= 1000000) {
              setPinModalAction({
                execute: () => handlePaySupplier(amountPoisha, description, walletId, refChalanNumber),
                desc: `${target.name} কে ${formatCurrency(amountPoisha, { locale })} পরিশোধ`,
              });
            } else {
              handlePaySupplier(amountPoisha, description, walletId, refChalanNumber);
            }
          }}
        />
      )}

      {/* ── Purchase Bill Modal ─────────────────────────────────────── */}
      {activePurchaseModal && (
        <PurchaseBillModal
          supplier={activePurchaseModal?.supplier || activePurchaseModal}
          isOpen={true}
          onClose={() => setActivePurchaseModal(null)}
          onSubmit={handlePurchaseSubmit}
          isBengali={isBengali}
        />
      )}

      {/* ── Supplier Return Modal ────────────────────────────────────── */}
      {activeReturnModal && (
        <SupplierReturnModal
          supplier={activeReturnModal?.supplier || activeReturnModal}
          initialChalan={activeReturnModal?.refChalan || ''}
          isOpen={true}
          onClose={() => setActiveReturnModal(null)}
          onSubmit={handleReturnSubmit}
          allLedgerEntries={ledgerEntries}
          isBengali={isBengali}
          locale={locale}
        />
      )}

      {/* ── Owner PIN Verification Modal ────────────────────────────── */}
      {pinModalAction && (
        <OwnerPinModal
          isOpen={true}
          onClose={() => setPinModalAction(null)}
          onSuccess={() => {
            pinModalAction.execute();
            setPinModalAction(null);
          }}
          actionDescription={pinModalAction.desc}
        />
      )}

      {/* ── Add Supplier Modal (Authentic Spacious bKash B2B Dialog) ── */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 flex items-center justify-between text-white shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shadow-inner border border-white/20">
                  <Building2 size={24} className="text-white drop-shadow-sm" />
                </div>
                <div>
                  <h3 className="font-black text-xl tracking-tight leading-tight">
                    {isBengali ? 'নতুন মহাজন / মিল খাতা যুক্ত করুন' : 'Add New Supplier / Mill'}
                  </h3>
                  <p className="text-xs text-purple-200 font-semibold mt-1">
                    {isBengali ? 'পাইকারি আড়ত, মিল ও ডিলারের চালানি দেনা হিসাব' : 'Wholesaler & mill ledger opening'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddSupplierOpen(false)}
                className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/20"
                title="বন্ধ করুন"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="p-8 space-y-5 bg-white">
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  {isBengali ? 'মহাজনের নাম' : 'Supplier Name'} <span className="text-purple-600">*</span>
                </label>
                <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all overflow-hidden shadow-2xs">
                  <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        newSuppCompanyRef.current?.focus();
                      }
                    }}
                    placeholder={isBengali ? 'যেমন: হাজী মোজাম্মেল হক' : 'e.g. Mozammel Hoque'}
                    className="w-full h-full px-4 text-base font-bold bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  {isBengali ? 'কোম্পানি / মিলের নাম' : 'Company / Mill Name'}
                </label>
                <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all overflow-hidden shadow-2xs">
                  <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                    <Building2 size={18} />
                  </div>
                  <input
                    ref={newSuppCompanyRef}
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        newSuppPhoneRef.current?.focus();
                      }
                    }}
                    placeholder={isBengali ? 'যেমন: দিনাজপুর অটো রাইস মিল' : 'e.g. Dinajpur Auto Rice Mill'}
                    className="w-full h-full px-4 text-base font-semibold bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'মোবাইল নম্বর' : 'Phone'}
                  </label>
                  <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all overflow-hidden shadow-2xs">
                    <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                      <Phone size={18} />
                    </div>
                    <input
                      ref={newSuppPhoneRef}
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          newSuppDueRef.current?.focus();
                        }
                      }}
                      placeholder="017XX-XXXXXX"
                      className="w-full h-full px-4 text-base font-semibold bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                    {isBengali ? 'প্রারম্ভিক দেনা (৳)' : 'Opening Debt (৳)'}
                  </label>
                  <div className="flex items-center h-13 rounded-2xl border-2 border-purple-300 bg-purple-50/40 focus-within:bg-white focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all overflow-hidden shadow-2xs">
                    <div className="w-12 h-full flex items-center justify-center bg-purple-100/80 border-r border-purple-200 font-black text-purple-700 text-lg select-none shrink-0">
                      ৳
                    </div>
                    <input
                      ref={newSuppDueRef}
                      type="number"
                      step="any"
                      value={newDueTaka}
                      onChange={(e) => setNewDueTaka(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          newSuppAddressRef.current?.focus();
                        }
                      }}
                      placeholder="0.00"
                      className="w-full h-full px-4 text-lg font-black bg-transparent focus:outline-none text-purple-800 placeholder:text-purple-400 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                  {isBengali ? 'ঠিকানা / মোকাম' : 'Location / District'}
                </label>
                <div className="flex items-center h-13 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all overflow-hidden shadow-2xs">
                  <div className="w-12 h-full flex items-center justify-center bg-slate-100/80 border-r border-slate-200/80 text-slate-400 select-none shrink-0">
                    <MapPin size={18} />
                  </div>
                  <input
                    ref={newSuppAddressRef}
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder={isBengali ? ' যেমন: পুলহাট, দিনাজপুর' : 'e.g. Dinajpur'}
                    className="w-full h-full px-4 text-base font-semibold bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="flex-1 h-13 rounded-2xl text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/80 transition-all cursor-pointer active:scale-95"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-13 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 hover:from-purple-800 hover:to-indigo-900 shadow-lg shadow-purple-900/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Building2 size={18} />
                  <span>{isBengali ? 'মহাজন সংরক্ষণ করুন ✓' : 'Save Supplier ✓'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </RoleAccessGate>
  );
}

// ── Supplier Payment Modal (Dedicated Chalan Settlement & Wallet Picker) ──
function SupplierPaymentModal({
  paymentTarget,
  isOpen,
  onClose,
  onSubmit,
  allLedgerEntries,
  registers,
  isBengali,
  locale,
}) {
  const targetSupplier = paymentTarget?.supplier || paymentTarget;
  if (!isOpen || !targetSupplier) return null;

  const preselectedChalan = paymentTarget?.refChalan || '';
  const initialAmountPoisha = paymentTarget?.defaultAmountPoisha;

  // 1. Calculate all purchase bills and their current settlement status for this supplier
  const supplierEntries = useMemo(() => {
    return (allLedgerEntries || []).filter(e =>
      e.partyId === targetSupplier.id ||
      e.partyName === targetSupplier.name ||
      (e.partyType === 'SUPPLIER' && e.partyName === targetSupplier.name) ||
      (e.title && e.title.includes(targetSupplier.name))
    );
  }, [allLedgerEntries, targetSupplier]);

  const chalans = useMemo(() => {
    const active = supplierEntries.filter(e => !e.isVoided);
    const bills = active.filter(e => ['PURCHASE_BILL', 'CREDIT_PURCHASE', 'BILL', 'GODOWN_INTAKE'].includes(e.type));
    const payments = active.filter(e => ['SUPPLIER_PAYMENT', 'PAYMENT_TO_SUPPLIER'].includes(e.type));
    const returns = active.filter(e => e.type === 'SUPPLIER_RETURN');

    return bills.map(bill => {
      const chalanNo = String(bill.billNumber || bill.voucherNumber || bill.id).trim();
      const linkedPayments = payments.filter(p => {
        if (p.refChalanNumber && p.refChalanNumber === chalanNo) return true;
        if (p.description && p.description.includes(chalanNo)) return true;
        if (p.title && p.title.includes(chalanNo)) return true;
        return false;
      });
      const linkedReturns = returns.filter(r => {
        if (r.refChalanNumber && r.refChalanNumber === chalanNo) return true;
        if (r.description && r.description.includes(chalanNo)) return true;
        if (r.title && r.title.includes(chalanNo)) return true;
        return false;
      });

      const billedPoisha = bill.amountPoisha || 0;
      const paidPoisha = linkedPayments.reduce((sum, p) => sum + (p.amountPoisha || 0), 0);
      const returnedPoisha = linkedReturns.reduce((sum, r) => sum + (r.amountPoisha || 0), 0);
      const duePoisha = Math.max(0, billedPoisha - paidPoisha - returnedPoisha);

      let status = 'UNPAID';
      if (duePoisha === 0) status = 'PAID';
      else if (paidPoisha > 0 || returnedPoisha > 0) status = 'PARTIAL';

      return {
        ...bill,
        chalanNo,
        billedPoisha,
        paidPoisha,
        returnedPoisha,
        duePoisha,
        status,
        date: bill.date || bill.timestamp || bill.createdAt,
        description: bill.description || bill.title || '',
      };
    });
  }, [supplierEntries]);

  const unpaidChalans = useMemo(() => chalans.filter(c => c.duePoisha > 0), [chalans]);
  const currentTotalDuePoisha = targetSupplier.balancePoisha || targetSupplier.currentDuePoisha || 0;

  // Mode: 'CHALAN' | 'GENERAL'
  const [paymentMode, setPaymentMode] = useState(() => {
    if (preselectedChalan) return 'CHALAN';
    if (unpaidChalans.length > 0) return 'CHALAN';
    return 'GENERAL';
  });

  const [selectedChalanNo, setSelectedChalanNo] = useState(() => {
    if (preselectedChalan) return preselectedChalan;
    if (unpaidChalans.length > 0) return unpaidChalans[0].chalanNo;
    return '';
  });

  const currentSelectedChalan = useMemo(() => {
    return chalans.find(c => c.chalanNo === selectedChalanNo);
  }, [chalans, selectedChalanNo]);

  // Initial amount
  const [amountStr, setAmountStr] = useState(() => {
    if (initialAmountPoisha !== undefined && initialAmountPoisha > 0) {
      return poishaToTaka(initialAmountPoisha).toString();
    }
    if (preselectedChalan) {
      const found = chalans.find(c => c.chalanNo === preselectedChalan);
      if (found && found.duePoisha > 0) return poishaToTaka(found.duePoisha).toString();
    }
    if (unpaidChalans.length > 0) {
      return poishaToTaka(unpaidChalans[0].duePoisha).toString();
    }
    if (currentTotalDuePoisha > 0) {
      return poishaToTaka(currentTotalDuePoisha).toString();
    }
    return '';
  });

  const [note, setNote] = useState(() => {
    if (preselectedChalan) return `চালান #${preselectedChalan} পরিশোধ`;
    if (unpaidChalans.length > 0) return `চালান #${unpaidChalans[0].chalanNo} পরিশোধ`;
    return 'দেনা পরিশোধ';
  });

  const [walletId, setWalletId] = useState('cash_drawer');

  const handleSelectChalan = (cNo) => {
    setSelectedChalanNo(cNo);
    const found = chalans.find(c => c.chalanNo === cNo);
    if (found) {
      setAmountStr(poishaToTaka(found.duePoisha).toString());
      setNote(`চালান #${cNo} পরিশোধ`);
    } else {
      setNote('দেনা পরিশোধ');
    }
  };

  const handleCopy = (text, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      toast.success(isBengali ? `চালান নং ${text} কপি হয়েছে!` : `Copied #${text}!`, { icon: '📋' });
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(isBengali ? `চালান নং ${text} কপি হয়েছে!` : `Copied #${text}!`, { icon: '📋' });
    }
  };

  const addQuickAmount = (taka) => {
    const current = Number(amountStr) || 0;
    setAmountStr((current + taka).toString());
  };

  const setExactDueAmount = () => {
    if (paymentMode === 'CHALAN' && currentSelectedChalan) {
      setAmountStr(poishaToTaka(currentSelectedChalan.duePoisha).toString());
    } else {
      setAmountStr(poishaToTaka(currentTotalDuePoisha).toString());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const poisha = parseToPoisha(amountStr);
    if (!poisha || poisha <= 0) {
      toast.error(isBengali ? 'সঠিক পরিশোধের পরিমাণ প্রদান করুন!' : 'Enter valid payment amount!');
      return;
    }
    const finalRefChalan = paymentMode === 'CHALAN' ? selectedChalanNo : '';
    onSubmit({
      amountPoisha: poisha,
      description: note.trim() || (finalRefChalan ? `চালান #${finalRefChalan} পরিশোধ` : 'দেনা পরিশোধ'),
      walletId,
      refChalanNumber: finalRefChalan,
    });
  };

  const walletOptions = [
    { id: 'cash_drawer', labelBn: 'নগদ ক্যাশ বাক্স', labelEn: 'Cash Drawer', icon: '💵' },
    { id: 'bank', labelBn: 'ব্যাংক একাউন্ট', labelEn: 'Bank Account', icon: '🏦' },
    { id: 'mfs', labelBn: 'মোবাইল ব্যাংকিং (বিকাশ/নগদ)', labelEn: 'MFS (bKash/Nagad)', icon: '📱' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 flex items-center justify-between text-white shadow-md shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shadow-inner border border-white/20 shrink-0">
              <ArrowUpRight size={24} className="text-white drop-shadow-sm" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
                {targetSupplier.name} - {isBengali ? 'দেনা পরিশোধ' : 'Payment'}
              </h3>
              <p className="text-xs text-purple-200 font-semibold mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{isBengali ? 'বর্তমান মোট বকেয়া দেনা:' : 'Total Payable Due:'}</span>
                <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                  {formatCurrency(currentTotalDuePoisha, { locale })}
                </span>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/20 shrink-0"
            title="বন্ধ করুন"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 sm:space-y-5 overflow-y-auto flex-1 bg-white">
          {/* Payment Mode Selector Tabs */}
          <div>
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block mb-1.5">
              {isBengali ? 'পরিশোধের ধরণ নির্বাচন করুন' : 'Payment Allocation Mode'}
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('CHALAN');
                  if (!selectedChalanNo && unpaidChalans.length > 0) {
                    handleSelectChalan(unpaidChalans[0].chalanNo);
                  }
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMode === 'CHALAN'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>🎯 {isBengali ? 'নির্দিষ্ট চালান পরিশোধ' : 'Pay Specific Chalan'}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  paymentMode === 'CHALAN' ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {unpaidChalans.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMode('GENERAL');
                  setNote('দেনা পরিশোধ');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  paymentMode === 'GENERAL'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>💵 {isBengali ? 'সাধারণ ব্যালেন্স পরিশোধ' : 'General Balance Payment'}</span>
              </button>
            </div>
          </div>

          {/* Conditional Chalan Selector / Details */}
          {paymentMode === 'CHALAN' && (
            <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-200/80 animate-in fade-in duration-150">
              {chalans.length > 0 ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black text-purple-950 uppercase tracking-wider">
                        {isBengali ? 'ক্রয় চালান নির্বাচন করুন' : 'Select Purchase Chalan'}
                      </label>
                      <span className="text-[11px] text-purple-700 font-bold">
                        {isBengali ? 'বকেয়া চালান স্বয়ংক্রিয়ভাবে ট্র্যাক হবে' : 'Auto-links & reduces bill due'}
                      </span>
                    </div>

                    <select
                      value={selectedChalanNo}
                      onChange={(e) => handleSelectChalan(e.target.value)}
                      className="w-full h-12 text-xs sm:text-sm font-bold px-3.5 rounded-xl border-2 border-purple-300 bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-2xs cursor-pointer text-slate-800"
                    >
                      <option value="">{isBengali ? '-- কোনো নির্দিষ্ট চালান নয় --' : '-- No specific bill --'}</option>
                      {chalans.map(c => (
                        <option key={c.id} value={c.chalanNo}>
                          #{c.chalanNo} — বাকি: ৳{poishaToTaka(c.duePoisha)} (মোট: ৳{poishaToTaka(c.billedPoisha)}) {c.status === 'PAID' ? '✓ পরিশোধিত' : c.status === 'PARTIAL' ? '⚠️ আংশিক বাকি' : '🔴 বাকি'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Selected Chalan Details Pill */}
                  {currentSelectedChalan && (
                    <div className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-purple-950 font-mono">
                            চালান #{currentSelectedChalan.chalanNo}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(currentSelectedChalan.chalanNo, e)}
                            className="p-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            title="চালান নম্বর কপি করুন"
                          >
                            <Copy size={11} />
                            <span>কপি</span>
                          </button>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          currentSelectedChalan.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : currentSelectedChalan.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {currentSelectedChalan.status === 'PAID' ? '✓ সম্পূর্ণ পরিশোধিত' : currentSelectedChalan.status === 'PARTIAL' ? '⚠️ আংশিক বকেয়া' : '🔴 সম্পূর্ণ বকেয়া'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] pt-1 border-t border-slate-100">
                        <div className="p-1.5 bg-slate-50 rounded-lg">
                          <span className="text-slate-400 block text-[9px] font-semibold">{isBengali ? 'মোট বিল' : 'Billed'}</span>
                          <span className="font-bold text-slate-800 font-mono">{formatCurrency(currentSelectedChalan.billedPoisha, { locale })}</span>
                        </div>
                        <div className="p-1.5 bg-emerald-50 rounded-lg">
                          <span className="text-emerald-600 block text-[9px] font-semibold">{isBengali ? 'পরিশোধ' : 'Paid'}</span>
                          <span className="font-bold text-emerald-700 font-mono">{formatCurrency(currentSelectedChalan.paidPoisha, { locale })}</span>
                        </div>
                        <div className="p-1.5 bg-amber-50 rounded-lg">
                          <span className="text-amber-600 block text-[9px] font-semibold">{isBengali ? 'ফেরত' : 'Returned'}</span>
                          <span className="font-bold text-amber-700 font-mono">{formatCurrency(currentSelectedChalan.returnedPoisha, { locale })}</span>
                        </div>
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <span className="text-purple-800 block text-[9px] font-black">{isBengali ? 'দেনা বাকি' : 'Due'}</span>
                          <span className="font-black text-purple-950 font-mono">{formatCurrency(currentSelectedChalan.duePoisha, { locale })}</span>
                        </div>
                      </div>

                      {currentSelectedChalan.duePoisha > 0 && (
                        <button
                          type="button"
                          onClick={() => setAmountStr(poishaToTaka(currentSelectedChalan.duePoisha).toString())}
                          className="w-full py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-black text-xs transition flex items-center justify-center gap-1 cursor-pointer active:scale-98"
                        >
                          <Check size={12} />
                          <span>{isBengali ? `এই চালানের বাকি সম্পূর্ণ দিন (৳${poishaToTaka(currentSelectedChalan.duePoisha)})` : 'Fill exact chalan due'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-2 text-xs text-purple-800 font-medium">
                  {isBengali ? 'ℹ️ এই মহাজনের কোনো পৃথক চালান রেকর্ড নেই। সাধারণ ব্যালেন্স পরিশোধ মোড ব্যবহার করুন।' : 'No bills found for this supplier. Use general balance payment.'}
                </div>
              )}
            </div>
          )}

          {/* Payment Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {isBengali ? 'পরিশোধের পরিমাণ (টাকা)' : 'Payment Amount (BDT)'} <span className="text-purple-600">*</span>
              </label>
              <button
                type="button"
                onClick={setExactDueAmount}
                className="text-xs font-bold text-purple-700 hover:text-purple-900 cursor-pointer underline decoration-dotted"
              >
                {isBengali ? 'বাকি সব টাকা' : 'Exact Due'}
              </button>
            </div>

            <div className="flex items-center h-14 rounded-2xl border-2 border-purple-300 bg-purple-50/40 focus-within:bg-white focus-within:border-purple-600 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all overflow-hidden shadow-2xs">
              <div className="w-12 h-full flex items-center justify-center bg-purple-100/80 border-r border-purple-200 text-purple-800 font-black text-xl select-none shrink-0">
                ৳
              </div>
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full h-full px-4 text-xl sm:text-2xl font-black text-purple-900 bg-transparent focus:outline-none placeholder:text-purple-300 tabular-nums"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1">{isBengali ? 'দ্রুত যোগ:' : 'Quick:'}</span>
              {[500, 1000, 2000, 5000, 10000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addQuickAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 text-xs font-bold transition cursor-pointer active:scale-95 border border-slate-200"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method / Wallet Selector */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              {isBengali ? 'পরিশোধের মাধ্যম (কোন ক্যাশ/ব্যাংক থেকে দেওয়া হচ্ছে)' : 'Payment Source / Wallet'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {walletOptions.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setWalletId(opt.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    walletId === opt.id
                      ? 'border-purple-600 bg-purple-50/80 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <span className="text-lg mb-1">{opt.icon}</span>
                  <span className={`text-xs font-bold block leading-tight ${
                    walletId === opt.id ? 'text-purple-950 font-black' : 'text-slate-700'
                  }`}>
                    {isBengali ? opt.labelBn : opt.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              {isBengali ? 'বিবরণ বা ভাউচার নোট' : 'Note / Remarks'}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isBengali ? 'যেমন: চেক নং বা ক্যাশ পরিশোধ' : 'e.g. Paid in cash'}
              className="w-full h-12 text-xs sm:text-sm font-semibold px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-2xs"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center gap-3.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-13 rounded-2xl text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/80 transition-all cursor-pointer active:scale-95"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 h-13 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-800 shadow-lg shadow-emerald-900/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowUpRight size={18} />
              <span>
                {isBengali ? `💸 ৳${amountStr || '০'} পরিশোধ নিশ্চিত করুন ✓` : `Confirm Pay ৳${amountStr || '0'} ✓`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Purchase Bill Modal Helper (Spacious bKash Dialog with Auto-Generate & Copy) ──
function PurchaseBillModal({ supplier, isOpen, onClose, onSubmit, isBengali }) {
  const [billNumber, setBillNumber] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleAutoGenerateBillNo = () => {
    const gen = `INV-${Date.now().toString().slice(-6)}`;
    setBillNumber(gen);
    toast.success(isBengali ? `চালান নং তৈরি হয়েছে: ${gen}` : `Generated bill #${gen}`, { icon: '🎲' });
  };

  const handleCopyBillNo = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!billNumber) return;
    try {
      navigator.clipboard.writeText(billNumber);
      toast.success(isBengali ? `চালান নং ${billNumber} কপি হয়েছে!` : `Copied #${billNumber}!`, { icon: '📋' });
    } catch {
      const ta = document.createElement('textarea');
      ta.value = billNumber;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(isBengali ? `চালান নং ${billNumber} কপি হয়েছে!` : `Copied #${billNumber}!`, { icon: '📋' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const poisha = parseToPoisha(amountStr);
    if (poisha <= 0) {
      toast.error(isBengali ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Enter a valid amount');
      return;
    }
    onSubmit(poisha, billNumber.trim() || `BILL-${Date.now().toString().slice(-6)}`, note);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="px-8 py-6 bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shadow-inner border border-white/20">
              <FileText size={24} className="text-white drop-shadow-sm" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-tight">
                {isBengali ? `${supplier.name} - নতুন মালের চালান` : `New Purchase Bill: ${supplier.name}`}
              </h3>
              <p className="text-xs text-purple-200 font-semibold mt-1">
                {isBengali ? 'ক্রয় চালান ও বকেয়া দেনা এন্ট্রি' : 'Purchase bill & debt addition'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/20"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {isBengali ? 'চালান / মেমো নম্বর' : 'Invoice / Bill No'}
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAutoGenerateBillNo}
                  className="px-2.5 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="স্বয়ংক্রিয় চালান নম্বর তৈরি করুন"
                >
                  <Sparkles size={11} />
                  <span>{isBengali ? '🎲 অটো তৈরি' : 'Auto'}</span>
                </button>
                {billNumber && (
                  <button
                    type="button"
                    onClick={handleCopyBillNo}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="চালান নম্বর কপি করুন"
                  >
                    <Copy size={11} />
                    <span>{isBengali ? 'কপি' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <input
              type="text"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              placeholder="e.g. INV-9042"
              className="w-full h-13 font-mono text-sm md:text-base font-bold px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              {isBengali ? 'চালানের মোট টাকা (টাকা)' : 'Bill Total (BDT)'} <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center h-13 rounded-2xl border-2 border-rose-300 bg-rose-50/40 focus-within:bg-white focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all overflow-hidden shadow-2xs">
              <div className="w-12 h-full flex items-center justify-center bg-rose-100/80 border-r border-rose-200 text-rose-700 font-black text-lg select-none shrink-0">
                ৳
              </div>
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full h-full px-4 text-lg md:text-xl font-black text-rose-600 bg-transparent focus:outline-none placeholder:text-rose-400 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              {isBengali ? 'বিবরণ বা মালের নাম' : 'Description / Items'}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isBengali ? 'যেমন: ৫০ বস্তা মিনিকেট চাল' : 'e.g. 50 bags Miniket Rice'}
              className="w-full h-13 text-sm md:text-base font-semibold px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition shadow-2xs"
            />
          </div>

          <div className="bg-purple-50/70 p-3 rounded-xl border border-purple-200/60 text-xs text-purple-900 font-medium">
            💡 {isBengali ? 'চালান নম্বরটি সংরক্ষিত থাকবে এবং পরবর্তীতে পরিশোধ বা মাল ফেরতের সময় স্বয়ংক্রিয়ভাবে লিঙ্ক হবে।' : 'Bill number will be preserved and automatically linked during payments & returns.'}
          </div>

          <div className="flex items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-13 rounded-2xl text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/80 transition-all cursor-pointer active:scale-95"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 h-13 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-purple-700 via-indigo-800 to-slate-900 hover:from-purple-800 hover:to-indigo-900 shadow-lg shadow-purple-900/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              <span>{isBengali ? 'চালান যুক্ত করুন ✓' : 'Record Bill ✓'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Goods Return to Wholesaler Modal (Debit Note with Chalan Linking & Copy) ──
function SupplierReturnModal({ supplier, initialChalan = '', isOpen, onClose, onSubmit, allLedgerEntries, isBengali, locale }) {
  const targetSupplier = supplier?.supplier || supplier;
  if (!isOpen || !targetSupplier) return null;

  // 1. Calculate purchase bills for this supplier so user can pick which chalan to return goods against!
  const supplierEntries = useMemo(() => {
    return (allLedgerEntries || []).filter(e =>
      e.partyId === targetSupplier.id ||
      e.partyName === targetSupplier.name ||
      (e.partyType === 'SUPPLIER' && e.partyName === targetSupplier.name) ||
      (e.title && e.title.includes(targetSupplier.name))
    );
  }, [allLedgerEntries, targetSupplier]);

  const chalans = useMemo(() => {
    const active = supplierEntries.filter(e => !e.isVoided);
    const bills = active.filter(e => ['PURCHASE_BILL', 'CREDIT_PURCHASE', 'BILL', 'GODOWN_INTAKE'].includes(e.type));
    return bills.map(bill => {
      const chalanNo = String(bill.billNumber || bill.voucherNumber || bill.id).trim();
      return {
        ...bill,
        chalanNo,
        amountPoisha: bill.amountPoisha || 0,
        date: bill.date || bill.timestamp || bill.createdAt,
        description: bill.description || bill.title || '',
      };
    });
  }, [supplierEntries]);

  const [selectedChalanNo, setSelectedChalanNo] = useState(initialChalan || '');
  const [amountTaka, setAmountTaka] = useState('');
  const [returnChallanNo, setReturnChallanNo] = useState(`RET-${Date.now().toString().slice(-6)}`);
  const [reason, setReason] = useState('মেয়াদোত্তীর্ণ পণ্য');
  const [note, setNote] = useState('');

  const currentDue = targetSupplier.balancePoisha || targetSupplier.currentDuePoisha || 0;
  const selectedChalan = chalans.find(c => c.chalanNo === selectedChalanNo);

  const handleGenerateReturnNo = () => {
    setReturnChallanNo(`RET-${Date.now().toString().slice(-6)}`);
    toast.success(isBengali ? 'নতুন ফেরত চালান নং তৈরি হয়েছে' : 'Generated new return no', { icon: '🎲' });
  };

  const handleCopy = (text, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      toast.success(isBengali ? `চালান নং ${text} কপি হয়েছে!` : `Copied #${text}!`, { icon: '📋' });
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(isBengali ? `চালান নং ${text} কপি হয়েছে!` : `Copied #${text}!`, { icon: '📋' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const poisha = takaToPoisha(amountTaka);
    if (!poisha || poisha <= 0) {
      toast.error(isBengali ? 'সঠিক ফেরত মূল্য প্রদান করুন!' : 'Enter valid return amount!');
      return;
    }
    onSubmit(poisha, returnChallanNo, reason, note, selectedChalanNo);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-amber-700 via-orange-800 to-slate-900 flex items-center justify-between text-white shadow-md shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shadow-inner border border-white/20">
              <RotateCcw size={24} className="text-white drop-shadow-sm" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white leading-tight">
                {targetSupplier.name} - {isBengali ? 'মাল ফেরত (ডেবিট নোট)' : 'Goods Return'}
              </h3>
              <p className="text-xs text-amber-200 font-semibold mt-1">
                {isBengali ? 'মহাজনকে পণ্য ফেরত দিয়ে দেনা হ্রাস করুন' : 'Debit Note Challan for Wholesaler'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer active:scale-90 border border-white/20"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 sm:space-y-5 bg-white overflow-y-auto flex-1">
          {/* Current Supplier Due Ribbon */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex justify-between items-center text-xs">
            <span className="font-bold text-amber-900">
              {isBengali ? 'মহাজনের বর্তমান পাওনা:' : 'Current Payable Due:'}
            </span>
            <span className="font-black text-rose-600 text-sm tabular-nums">
              {formatCurrency(currentDue, { locale })}
            </span>
          </div>

          {/* Original Purchase Bill Selector (Optional & Recommended) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
              {isBengali ? 'মূল ক্রয় চালান নির্বাচন (ঐচ্ছিক)' : 'Original Purchase Chalan (Optional)'}
            </label>
            <select
              value={selectedChalanNo}
              onChange={(e) => setSelectedChalanNo(e.target.value)}
              className="w-full h-12 text-xs sm:text-sm font-bold px-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-600 transition shadow-2xs cursor-pointer text-slate-800"
            >
              <option value="">{isBengali ? '-- কোনো নির্দিষ্ট চালান নয় / সাধারণ ফেরত --' : '-- No specific bill / general return --'}</option>
              {chalans.map(c => (
                <option key={c.id} value={c.chalanNo}>
                  #{c.chalanNo} — মোট বিল: ৳{poishaToTaka(c.amountPoisha)} ({c.description || 'ক্রয় চালান'})
                </option>
              ))}
            </select>

            {/* Selected Chalan Banner with Copy Button */}
            {selectedChalan && (
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/90 text-xs flex items-center justify-between gap-2 mt-1">
                <div>
                  <span className="font-black text-amber-950 font-mono">
                    মূল চালান: #{selectedChalan.chalanNo}
                  </span>
                  <span className="text-slate-500 font-medium ml-2">
                    বিল: ৳{poishaToTaka(selectedChalan.amountPoisha)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleCopy(selectedChalan.chalanNo, e)}
                  className="px-2 py-0.5 rounded-md bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={11} />
                  <span>কপি</span>
                </button>
              </div>
            )}
          </div>

          {/* Return Challan No with Auto-Gen & Copy */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {isBengali ? 'ফেরত চালান নম্বর' : 'Return Challan No'}
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleGenerateReturnNo}
                  className="px-2.5 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  title="নতুন চালান নম্বর তৈরি করুন"
                >
                  <Sparkles size={11} />
                  <span>{isBengali ? '🎲 অটো' : 'Auto'}</span>
                </button>
                {returnChallanNo && (
                  <button
                    type="button"
                    onClick={(e) => handleCopy(returnChallanNo, e)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="কপি করুন"
                  >
                    <Copy size={11} />
                    <span>{isBengali ? 'কপি' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <input
              type="text"
              value={returnChallanNo}
              onChange={(e) => setReturnChallanNo(e.target.value)}
              placeholder="RET-12345"
              className="w-full h-13 font-mono text-sm md:text-base font-bold px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              {isBengali ? 'ফেরতের কারণ' : 'Reason for Return'}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-13 text-sm md:text-base font-bold px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-amber-600 transition shadow-2xs cursor-pointer"
            >
              <option value="মেয়াদোত্তীর্ণ পণ্য">{isBengali ? 'মেয়াদোত্তীর্ণ পণ্য (Expired Items)' : 'Expired Items'}</option>
              <option value="ভাঙ্গা / ক্ষতিগ্রস্ত কার্টন">{isBengali ? 'ভাঙ্গা / ক্ষতিগ্রস্ত কার্টন (Damaged/Broken)' : 'Damaged Goods'}</option>
              <option value="অতিরিক্ত সরবরাহ">{isBengali ? 'অতিরিক্ত সরবরাহ (Over-supplied)' : 'Over-supplied'}</option>
              <option value="ভুল পণ্য ডেলিভারি">{isBengali ? 'ভুল পণ্য ডেলিভারি (Wrong Product)' : 'Wrong Product'}</option>
              <option value="গুণমান নিম্নমানের">{isBengali ? 'গুণমান নিম্নমানের (Sub-standard quality)' : 'Sub-standard'}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              {isBengali ? 'ফেরতকৃত পণ্যের মোট মূল্য (টাকা)' : 'Total Returned Value (৳)'} <span className="text-amber-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">৳</span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                value={amountTaka}
                onChange={(e) => setAmountTaka(e.target.value)}
                placeholder="০.০০"
                className="w-full h-14 pl-10 pr-4 text-xl font-black rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
              {isBengali ? 'ফেরতকৃত পণ্যের বিবরণ / নোট' : 'Returned Items Description'}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isBengali ? 'যেমন: ৫ পাতা নাপা সিরাপ (মেয়াদোত্তীর্ণ)' : 'e.g. 5 pcs syrup expired'}
              className="w-full h-13 text-sm md:text-base font-semibold px-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/10 transition shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-13 rounded-2xl text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/80 transition-all cursor-pointer active:scale-95"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 h-13 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 shadow-lg shadow-orange-700/30 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              <span>{isBengali ? 'ফেরত চালান নিশ্চিত করুন ✓' : 'Confirm Return ✓'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Printable Supplier Statement Modal ──────────────────────────────────
function PrintSupplierStatementModal({ supplier, summary, transactions, tenant, onClose, isBengali, locale }) {
  const currentDuePoisha = summary?.currentDuePoisha ?? (supplier.balancePoisha || supplier.currentDuePoisha || 0);
  const totalBillsPoisha = summary?.totalBillsPoisha ?? transactions
    .filter(t => !t.isVoided && (t.type === 'PURCHASE_BILL' || t.type === 'CREDIT_PURCHASE' || t.type === 'BILL' || t.type === 'GODOWN_INTAKE'))
    .reduce((sum, t) => sum + (t.amountPoisha || 0), 0);
  const totalPaidPoisha = summary?.totalPaidPoisha ?? transactions
    .filter(t => !t.isVoided && (t.type === 'SUPPLIER_PAYMENT' || t.type === 'PAYMENT_TO_SUPPLIER'))
    .reduce((sum, t) => sum + (t.amountPoisha || 0), 0);
  const totalReturnsPoisha = summary?.totalReturnsPoisha ?? transactions
    .filter(t => !t.isVoided && (t.type === 'SUPPLIER_RETURN'))
    .reduce((sum, t) => sum + (t.amountPoisha || 0), 0);
  const openingDuePoisha = summary?.openingDuePoisha ?? 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Control Header (Hidden in Print) */}
        <div className="print:hidden px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-purple-400" />
            <span className="font-black text-sm">
              {isBengali ? 'মহাজন খাতার লেজার বিবরণী প্রিন্ট' : 'Print Wholesaler Ledger Statement'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>{isBengali ? 'প্রিন্ট দিন' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Passbook Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-sm">
          {/* Shop Header */}
          <div className="text-center border-b pb-4 border-slate-200">
            <h2 className="text-2xl font-black text-slate-900">{tenant?.name || 'খাতা এন্টারপ্রাইজ'}</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{tenant?.address || 'বাংলাদেশ'}</p>
            <p className="text-xs text-slate-500 font-mono">মোবাইল: {tenant?.phone || '০১৭XXXXXXXX'}</p>
            <div className="inline-block mt-3 px-4 py-1 rounded-full bg-purple-100 text-purple-900 font-black text-xs">
              {isBengali ? 'পাইকারি মহাজন / মিল পাসবুক ও দেনা বিবরণী' : 'Wholesaler / Mill Passbook Statement'}
            </div>
          </div>

          {/* Supplier Info & Statement Date */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <p className="text-slate-400 font-semibold">{isBengali ? 'মহাজনের নাম:' : 'Supplier Name:'}</p>
              <p className="font-black text-sm text-slate-900">{supplier.name}</p>
              {supplier.company && <p className="font-semibold text-purple-700">🏢 {supplier.company}</p>}
              <p className="text-slate-600 font-mono mt-0.5">{supplier.phone || 'ফোন নম্বর নেই'}</p>
              {supplier.address && <p className="text-slate-500">{supplier.address}</p>}
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-semibold">{isBengali ? 'স্টেটমেন্ট প্রিন্ট তারিখ:' : 'Statement Date:'}</p>
              <p className="font-bold text-slate-900 font-mono">{new Date().toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}</p>
              <p className="text-slate-400 font-semibold mt-2">{isBengali ? 'বর্তমান নিট বাকি দেনা:' : 'Current Due Payable:'}</p>
              <p className="font-black text-xl text-rose-600 tabular-nums">
                {formatCurrency(currentDuePoisha, { locale })}
              </p>
            </div>
          </div>

          {/* 4-Metric Tally Boxes in Printout */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 font-bold block">{isBengali ? 'প্রারম্ভিক দেনা' : 'Opening Due'}</span>
              <span className="font-black text-slate-800">{formatCurrency(openingDuePoisha, { locale })}</span>
            </div>
            <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50">
              <span className="text-[10px] text-rose-700 font-bold block">{isBengali ? 'মোট চালান' : 'Total Bills'}</span>
              <span className="font-black text-rose-700">+{formatCurrency(totalBillsPoisha, { locale })}</span>
            </div>
            <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <span className="text-[10px] text-emerald-700 font-bold block">{isBengali ? 'মোট পরিশোধ' : 'Total Paid'}</span>
              <span className="font-black text-emerald-700">-{formatCurrency(totalPaidPoisha, { locale })}</span>
            </div>
            <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50">
              <span className="text-[10px] text-amber-700 font-bold block">{isBengali ? 'মোট ফেরত' : 'Total Returns'}</span>
              <span className="font-black text-amber-700">-{formatCurrency(totalReturnsPoisha, { locale })}</span>
            </div>
          </div>

          {/* Ledger Table with Running Balance */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-black">
                <tr>
                  <th className="py-2.5 px-3">{isBengali ? 'তারিখ ও সময়' : 'Date'}</th>
                  <th className="py-2.5 px-2">{isBengali ? 'মেমো / ভাউচার' : 'Voucher/Bill'}</th>
                  <th className="py-2.5 px-3">{isBengali ? 'বিবরণ ও মাধ্যম' : 'Description'}</th>
                  <th className="py-2.5 px-3 text-right">{isBengali ? 'চালান বিল (+)' : 'Bill (+)'}</th>
                  <th className="py-2.5 px-3 text-right">{isBengali ? 'পরিশোধ / ফেরত (-)' : 'Paid/Return (-)'}</th>
                  <th className="py-2.5 px-3 text-right bg-slate-200/50">{isBengali ? 'চলতি দেনা (জের)' : 'Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">কোনো লেনদেনের রেকর্ড নেই</td>
                  </tr>
                ) : (
                  transactions.map((tx, idx) => {
                    const isPayment = tx.type === 'SUPPLIER_PAYMENT' || tx.type === 'PAYMENT_TO_SUPPLIER';
                    const isReturn = tx.type === 'SUPPLIER_RETURN';
                    const isOpening = tx.type === 'SUPPLIER_OPENING_BALANCE';
                    const isBill = !isPayment && !isReturn && !isOpening;
                    const isVoid = tx.isVoided;
                    return (
                      <tr key={idx} className={isVoid ? 'bg-rose-50/30 line-through text-slate-400' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                          {new Date(tx.timestamp || tx.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')}
                          <span className="block text-[10px] text-slate-400">
                            {new Date(tx.timestamp || tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-mono font-bold">
                          {tx.billNumber || tx.returnChallanNo || tx.voucherNumber || tx.id}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          {isOpening ? (
                            <span className="font-bold text-purple-700">📌 {isBengali ? 'প্রারম্ভিক বকেয়া দেনা' : 'Opening Debt'}</span>
                          ) : isReturn ? (
                            <span className="text-amber-700 font-bold">
                              🔄 মাল ফেরত {tx.reason ? `(${tx.reason})` : ''}
                            </span>
                          ) : isPayment ? (
                            <span className="text-emerald-700 font-bold">
                              💸 টাকা পরিশোধ ({tx.walletName || 'ক্যাশ'})
                            </span>
                          ) : (
                            <span className="text-rose-700 font-bold">
                              🛍️ ক্রয় চালান ({tx.description || 'বাকি ক্রয়'})
                            </span>
                          )}
                          {isVoid && <span className="text-rose-600 font-black"> (বাতিলকৃত)</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black tabular-nums text-rose-600 whitespace-nowrap">
                          {(isBill || isOpening) ? formatCurrency(tx.amountPoisha || 0, { locale }) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black tabular-nums whitespace-nowrap">
                          {isPayment && (
                            <span className="text-emerald-700">-{formatCurrency(tx.amountPoisha || 0, { locale })}</span>
                          )}
                          {isReturn && (
                            <span className="text-amber-600">(-{formatCurrency(tx.amountPoisha || 0, { locale })})</span>
                          )}
                          {!isPayment && !isReturn && '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black tabular-nums whitespace-nowrap bg-slate-50 font-mono text-slate-900">
                          {formatCurrency(tx.runningDuePoisha !== undefined ? tx.runningDuePoisha : currentDuePoisha, { locale })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black text-slate-900">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3">সর্বমোট সক্রিয় লেনদেন:</td>
                  <td className="py-2.5 px-3 text-right text-rose-600 tabular-nums font-mono">
                    +{formatCurrency(totalBillsPoisha, { locale })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 tabular-nums font-mono">
                    -{formatCurrency(totalPaidPoisha + totalReturnsPoisha, { locale })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-purple-900 tabular-nums font-mono bg-purple-100/50">
                    {formatCurrency(currentDuePoisha, { locale })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signature Lines */}
          <div className="pt-8 flex justify-between text-xs text-slate-500 border-t border-slate-200">
            <div className="text-center w-40">
              <div className="border-b border-slate-300 pb-1 mb-1"></div>
              <span>মহাজন / মিল প্রতিনিধির স্বাক্ষর</span>
            </div>
            <div className="text-center w-40">
              <div className="border-b border-slate-300 pb-1 mb-1"></div>
              <span>দোকান মালিক / ক্যাশিয়ার</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
