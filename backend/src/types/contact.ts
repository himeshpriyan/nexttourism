export type ContactSource = 'Manual Entry' | 'Visiting Card Scan' | 'CSV Import';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  company?: string;
  designation?: string;
  category: string;
  address?: string;
  notes?: string;
  tags: string[];
  source: ContactSource;
  visitingCardImage?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  bgLight: string;
  textColor: string;
  iconName: string;
  isDefault: boolean;
  contactCount?: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingContact?: Contact;
  matchedField?: 'phone' | 'alternatePhone';
}
