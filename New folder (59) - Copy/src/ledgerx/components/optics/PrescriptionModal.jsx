import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '../../context/LocaleContext';
import { useTenant } from '../../context/TenantContext';
import { openWhatsAppDirect } from '../../utils/whatsapp';
import {
  X,
  Glasses,
  Printer,
  MessageCircle,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Save,
  AlertTriangle,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PrescriptionModal({
  isOpen,
  onClose,
  customer,
  onSavePrescription,
}) {
  const { isBengali } = useLocale();
  const { activeTenant } = useTenant();

  const rx = customer?.prescription || {};

  const [isEditing, setIsEditing] = useState(!customer?.prescription);
  const [doctorName, setDoctorName] = useState(rx.doctorName || '');
  const [rxDate, setRxDate] = useState(rx.rxDate || '');
  const [pd, setPd] = useState(rx.pd || '');
  const [lensType, setLensType] = useState(rx.lensType || '');
  const [frameModel, setFrameModel] = useState(rx.frameModel || '');
  const [notes, setNotes] = useState(rx.notes || '');

  // Eye Power Matrix
  const [odSph, setOdSph] = useState(rx.rightEye?.sph || '');
  const [odCyl, setOdCyl] = useState(rx.rightEye?.cyl || '');
  const [odAxis, setOdAxis] = useState(rx.rightEye?.axis || '');
  const [odAdd, setOdAdd] = useState(rx.rightEye?.add || '');

  const [osSph, setOsSph] = useState(rx.leftEye?.sph || '');
  const [osCyl, setOsCyl] = useState(rx.leftEye?.cyl || '');
  const [osAxis, setOsAxis] = useState(rx.leftEye?.axis || '');
  const [osAdd, setOsAdd] = useState(rx.leftEye?.add || '');

  if (!isOpen || !customer) return null;

  // Check 6-month status
  const isSixMonthsOld = customer.needsFollowUp || Boolean(customer.prescriptionDate && (Date.now() - new Date(customer.prescriptionDate).getTime() > 180 * 24 * 60 * 60 * 1000));

  const handleSave = (e) => {
    e?.preventDefault();
    const updatedRx = {
      doctorName: doctorName.trim(),
      rxDate: rxDate.trim(),
      pd: pd.trim(),
      lensType: lensType.trim(),
      frameModel: frameModel.trim(),
      notes: notes.trim(),
      rightEye: { sph: odSph, cyl: odCyl, axis: odAxis, add: odAdd },
      leftEye: { sph: osSph, cyl: osCyl, axis: osAxis, add: osAdd },
    };

    if (onSavePrescription) {
      onSavePrescription(customer.id, updatedRx);
    }
    setIsEditing(false);
    toast.success(isBengali ? 'চশমার পাওয়ার প্রেসক্রিপশন সংরক্ষিত হয়েছে!' : 'Prescription saved successfully!', {
      icon: '👓',
    });
  };

  const handleSendWhatsAppPrescription = () => {
    if (!customer.phone) {
      toast.error(isBengali ? 'গ্রাহকের ফোন নম্বর নেই!' : 'No phone number for customer!');
      return;
    }

    const text = `👓 *${activeTenant?.name || 'নূর অপটিক্যালস ও আই কেয়ার'}*
*চশমার পাওয়ার মেমো ও প্রেসক্রিপশন কার্ড*
--------------------------------
👤 গ্রাহকের নাম: *${customer.name}*
📞 মোবাইল: ${customer.phone}
👨‍⚕️ পরীক্ষক: ${doctorName}
📅 তারিখ: ${rxDate}

*চোখের পাওয়ার বিবরণী (OD / OS):*
👁️ *ডান চোখ (Right Eye - OD):*
• SPH: ${odSph} | CYL: ${odCyl} | AXIS: ${odAxis} | ADD: ${odAdd}

👁️ *বাম চোখ (Left Eye - OS):*
• SPH: ${osSph} | CYL: ${osCyl} | AXIS: ${osAxis} | ADD: ${osAdd}

🎯 পিপিলারি দূরত্ব (PD): *${pd}*
🔍 লেন্সের ধরণ: *${lensType}*
👓 ফ্রেম মডেল: *${frameModel}*

💡 *পরামর্শ:* লেন্স স্ক্র্যাচ-মুক্ত রাখতে মাইক্রোফাইবার কাপড় ও লেন্স ক্লিনার ব্যবহার করুন। প্রতি ৬ মাস অন্তর চোখ ও পাওয়ার পরীক্ষা করান।
🏢 ঠিকানা: ${activeTenant?.address || 'গ্রিন রোড, ঢাকা'} | 📞 ${activeTenant?.phone || ''}`;

    openWhatsAppDirect(customer.phone, text);
    toast.success(isBengali ? 'প্রেসক্রিপশন হোয়াটসঅ্যাপে পাঠানো হয়েছে!' : 'Prescription sent via WhatsApp!');
  };

  const handleSendFollowUpAlert = () => {
    if (!customer.phone) {
      toast.error(isBengali ? 'গ্রাহকের ফোন নম্বর নেই!' : 'No phone number for customer!');
      return;
    }

    const text = `👓 *${activeTenant?.name || 'নূর অপটিক্যালস ও আই কেয়ার'}*
*৬ মাসের লেন্স চেকআপ ও ভিশন কেয়ার নোটিশ*
--------------------------------
আসসালামু আলাইকুম *${customer.name}*,
আপনার বর্তমান চশমার লেন্স তৈরির ৬ মাস পূর্ণ হয়েছে। লেন্সের পাওয়ার সঠিক আছে কিনা এবং লেন্সে কোনো সূক্ষ্ম স্ক্র্যাচ আছে কিনা তা যাচাই করতে আমাদের সেন্টারে এসে *বিনামূল্যে চশমা চেকআপ ও আল্ট্রাসোনিক ক্লিনিং* করিয়ে নেওয়ার জন্য অনুরোধ করা হচ্ছে।

🕒 সেন্টারের সময়: সকাল ১০টা হতে রাত ৯টা
🏢 ঠিকানা: ${activeTenant?.address || 'গ্রিন রোড, পান্থপথ মোড়, ঢাকা'}
📞 যোগাযোগ: ${activeTenant?.phone || ''}`;

    openWhatsAppDirect(customer.phone, text);
    toast.success(isBengali ? '৬ মাসের লেন্স চেকআপ নোটিশ পাঠানো হয়েছে!' : '6-Month follow-up reminder sent!');
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40 shadow-sm shrink-0">
              <Glasses size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base leading-tight">
                  {isBengali ? 'চশমার পাওয়ার প্রেসক্রিপশন ও আই কেয়ার খাতা' : 'Optical Prescription & Eye Power Khata'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                  OD / OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {customer.name} • {customer.phone || 'মোবাইল নেই'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 6-Month Follow-Up Alert Banner (If Applicable) */}
        {isSixMonthsOld && (
          <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                  <span>⚡ ৬ মাসের লেন্স চেকআপ তাগাদা সক্রিয়</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">OVERDUE</span>
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  চশমা ক্রয়ের ৬ মাস পূর্ণ হয়েছে। দৃষ্টি সুস্থ রাখতে বিনামূল্যে লেন্স পরীক্ষা করানোর নোটিশ পাঠান।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendFollowUpAlert}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <MessageCircle size={14} />
              <span>{isBengali ? 'তাগাদা পাঠান' : 'WhatsApp'}</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[70vh] custom-scrollbar">
          
          {/* Doctor & Date Header Bar */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <User size={15} className="text-cyan-700" />
              {isEditing ? (
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="পরীক্ষক বা ডাক্তারের নাম"
                  className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <span className="font-bold text-slate-800">পরীক্ষক: {doctorName}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-cyan-700" />
              {isEditing ? (
                <input
                  type="text"
                  value={rxDate}
                  onChange={(e) => setRxDate(e.target.value)}
                  placeholder="তারিখ (DD/MM/YYYY)"
                  className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:border-cyan-500 w-28"
                />
              ) : (
                <span className="font-bold text-slate-800">তারিখ: {rxDate}</span>
              )}
            </div>
          </div>

          {/* OD / OS Eye Power Prescription Matrix Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-black tracking-wide">
              <span>চোখের পাওয়ার মেট্রিক্স (PRESCRIPTION POWER)</span>
              <span className="text-[10px] text-cyan-300 font-mono">Dpt (Diopter)</span>
            </div>

            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-black">
                  <th className="py-2.5 px-3 text-left">চোখ (EYE)</th>
                  <th className="py-2.5 px-2">SPH (গোলাকার)</th>
                  <th className="py-2.5 px-2">CYL (সিলিন্ডার)</th>
                  <th className="py-2.5 px-2">AXIS (অক্ষ)</th>
                  <th className="py-2.5 px-2">ADD (রিডিং এড)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {/* Right Eye (OD) */}
                <tr className="hover:bg-cyan-50/30 transition-colors">
                  <td className="py-3 px-3 text-left font-bold font-sans text-cyan-900 bg-cyan-50/50">
                    👁️ ডান চোখ (OD)
                  </td>
                  <td className="py-2 px-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={odSph}
                        onChange={(e) => setOdSph(e.target.value)}
                        placeholder="-2.00"
                        className="w-16 text-center py-1 rounded border border-slate-300 font-mono font-bold bg-white focus:border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span className="font-black text-slate-900 text-sm">{odSph || '-'}</span>
                    )}
                  </td>
                  <td className="py-2 px-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={odCyl}
                        onChange={(e) => setOdCyl(e.target.value)}
                        placeholder="-0.75"
                        className="w-16 text-center py-1 rounded border border-slate-300 font-mono font-bold bg-white focus:border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{odCyl || '-'}</span>
                    )}
                  </td>
                  <td className="py-2 px-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={odAxis}
                        onChange={(e) => setOdAxis(e.target.value)}
                        placeholder="90°"
                        className="w-14 text-center py-1 rounded border border-slate-300 font-mono font-bold bg-white focus:border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{odAxis || '-'}</span>
                    )}
                  </td>
                  <td className="py-2 px-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={odAdd}
                        onChange={(e) => setOdAdd(e.target.value)}
                        placeholder="+1.50"
                        className="w-16 text-center py-1 rounded border border-slate-300 font-mono font-bold bg-white focus:border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span className="font-black text-emerald-700">{odAdd || '-'}</span>
                    )}
                  </td>
                </tr>

                {/* Left Eye (OS) */}
                <tr className="hover:bg-cyan-50/30 transition-colors">
                  <td className="py-3 px-3 text-left font-bold font-sans text-cyan-900 bg-cyan-50/50">
                    👁️ বাম চোখ (OS)
                  </td>
                  <td className="py-2 px-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={osSph}
                        onChange={(e) => setOsSph(e.target.value)}
                        placeholder="-1.75"
                        className="w-16 text-center py-1 rounded border border-slate-300 font-mono font-bold bg-white focus:border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span className="font-black text-slate-900 text-sm">{osSph || '-'}</span>
                    )}
                  </td>
                  <td className="py-2 px-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={osCyl}
                        onChange={(e) => setOsCyl(e.target.value)}
                        placeholder="-0.50"
                        className="w-16 text-center py-1 rounded border border-slate-300 font-mono font-bold bg-white focus:border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{osCyl || '-'}</span>
                    )}
                  </td>
                  <td className="py-2 px-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={osAxis}
                        onChange={(e) => setOsAxis(e.target.value)}
                        placeholder="85°"
                        className="w-14 text-center py-1 rounded border border-slate-300 font-mono font-bold bg-white focus:border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span className="font-bold text-slate-800">{osAxis || '-'}</span>
                    )}
                  </td>
                  <td className="py-2 px-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={osAdd}
                        onChange={(e) => setOsAdd(e.target.value)}
                        placeholder="+1.50"
                        className="w-16 text-center py-1 rounded border border-slate-300 font-mono font-bold bg-white focus:border-cyan-500 focus:outline-none"
                      />
                    ) : (
                      <span className="font-black text-emerald-700">{osAdd || '-'}</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lens & Frame Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-500 text-[11px] block">পিপিলারি দূরত্ব (PD):</span>
              {isEditing ? (
                <input
                  type="text"
                  value={pd}
                  onChange={(e) => setPd(e.target.value)}
                  placeholder="e.g. 63 mm"
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold bg-white focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <span className="font-black text-slate-900 text-sm">{pd || '-'}</span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-500 text-[11px] block">লেন্সের ধরণ (Lens Coating):</span>
              {isEditing ? (
                <input
                  type="text"
                  value={lensType}
                  onChange={(e) => setLensType(e.target.value)}
                  placeholder="e.g. ব্লু কাট প্রগ্রেসিভ লেন্স"
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold bg-white focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <span className="font-bold text-cyan-900">{lensType || '-'}</span>
              )}
            </div>

            <div className="sm:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-500 text-[11px] block">ফ্রেম মডেল ও বিবরণ:</span>
              {isEditing ? (
                <input
                  type="text"
                  value={frameModel}
                  onChange={(e) => setFrameModel(e.target.value)}
                  placeholder="e.g. টাইটানিয়াম রিমলেস লাইটওয়েট ফ্রেম"
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold bg-white focus:outline-none focus:border-cyan-500"
                />
              ) : (
                <span className="font-bold text-slate-800">{frameModel || '-'}</span>
              )}
            </div>

            <div className="sm:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-500 text-[11px] block">ডাক্তারের বিশেষ পরামর্শ ও নোট:</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="প্রয়োজনীয় নির্দেশনা বা নোট লিখুন..."
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-medium bg-white focus:outline-none focus:border-cyan-500 text-xs"
                />
              ) : (
                <p className="text-slate-600 font-medium leading-relaxed">{notes || '-'}</p>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Save size={14} />
                <span>{isBengali ? 'পাওয়ার সংরক্ষণ করুন' : 'Save Prescription'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Edit3 size={14} />
                <span>{isBengali ? 'পাওয়ার এডিট' : 'Edit Power'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendWhatsAppPrescription}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="গ্রাহকের হোয়াটসঅ্যাপে পাওয়ার কার্ড পাঠান"
            >
              <MessageCircle size={14} />
              <span>{isBengali ? 'হোয়াটসঅ্যাপে পাঠান' : 'Send WhatsApp'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintSlip}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer size={14} />
              <span>{isBengali ? 'প্রিন্ট স্লিপ' : 'Print Rx Slip'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              {isBengali ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
