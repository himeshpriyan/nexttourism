import type { CategoryItem, Contact } from '../../types/contact';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-student',
    name: 'Student',
    color: 'emerald',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textColor: 'text-emerald-700',
    iconName: 'GraduationCap',
    isDefault: true,
  },
  {
    id: 'cat-professor',
    name: 'Professor',
    color: 'indigo',
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    textColor: 'text-indigo-700',
    iconName: 'BookOpen',
    isDefault: true,
  },
  {
    id: 'cat-staff',
    name: 'Staff',
    color: 'sky',
    bgLight: 'bg-sky-50 text-sky-700 border-sky-200',
    textColor: 'text-sky-700',
    iconName: 'Building2',
    isDefault: true,
  },
  {
    id: 'cat-client',
    name: 'Client',
    color: 'purple',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    textColor: 'text-purple-700',
    iconName: 'Briefcase',
    isDefault: true,
  },
  {
    id: 'cat-vendor',
    name: 'Vendor',
    color: 'amber',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
    textColor: 'text-amber-700',
    iconName: 'Truck',
    isDefault: true,
  },
  {
    id: 'cat-customer',
    name: 'Customer',
    color: 'rose',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
    textColor: 'text-rose-700',
    iconName: 'Users',
    isDefault: true,
  },
  {
    id: 'cat-friend',
    name: 'Friend',
    color: 'pink',
    bgLight: 'bg-pink-50 text-pink-700 border-pink-200',
    textColor: 'text-pink-700',
    iconName: 'Heart',
    isDefault: true,
  },
  {
    id: 'cat-other',
    name: 'Other',
    color: 'slate',
    bgLight: 'bg-slate-100 text-slate-700 border-slate-200',
    textColor: 'text-slate-700',
    iconName: 'Tag',
    isDefault: true,
  },
];

export const CATEGORY_COLOR_MAP: Record<string, { bgLight: string; textColor: string; dotColor: string }> = {
  Student: { bgLight: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700', dotColor: 'bg-emerald-500' },
  Professor: { bgLight: 'bg-indigo-50 border-indigo-200', textColor: 'text-indigo-700', dotColor: 'bg-indigo-500' },
  Staff: { bgLight: 'bg-sky-50 border-sky-200', textColor: 'text-sky-700', dotColor: 'bg-sky-500' },
  Client: { bgLight: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700', dotColor: 'bg-purple-500' },
  Vendor: { bgLight: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', dotColor: 'bg-amber-500' },
  Customer: { bgLight: 'bg-rose-50 border-rose-200', textColor: 'text-rose-700', dotColor: 'bg-rose-500' },
  Friend: { bgLight: 'bg-pink-50 border-pink-200', textColor: 'text-pink-700', dotColor: 'bg-pink-500' },
  Other: { bgLight: 'bg-slate-100 border-slate-200', textColor: 'text-slate-700', dotColor: 'bg-slate-500' },
};

// SVG Card Generators for realistic visiting card samples
export function createSampleCardSvg(data: {
  name: string;
  designation: string;
  company: string;
  phone: string;
  email: string;
  website?: string;
  address?: string;
  themeColor?: string;
}): string {
  const color = data.themeColor || '#4f46e5';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="600" height="350">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="#818cf8"/>
      </linearGradient>
    </defs>
    <rect width="600" height="350" rx="16" fill="url(#cardGrad)" stroke="#e2e8f0" stroke-width="3"/>
    <path d="M 0 0 L 160 0 L 120 350 L 0 350 Z" fill="url(#accentGrad)" opacity="0.12"/>
    <rect x="0" y="0" width="12" height="350" fill="${color}" rx="6"/>
    
    <!-- Company Header -->
    <text x="50" y="65" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="22" font-weight="bold" fill="${color}" letter-spacing="1">${data.company.toUpperCase()}</text>
    <line x1="50" y1="80" x2="320" y2="80" stroke="${color}" stroke-width="2" opacity="0.4"/>
    
    <!-- Name and Designation -->
    <text x="50" y="145" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="28" font-weight="bold" fill="#0f172a">${data.name}</text>
    <text x="50" y="175" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="600" fill="#64748b" letter-spacing="0.5">${data.designation}</text>
    
    <!-- Contact Info Section -->
    <g transform="translate(50, 220)">
      <!-- Phone -->
      <circle cx="10" cy="10" r="10" fill="${color}" opacity="0.15"/>
      <text x="32" y="15" font-family="Arial, sans-serif" font-size="15" font-weight="500" fill="#334155">TEL: ${data.phone}</text>
      
      <!-- Email -->
      <circle cx="10" cy="40" r="10" fill="${color}" opacity="0.15"/>
      <text x="32" y="45" font-family="Arial, sans-serif" font-size="15" font-weight="500" fill="#334155">EMAIL: ${data.email}</text>
      
      <!-- Website / Address -->
      <circle cx="10" cy="70" r="10" fill="${color}" opacity="0.15"/>
      <text x="32" y="75" font-family="Arial, sans-serif" font-size="14" font-weight="400" fill="#64748b">${data.website || data.address || 'Tech City, Innovation Hub'}</text>
    </g>
    
    <!-- Decorative Corner Pattern -->
    <circle cx="540" cy="60" r="40" fill="${color}" opacity="0.05"/>
    <circle cx="540" cy="60" r="20" fill="${color}" opacity="0.1"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_CONTACTS: Contact[] = [];
