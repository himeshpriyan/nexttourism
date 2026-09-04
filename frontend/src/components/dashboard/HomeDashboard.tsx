import React from 'react';
import {
  Search,
  Users,
  GraduationCap,
  BookOpen,
  Briefcase,
  X,
} from 'lucide-react';
import { useContacts } from '../../context/ContactContext';
import { StatCard } from './StatCard';
import { CategoryPillList } from './CategoryPillList';
import { RecentContactsCarousel } from './RecentContactsCarousel';

export const HomeDashboard: React.FC = () => {
  const {
    filters,
    setSearchQuery,
    setCategoryFilter,
    setActiveTab,
    categoryCounts,
    totalContactsCount,
  } = useContacts();

  const handleStatClick = (categoryName: string | null) => {
    setCategoryFilter(categoryName);
    setActiveTab('contacts');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Mobile / Desktop Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, phone, email, company..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (filters.searchQuery) setActiveTab('contacts');
            }}
            className="w-full pl-12 pr-10 py-3.5 bg-white text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200/90 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm sm:text-base font-medium transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Quick Category Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Categories
          </h3>
          <button
            onClick={() => setActiveTab('categories')}
            className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            Manage all
          </button>
        </div>
        <CategoryPillList />
      </div>

      {/* 3. Key Contact Count Metrics */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="Total Contacts"
            count={totalContactsCount}
            icon={Users}
            gradient="from-indigo-600 to-indigo-500"
            textColor="text-white"
            onClick={() => handleStatClick(null)}
            badgeText="All"
          />
          <StatCard
            title="Students"
            count={categoryCounts['Student'] || 0}
            icon={GraduationCap}
            gradient="from-emerald-500 to-teal-600"
            textColor="text-white"
            onClick={() => handleStatClick('Student')}
            badgeText="Active"
          />
          <StatCard
            title="Professors"
            count={categoryCounts['Professor'] || 0}
            icon={BookOpen}
            gradient="from-blue-600 to-indigo-600"
            textColor="text-white"
            onClick={() => handleStatClick('Professor')}
            badgeText="Faculty"
          />
          <StatCard
            title="Clients"
            count={categoryCounts['Client'] || 0}
            icon={Briefcase}
            gradient="from-purple-600 to-pink-600"
            textColor="text-white"
            onClick={() => handleStatClick('Client')}
            badgeText="Enterprise"
          />
        </div>
      </div>

      {/* 4. Recent Contacts Section */}
      <RecentContactsCarousel />
    </div>
  );
};
