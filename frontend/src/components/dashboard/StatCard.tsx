import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  count: number;
  icon: LucideIcon;
  gradient: string;
  textColor: string;
  onClick?: () => void;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  icon: Icon,
  gradient,
  textColor,
  onClick,
  badgeText,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden active:scale-[0.99]`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {count}
            </h3>
            {badgeText && (
              <span className="text-[10px] font-bold text-slate-400">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} ${textColor} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Decorative background glow */}
      <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 pointer-events-none blur-lg`} />
    </div>
  );
};
