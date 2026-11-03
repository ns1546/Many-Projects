import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '../../context/LocaleContext';
import { useTenant } from '../../context/TenantContext';
import { openWhatsAppDirect } from '../../utils/whatsapp';
import {
  X,
  Glasses,
  User,
  Phone,
  MapPin,
  Calendar,
  Save,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Eye,
  Send,
  Stethoscope
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddCustomerWithOpticsModal({
  isOpen,
  onClose,
  onSaveCustomer, // (newCustomer) => void
  initialName = '',
  initialPhone = '',
}) {
  const { isBengali } = useLocale();
  const { activeTenant } = useTenant();

  const isOpticsStore = activeTenant?.businessType === 'OPTICS';

  // Customer Core Contact Fields (Zero fake data)
  const [name, setName] = useState(initialName || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Optical Prescription is completely OPTIONAL and COLLAPSED by default
  const [includePrescription, setIncludePrescription] = useState(false);

  // Optical Rx Fields (Strictly empty defaults, NO fake presets)
  const [doctorName, setDoctorName] = useState('');
  const [rxDate, setRxDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pd, setPd] = useState('');
  const [lensType, setLensType] = useState('');
  const [frameModel, setFrameModel] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [sendWhatsAppOnSave, setSendWhatsAppOnSave] = useState(false);

  // Right Eye (OD)
  const [odSph, setOdSph] = useState('');
  const [odCyl, setOdCyl] = useState('');
  const [odAxis, setOdAxis] = useState('');
  const [odAdd, setOdAdd] = useState('');

  // Left Eye (OS)
  const [osSph, setOsSph] = useState('');
  const [osCyl, setOsCyl] = useState('');
  const [osAxis, setOsAxis] = useState('');
  const [osAdd, setOsAdd] = useState('');

  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName || '');
      setPhone(initialPhone || '');
      setAddress('');
      setNotes('');
      setIncludePrescription(false);
      setDoctorName('');
      setRxDate(new Date().toISOString().slice(0, 10));
      setPd('');
      setLensType('');
      setFrameModel('');
      setDeliveryNote('');
      setSendWhatsAppOnSave(false);
      setOdSph('');
      setOdCyl('');
      setOdAxis('');
      setOdAdd('');
      setOsSph('');
      setOsCyl('');
      setOsAxis('');
      setOsAdd('');
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialName, initialPhone]);

  if (!isOpen) return null;

  // Copy OD to OS for convenience
  const handleCopyOdToOs = () => {
    setOsSph(odSph);
    setOsCyl(odCyl);
    setOsAxis(odAxis);
    setOsAdd(odAdd);
    toast.success(isBengali ? 'ডান চোখের পাওয়ার বাম চোখে কপি করা হয়েছে' : 'Copied OD power to OS', {
      icon: '⚡',
      duration: 1500,
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.error(isBengali ? 'দয়া করে কাস্টমারের নাম লিখুন' : 'Customer name is required');
      nameInputRef.current?.focus();
      return;
    }

    // Build Prescription Object ONLY if includePrescription is enabled and has actual content
    let prescriptionData = null;
    const hasAnyRxContent = Boolean(
      odSph || odCyl || odAxis || odAdd || osSph || osCyl || osAxis || osAdd || pd || lensType || frameModel || doctorName
    );

    if (isOpticsStore && includePrescription && hasAnyRxContent) {
      prescriptionData = {
        doctorName: doctorName.trim(),
        rxDate: rxDate || new Date().toISOString().slice(0, 10),
        pd: pd.trim(),
        lensType: lensType.trim(),
        frameModel: frameModel.trim(),
        deliveryNote: deliveryNote.trim(),
        notes: notes.trim(),
        rightEye: {
          sph: odSph.trim(),
          cyl: odCyl.trim(),
          axis: odAxis.trim(),
          add: odAdd.trim(),
        },
        leftEye: {
          sph: osSph.trim(),
          cyl: osCyl.trim(),
          axis: osAxis.trim(),
          add: osAdd.trim(),
        },
      };
    }

    const customerPayload = {
      name: trimmedName,
      phone: trimmedPhone,
      address: address.trim(),
      prescription: prescriptionData,
      prescriptionDate: prescriptionData ? (rxDate || new Date().toISOString().slice(0, 10)) : null,
      notes: notes.trim(),
    };

    if (onSaveCustomer) {
      onSaveCustomer(customerPayload);

      // WhatsApp delivery if requested, optical data exists, and phone number is present
      if (sendWhatsAppOnSave && prescriptionData && trimmedPhone) {
        setTimeout(() => {
          const shopName = activeTenant?.name || '';
          const msg = `👓 *${shopName}*
*চশমার পাওয়ার মেমো*
--------------------------------
👤 গ্রাহক: *${trimmedName}*
📞 মোবাইল: ${trimmedPhone}
${doctorName ? `👨‍⚕️ পরীক্ষক: ${doctorName}\n` : ''}📅 তারিখ: ${rxDate}

*চোখের পাওয়ার বিবরণী (OD / OS):*
👁️ *ডান চোখ (OD):* SPH: ${odSph || 'N/A'} | CYL: ${odCyl || 'N/A'} | AXIS: ${odAxis || 'N/A'} | ADD: ${odAdd || 'N/A'}
👁️ *বাম চোখ (OS):* SPH: ${osSph || 'N/A'} | CYL: ${osCyl || 'N/A'} | AXIS: ${osAxis || 'N/A'} | ADD: ${osAdd || 'N/A'}
${pd ? `🎯 PD: ${pd}\n` : ''}${lensType ? `🔍 লেন্স: ${lensType}\n` : ''}${frameModel ? `👓 ফ্রেম: ${frameModel}\n` : ''}${deliveryNote ? `🕒 ডেলিভারি: ${deliveryNote}\n` : ''}
🏢 ${activeTenant?.address || ''} | 📞 ${activeTenant?.phone || ''}`;
          openWhatsAppDirect(trimmedPhone, msg);
        }, 400);
      }
    }

    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <User size={18} className="text-slate-300" />
            <div>
              <h3 className="text-sm font-bold leading-tight">
                {isBengali ? 'নতুন কাস্টমার যোগ করুন' : 'Add New Customer'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">
                {activeTenant?.name || (isBengali ? 'সেলস কাউন্টার' : 'Sales Counter')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="বন্ধ করুন (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1 custom-scrollbar text-xs">
          
          {/* Customer Core Contact Info */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBengali ? 'কাস্টমারের নাম' : 'Customer Name'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={nameInputRef}
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isBengali ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-slate-400 font-normal">({isBengali ? 'ঐচ্ছিক' : 'Optional'})</span>
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono font-semibold focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBengali ? 'ঠিকানা' : 'Address'} <span className="text-slate-400 font-normal">({isBengali ? 'ঐচ্ছিক' : 'Optional'})</span>
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={isBengali ? 'যেমন: ধানমন্ডি, ঢাকা' : 'e.g. Dhanmondi, Dhaka'}
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Optical Prescription Section (ONLY for Optics Store, OPTIONAL & COLLAPSED by default) ── */}
          {isOpticsStore && (
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIncludePrescription(!includePrescription)}
                className={`w-full p-3 rounded-xl border transition flex items-center justify-between text-left cursor-pointer ${
                  includePrescription
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Glasses size={16} className={includePrescription ? 'text-slate-900' : 'text-slate-500'} />
                  <div>
                    <span className="font-bold text-xs block">
                      {isBengali ? 'চশমার পাওয়ার প্রেসক্রিপশন যোগ করতে চান?' : 'Add Optical Prescription (Power)?'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      {isBengali ? '(ঐচ্ছিক — পাওয়ার না থাকলে এটি খোলার প্রয়োজন নেই)' : '(Optional — leave closed for normal retail sales)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    includePrescription ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {includePrescription ? (isBengali ? 'খোলা আছে' : 'Active') : (isBengali ? '+ যোগ করুন' : '+ Expand')}
                  </span>
                  {includePrescription ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </button>

              {/* Collapsible Optical Fields (No fake defaults) */}
              {includePrescription && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  
                  {/* Doctor & Date Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {isBengali ? 'অপটোমেট্রিস্ট / চক্ষু ডাক্তারের নাম' : 'Doctor / Optometrist'}
                      </label>
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        placeholder={isBengali ? 'যেমন: ডা: রফিক' : 'e.g. Dr. Rafiq'}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        {isBengali ? 'প্রেসক্রিপশনের তারিখ' : 'Prescription Date'}
                      </label>
                      <input
                        type="date"
                        value={rxDate}
                        onChange={(e) => setRxDate(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  {/* Eye Power Matrix (OD & OS) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                        <Eye size={13} className="text-slate-700" />
                        <span>{isBengali ? 'চোখের পাওয়ার বিবরণী (OD ও OS)' : 'Refraction Power'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyOdToOs}
                        className="text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        title="ডান চোখের পাওয়ার বাম চোখে কপি করুন"
                      >
                        <Copy size={10} />
                        <span>{isBengali ? 'উভয় চোখ একই (OD → OS)' : 'Sync OD → OS'}</span>
                      </button>
                    </div>

                    {/* Right Eye (OD) */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-800 block">
                        👁️ {isBengali ? 'ডান চোখ (Right Eye - OD)' : 'Right Eye (OD)'}
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">SPH</label>
                          <input
                            type="text"
                            value={odSph}
                            onChange={(e) => setOdSph(e.target.value)}
                            placeholder="-0.00"
                            className="w-full h-7 px-1.5 text-center text-xs font-mono font-bold rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">CYL</label>
                          <input
                            type="text"
                            value={odCyl}
                            onChange={(e) => setOdCyl(e.target.value)}
                            placeholder="-0.00"
                            className="w-full h-7 px-1.5 text-center text-xs font-mono font-bold rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">AXIS</label>
                          <input
                            type="text"
                            value={odAxis}
                            onChange={(e) => setOdAxis(e.target.value)}
                            placeholder="90°"
                            className="w-full h-7 px-1.5 text-center text-xs font-mono font-bold rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">ADD</label>
                          <input
                            type="text"
                            value={odAdd}
                            onChange={(e) => setOdAdd(e.target.value)}
                            placeholder="+0.00"
                            className="w-full h-7 px-1.5 text-center text-xs font-mono font-bold rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Left Eye (OS) */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-800 block">
                        👁️ {isBengali ? 'বাম চোখ (Left Eye - OS)' : 'Left Eye (OS)'}
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">SPH</label>
                          <input
                            type="text"
                            value={osSph}
                            onChange={(e) => setOsSph(e.target.value)}
                            placeholder="-0.00"
                            className="w-full h-7 px-1.5 text-center text-xs font-mono font-bold rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">CYL</label>
                          <input
                            type="text"
                            value={osCyl}
                            onChange={(e) => setOsCyl(e.target.value)}
                            placeholder="-0.00"
                            className="w-full h-7 px-1.5 text-center text-xs font-mono font-bold rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">AXIS</label>
                          <input
                            type="text"
                            value={osAxis}
                            onChange={(e) => setOsAxis(e.target.value)}
                            placeholder="85°"
                            className="w-full h-7 px-1.5 text-center text-xs font-mono font-bold rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">ADD</label>
                          <input
                            type="text"
                            value={osAdd}
                            onChange={(e) => setOsAdd(e.target.value)}
                            placeholder="+0.00"
                            className="w-full h-7 px-1.5 text-center text-xs font-mono font-bold rounded border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PD, Lens Type, Frame Model */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold block mb-0.5">PD (মিমি)</label>
                      <input
                        type="text"
                        value={pd}
                        onChange={(e) => setPd(e.target.value)}
                        placeholder="e.g. 63 mm"
                        className="w-full h-8 px-2 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold block mb-0.5">লেন্সের ধরণ</label>
                      <input
                        type="text"
                        value={lensType}
                        onChange={(e) => setLensType(e.target.value)}
                        placeholder="যেমন: ব্লু কাট"
                        className="w-full h-8 px-2 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 font-bold block mb-0.5">ফ্রেম মডেল</label>
                      <input
                        type="text"
                        value={frameModel}
                        onChange={(e) => setFrameModel(e.target.value)}
                        placeholder="যেমন: রিমলেস"
                        className="w-full h-8 px-2 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:border-slate-800"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Opt-in */}
                  {phone && (
                    <label className="flex items-center gap-2 pt-1 text-slate-700 cursor-pointer text-[11px] font-semibold">
                      <input
                        type="checkbox"
                        checked={sendWhatsAppOnSave}
                        onChange={(e) => setSendWhatsAppOnSave(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span>{isBengali ? 'গ্রাহকের হোয়াটসঅ্যাপে পাওয়ার মেমো পাঠাতে চান?' : 'Send Power Memo via WhatsApp on save?'}</span>
                    </label>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Save size={14} />
              <span>{isBengali ? 'কাস্টমার সংরক্ষণ করুন' : 'Save Customer'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
