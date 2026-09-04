import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { CategoryItem, Contact, FilterState, OCRScanResult } from '../types/contact';
import { contactRepository } from '../services/storage/HybridContactRepository';
import { exportContactsToCSV, downloadFile } from '../services/importExport/csvService';
import { exportAllContactsAsVCard, exportContactAsVCard } from '../services/importExport/vcardService';
import { useToast } from './ToastContext';

interface DuplicateAlertState {
  isOpen: boolean;
  existingContact?: Contact;
  candidateContact?: Partial<Contact>;
  onResolve?: (action: 'view' | 'update' | 'save_new') => void;
}

interface ContactContextType {
  contacts: Contact[];
  filteredContacts: Contact[];
  categories: CategoryItem[];
  categoryCounts: Record<string, number>;
  filters: FilterState;
  allTags: string[];
  totalContactsCount: number;
  recentContacts: Contact[];
  activeTab: 'home' | 'contacts' | 'categories' | 'scan';
  setActiveTab: (tab: 'home' | 'contacts' | 'categories' | 'scan') => void;

  // Contact Actions
  saveContact: (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }, forceSkipDuplicateCheck?: boolean) => Promise<boolean>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<boolean>;
  deleteContact: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => Promise<void>;

  // Filter setters
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string | null) => void;
  toggleTagFilter: (tag: string) => void;
  setSourceFilter: (source: FilterState['sourceFilter']) => void;
  setSortBy: (sortBy: FilterState['sortBy']) => void;
  setOnlyWithEmail: (val: boolean) => void;
  setOnlyWithCard: (val: boolean) => void;
  resetFilters: () => void;

  // Category Actions
  addCategory: (name: string, color?: string, iconName?: string) => Promise<boolean>;
  updateCategory: (id: string, name: string, color?: string, iconName?: string) => Promise<boolean>;
  deleteCategory: (id: string, fallback?: string) => Promise<boolean>;

  // Import / Export
  importContactsBatch: (
    items: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>,
    duplicateStrategy: 'skip' | 'update' | 'keep_both'
  ) => Promise<{ importedCount: number; updatedCount: number; skippedCount: number }>;
  exportContactsCSV: (categoryName?: string) => void;
  exportContactsVCF: (contactOrAll?: Contact) => void;
  resetToSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Modals & Navigation state
  isAddModalOpen: boolean;
  openAddModal: (prefill?: Partial<Contact>) => void;
  closeAddModal: () => void;

  editingContact: Contact | null;
  openEditModal: (contact: Contact) => void;
  closeEditModal: () => void;

  selectedContact: Contact | null;
  openDetailModal: (contact: Contact) => void;
  closeDetailModal: () => void;

  isScannerOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;

  isImportModalOpen: boolean;
  openImportModal: () => void;
  closeImportModal: () => void;

  isExportModalOpen: boolean;
  openExportModal: () => void;
  closeExportModal: () => void;

  isCategoryModalOpen: boolean;
  openCategoryModal: () => void;
  closeCategoryModal: () => void;

  // Duplicate Alert
  duplicateAlert: DuplicateAlertState;
  closeDuplicateAlert: () => void;
  resolveDuplicate: (action: 'view' | 'update' | 'save_new') => void;

  // OCR prefill helper
  handleOcrComplete: (result: OCRScanResult, cardImageBase64?: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  category: null,
  selectedTags: [],
  sourceFilter: 'All',
  onlyWithEmail: false,
  onlyWithCard: false,
  sortBy: 'name-asc',
};

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<'home' | 'contacts' | 'categories' | 'scan'>('home');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Duplicate Alert State
  const [duplicateAlert, setDuplicateAlert] = useState<DuplicateAlertState>({
    isOpen: false,
  });

  // Load initial data
  const refreshData = useCallback(async () => {
    try {
      const loadedContacts = await contactRepository.getAllContacts();
      const loadedCategories = await contactRepository.getCategories();
      setContacts(loadedContacts);
      setCategories(loadedCategories);
    } catch (e) {
      console.error('Failed to load data', e);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Derived Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contacts.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [contacts]);

  // Derived unique Tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => {
      if (c.tags) {
        c.tags.forEach((t) => set.add(t));
      }
    });
    return Array.from(set).sort();
  }, [contacts]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contactRepository.filterContacts(contacts, filters);
  }, [contacts, filters]);

  // Recent contacts (sorted by createdAt desc, max 6)
  const recentContacts = useMemo(() => {
    return [...contacts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [contacts]);

  // Filter Setters
  const setSearchQuery = (searchQuery: string) => setFilters((p) => ({ ...p, searchQuery }));
  const setCategoryFilter = (category: string | null) => setFilters((p) => ({ ...p, category }));
  const toggleTagFilter = (tag: string) =>
    setFilters((p) => ({
      ...p,
      selectedTags: p.selectedTags.includes(tag)
        ? p.selectedTags.filter((t) => t !== tag)
        : [...p.selectedTags, tag],
    }));
  const setSourceFilter = (sourceFilter: FilterState['sourceFilter']) =>
    setFilters((p) => ({ ...p, sourceFilter }));
  const setSortBy = (sortBy: FilterState['sortBy']) => setFilters((p) => ({ ...p, sortBy }));
  const setOnlyWithEmail = (onlyWithEmail: boolean) => setFilters((p) => ({ ...p, onlyWithEmail }));
  const setOnlyWithCard = (onlyWithCard: boolean) => setFilters((p) => ({ ...p, onlyWithCard }));
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  // Duplicate Resolution handler
  const closeDuplicateAlert = () => setDuplicateAlert({ isOpen: false });

  const resolveDuplicate = (action: 'view' | 'update' | 'save_new') => {
    if (duplicateAlert.onResolve) {
      duplicateAlert.onResolve(action);
    }
    setDuplicateAlert({ isOpen: false });
  };

  // Contact CRUD Handlers
  const saveContact = async (
    contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    forceSkipDuplicateCheck = false
  ): Promise<boolean> => {
    try {
      // Check duplicate phone if not forced
      if (!forceSkipDuplicateCheck && contactData.phone) {
        const dupCheck = await contactRepository.checkDuplicatePhone(contactData.phone, contactData.id);
        if (dupCheck.isDuplicate && dupCheck.existingContact) {
          // Open Duplicate Modal and return false until resolved
          setDuplicateAlert({
            isOpen: true,
            existingContact: dupCheck.existingContact,
            candidateContact: contactData,
            onResolve: async (action) => {
              if (action === 'view') {
                closeAddModal();
                closeEditModal();
                setSelectedContact(dupCheck.existingContact!);
              } else if (action === 'update') {
                await updateContact(dupCheck.existingContact!.id, {
                  ...contactData,
                  tags: Array.from(new Set([...dupCheck.existingContact!.tags, ...(contactData.tags || [])])),
                  notes: contactData.notes
                    ? `${dupCheck.existingContact!.notes ? dupCheck.existingContact!.notes + ' | ' : ''}${contactData.notes}`
                    : dupCheck.existingContact!.notes,
                });
                closeAddModal();
                showToast(`Updated existing contact for ${dupCheck.existingContact!.name}`, 'success');
              } else if (action === 'save_new') {
                const saved = await contactRepository.saveContact(contactData);
                await refreshData();
                closeAddModal();
                showToast(`Saved ${saved.name} as a new contact`, 'success');
                confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
              }
            },
          });
          return false;
        }
      }

      // Save directly
      const saved = await contactRepository.saveContact(contactData);
      await refreshData();
      closeAddModal();
      showToast(`Contact "${saved.name}" added to vault!`, 'success');
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
      return true;
    } catch (err) {
      showToast('Error saving contact', 'error');
      console.error(err);
      return false;
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>): Promise<boolean> => {
    try {
      const updated = await contactRepository.updateContact(id, updates);
      await refreshData();
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact(updated);
      }
      closeEditModal();
      showToast(`Updated "${updated.name}" successfully`, 'success');
      return true;
    } catch (err) {
      showToast('Error updating contact', 'error');
      console.error(err);
      return false;
    }
  };

  const deleteContact = async (id: string): Promise<boolean> => {
    try {
      const contactToDelete = contacts.find((c) => c.id === id);
      const ok = await contactRepository.deleteContact(id);
      if (ok) {
        await refreshData();
        if (selectedContact && selectedContact.id === id) {
          setSelectedContact(null);
        }
        showToast(`Deleted ${contactToDelete?.name || 'contact'}`, 'info');
        return true;
      }
      return false;
    } catch (err) {
      showToast('Error deleting contact', 'error');
      console.error(err);
      return false;
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const updated = await contactRepository.toggleFavorite(id);
      await refreshData();
      if (selectedContact && selectedContact.id === id) {
        setSelectedContact(updated);
      }
      showToast(updated.isFavorite ? `Added to favorites` : `Removed from favorites`, 'info');
    } catch (err) {
      console.error(err);
    }
  };

  // Category Actions
  const addCategory = async (name: string, color = 'indigo', iconName = 'Tag'): Promise<boolean> => {
    try {
      if (!name.trim()) return false;
      const exists = categories.some((c) => c.name.toLowerCase() === name.trim().toLowerCase());
      if (exists) {
        showToast(`Category "${name}" already exists`, 'warning');
        return false;
      }

      await contactRepository.saveCategory({
        name: name.trim(),
        color,
        bgLight: `bg-${color}-50 text-${color}-700 border-${color}-200`,
        textColor: `text-${color}-700`,
        iconName,
        isDefault: false,
      });
      await refreshData();
      showToast(`Category "${name}" created`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Failed to add category', 'error');
      return false;
    }
  };

  const updateCategory = async (id: string, name: string, color = 'indigo', iconName = 'Tag'): Promise<boolean> => {
    try {
      await contactRepository.updateCategory(id, {
        name: name.trim(),
        color,
        bgLight: `bg-${color}-50 text-${color}-700 border-${color}-200`,
        textColor: `text-${color}-700`,
        iconName,
      });
      await refreshData();
      showToast(`Category updated to "${name}"`, 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Failed to update category', 'error');
      return false;
    }
  };

  const deleteCategory = async (id: string, fallback = 'Other'): Promise<boolean> => {
    try {
      const ok = await contactRepository.deleteCategory(id, fallback);
      if (ok) {
        await refreshData();
        showToast('Category deleted and contacts re-assigned', 'info');
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      showToast('Failed to delete category', 'error');
      return false;
    }
  };

  // Import / Export
  const importContactsBatch = async (
    items: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>,
    duplicateStrategy: 'skip' | 'update' | 'keep_both'
  ) => {
    const res = await contactRepository.bulkImportContacts(items, duplicateStrategy);
    await refreshData();
    showToast(
      `Import complete: ${res.importedCount} new, ${res.updatedCount} updated, ${res.skippedCount} skipped`,
      'success'
    );
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    return res;
  };

  const exportContactsCSV = (categoryName?: string) => {
    const csvData = exportContactsToCSV(contacts, categoryName);
    const filename = categoryName && categoryName !== 'All'
      ? `${categoryName.toLowerCase().replace(/\s+/g, '_')}_contacts.csv`
      : 'all_contacts_contactvault.csv';
    downloadFile(csvData, filename);
    showToast(`Exported ${filename}`, 'success');
  };

  const exportContactsVCF = (contactOrAll?: Contact) => {
    if (contactOrAll) {
      exportContactAsVCard(contactOrAll);
      showToast(`Exported vCard for ${contactOrAll.name}`, 'success');
    } else {
      exportAllContactsAsVCard(contacts, 'all_contacts_contactvault.vcf');
      showToast(`Exported all contacts as vCard (.vcf)`, 'success');
    }
  };

  const resetToSampleData = async () => {
    await contactRepository.resetToSampleData();
    await refreshData();
    showToast('Reset data to realistic sample contacts', 'info');
  };

  const clearAllData = async () => {
    await contactRepository.clearAllData();
    await refreshData();
    showToast('Cleared all local contacts', 'info');
  };

  // Modal helpers
  const openAddModal = (prefill?: Partial<Contact>) => {
    if (prefill) {
      setEditingContact({
        id: '',
        name: prefill.name || '',
        phone: prefill.phone || '',
        alternatePhone: prefill.alternatePhone || '',
        email: prefill.email || '',
        company: prefill.company || '',
        designation: prefill.designation || '',
        category: prefill.category || 'Other',
        address: prefill.address || '',
        notes: prefill.notes || '',
        tags: prefill.tags || [],
        source: prefill.source || 'Manual Entry',
        visitingCardImage: prefill.visitingCardImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      setEditingContact(null);
    }
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingContact(null);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setIsAddModalOpen(true);
  };
  const closeEditModal = () => {
    setEditingContact(null);
    setIsAddModalOpen(false);
  };

  const openDetailModal = (contact: Contact) => setSelectedContact(contact);
  const closeDetailModal = () => setSelectedContact(null);

  const openScanner = () => setIsScannerOpen(true);
  const closeScanner = () => setIsScannerOpen(false);

  const openImportModal = () => setIsImportModalOpen(true);
  const closeImportModal = () => setIsImportModalOpen(false);

  const openExportModal = () => setIsExportModalOpen(true);
  const closeExportModal = () => setIsExportModalOpen(false);

  const openCategoryModal = () => setIsCategoryModalOpen(true);
  const closeCategoryModal = () => setIsCategoryModalOpen(false);

  const handleOcrComplete = (result: OCRScanResult, cardImageBase64?: string) => {
    setIsScannerOpen(false);
    openAddModal({
      name: result.name || '',
      phone: result.phone || '',
      alternatePhone: result.alternatePhone || '',
      email: result.email || '',
      company: result.company || '',
      designation: result.designation || '',
      category: result.suggestedCategory || 'Other',
      address: result.address || '',
      source: 'Visiting Card Scan',
      visitingCardImage: cardImageBase64,
      notes: result.website ? `Website: ${result.website}` : '',
    });
    showToast('Card scanned! Review and save details.', 'success');
  };

  return (
    <ContactContext.Provider
      value={{
        contacts,
        filteredContacts,
        categories,
        categoryCounts,
        filters,
        allTags,
        totalContactsCount: contacts.length,
        recentContacts,
        activeTab,
        setActiveTab,

        saveContact,
        updateContact,
        deleteContact,
        toggleFavorite,

        setSearchQuery,
        setCategoryFilter,
        toggleTagFilter,
        setSourceFilter,
        setSortBy,
        setOnlyWithEmail,
        setOnlyWithCard,
        resetFilters,

        addCategory,
        updateCategory,
        deleteCategory,

        importContactsBatch,
        exportContactsCSV,
        exportContactsVCF,
        resetToSampleData,
        clearAllData,

        isAddModalOpen,
        openAddModal,
        closeAddModal,

        editingContact,
        openEditModal,
        closeEditModal,

        selectedContact,
        openDetailModal,
        closeDetailModal,

        isScannerOpen,
        openScanner,
        closeScanner,

        isImportModalOpen,
        openImportModal,
        closeImportModal,

        isExportModalOpen,
        openExportModal,
        closeExportModal,

        isCategoryModalOpen,
        openCategoryModal,
        closeCategoryModal,

        duplicateAlert,
        closeDuplicateAlert,
        resolveDuplicate,

        handleOcrComplete,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = (): ContactContextType => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};
