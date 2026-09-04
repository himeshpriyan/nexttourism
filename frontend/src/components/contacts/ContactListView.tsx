import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  X,
  Mail,
  Image as ImageIcon,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useContacts } from '../../context/ContactContext';
import { ContactCard } from './ContactCard';
import { EmptyState } from '../common/EmptyState';
import { CategoryPillList } from '../dashboard/CategoryPillList';

export const ContactListView: React.FC = () => {
  const {
    filteredContacts,
    totalContactsCount,
    filters,
    setSearchQuery,
    setSortBy,
    setSourceFilter,
    setOnlyWithEmail,
    setOnlyWithCard,
    toggleTagFilter,
    resetFilters,
    allTags,
    openAddModal,
    openScanner,
  } = useContacts();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const activeFiltersCount =
    (filters.category ? 1 : 0) +
    (filters.sourceFilter !== 'All' ? 1 : 0) +
    (filters.onlyWithEmail ? 1 : 0) +
    (filters.onlyWithCard ? 1 : 0) +
    filters.selectedTags.length;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Search Bar & Filter / Sort Toolbar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, phone, email, company..."
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-white text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200/90 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowAdvancedFilters((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              showAdvancedFilters || activeFiltersCount > 0
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filters.sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof filters.sortBy)}
              className="appearance-none bg-white text-slate-700 border border-slate-200 rounded-xl pl-8 pr-7 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
            >
              <option value="name-asc">A → Z</option>
              <option value="name-desc">Z → A</option>
              <option value="created-desc">Recently Added</option>
              <option value="updated-desc">Recently Updated</option>
              <option value="company-asc">Company (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Category Pills Bar */}
        <CategoryPillList />

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Options</span>
              </h4>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Source Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Source
                </label>
                <select
                  value={filters.sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as typeof filters.sourceFilter)}
                  className="w-full bg-white text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="All">All Sources</option>
                  <option value="Manual Entry">Manual Entry</option>
                  <option value="Visiting Card Scan">Visiting Card Scan</option>
                  <option value="CSV Import">CSV Import</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="sm:col-span-2 flex flex-wrap items-center gap-2 pt-4 sm:pt-4">
                <button
                  onClick={() => setOnlyWithEmail(!filters.onlyWithEmail)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    filters.onlyWithEmail
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Has Email</span>
                  {filters.onlyWithEmail && <Check className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => setOnlyWithCard(!filters.onlyWithCard)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                    filters.onlyWithCard
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Has Card Photo</span>
                  {filters.onlyWithCard && <Check className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Tags Selector */}
            {allTags.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  Filter by Tag
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {allTags.map((tag) => {
                    const isSelected = filters.selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTagFilter(tag)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Total Match Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Showing {filteredContacts.length}{' '}
          {filteredContacts.length === 1 ? 'Contact' : 'Contacts'}{' '}
          {filters.category ? `in ${filters.category}` : ''}
        </p>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* 3. Contact Cards Grid / List */}
      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={totalContactsCount === 0 ? 'No contacts in vault yet' : 'No contacts match your filters'}
          description={
            totalContactsCount === 0
              ? 'Start organizing your network by adding your first contact or scanning a visiting card.'
              : 'Try adjusting your search query, clearing category filters, or removing tag filters.'
          }
          actionText={totalContactsCount === 0 ? 'Add First Contact' : 'Reset Filters'}
          onAction={totalContactsCount === 0 ? () => openAddModal() : resetFilters}
          secondaryActionText={totalContactsCount === 0 ? 'Scan Card' : undefined}
          onSecondaryAction={totalContactsCount === 0 ? openScanner : undefined}
        />
      )}
    </div>
  );
};
