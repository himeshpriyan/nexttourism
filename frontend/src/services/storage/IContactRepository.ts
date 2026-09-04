import type { CategoryItem, Contact, DuplicateCheckResult, FilterState } from '../../types/contact';

export interface IContactRepository {
  // Contact CRUD
  getAllContacts(): Promise<Contact[]>;
  getContactById(id: string): Promise<Contact | null>;
  saveContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Contact>;
  updateContact(id: string, updates: Partial<Contact>): Promise<Contact>;
  deleteContact(id: string): Promise<boolean>;
  toggleFavorite(id: string): Promise<Contact>;
  
  // Duplicate Check
  checkDuplicatePhone(phone: string, excludeId?: string): Promise<DuplicateCheckResult>;
  
  // Query & Filter
  filterContacts(contacts: Contact[], filters: FilterState): Contact[];
  
  // Category Management
  getCategories(): Promise<CategoryItem[]>;
  saveCategory(category: Omit<CategoryItem, 'id' | 'contactCount'>): Promise<CategoryItem>;
  updateCategory(id: string, updates: Partial<CategoryItem>): Promise<CategoryItem>;
  deleteCategory(id: string, fallbackCategoryName?: string): Promise<boolean>;
  getCategoryCounts(): Promise<Record<string, number>>;
  
  // Bulk Operations
  bulkImportContacts(contacts: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>, resolveDuplicates: 'skip' | 'update' | 'keep_both'): Promise<{
    importedCount: number;
    updatedCount: number;
    skippedCount: number;
  }>;
  
  // Reset & Seed
  resetToSampleData(): Promise<void>;
  clearAllData(): Promise<void>;
}
