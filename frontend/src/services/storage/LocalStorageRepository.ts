import type { CategoryItem, Contact, DuplicateCheckResult, FilterState } from '../../types/contact';
import { normalizePhoneNumber } from '../../utils/phoneUtils';
import { DEFAULT_CATEGORIES, SAMPLE_CONTACTS } from '../seed/sampleData';
import type { IContactRepository } from './IContactRepository';

const CONTACTS_KEY = 'contactvault_contacts_v1';
const CATEGORIES_KEY = 'contactvault_categories_v1';

export class LocalStorageRepository implements IContactRepository {
  private getStoredContacts(): Contact[] {
    try {
      const data = localStorage.getItem(CONTACTS_KEY);
      if (!data) {
        localStorage.setItem(CONTACTS_KEY, JSON.stringify([]));
        return [];
      }
      return JSON.parse(data) as Contact[];
    } catch (e) {
      console.error('Failed to parse contacts from localStorage', e);
      return [];
    }
  }

  private setStoredContacts(contacts: Contact[]): void {
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to write contacts to localStorage', e);
    }
  }

  private getStoredCategories(): CategoryItem[] {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      if (!data) {
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
        return [...DEFAULT_CATEGORIES];
      }
      return JSON.parse(data) as CategoryItem[];
    } catch (e) {
      console.error('Failed to parse categories from localStorage', e);
      return [...DEFAULT_CATEGORIES];
    }
  }

  private setStoredCategories(categories: CategoryItem[]): void {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to write categories to localStorage', e);
    }
  }

  // --- Contacts CRUD ---

  async getAllContacts(): Promise<Contact[]> {
    return this.getStoredContacts();
  }

  async getContactById(id: string): Promise<Contact | null> {
    const contacts = this.getStoredContacts();
    return contacts.find((c) => c.id === id) || null;
  }

  async saveContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Contact> {
    const contacts = this.getStoredContacts();
    const now = new Date().toISOString();
    const newContact: Contact = {
      ...contactData,
      id: contactData.id || `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
      tags: contactData.tags || [],
      category: contactData.category || 'Other',
    };

    contacts.unshift(newContact);
    this.setStoredContacts(contacts);
    return newContact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const contacts = this.getStoredContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Contact with ID ${id} not found.`);
    }

    const updatedContact: Contact = {
      ...contacts[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    contacts[index] = updatedContact;
    this.setStoredContacts(contacts);
    return updatedContact;
  }

  async deleteContact(id: string): Promise<boolean> {
    const contacts = this.getStoredContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    if (filtered.length === contacts.length) return false;
    this.setStoredContacts(filtered);
    return true;
  }

  async toggleFavorite(id: string): Promise<Contact> {
    const contacts = this.getStoredContacts();
    const index = contacts.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Contact not found');

    const updated = {
      ...contacts[index],
      isFavorite: !contacts[index].isFavorite,
      updatedAt: new Date().toISOString(),
    };
    contacts[index] = updated;
    this.setStoredContacts(contacts);
    return updated;
  }

  // --- Duplicate Checking ---

  async checkDuplicatePhone(phone: string, excludeId?: string): Promise<DuplicateCheckResult> {
    if (!phone || !phone.trim()) {
      return { isDuplicate: false };
    }

    const normalizedTarget = normalizePhoneNumber(phone);
    if (!normalizedTarget || normalizedTarget.length < 5) {
      return { isDuplicate: false };
    }

    const contacts = this.getStoredContacts();
    for (const c of contacts) {
      if (excludeId && c.id === excludeId) continue;

      const normPhone = normalizePhoneNumber(c.phone);
      if (normPhone && (normPhone === normalizedTarget || normPhone.endsWith(normalizedTarget) || normalizedTarget.endsWith(normPhone))) {
        return { isDuplicate: true, existingContact: c, matchedField: 'phone' };
      }

      if (c.alternatePhone) {
        const normAlt = normalizePhoneNumber(c.alternatePhone);
        if (normAlt && (normAlt === normalizedTarget || normAlt.endsWith(normalizedTarget) || normalizedTarget.endsWith(normAlt))) {
          return { isDuplicate: true, existingContact: c, matchedField: 'alternatePhone' };
        }
      }
    }

    return { isDuplicate: false };
  }

  // --- Search, Filter & Sort ---

  filterContacts(contacts: Contact[], filters: FilterState): Contact[] {
    let result = [...contacts];

    // Search query across name, phone, alternatePhone, email, company, designation, notes, address
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const qDigits = normalizePhoneNumber(filters.searchQuery);

      result = result.filter((c) => {
        const nameMatch = c.name.toLowerCase().includes(q);
        const emailMatch = c.email?.toLowerCase().includes(q) ?? false;
        const companyMatch = c.company?.toLowerCase().includes(q) ?? false;
        const designationMatch = c.designation?.toLowerCase().includes(q) ?? false;
        const notesMatch = c.notes?.toLowerCase().includes(q) ?? false;
        const addressMatch = c.address?.toLowerCase().includes(q) ?? false;

        let phoneMatch = false;
        if (qDigits) {
          const normP = normalizePhoneNumber(c.phone);
          const normAlt = c.alternatePhone ? normalizePhoneNumber(c.alternatePhone) : '';
          phoneMatch = normP.includes(qDigits) || normAlt.includes(qDigits);
        } else {
          phoneMatch = c.phone.includes(q) || (c.alternatePhone?.includes(q) ?? false);
        }

        return nameMatch || phoneMatch || emailMatch || companyMatch || designationMatch || notesMatch || addressMatch;
      });
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      result = result.filter((c) => c.category.toLowerCase() === filters.category?.toLowerCase());
    }

    // Tags filter
    if (filters.selectedTags && filters.selectedTags.length > 0) {
      result = result.filter((c) => filters.selectedTags.some((tag) => c.tags.includes(tag)));
    }

    // Source filter
    if (filters.sourceFilter && filters.sourceFilter !== 'All') {
      result = result.filter((c) => c.source === filters.sourceFilter);
    }

    // Email flag
    if (filters.onlyWithEmail) {
      result = result.filter((c) => Boolean(c.email && c.email.trim()));
    }

    // Visiting card flag
    if (filters.onlyWithCard) {
      result = result.filter((c) => Boolean(c.visitingCardImage));
    }

    // Sorting
    switch (filters.sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'created-desc':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'updated-desc':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'company-asc':
        result.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
        break;
      default:
        result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }

  // --- Category Management ---

  async getCategories(): Promise<CategoryItem[]> {
    const categories = this.getStoredCategories();
    const counts = await this.getCategoryCounts();
    return categories.map((cat) => ({
      ...cat,
      contactCount: counts[cat.name] || 0,
    }));
  }

  async saveCategory(categoryData: Omit<CategoryItem, 'id' | 'contactCount'>): Promise<CategoryItem> {
    const categories = this.getStoredCategories();
    const newCategory: CategoryItem = {
      ...categoryData,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      contactCount: 0,
    };
    categories.push(newCategory);
    this.setStoredCategories(categories);
    return newCategory;
  }

  async updateCategory(id: string, updates: Partial<CategoryItem>): Promise<CategoryItem> {
    const categories = this.getStoredCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    const oldName = categories[index].name;
    const updated = { ...categories[index], ...updates };
    categories[index] = updated;
    this.setStoredCategories(categories);

    // If category name was renamed, update all contacts that belonged to old name
    if (updates.name && updates.name !== oldName) {
      const contacts = this.getStoredContacts();
      const updatedContacts = contacts.map((c) => (c.category === oldName ? { ...c, category: updates.name! } : c));
      this.setStoredContacts(updatedContacts);
    }

    return updated;
  }

  async deleteCategory(id: string, fallbackCategoryName = 'Other'): Promise<boolean> {
    const categories = this.getStoredCategories();
    const catToDelete = categories.find((c) => c.id === id);
    if (!catToDelete) return false;

    const filtered = categories.filter((c) => c.id !== id);
    this.setStoredCategories(filtered);

    // Reassign existing contacts in deleted category to fallback category
    const contacts = this.getStoredContacts();
    const updatedContacts = contacts.map((c) =>
      c.category === catToDelete.name ? { ...c, category: fallbackCategoryName } : c
    );
    this.setStoredContacts(updatedContacts);

    return true;
  }

  async getCategoryCounts(): Promise<Record<string, number>> {
    const contacts = this.getStoredContacts();
    const counts: Record<string, number> = {};
    for (const c of contacts) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return counts;
  }

  // --- Bulk Import ---

  async bulkImportContacts(
    newContacts: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>,
    resolveDuplicates: 'skip' | 'update' | 'keep_both'
  ): Promise<{ importedCount: number; updatedCount: number; skippedCount: number }> {
    const existing = this.getStoredContacts();
    const now = new Date().toISOString();

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    const contactsMap = new Map<string, Contact>();
    existing.forEach((c) => contactsMap.set(c.id, c));

    // Helper map of normalized phone -> contact ID
    const phoneMap = new Map<string, string>();
    existing.forEach((c) => {
      const norm = normalizePhoneNumber(c.phone);
      if (norm) phoneMap.set(norm, c.id);
    });

    for (const item of newContacts) {
      const normPhone = normalizePhoneNumber(item.phone);
      const existingId = normPhone ? phoneMap.get(normPhone) : undefined;

      if (existingId && resolveDuplicates === 'skip') {
        skippedCount++;
        continue;
      }

      if (existingId && resolveDuplicates === 'update') {
        const existingRecord = contactsMap.get(existingId)!;
        const merged: Contact = {
          ...existingRecord,
          name: item.name || existingRecord.name,
          email: item.email || existingRecord.email,
          company: item.company || existingRecord.company,
          designation: item.designation || existingRecord.designation,
          category: item.category || existingRecord.category,
          address: item.address || existingRecord.address,
          notes: item.notes ? `${existingRecord.notes || ''} | ${item.notes}`.trim() : existingRecord.notes,
          tags: Array.from(new Set([...(existingRecord.tags || []), ...(item.tags || [])])),
          updatedAt: now,
        };
        contactsMap.set(existingId, merged);
        updatedCount++;
        continue;
      }

      // If keep_both or not a duplicate
      const id = `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newContactRecord: Contact = {
        ...item,
        id,
        createdAt: now,
        updatedAt: now,
        tags: item.tags || [],
        category: item.category || 'Other',
        source: item.source || 'CSV Import',
      };
      contactsMap.set(id, newContactRecord);
      if (normPhone) phoneMap.set(normPhone, id);
      importedCount++;
    }

    const finalContacts = Array.from(contactsMap.values());
    this.setStoredContacts(finalContacts);

    return { importedCount, updatedCount, skippedCount };
  }

  async resetToSampleData(): Promise<void> {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(SAMPLE_CONTACTS));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  }

  async clearAllData(): Promise<void> {
    localStorage.removeItem(CONTACTS_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
  }
}

export const contactRepository = new LocalStorageRepository();
