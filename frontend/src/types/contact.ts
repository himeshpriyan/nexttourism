export type ContactSource = 'Manual Entry' | 'Visiting Card Scan' | 'CSV Import';

export type DefaultCategory = 
  | 'Student'
  | 'Professor'
  | 'Staff'
  | 'Client'
  | 'Vendor'
  | 'Customer'
  | 'Friend'
  | 'Other';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  company?: string;
  designation?: string;
  category: string; // DefaultCategory or custom category name
  address?: string;
  notes?: string;
  tags: string[];
  source: ContactSource;
  visitingCardImage?: string; // base64 or sample data URL
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  isFavorite?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex
  bgLight: string;
  textColor: string;
  iconName: string;
  isDefault: boolean;
  contactCount?: number;
}

export type SortField = 'name' | 'createdAt' | 'updatedAt' | 'company';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  category: string | null; // null for all
  selectedTags: string[];
  sourceFilter: ContactSource | 'All';
  onlyWithEmail: boolean;
  onlyWithCard: boolean;
  sortBy: 'name-asc' | 'name-desc' | 'created-desc' | 'updated-desc' | 'company-asc';
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingContact?: Contact;
  matchedField?: 'phone' | 'alternatePhone';
}

export interface OCRScanResult {
  rawText: string;
  name?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  company?: string;
  designation?: string;
  website?: string;
  address?: string;
  suggestedCategory?: string;
  confidence: number;
}
