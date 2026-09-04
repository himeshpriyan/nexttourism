import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { CategoryItem, Contact } from '../types/contact.js';
import { ContactModel } from './ContactModel.js';
import { CategoryModel } from './CategoryModel.js';
import { isMongoConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-student', name: 'Student', color: 'emerald', bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200', textColor: 'text-emerald-700', iconName: 'GraduationCap', isDefault: true },
  { id: 'cat-professor', name: 'Professor', color: 'indigo', bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200', textColor: 'text-indigo-700', iconName: 'BookOpen', isDefault: true },
  { id: 'cat-staff', name: 'Staff', color: 'sky', bgLight: 'bg-sky-50 text-sky-700 border-sky-200', textColor: 'text-sky-700', iconName: 'Building2', isDefault: true },
  { id: 'cat-client', name: 'Client', color: 'purple', bgLight: 'bg-purple-50 text-purple-700 border-purple-200', textColor: 'text-purple-700', iconName: 'Briefcase', isDefault: true },
  { id: 'cat-vendor', name: 'Vendor', color: 'amber', bgLight: 'bg-amber-50 text-amber-700 border-amber-200', textColor: 'text-amber-700', iconName: 'Truck', isDefault: true },
  { id: 'cat-customer', name: 'Customer', color: 'rose', bgLight: 'bg-rose-50 text-rose-700 border-rose-200', textColor: 'text-rose-700', iconName: 'Users', isDefault: true },
  { id: 'cat-friend', name: 'Friend', color: 'pink', bgLight: 'bg-pink-50 text-pink-700 border-pink-200', textColor: 'text-pink-700', iconName: 'Heart', isDefault: true },
  { id: 'cat-other', name: 'Other', color: 'slate', bgLight: 'bg-slate-100 text-slate-700 border-slate-200', textColor: 'text-slate-700', iconName: 'Tag', isDefault: true },
];

export const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'cnt-1',
    name: 'Dr. Rahul Kumar',
    phone: '9876543210',
    alternatePhone: '9876543211',
    email: 'rahul.kumar@abccollege.edu.in',
    company: 'ABC Institute of Technology',
    designation: 'Professor & Dean of Academics',
    category: 'Professor',
    address: 'Faculty Block 4, North Campus, New Delhi, 110007',
    notes: 'Department head for Computer Science. Key contact for research grants & approvals.',
    tags: ['Academics', 'CS Department', 'Key Decision Maker'],
    source: 'Visiting Card Scan',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    isFavorite: true,
  },
  {
    id: 'cnt-2',
    name: 'Aarav Sharma',
    phone: '9123456780',
    alternatePhone: '',
    email: 'aarav.sharma22@student.edu',
    company: 'ABC Institute of Technology',
    designation: 'B.Tech CS Student (Final Year)',
    category: 'Student',
    address: 'Boys Hostel 2, Room 304, Campus Rd',
    notes: 'President of Coding Club. Organizing Hackathon 2026.',
    tags: ['Student Council', 'Hackathon Lead', 'Batch 2026'],
    source: 'Manual Entry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    isFavorite: true,
  },
  {
    id: 'cnt-3',
    name: 'Priya Sundaram',
    phone: '9845012345',
    alternatePhone: '9845012346',
    email: 'priya.s@apextechsolutions.com',
    company: 'Apex Tech Solutions Pvt Ltd',
    designation: 'VP of Enterprise Sales',
    category: 'Client',
    address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
    notes: 'Renewing enterprise contract in Q3.',
    tags: ['Enterprise', 'VIP Client'],
    source: 'Visiting Card Scan',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    isFavorite: true,
  },
];

