import React from 'react';
import { Layers, GraduationCap, BookOpen, Building2, Briefcase, Truck, Users, Heart, Tag } from 'lucide-react';
import { useContacts } from '../../context/ContactContext';

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  BookOpen,
  Building2,
  Briefcase,
  Truck,
  Users,
  Heart,
  Tag,
};

export const CategoryPillList: React.FC = () => {
  const { categories, categoryCounts, filters, setCategoryFilter, totalContactsCount } = useContacts();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* All Category Pill */}
      <button
        onClick={() => setCategoryFilter(null)}
        className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 cursor-pointer ${
          filters.category === null
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span>All</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            filters.category === null ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {totalContactsCount}
        </span>
      </button>

      {/* Dynamic Category Pills */}
      {categories.map((cat) => {
        const isSelected = filters.category === cat.name;
        const IconComponent = ICON_MAP[cat.iconName] || Tag;
        const count = categoryCounts[cat.name] || 0;

        return (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(isSelected ? null : cat.name)}
            className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition active:scale-95 cursor-pointer ${
              isSelected
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <IconComponent className="w-3.5 h-3.5 shrink-0 opacity-80" />
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
