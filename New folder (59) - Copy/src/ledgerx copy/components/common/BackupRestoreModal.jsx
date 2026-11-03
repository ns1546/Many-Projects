import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTenant } from '../../context/TenantContext';
import { useLocale } from '../../context/LocaleContext';
import { createTenantBackupSnapshot, downloadBackupFile, restoreTenantBackupSnapshot } from '../../utils/backupRestore';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  HardDrive, 
  Lock, 
  RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BackupRestoreModal({ isOpen, onClose }) {
  const { activeTenantId, activeTenant } = useTenant();
  const { isBengali, formatNumber } = useLocale();

  const [activeTab, setActiveTab] = useState('BACKUP'); // 'BACKUP' | 'RESTORE'
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const { blob, checksum, metadata } = await createTenantBackupSnapshot(activeTenantId, activeTenant?.name);
      downloadBackupFile(blob, activeTenantId);
      toast.success(
        isBengali 
          ? `ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে! (SHA-256 ভেরিফাইড)` 
          : `Backup downloaded securely! SHA-256 Checksum: ${checksum.slice(0, 8)}...`
      );
    } catch (err) {
      toast.error('Backup creation failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRestoreSubmit = async () => {
    if (!selectedFile) return;
    setIsRestoring(true);
    try {
      const result = await restoreTenantBackupSnapshot(selectedFile, activeTenantId);
      toast.success(
        isBengali
          ? `সফলভাবে ${formatNumber(result.recordCount)} টি রেকর্ড রিস্টোর হয়েছে! পেজ রিলোড হচ্ছে...`
          : `Restored ${result.recordCount} records! Reloading...`
      );
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      toast.error('Restore Error: ' + err.message, { duration: 6000 });
      setIsRestoring(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[88vh] my-auto flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#E2136E]/10 to-transparent border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E2136E]/15 text-[#E2136E] flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">
                {isBengali ? 'ডেটা ব্যাকআপ ও ডিজাস্টার রিকভারি হাব' : 'Disaster Recovery & Backup Hub'}
              </h2>
              <p className="text-[11px] text-gray-500">
                {isBengali 
                  ? 'SHA-256 এনক্রিপ্ট করা ফাইল সংরক্ষণ ও ইনস্ট্যান্ট রিস্টোর' 
                  : 'Tamper-proof encrypted snapshots & 1-click restore'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 p-1 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'BACKUP'
                ? 'bg-white shadow-sm text-[#E2136E]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Download size={14} />
            <span>{isBengali ? 'ব্যাকআপ ডাউনলোড' : 'Download Backup'}</span>
          </button>
          <button
            onClick={() => setActiveTab('RESTORE')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'RESTORE'
                ? 'bg-white shadow-sm text-indigo-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload size={14} />
            <span>{isBengali ? 'ফাইল থেকে রিস্টোর' : 'Restore from File'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'BACKUP' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-1">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{isBengali ? 'ডেটাবেজ সম্পূর্ণ সুরক্ষিত' : 'Database Ready for Export'}</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  {isBengali
                    ? `বর্তমান স্টোর: "${activeTenant?.name}"। এই ব্যাকআপে আপনার সকল কাস্টমার বাকি, মহাজন হিসাব, স্টক, ক্যাশবাক্স এবং বিগত দিনের মেমো অন্তর্ভুক্ত থাকবে।`
                    : `Active Tenant: "${activeTenant?.name}". Includes all customer ledgers, supplier dues, inventory, and cash logs.`}
                </p>
              </div>

              <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div className="flex justify-between">
                  <span>{isBengali ? 'এনক্রিপশন অ্যালগরিদম:' : 'Security Algorithm:'}</span>
                  <strong className="text-gray-800">SHA-256 Authenticated Envelope</strong>
                </div>
                <div className="flex justify-between">
                  <span>{isBengali ? 'ফাইল ফরম্যাট:' : 'File Extension:'}</span>
                  <strong className="text-gray-800">.lxdb (LedgerX Encrypted Database)</strong>
                </div>
                <div className="flex justify-between">
                  <span>{isBengali ? 'অফলাইন সামঞ্জস্য:' : 'Offline Portable:'}</span>
                  <strong className="text-emerald-600">১০০% পেনড্রাইভ / পিসিতে সংরক্ষণযোগ্য</strong>
                </div>
              </div>

              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-[#E2136E] hover:bg-[#c0105d] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#E2136E]/20 disabled:opacity-50"
              >
                {isExporting ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
                <span>
                  {isExporting
                    ? isBengali ? 'এনক্রিপ্ট করা হচ্ছে...' : 'Generating Backup...'
                    : isBengali ? 'এখনই সুরক্ষিত ব্যাকআপ ডাউনলোড করুন (.lxdb)' : 'Download Encrypted Backup Now'}
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>{isBengali ? 'সতর্কতা ও সেফটি রোলব্যাক প্রোটেকশন' : 'Safety Rollback Active'}</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  {isBengali
                    ? 'ফাইল রিস্টোর করার সাথে সাথে আপনার স্টোরের ডেটা ব্যাকআপ ফাইলের ডেটা দিয়ে আপডেট হবে। কোনো ত্রুটি হলে সিস্টেম স্বয়ংক্রিয়ভাবে আগের অবস্থায় ফিরে যাবে।'
                    : 'Restoring will load all transactions from the backup file into this tenant. An automatic pre-restore rollback checkpoint is preserved.'}
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#E2136E] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".lxdb,.json"
                  className="hidden"
                />
                <HardDrive size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-xs font-bold text-gray-700">
                  {selectedFile ? selectedFile.name : (isBengali ? 'ব্যাকআপ ফাইল (.lxdb) নির্বাচন করুন' : 'Click to select .lxdb backup file')}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {selectedFile 
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB` 
                    : (isBengali ? 'ড্র্যাগ এবং ড্রপ করুন অথবা ক্লিক করুন' : 'Supports encrypted LedgerX snapshots')}
                </p>
              </div>

              <button
                onClick={handleRestoreSubmit}
                disabled={!selectedFile || isRestoring}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {isRestoring ? <RefreshCw size={15} className="animate-spin" /> : <Upload size={15} />}
                <span>
                  {isRestoring 
                    ? isBengali ? 'ভেরিফাই ও রিস্টোর করা হচ্ছে...' : 'Verifying & Restoring...'
                    : isBengali ? 'ফাইল ভেরিফাই করে রিস্টোর সম্পন্ন করুন' : 'Verify & Restore Database'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