class DataStore {
  constructor() {
    this.ensureDataDirectory();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CONTACTS_FILE)) {
      fs.writeFileSync(CONTACTS_FILE, JSON.stringify(SAMPLE_CONTACTS, null, 2), 'utf-8');
    }
    if (!fs.existsSync(CATEGORIES_FILE)) {
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(DEFAULT_CATEGORIES, null, 2), 'utf-8');
    }
  }

  // File fallback helpers
  private getLocalContacts(): Contact[] {
    try {
      this.ensureDataDirectory();
      const content = fs.readFileSync(CONTACTS_FILE, 'utf-8');
      return JSON.parse(content) as Contact[];
    } catch {
      return [...SAMPLE_CONTACTS];
    }
  }

  private saveLocalContacts(contacts: Contact[]): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write local contacts file:', err);
    }
  }

  private getLocalCategories(): CategoryItem[] {
    try {
      this.ensureDataDirectory();
      const content = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      return JSON.parse(content) as CategoryItem[];
    } catch {
      return [...DEFAULT_CATEGORIES];
    }
  }

  private saveLocalCategories(categories: CategoryItem[]): void {
    try {
      this.ensureDataDirectory();
      fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write local categories file:', err);
    }
  }

  // Asynchronous API supporting MongoDB with Local JSON Fallback
  async getContacts(): Promise<Contact[]> {
    if (isMongoConnected()) {
      try {
        const docs = await ContactModel.find({}).sort({ createdAt: -1 }).lean();
        return docs.map((doc) => ({
          id: doc.id,
          name: doc.name,
          phone: doc.phone,
          alternatePhone: doc.alternatePhone,
          email: doc.email,
          company: doc.company,
          designation: doc.designation,
          category: doc.category,
          address: doc.address,
          notes: doc.notes,
          tags: doc.tags || [],
          source: (doc.source as Contact['source']) || 'Manual Entry',
          visitingCardImage: doc.visitingCardImage,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          isFavorite: doc.isFavorite,
        }));
      } catch (err) {
        console.error('MongoDB find contacts error, using local store:', err);
      }
    }
    return this.getLocalContacts();
  }

  async getContactById(id: string): Promise<Contact | null> {
    if (isMongoConnected()) {
      try {
        const doc = await ContactModel.findOne({ id }).lean();
        if (doc) {
          return {
            id: doc.id,
            name: doc.name,
            phone: doc.phone,
            alternatePhone: doc.alternatePhone,
            email: doc.email,
            company: doc.company,
            designation: doc.designation,
            category: doc.category,
            address: doc.address,
            notes: doc.notes,
            tags: doc.tags || [],
            source: (doc.source as Contact['source']) || 'Manual Entry',
            visitingCardImage: doc.visitingCardImage,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            isFavorite: doc.isFavorite,
          };
        }
        return null;
      } catch (err) {
        console.error('MongoDB find contact by id error:', err);
      }
    }
    const contacts = this.getLocalContacts();
    return contacts.find((c) => c.id === id) || null;
  }

  async saveContact(contact: Contact): Promise<Contact> {
    if (isMongoConnected()) {
      try {
        await ContactModel.findOneAndUpdate(
          { id: contact.id },
          { $set: contact },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error('MongoDB save contact error:', err);
      }
    }
    // Mirror in local store
    const local = this.getLocalContacts();
    const idx = local.findIndex((c) => c.id === contact.id);
    if (idx >= 0) {
      local[idx] = contact;
    } else {
      local.unshift(contact);
    }
    this.saveLocalContacts(local);
    return contact;
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const updatedAt = new Date().toISOString();
    if (isMongoConnected()) {
      try {
        const updated = await ContactModel.findOneAndUpdate(
          { id },
          { $set: { ...updates, updatedAt } },
          { new: true }
        ).lean();
        if (updated) {
          const contact: Contact = {
            id: updated.id,
            name: updated.name,
            phone: updated.phone,
            alternatePhone: updated.alternatePhone,
            email: updated.email,
            company: updated.company,
            designation: updated.designation,
            category: updated.category,
            address: updated.address,
            notes: updated.notes,
            tags: updated.tags || [],
            source: (updated.source as Contact['source']) || 'Manual Entry',
            visitingCardImage: updated.visitingCardImage,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            isFavorite: updated.isFavorite,
          };
          // Mirror in local store
          const local = this.getLocalContacts();
          const idx = local.findIndex((c) => c.id === id);
          if (idx >= 0) {
            local[idx] = contact;
            this.saveLocalContacts(local);
          }
          return contact;
        }
      } catch (err) {
        console.error('MongoDB update contact error:', err);
      }
    }

    const local = this.getLocalContacts();
    const idx = local.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const merged: Contact = {
      ...local[idx],
      ...updates,
      id,
      updatedAt,
    };
    local[idx] = merged;
    this.saveLocalContacts(local);
    return merged;
  }

  async deleteContact(id: string): Promise<boolean> {
    let deletedFromMongo = false;
    if (isMongoConnected()) {
      try {
        const res = await ContactModel.deleteOne({ id });
        deletedFromMongo = (res.deletedCount || 0) > 0;
      } catch (err) {
        console.error('MongoDB delete contact error:', err);
      }
    }

    const local = this.getLocalContacts();
    const filtered = local.filter((c) => c.id !== id);
    const deletedFromLocal = filtered.length !== local.length;
    if (deletedFromLocal) {
      this.saveLocalContacts(filtered);
    }
    return deletedFromMongo || deletedFromLocal;
  }

  async saveContacts(contacts: Contact[]): Promise<void> {
    if (isMongoConnected()) {
      try {
        await ContactModel.deleteMany({});
        if (contacts.length > 0) {
          await ContactModel.insertMany(contacts);
        }
      } catch (err) {
        console.error('MongoDB bulk save contacts error:', err);
      }
    }
    this.saveLocalContacts(contacts);
  }

  async getCategories(): Promise<CategoryItem[]> {
    if (isMongoConnected()) {
      try {
        const docs = await CategoryModel.find({}).lean();
        return docs.map((doc) => ({
          id: doc.id,
          name: doc.name,
          color: doc.color,
          bgLight: doc.bgLight,
          textColor: doc.textColor,
          iconName: doc.iconName,
          isDefault: doc.isDefault,
        }));
      } catch (err) {
        console.error('MongoDB find categories error, using local:', err);
      }
    }
    return this.getLocalCategories();
  }

  async saveCategory(category: CategoryItem): Promise<CategoryItem> {
    if (isMongoConnected()) {
      try {
        await CategoryModel.findOneAndUpdate(
          { id: category.id },
          { $set: category },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error('MongoDB save category error:', err);
      }
    }
    const local = this.getLocalCategories();
    const idx = local.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      local[idx] = category;
    } else {
      local.push(category);
    }
    this.saveLocalCategories(local);
    return category;
  }

  async updateCategory(id: string, updates: Partial<CategoryItem>): Promise<CategoryItem | null> {
    if (isMongoConnected()) {
      try {
        const doc = await CategoryModel.findOneAndUpdate(
          { id },
          { $set: updates },
          { new: true }
        ).lean();
        if (doc) {
          const category: CategoryItem = {
            id: doc.id,
            name: doc.name,
            color: doc.color,
            bgLight: doc.bgLight,
            textColor: doc.textColor,
            iconName: doc.iconName,
            isDefault: doc.isDefault,
          };
          const local = this.getLocalCategories();
          const idx = local.findIndex((c) => c.id === id);
          if (idx >= 0) {
            local[idx] = category;
            this.saveLocalCategories(local);
          }
          return category;
        }
      } catch (err) {
        console.error('MongoDB update category error:', err);
      }
    }

    const local = this.getLocalCategories();
    const idx = local.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const merged: CategoryItem = {
      ...local[idx],
      ...updates,
      id,
    };
    local[idx] = merged;
    this.saveLocalCategories(local);
    return merged;
  }

  async deleteCategory(id: string): Promise<boolean> {
    let deletedMongo = false;
    if (isMongoConnected()) {
      try {
        const res = await CategoryModel.deleteOne({ id });
        deletedMongo = (res.deletedCount || 0) > 0;
      } catch (err) {
        console.error('MongoDB delete category error:', err);
      }
    }

    const local = this.getLocalCategories();
    const filtered = local.filter((c) => c.id !== id);
    const deletedLocal = filtered.length !== local.length;
    if (deletedLocal) {
      this.saveLocalCategories(filtered);
    }
    return deletedMongo || deletedLocal;
  }

  async saveCategories(categories: CategoryItem[]): Promise<void> {
    if (isMongoConnected()) {
      try {
        await CategoryModel.deleteMany({});
        if (categories.length > 0) {
          await CategoryModel.insertMany(categories);
        }
      } catch (err) {
        console.error('MongoDB bulk save categories error:', err);
      }
    }
    this.saveLocalCategories(categories);
  }
}

export const dataStore = new DataStore();
