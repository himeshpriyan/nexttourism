import React from 'react';
import { CATEGORY_COLOR_MAP } from '../../services/seed/sampleData';

interface BadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const CategoryBadge: React.FC<BadgeProps> = ({
  category,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const colorConfig = CATEGORY_COLOR_MAP[category] || {
    bgLight: 'bg-indigo-50 border-indigo-200',
    textColor: 'text-indigo-700',
    dotColor: 'bg-indigo-500',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors ${colorConfig.bgLight} ${colorConfig.textColor} ${sizeClasses[size]} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorConfig.dotColor}`} />
      )}
      <span>{category}</span>
    </span>
  );
};
