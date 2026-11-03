import React from 'react';
import { MobileAppProvider, useMobileApp } from './context/MobileAppContext';
import DeviceFrame from './components/DeviceFrame';
import Header from './components/Header';
import TallyKhataQuickBar from './components/TallyKhataQuickBar';
import ActionGrid from './components/ActionGrid';
import RecentContacts from './components/RecentContacts';
import BentoServices from './components/BentoServices';
import BottomNav from './components/BottomNav';
import CelebrationOverlay from './components/CelebrationOverlay';

// Dedicated Enterprise Full Pages
import PageQuickSale from './pages/PageQuickSale';
import PageCustomerKhata from './pages/PageCustomerKhata';
import PageCustomerDetails from './pages/PageCustomerDetails';
import PageSupplierKhata from './pages/PageSupplierKhata';
import PageCashbox from './pages/PageCashbox';
import PageAddMoney from './pages/PageAddMoney';
import PageExpense from './pages/PageExpense';
import PageInventory from './pages/PageInventory';
import PageSoundbox from './pages/PageSoundbox';
import PageQRHub from './pages/PageQRHub';
import PageReceipt from './pages/PageReceipt';
import PageHalkhata from './pages/PageHalkhata';
import PageMushakTax from './pages/PageMushakTax';
import PageCrates from './pages/PageCrates';
import PageBagCalc from './pages/PageBagCalc';
import PageChequeRegister from './pages/PageChequeRegister';
import PagePnLReport from './pages/PagePnLReport';
import PageGodownKhata from './pages/PageGodownKhata';
import PageSystemHistory from './pages/PageSystemHistory';
import PageCustomerDirectory from './pages/PageCustomerDirectory';

// Root Navigation Tabs
import StatementTab from './components/StatementTab';
import InboxTab from './components/InboxTab';
import SettingsTab from './components/SettingsTab';

import './ledgerx_mobile.css';

function MainScreenRouter() {
  const { currentScreen, activeTab } = useMobileApp();

  // 1. Root Home Screen (switches between Home, Statement, Inbox, Settings)
  if (currentScreen === 'home') {
    if (activeTab === 'statement') return <StatementTab />;
    if (activeTab === 'inbox') return <InboxTab />;
    if (activeTab === 'settings') return <SettingsTab />;

    return (
      <>
        <Header />
        <TallyKhataQuickBar />
        <ActionGrid />
        <RecentContacts />
        <BentoServices />
      </>
    );
  }

  // 2. Dedicated Full Subpages with Back Header & Complete Logic
  switch (currentScreen) {
    case 'quick-sale':
    case 'quickSale':
      return <PageQuickSale />;

    case 'customer-khata':
    case 'customerKhata':
      return <PageCustomerKhata />;

    case 'customer-details':
    case 'customerAction':
      return <PageCustomerDetails />;

    case 'supplier-khata':
    case 'supplierKhata':
      return <PageSupplierKhata />;

    case 'cashbox':
      return <PageCashbox />;

    case 'add-money':
    case 'addMoney':
      return <PageAddMoney />;

    case 'expense':
      return <PageExpense />;

    case 'inventory':
      return <PageInventory />;

    case 'soundbox':
      return <PageSoundbox />;

    case 'qr-hub':
    case 'qr':
    case 'qrHub':
      return <PageQRHub />;

    case 'receipt':
      return <PageReceipt />;

    case 'halkhata':
      return <PageHalkhata />;

    case 'mushak-tax':
    case 'mushak':
      return <PageMushakTax />;

    case 'crates':
      return <PageCrates />;

    case 'bag-calc':
    case 'bagCalc':
      return <PageBagCalc />;

    case 'cheque-register':
    case 'cheques':
      return <PageChequeRegister />;

    case 'pnl-report':
    case 'pnl':
    case 'reports':
      return <PagePnLReport />;

    case 'godown':
    case 'godown-khata':
      return <PageGodownKhata />;

    case 'customer-directory':
    case 'crm':
      return <PageCustomerDirectory />;

    case 'system-history':
    case 'history':
      return <PageSystemHistory />;

    case 'statement':
      return <StatementTab />;

    case 'inbox':
      return <InboxTab />;

    case 'settings':
      return <SettingsTab />;

    default:
      return (
        <>
          <Header />
          <TallyKhataQuickBar />
          <ActionGrid />
          <RecentContacts />
          <BentoServices />
        </>
      );
  }
}

function MainAppShell() {
  const {
    currentScreen,
    celebrationState,
    dismissCelebration,
    language,
  } = useMobileApp();

  // BottomNav is strictly for root tabs (Home, Statement, Inbox, Settings)
  // Dedicated subpages have their own full viewport with back button and specific action bars
  const isRootTab =
    currentScreen === 'home' ||
    currentScreen === 'statement' ||
    currentScreen === 'inbox' ||
    currentScreen === 'settings';

  return (
    <DeviceFrame isRootTab={isRootTab} bottomNav={isRootTab ? <BottomNav /> : null}>
      <MainScreenRouter />
      <CelebrationOverlay
        isOpen={Boolean(celebrationState?.isOpen)}
        onClose={dismissCelebration}
        type={celebrationState?.type || 'sale'}
        titleBn={celebrationState?.titleBn}
        titleEn={celebrationState?.titleEn}
        subtitleBn={celebrationState?.subtitleBn}
        subtitleEn={celebrationState?.subtitleEn}
        amount={celebrationState?.amount || 0}
        partyName={celebrationState?.partyName}
        partyPhone={celebrationState?.partyPhone}
        invoiceNo={celebrationState?.invoiceNo}
        onViewReceipt={celebrationState?.onViewReceipt}
        isBn={language === 'bn'}
      />
    </DeviceFrame>
  );
}

export default function LedgerXMobileApp() {
  return (
    <MobileAppProvider>
      <MainAppShell />
    </MobileAppProvider>
  );
}
