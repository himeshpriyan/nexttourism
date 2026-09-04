import React from 'react';
import { LayoutDashboard, Users, FolderTree, ScanLine, Plus } from 'lucide-react';
import { useContacts } from '../../context/ContactContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openScanner, openAddModal, totalContactsCount } = useContacts();

  return (
    <>
      {/* Floating Add Contact Button (Mobile) */}
      <div className="fixed right-4 bottom-20 z-40 lg:hidden">
        <button
          onClick={() => openAddModal()}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-transform"
          aria-label="Add Contact"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Sticky Bottom Navigation Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-slate-200/80 lg:hidden pb-safe">
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {/* 1. Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === 'home' ? 'bg-indigo-50' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Home</span>
          </button>

          {/* 2. Contacts */}
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer relative ${
              activeTab === 'contacts' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === 'contacts' ? 'bg-indigo-50' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Contacts</span>
            {totalContactsCount > 0 && (
              <span className="absolute top-2 right-6 w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </button>

          {/* 3. Scan Visiting Card */}
          <button
            onClick={openScanner}
            className="flex flex-col items-center justify-center gap-1 transition cursor-pointer text-slate-400 hover:text-indigo-600"
          >
            <div className="p-1 rounded-xl hover:bg-indigo-50 transition">
              <ScanLine className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Scan</span>
          </button>

          {/* 4. Categories */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
              activeTab === 'categories' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className={`p-1 rounded-xl transition ${activeTab === 'categories' ? 'bg-indigo-50' : ''}`}>
              <FolderTree className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold">Categories</span>
          </button>
        </div>
      </nav>
    </>
  );
};
