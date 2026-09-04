import type { CategoryItem, Contact, DuplicateCheckResult, FilterState } from '../../types/contact';
import type { IContactRepository } from './IContactRepository';
import { LocalStorageRepository } from './LocalStorageRepository';

const API_BASE_URL = 'http://localhost:5000/api';

export class HybridContactRepository implements IContactRepository {
  private localRepo = new LocalStorageRepository();
  private backendAvailable: boolean | null = null;

  private async isBackendHealthy(): Promise<boolean> {
    if (this.backendAvailable !== null) {
      return this.backendAvailable;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(1200) });
      this.backendAvailable = res.ok;
      return this.backendAvailable;
    } catch {
      this.backendAvailable = false;
      return false;
    }
  }

  async getAllContacts(): Promise<Contact[]> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.getAllContacts();
  }

  async getContactById(id: string): Promise<Contact | null> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.getContactById(id);
  }

  async saveContact(contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Contact> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contactData),
        });
        const json = await res.json();
        if (json.success && json.data) {
          // Also save locally as mirror
          await this.localRepo.saveContact(contactData);
          return json.data;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.saveContact(contactData);
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const json = await res.json();
        if (json.success && json.data) {
          await this.localRepo.updateContact(id, updates);
          return json.data;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.updateContact(id, updates);
  }

  async deleteContact(id: string): Promise<boolean> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          await this.localRepo.deleteContact(id);
          return true;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.deleteContact(id);
  }

  async toggleFavorite(id: string): Promise<Contact> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/${id}/favorite`, { method: 'POST' });
        const json = await res.json();
        if (json.success && json.data) {
          await this.localRepo.toggleFavorite(id);
          return json.data;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.toggleFavorite(id);
  }

  async checkDuplicatePhone(phone: string, excludeId?: string): Promise<DuplicateCheckResult> {
    return this.localRepo.checkDuplicatePhone(phone, excludeId);
  }

  filterContacts(contacts: Contact[], filters: FilterState): Contact[] {
    return this.localRepo.filterContacts(contacts, filters);
  }

  async getCategories(): Promise<CategoryItem[]> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.getCategories();
  }

  async saveCategory(categoryData: Omit<CategoryItem, 'id' | 'contactCount'>): Promise<CategoryItem> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData),
        });
        const json = await res.json();
        if (json.success && json.data) {
          await this.localRepo.saveCategory(categoryData);
          return json.data;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.saveCategory(categoryData);
  }

  async updateCategory(id: string, updates: Partial<CategoryItem>): Promise<CategoryItem> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const json = await res.json();
        if (json.success && json.data) {
          await this.localRepo.updateCategory(id, updates);
          return json.data;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.updateCategory(id, updates);
  }

  async deleteCategory(id: string, fallbackCategoryName = 'Other'): Promise<boolean> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          await this.localRepo.deleteCategory(id, fallbackCategoryName);
          return true;
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.deleteCategory(id, fallbackCategoryName);
  }

  async getCategoryCounts(): Promise<Record<string, number>> {
    return this.localRepo.getCategoryCounts();
  }

  async bulkImportContacts(
    newContacts: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>,
    resolveDuplicates: 'skip' | 'update' | 'keep_both'
  ): Promise<{ importedCount: number; updatedCount: number; skippedCount: number }> {
    const isOnline = await this.isBackendHealthy();
    if (isOnline) {
      try {
        const res = await fetch(`${API_BASE_URL}/contacts/bulk-import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts: newContacts, strategy: resolveDuplicates }),
        });
        const json = await res.json();
        if (json.success) {
          await this.localRepo.bulkImportContacts(newContacts, resolveDuplicates);
          return {
            importedCount: json.importedCount,
            updatedCount: json.updatedCount,
            skippedCount: json.skippedCount,
          };
        }
      } catch (err) {
        console.warn('API error, falling back to local storage', err);
      }
    }
    return this.localRepo.bulkImportContacts(newContacts, resolveDuplicates);
  }

  async resetToSampleData(): Promise<void> {
    return this.localRepo.resetToSampleData();
  }

  async clearAllData(): Promise<void> {
    return this.localRepo.clearAllData();
  }
}

export const contactRepository = new HybridContactRepository();
