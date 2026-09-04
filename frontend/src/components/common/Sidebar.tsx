import React from 'react';
import {
  LayoutDashboard,
  Users,
  FolderTree,
  ScanLine,
  PlusCircle,
  FileSpreadsheet,
  Download,
  Database,
  type LucideIcon,
} from 'lucide-react';
import { useContacts } from '../../context/ContactContext';
import { CategoryBadge } from './Badge';

interface NavItem {
  id: 'home' | 'contacts' | 'categories' | 'scan';
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    categories,
    categoryCounts,
    setCategoryFilter,
    openAddModal,
    openScanner,
    openImportModal,
    openExportModal,
    totalContactsCount,
  } = useContacts();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts', label: 'All Contacts', icon: Users, badge: totalContactsCount },
    { id: 'categories', label: 'Categories', icon: FolderTree, badge: categories.length },
    { id: 'scan', label: 'Card Scanner', icon: ScanLine },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between py-6 pr-6 border-r border-slate-200/80 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Quick Add Action Button */}
        <button
          onClick={() => openAddModal()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-sm rounded-2xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Contact</span>
        </button>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'scan') {
                    openScanner();
                  } else {
                    setActiveTab(item.id as 'home' | 'contacts' | 'categories');
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-indigo-200/60 text-indigo-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Categories List */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Categories
            </p>
            <button
              onClick={() => setActiveTab('categories')}
              className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
            {categories.map((cat) => {
              const count = categoryCounts[cat.name] || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategoryFilter(cat.name);
                    setActiveTab('contacts');
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition text-left cursor-pointer"
                >
                  <CategoryBadge category={cat.name} size="sm" showDot={true} />
                  <span className="text-[11px] text-slate-400 font-mono">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Import / Export Tools */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Data Tools
          </p>
          <button
            onClick={openImportModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import CSV / Excel</span>
          </button>
          <button
            onClick={openExportModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export (CSV / vCard)</span>
          </button>
        </div>
      </div>

      {/* Storage Backend status */}
      <div className="pt-4 border-t border-slate-200/80">
        <div className="p-3 bg-slate-100/70 rounded-2xl border border-slate-200/60 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-xs">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-slate-800">Local Vault</p>
            </div>
            <p className="text-[10px] text-slate-500">Persistent Browser Storage</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
