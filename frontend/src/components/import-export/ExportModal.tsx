import React, { useState } from 'react';
import { FileSpreadsheet, Share2 } from 'lucide-react';
import { useContacts } from '../../context/ContactContext';
import { Modal } from '../common/Modal';

export const ExportModal: React.FC = () => {
  const {
    isExportModalOpen,
    closeExportModal,
    categories,
    categoryCounts,
    totalContactsCount,
    exportContactsCSV,
    exportContactsVCF,
  } = useContacts();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const handleExportCSV = () => {
    exportContactsCSV(selectedCategory);
    closeExportModal();
  };

  const handleExportVCF = () => {
    exportContactsVCF();
    closeExportModal();
  };

  const countForSelected =
    selectedCategory === 'All'
      ? totalContactsCount
      : categoryCounts[selectedCategory] || 0;

  return (
    <Modal
      isOpen={isExportModalOpen}
      onClose={closeExportModal}
      title="Export Contacts"
      subtitle="Download contacts as CSV or standard vCard (.vcf) format"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Category Selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Select Scope
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Contacts ({totalContactsCount})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name} ({categoryCounts[cat.name] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Export Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* CSV Option */}
          <div
            onClick={handleExportCSV}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between group shadow-xs active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                .CSV
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                CSV Spreadsheet
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Export {countForSelected} {selectedCategory === 'All' ? 'contacts' : selectedCategory} for Excel & Google Sheets
              </p>
            </div>
          </div>

          {/* vCard Option */}
          <div
            onClick={handleExportVCF}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between group shadow-xs active:scale-[0.98]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                .VCF
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                Phone Contacts (vCard)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Compatible with iPhone, Android, Google Contacts & Outlook
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center">
          <p className="text-xs text-slate-400">
            Files are generated client-side directly from your local browser vault.
          </p>
        </div>
      </div>
    </Modal>
  );
};
