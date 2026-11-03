import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTenant, ROLES, ROLE_CONFIGS } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { 
  ShieldCheck, 
  Crown, 
  Briefcase, 
  UserCheck, 
  Lock, 
  X, 
  Check, 
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoleSwitcherModal({ isOpen, onClose, initialRole }) {
  const { userRole, switchRoleWithPin, isOwner, activeTenant, updateActiveTenant } = useTenant();
  const { isBengali } = useLocale();

  const [selectedRole, setSelectedRole] = useState(initialRole || (userRole === ROLES.OWNER ? ROLES.OWNER : ROLES.OWNER));
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole || (userRole !== ROLES.OWNER ? ROLES.OWNER : userRole));
      setPin('');
      setPinError('');
      setIsChangingPin(false);
    }
  }, [isOpen, initialRole, userRole]);

  if (!isOpen) return null;

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    setPin('');
    setPinError('');

    if (roleKey !== ROLES.OWNER) {
      // Switching to Manager or Cashier does not require PIN
      const res = switchRoleWithPin(roleKey);
      if (res.success) {
        toast.success(res.message, { icon: '👔' });
        onClose();
      }
    }
  };

  const handleConfirmOwnerElevation = (e) => {
    e.preventDefault();
    if (!pin) {
      setPinError(isBengali ? 'দয়া করে ৪ ডিজিটের পিন কোড দিন' : 'Please enter 4-digit PIN');
      return;
    }

    const res = switchRoleWithPin(ROLES.OWNER, pin);
    if (res.success) {
      toast.success(res.message, { icon: '👑' });
      onClose();
    } else {
      setPinError(res.message);
      setPin('');
    }
  };

  const handleChangeOwnerPin = (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      toast.error(isBengali ? 'পিন কমপক্ষে ৪ ডিজিটের হতে হবে!' : 'PIN must be at least 4 digits!');
      return;
    }
    if (newPin !== confirmNewPin) {
      toast.error(isBengali ? 'দুটো পিন নম্বর মিলছে না!' : 'PIN numbers do not match!');
      return;
    }

    updateActiveTenant({ ownerPin: newPin });
    toast.success(isBengali ? 'মালিকের নতুন পিন কোড সফলভাবে সংরক্ষিত হয়েছে!' : 'Owner PIN updated successfully!', { icon: '🔐' });
    setIsChangingPin(false);
    setNewPin('');
    setConfirmNewPin('');
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[88vh] my-auto flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {isBengali ? 'ব্যবহারকারী ভূমিকা ও নিরাপত্তা (RBAC)' : 'User Role & Shop Security'}
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {isBengali ? 'ম্যানেজার ও ক্যাশিয়ারের জন্য এক্সেস নিয়ন্ত্রণ' : 'Role-based access control for staff'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Active Status Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {isBengali ? 'বর্তমান সক্রিয় ভূমিকা' : 'Current Active Role'}
              </span>
              <span className="text-sm font-black text-slate-900 flex items-center gap-2 mt-0.5">
                {userRole === ROLES.OWNER && <Crown size={18} className="text-amber-500" />}
                {userRole === ROLES.MANAGER && <Briefcase size={18} className="text-blue-500" />}
                {userRole === ROLES.CASHIER && <UserCheck size={18} className="text-emerald-500" />}
                <span>{ROLE_CONFIGS[userRole]?.nameBn || userRole}</span>
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              PIN: {activeTenant?.ownerPin ? '••••' : '1234'}
            </span>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider block">
              {isBengali ? 'ভূমিকা নির্বাচন করুন' : 'Select Operational Role'}
            </label>

            {/* 1. Owner */}
            <div
              onClick={() => handleSelectRole(ROLES.OWNER)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                selectedRole === ROLES.OWNER
                  ? 'border-amber-400 bg-amber-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 mt-0.5 border border-amber-300">
                  <Crown size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-slate-900">
                      {ROLE_CONFIGS.OWNER.nameBn}
                    </h4>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                      Full Access
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {ROLE_CONFIGS.OWNER.descriptionBn}
                  </p>
                </div>
              </div>
              {userRole === ROLES.OWNER && (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check size={14} />
                </div>
              )}
            </div>

            {/* 2. Manager */}
            <div
              onClick={() => handleSelectRole(ROLES.MANAGER)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                selectedRole === ROLES.MANAGER
                  ? 'border-blue-400 bg-blue-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0 mt-0.5 border border-blue-300">
                  <Briefcase size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-slate-900">
                      {ROLE_CONFIGS.MANAGER.nameBn}
                    </h4>
                    <span className="text-[10px] bg-blue-200 text-blue-900 font-extrabold px-2 py-0.5 rounded-full">
                      Protected
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {ROLE_CONFIGS.MANAGER.descriptionBn}
                  </p>
                </div>
              </div>
              {userRole === ROLES.MANAGER && (
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check size={14} />
                </div>
              )}
            </div>

            {/* 3. Cashier */}
            <div
              onClick={() => handleSelectRole(ROLES.CASHIER)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                selectedRole === ROLES.CASHIER
                  ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 mt-0.5 border border-emerald-300">
                  <UserCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm text-slate-900">
                      {ROLE_CONFIGS.CASHIER.nameBn}
                    </h4>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                      POS Only
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {ROLE_CONFIGS.CASHIER.descriptionBn}
                  </p>
                </div>
              </div>
              {userRole === ROLES.CASHIER && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check size={14} />
                </div>
              )}
            </div>
          </div>

          {/* PIN Verification Section if trying to switch to OWNER */}
          {selectedRole === ROLES.OWNER && userRole !== ROLES.OWNER && (
            <form onSubmit={handleConfirmOwnerElevation} className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Lock size={16} className="text-amber-600 shrink-0" />
                <span>{isBengali ? 'মালিক মোড আনলক করতে পিন কোড দিন (ডিফল্ট: 1234)' : 'Enter Owner PIN to unlock admin mode (Default: 1234)'}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setPinError('');
                  }}
                  placeholder="৪ ডিজিট পিন"
                  className="flex-1 h-11 px-4 rounded-xl border border-amber-300 bg-white font-mono text-center text-lg font-black tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs md:text-sm shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {isBengali ? 'আনলক করুন' : 'Unlock'}
                </button>
              </div>
              {pinError && (
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <AlertCircle size={13} />
                  <span>{pinError}</span>
                </p>
              )}
            </form>
          )}

          {/* Change Owner PIN Collapsible (Available to Owner) */}
          {isOwner && (
            <div className="pt-2 border-t border-slate-100">
              {!isChangingPin ? (
                <button
                  type="button"
                  onClick={() => setIsChangingPin(true)}
                  className="text-xs font-bold text-slate-600 hover:text-[#E2136E] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <KeyRound size={15} />
                  <span>{isBengali ? 'মালিকের পিন কোড পরিবর্তন করুন' : 'Change Owner Security PIN'}</span>
                </button>
              ) : (
                <form onSubmit={handleChangeOwnerPin} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">{isBengali ? 'নতুন পিন কোড সেট করুন' : 'Set New PIN'}</span>
                    <button
                      type="button"
                      onClick={() => setIsChangingPin(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      {isBengali ? 'বাতিল' : 'Cancel'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="নতুন পিন (যেমন: 5678)"
                      className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-mono text-center font-bold focus:outline-none focus:border-[#E2136E]"
                    />
                    <input
                      type="password"
                      maxLength={6}
                      value={confirmNewPin}
                      onChange={(e) => setConfirmNewPin(e.target.value)}
                      placeholder="পুনরায় নতুন পিন"
                      className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-mono text-center font-bold focus:outline-none focus:border-[#E2136E]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                  >
                    {isBengali ? 'নতুন পিন সংরক্ষণ করুন' : 'Save New PIN'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{isBengali ? 'ম্যানেজার মোডে গোপন লাভ ও ডিলিট নিষ্ক্রিয় থাকে' : 'Manager mode protects profit & deletes'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition cursor-pointer"
          >
            {isBengali ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
