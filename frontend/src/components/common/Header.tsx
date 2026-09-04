import React, { useState } from 'react';
import { ShieldCheck, Plus, ScanLine, Upload, Download, MoreVertical, RefreshCw, Trash2, Search } from 'lucide-react';
import { useContacts } from '../../context/ContactContext';

export const Header: React.FC = () => {
  const {
    openAddModal,
    openScanner,
    openImportModal,
    openExportModal,
    resetToSampleData,
    clearAllData,
    filters,
    setSearchQuery,
    totalContactsCount,
  } = useContacts();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
                Contact<span className="text-indigo-600">Vault</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block -mt-0.5">
              {totalContactsCount} contacts organized
            </p>
          </div>
        </div>

        {/* Global Quick Search (Center on desktop/tablet) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, email, company..."
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition shadow-inner"
            />
          </div>
        </div>

        {/* Quick Actions (Right) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Scan Card button */}
          <button
            onClick={openScanner}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold rounded-xl border border-indigo-100 transition active:scale-95 shadow-xs"
            title="Scan Visiting Card"
          >
            <ScanLine className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Scan Card</span>
          </button>

          {/* Add Contact Button */}
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/25 transition active:scale-95"
            title="Add New Contact"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Contact</span>
          </button>

          {/* Overflow Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((p) => !p)}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-30 animate-in fade-in slide-in-from-top-2 text-xs sm:text-sm">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      openImportModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition text-left"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Contacts (CSV)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      openExportModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition text-left"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Contacts (CSV/vCard)</span>
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      resetToSampleData();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition text-left"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Load Sample Contacts</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (window.confirm('Are you sure you want to clear all contacts? This cannot be undone.')) {
                        clearAllData();
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Contacts</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
